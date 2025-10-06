// src/modules/meal/application/usecases/GetMenuByDay.ts
import { MenuRepo } from "../../infrastructure/MenuRepo.static";

export type MenuLevel = "basic" | "performance";
export type MenuItem = { meal_type:"breakfast"|"lunch"|"dinner"|"snack"; name:string; tip?:string };
export type DayMenu = { day_of_week:number; items:MenuItem[]; note?:string };

export function getISOWeekDay(dateISO: string) {
  const d = new Date(dateISO);
  const dow = d.getDay(); // 0=Sun
  return ((dow + 6) % 7) + 1; // Mon=1..Sun=7
}

export async function GetMenuByDay(dateISO: string, level: MenuLevel) {
  const repo = new MenuRepo();
  const dow = getISOWeekDay(dateISO);
  return await repo.getMenuForDayOfWeek(dow, level);
}
