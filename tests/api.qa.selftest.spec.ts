import { describe, it, expect } from "vitest";
// Assume API file can be imported for test
import { GET as selftestGET } from "@/interfaces/api/qa/selftest/route";

describe("api/qa/selftest", () => {
  it("returns 200 and version/timestamp/uptime_s", async () => {
    const res = await selftestGET({} as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(typeof data.version).toBe("string");
    expect(typeof data.uptime_s).toBe("number");
    expect(typeof data.timestamp).toBe("string");
  });
});