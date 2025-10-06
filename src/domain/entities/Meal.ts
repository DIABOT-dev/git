export interface Meal {
  id?: string;
  userId: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodsText: string;
  portion: "low" | "medium" | "high";
  at: string; // ISO
}
