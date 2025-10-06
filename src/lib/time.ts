import { formatISO, startOfDay } from "date-fns";
export const nowIso = () => formatISO(new Date());
export const startOfDayIso = (d = new Date()) => formatISO(startOfDay(d));
