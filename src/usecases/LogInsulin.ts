import { z } from "zod";
import { InsulinRepository } from "@/application/ports/InsulinRepository";

export const LogInsulinInput = z.object({
  userId: z.string().min(1),
  units: z.number().positive(),
  insulinType: z.string().optional(),
  at: z.string().datetime()
});
export type LogInsulinInput = z.infer<typeof LogInsulinInput>;

export class LogInsulin {
  constructor(private repo: InsulinRepository) {}
  async exec(input: LogInsulinInput) {
    const ok = LogInsulinInput.parse(input);
    return this.repo.create({ ...ok });
  }
}
