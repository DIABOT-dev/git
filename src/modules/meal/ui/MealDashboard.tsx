// src/modules/meal/ui/MealDashboard.tsx
"use client";
import { useState } from "react";
import Calendar from "./components/Calendar";
import MealDaySheet from "./components/MealDaySheet";

export default function MealDashboard(){
  const [openDate, setOpenDate] = useState<string|null>(null);
  return (
    <div className="p-4 space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Thực đơn theo lịch</h1>
          <p className="text-sm text-gray-500">Chọn ngày để xem thực đơn • Basic / Hiệu suất cao</p>
        </div>
      </header>
      <Calendar onPickDate={(iso)=>setOpenDate(iso)} />
      {openDate && <MealDaySheet dateISO={openDate} onClose={()=>setOpenDate(null)} />}
    </div>
  );
}
