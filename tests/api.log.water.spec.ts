import { describe, it, expect } from "vitest";
import { waterLogSchema } from "@/domain/schemas";

describe("waterLogSchema", () => {
  it("accepts valid payload", () => {
    expect(() =>
      waterLogSchema.parse({
        ml: 1800,
        ts: "2025-10-14T08:00:00Z"
      })
    ).not.toThrow();
  });

  it("rejects invalid ml", () => {
    expect(() =>
      waterLogSchema.parse({
        ml: -5,
        ts: "2025-10-14T08:00:00Z"
      })
    ).toThrow();
  });

  it("rejects invalid timestamp", () => {
    expect(() =>
      waterLogSchema.parse({
        ml: 1200,
        ts: "invalid"
      })
    ).toThrow();
  });
});