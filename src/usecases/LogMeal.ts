import { z } from "zod";
import { MealRepository } from "@/application/ports/MealRepository";

export const LogMealInput = z.object({
  userId: z.string().min(1),
  mealType: z.enum(["breakfast","lunch","dinner","snack"]),
  foodsText: z.string().min(1),
  portion: z.enum(["low","medium","high"]),
  at: z.string().datetime()
});
export type LogMealInput = z.infer<typeof LogMealInput>;

export class LogMeal {
  constructor(private repo: MealRepository) {}
  async exec(input: LogMealInput) {
    const ok = LogMealInput.parse(input);
    return this.repo.create({ ...ok });
  }
}
