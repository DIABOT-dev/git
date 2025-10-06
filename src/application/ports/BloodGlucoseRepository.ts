import { BloodGlucose } from "@/domain/entities/BloodGlucose";
export interface BloodGlucoseRepository {
  create(entry: BloodGlucose): Promise<BloodGlucose>;
}
