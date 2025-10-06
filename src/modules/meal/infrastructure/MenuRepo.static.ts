// src/modules/meal/infrastructure/MenuRepo.static.ts
import basic from "./data/menu_basic.json";
import performance from "./data/menu_performance.json";

export type MenuItem = { meal_type:"breakfast"|"lunch"|"dinner"|"snack"; name:string; tip?:string };
export type DayMenu = { day_of_week:number; items:MenuItem[]; note?:string };

export class MenuRepo {
  async getMenuForDayOfWeek(day_of_week: number, level: "basic"|"performance"): Promise<DayMenu | null> {
    const src = (level === "basic" ? (basic as any) : (performance as any));
    const day = (src.days as DayMenu[]).find(d => d.day_of_week === day_of_week);
    return day ?? null;
  }

  // Alias for compatibility
  async getMenuForDay(day_of_week: number, level: "basic"|"performance"): Promise<DayMenu | null> {
    return this.getMenuForDayOfWeek(day_of_week, level);
  }
}
