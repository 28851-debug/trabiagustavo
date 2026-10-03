import { access, cp, readdir, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("frontend"), output = resolve("public");
await rm(output, { recursive: true, force: true });
await cp(source, output, { recursive: true });

const required = ["index.html", "products.html", "customers.html", "repairs.html", "css/style.css", "js/app.js"];
await Promise.all(required.map((file) => access(resolve(output, file))));

async function assertSafe(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await assertSafe(path);
    else {
      if (/^\.env|\.pem$|\.key$/i.test(entry.name)) throw new Error(`Arquivo sensível no build: ${entry.name}`);
      const contents = await readFile(path, "utf8");
      if (/DATABASE_URL\s*=|postgres(?:ql)?:\/\//i.test(contents)) throw new Error(`Possível segredo no build: ${entry.name}`);
    }
  }
}
await assertSafe(output);
console.info(`Frontend gerado em ${output}`);
