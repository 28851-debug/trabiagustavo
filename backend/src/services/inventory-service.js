import { AppError } from "../errors/app-error.js";
export function createInventoryService(repo){
  const run=async(id,operation)=>{const result=await repo.change(id,operation); if(result.missing) throw new AppError(404,"NOT_FOUND","Produto não encontrado."); if(result.error==="INSUFFICIENT_STOCK") throw new AppError(409,"INSUFFICIENT_STOCK","Estoque insuficiente.",{available:result.available,requested:result.requested}); if(result.error==="NO_CHANGE") throw new AppError(409,"NO_STOCK_CHANGE","O estoque informado já é o atual."); return result;};
  return {
    add:(id,{quantity,note})=>run(id,(p)=>({type:"IN",quantity,newStock:p.quantity+quantity,note:note||null})),
    remove:(id,{quantity,note})=>run(id,(p)=>quantity>p.quantity?{error:"INSUFFICIENT_STOCK",available:p.quantity,requested:quantity}:{type:"OUT",quantity,newStock:p.quantity-quantity,note:note||null}),
    adjust:(id,{new_stock,reason})=>run(id,(p)=>new_stock===p.quantity?{error:"NO_CHANGE"}:{type:"ADJUSTMENT",quantity:Math.abs(new_stock-p.quantity),newStock:new_stock,note:reason}),
    list:(productId,q)=>repo.list(productId,q),
  };
}
