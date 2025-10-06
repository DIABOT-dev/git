import { WaterIntake } from "@/domain/entities/WaterIntake";
export interface WaterRepository {
  create(entry: WaterIntake): Promise<WaterIntake>;
}
