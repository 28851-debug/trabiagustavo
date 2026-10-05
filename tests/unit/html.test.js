import { describe, expect, it } from "vitest";

import { escapeHtml } from "../../frontend/js/html.js";

describe("escapeHtml", () => {
  it("renders user-controlled markup as plain text", () => {
    expect(escapeHtml(`<img src=x onerror="alert('xss')"> & 'quoted'`)).toBe(
      "&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt; &amp; &#39;quoted&#39;",
    );
  });
});
