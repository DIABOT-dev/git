import { Meal } from "@/domain/entities/Meal";
export interface MealRepository {
  create(entry: Meal): Promise<Meal>;
}
