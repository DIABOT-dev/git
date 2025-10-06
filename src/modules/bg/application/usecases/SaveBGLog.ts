// src/modules/bg/application/usecases/SaveBGLog.ts
import type { BGLogDTO, SaveResult } from "../../domain/types";
import { validateBG } from "../../domain/validators";
import type { BGRepo } from "../ports/BGRepo";

export class SaveBGLog {
  constructor(private repo: BGRepo) {}

  async execute(dto: BGLogDTO): Promise<SaveResult> {
    const v = validateBG(dto);
    if (!v.valid) return { ok: false, status: 400, error: (v as any).message };

    // latency metric (optional)
    const t0 = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    const res = await this.repo.save(dto);
    const latency = ((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()) - t0;
    // TODO: telemetry: log_bg_submit_success / _error with { latency, unit: dto.unit, context: dto.context, device: navigator.userAgent }
    return res;
  }
}