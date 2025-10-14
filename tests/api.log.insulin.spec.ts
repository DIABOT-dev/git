import { describe, it, expect } from "vitest";
import { insulinLogSchema } from "@/domain/schemas";

describe("insulinLogSchema", () => {
  it("accepts valid payload", () => {
    expect(() =>
      insulinLogSchema.parse({
        dose: 12,
        type: "rapid",
        context: "before meal",
        ts: "2025-10-14T08:00:00Z",
        note: "normal"
      })
    ).not.toThrow();
  });

  it("rejects invalid dose", () => {
    expect(() =>
      insulinLogSchema.parse({
        dose: -1,
        type: "rapid",
        ts: "2025-10-14T08:00:00Z"
      })
    ).toThrow();
  });

  it("rejects invalid type", () => {
    expect(() =>
      insulinLogSchema.parse({
        dose: 12,
        type: "other",
        ts: "2025-10-14T08:00:00Z"
      })
    ).toThrow();
  });

  it("rejects invalid timestamp", () => {
    expect(() =>
      insulinLogSchema.parse({
        dose: 12,
        type: "rapid",
        ts: "bad-date"
      })
    ).toThrow();
  });
});