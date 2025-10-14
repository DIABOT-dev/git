import { describe, it, expect } from "vitest";
import { bgLogSchema } from "@/domain/schemas";

describe("bgLogSchema", () => {
  it("accepts valid payload", () => {
    expect(() =>
      bgLogSchema.parse({
        value: 120,
        unit: "mg/dL",
        context: "fasting",
        ts: "2025-10-14T08:00:00Z",
        note: "after breakfast"
      })
    ).not.toThrow();
  });

  it("rejects missing value", () => {
    expect(() =>
      bgLogSchema.parse({
        unit: "mg/dL",
        ts: "2025-10-14T08:00:00Z"
      })
    ).toThrow();
  });

  it("rejects invalid unit", () => {
    expect(() =>
      bgLogSchema.parse({
        value: 120,
        unit: "mg", // invalid
        ts: "2025-10-14T08:00:00Z"
      })
    ).toThrow();
  });

  it("rejects invalid timestamp", () => {
    expect(() =>
      bgLogSchema.parse({
        value: 120,
        unit: "mg/dL",
        ts: "not-a-date"
      })
    ).toThrow();
  });
});