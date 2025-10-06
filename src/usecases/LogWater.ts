import { z } from "zod";
import { WaterRepository } from "@/application/ports/WaterRepository";

export const LogWaterInput = z.object({
  userId: z.string().min(1),
  ml: z.number().int().positive(),
  at: z.string().datetime()
});
export type LogWaterInput = z.infer<typeof LogWaterInput>;

export class LogWater {
  constructor(private repo: WaterRepository) {}
  async exec(input: LogWaterInput) {
    const ok = LogWaterInput.parse(input);
    return this.repo.create({ ...ok });
  }
}
