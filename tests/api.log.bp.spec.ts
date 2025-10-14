import { describe, it, expect } from "vitest";
import { bpLogSchema } from "@/domain/schemas";

describe("bpLogSchema", () => {
  it("accepts valid payload", () => {
    expect(() =>
      bpLogSchema.parse({
        systolic: 120,
        diastolic: 80,
        pulse: 70,
        ts: "2025-10-14T08:00:00Z"
      })
    ).not.toThrow();
  });

  it("rejects invalid systolic", () => {
    expect(() =>
      bpLogSchema.parse({
        systolic: 30,
        diastolic: 80,
        ts: "2025-10-14T08:00:00Z"
      })
    ).toThrow();
  });

  it("rejects invalid diastolic", () => {
    expect(() =>
      bpLogSchema.parse({
        systolic: 120,
        diastolic: 10,
        ts: "2025-10-14T08:00:00Z"
      })
    ).toThrow();
  });

  it("rejects invalid timestamp", () => {
    expect(() =>
      bpLogSchema.parse({
        systolic: 120,
        diastolic: 80,
        ts: "bad-date"
      })
    ).toThrow();
  });
});