import { InsulinDose } from "@/domain/entities/InsulinDose";
export interface InsulinRepository {
  create(entry: InsulinDose): Promise<InsulinDose>;
}
