import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Vercel Express entrypoint", () => {
  it("imports Express directly and exports the application", async () => {
    const source = await readFile(new URL("../../server.js", import.meta.url), "utf8");
    expect(source).toMatch(/import express from ["']express["']/);
    expect(source).toMatch(/export default app/);
  });
});
