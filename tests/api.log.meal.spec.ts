import { describe, it, expect } from "vitest";
import { mealLogSchema } from "@/domain/schemas";

describe("mealLogSchema", () => {
  it("accepts valid payload", () => {
    expect(() =>
      mealLogSchema.parse({
        meal_type: "lunch",
        text: "rice and chicken",
        portion: "medium",
        ts: "2025-10-14T12:00:00Z",
        photo_url: "https://example.com/photo.jpg"
      })
    ).not.toThrow();
  });

  it("rejects invalid meal_type", () => {
    expect(() =>
      mealLogSchema.parse({
        meal_type: "supper",
        text: "food",
        ts: "2025-10-14T12:00:00Z"
      })
    ).toThrow();
  });

  it("rejects missing text", () => {
    expect(() =>
      mealLogSchema.parse({
        meal_type: "lunch",
        ts: "2025-10-14T12:00:00Z"
      })
    ).toThrow();
  });

  it("rejects invalid photo_url", () => {
    expect(() =>
      mealLogSchema.parse({
        meal_type: "lunch",
        text: "rice",
        ts: "2025-10-14T12:00:00Z",
        photo_url: "not-a-url"
      })
    ).toThrow();
  });

  it("rejects invalid timestamp", () => {
    expect(() =>
      mealLogSchema.parse({
        meal_type: "lunch",
        text: "rice",
        ts: "bad-date"
      })
    ).toThrow();
  });
});