import { z } from "zod";
import { GlucoseLogsRepo } from "@/infrastructure/repositories/GlucoseLogsRepo";
import { LogBGInput } from "@/interfaces/api/validators";
import { GlucoseLog } from "@/domain/types";

export class LogBG {
  constructor(private repo: GlucoseLogsRepo) {}

  async execute(userId: string, input: LogBGInput): Promise<GlucoseLog> {
    const validated = LogBGInput.parse(input);
    
    const log = await this.repo.create({
      user_id: userId,
      value_mgdl: validated.value_mgdl,
      tag: validated.tag,
      taken_at: validated.taken_at
    });

    return log;
  }
}