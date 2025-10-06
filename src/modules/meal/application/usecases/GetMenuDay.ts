// src/modules/meal/application/usecases/GetMenuDay.ts
import { MenuRepo } from "../../infrastructure/MenuRepo.static";

export async function GetMenuDay(dayOfWeek:number, level:"basic"|"performance") {
  const repo = new MenuRepo();
  return await repo.getMenuForDay(dayOfWeek, level);
}
