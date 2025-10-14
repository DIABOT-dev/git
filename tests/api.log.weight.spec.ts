import { describe, it, expect } from "vitest";
import { weightLogSchema } from "@/domain/schemas";

describe("weightLogSchema", () => {
  it("accepts valid payload", () => {
    expect(() =>
      weightLogSchema.parse({
        kg: 70,
        ts: "2025-10-14T08:00:00Z"
      })
    ).not.toThrow();
  });

  it("rejects invalid kg", () => {
    expect(() =>
      weightLogSchema.parse({
        kg: 10, // too low
        ts: "2025-10-14T08:00:00Z"
      })
    ).toThrow();
  });

  it("rejects invalid timestamp", () => {
    expect(() =>
      weightLogSchema.parse({
        kg: 70,
        ts: "bad-date"
      })
    ).toThrow();
  });
});