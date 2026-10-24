import { describe, expect, it } from "vitest";
import { errorDigest } from "./error-digest";

describe("errorDigest", () => {
  it("reads the digest Next.js adds to server errors", () => {
    expect(errorDigest(Object.assign(new Error("x"), { digest: "abc123" }))).toBe("abc123");
  });

  it("ignores values without a string digest", () => {
    expect(errorDigest(new Error("x"))).toBeUndefined();
    expect(errorDigest({ digest: 42 })).toBeUndefined();
    expect(errorDigest("boom")).toBeUndefined();
    expect(errorDigest(null)).toBeUndefined();
  });
});
