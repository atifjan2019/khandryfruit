import { afterEach, describe, expect, it } from "vitest";

import { hasTrustedOrigin } from "./origin";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

describe("origin validation", () => {
  it("accepts safe methods without an Origin header", () => {
    expect(hasTrustedOrigin(new Request("https://shop.example/api", { method: "GET" }))).toBe(true);
  });

  it("accepts an exact configured origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://shop.example";
    const request = new Request("https://shop.example/api", {
      method: "POST",
      headers: { Origin: "https://shop.example" },
    });
    expect(hasTrustedOrigin(request)).toBe(true);
  });

  it("rejects missing, lookalike, and cross-site origins", () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_SITE_URL = "https://shop.example";
    expect(hasTrustedOrigin(new Request("https://shop.example/api", { method: "POST" }))).toBe(false);
    for (const origin of ["https://evil.example", "https://shop.example.evil.test"]) {
      expect(
        hasTrustedOrigin(
          new Request("https://shop.example/api", { method: "POST", headers: { Origin: origin } }),
        ),
      ).toBe(false);
    }
  });
});
