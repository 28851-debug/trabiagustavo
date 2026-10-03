import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { inventoryMovements, products } from "../database/schema.js";

const movementSelection={ id:inventoryMovements.id,product_id:inventoryMovements.productId,type:inventoryMovements.type,quantity:inventoryMovements.quantity,previous_stock:inventoryMovements.previousStock,new_stock:inventoryMovements.newStock,reference_type:inventoryMovements.referenceType,reference_id:inventoryMovements.referenceId,note:inventoryMovements.note,created_at:inventoryMovements.createdAt };
export function createInventoryRepository(db) { return {
  async change(productId, operation) { return db.transaction(async (tx) => {
    const product=(await tx.select().from(products).where(and(eq(products.id,productId),isNull(products.archivedAt))).for("update").limit(1))[0];
    if(!product) return { missing:true };
    const movement=operation(product);
    if(movement.error) return movement;
    await tx.update(products).set({quantity:movement.newStock,updatedAt:new Date()}).where(eq(products.id,productId));
    const row=(await tx.insert(inventoryMovements).values({productId,type:movement.type,quantity:movement.quantity,previousStock:product.quantity,newStock:movement.newStock,note:movement.note}).returning(movementSelection))[0];
    return row;
  }); },
  async list(productId,query){ const where=productId?eq(inventoryMovements.productId,productId):undefined; const [items,count]=await Promise.all([db.select(movementSelection).from(inventoryMovements).where(where).orderBy(desc(inventoryMovements.createdAt),desc(inventoryMovements.id)).limit(query.pageSize).offset((query.page-1)*query.pageSize),db.select({count:sql`count(*)`}).from(inventoryMovements).where(where)]); const total=Number(count[0].count); return {items,meta:{page:query.page,page_size:query.pageSize,total,total_pages:Math.ceil(total/query.pageSize)}}; },
}; }
