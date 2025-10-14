import { describe, it, expect } from "vitest";
// Assume demo logic is in API file or can be imported for test
import { GET as chart7dGET } from "@/interfaces/api/chart/7d/route";

describe("api/chart/7d demo fallback", () => {
  it("returns 200 and fallback demo data", async () => {
    const res = await chart7dGET({} as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.series)).toBe(true);
    expect(data.fallback).toBe(true);
    expect(data.range).toBe("7d");
    expect(typeof data.summary).toBe("object");
  });
});