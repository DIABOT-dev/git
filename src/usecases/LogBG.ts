import { z } from "zod";
import { BloodGlucoseRepository } from "@/application/ports/BloodGlucoseRepository";

export const LogBGInput = z.object({
  userId: z.string().min(1),
  mgdl: z.number().int().positive(),
  context: z.enum(["fasting","pre","post","random"]).optional(),
  at: z.string().datetime()
});
export type LogBGInput = z.infer<typeof LogBGInput>;

export class LogBG {
  constructor(private repo: BloodGlucoseRepository) {}
  async exec(input: LogBGInput) {
    const ok = LogBGInput.parse(input);
    return this.repo.create({ ...ok });
  }
}
