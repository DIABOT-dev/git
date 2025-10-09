import { describe, expect, it } from "vitest";
import { mapProfileFromDB, mapProfileToDB } from "../src/lib/profile/mappers";

describe("profile mappers", () => {
  it("mapProfileFromDB trả về default persona an toàn khi prefs null", () => {
    const profile = mapProfileFromDB({
      id: "user-1",
      email: "user@example.com",
      prefs: null,
      conditions: null,
    });

    expect(profile.prefs.ai_persona).toBe("friend");
    expect(profile.prefs.guidance_level).toBe("minimal");
    expect(profile.prefs.low_ask_mode).toBe(false);
  });

  it("mapProfileToDB sanitize persona và goals không hợp lệ", () => {
    const payload = mapProfileToDB({
      email: "user@example.com",
      prefs: {
        ai_persona: "wizard",
        guidance_level: "hyper",
        low_ask_mode: "nope",
        goals: {
          primaryGoal: "",
          targetWeight: "abc",
          targetHbA1c: "6.5",
          dailySteps: "10000",
          waterCups: null,
        },
      },
    });

    expect(payload.prefs.ai_persona).toBe("friend");
    expect(payload.prefs.guidance_level).toBe("minimal");
    expect(payload.prefs.low_ask_mode).toBe(false);
    expect(payload.prefs.goals).toEqual({
      targetHbA1c: 6.5,
      dailySteps: 10000,
    });
  });
});
