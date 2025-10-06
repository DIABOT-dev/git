import { BGLogDTO, SaveResult } from "../../domain/types";

export interface BGRepo {
  save(dto: BGLogDTO): Promise<SaveResult>;
}