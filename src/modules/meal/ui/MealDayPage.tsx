// src/modules/meal/ui/MealDayPage.tsx
"use client";
import { useEffect, useState } from "react";
import { GetMenuDay } from "../application/usecases/GetMenuDay";

type MenuItem = { meal_type:"breakfast"|"lunch"|"dinner"|"snack"; name:string; tip?:string };
type DayMenu = { day_of_week:number; items:MenuItem[]; note?:string };

export default function MealDayPage({dateISO,onClose}:{dateISO:string;onClose:()=>void}){
  const [level,setLevel] = useState<"basic"|"performance">("basic");
  const [menu,setMenu] = useState<DayMenu|null>(null);

  useEffect(()=>{
    const d=new Date(dateISO); const dow=((d.getDay()+6)%7)+1;
    GetMenuDay(dow,level).then(setMenu);
  },[dateISO,level]);

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-white w-full rounded-t-xl p-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Thực đơn ngày {new Date(dateISO).toLocaleDateString()}</h2>
          <button onClick={onClose} className="border px-2 py-1 rounded">Đóng</button>
        </div>
        <div className="flex gap-2 mb-3">
          <button onClick={()=>setLevel("basic")} className={level==="basic"?"bg-blue-600 text-white px-3 py-1":"border px-3 py-1"}>Basic</button>
          <button onClick={()=>setLevel("performance")} className={level==="performance"?"bg-blue-600 text-white px-3 py-1":"border px-3 py-1"}>Hiệu suất cao</button>
        </div>
        {!menu && <div>Chưa có thực đơn.</div>}
        {menu && menu.items.map((it,i)=>(
          <div key={i} className="border rounded p-3 mb-2">
            <div className="font-medium">{it.name}</div>
            {it.tip && <div className="text-sm text-gray-500">{it.tip}</div>}
            <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded">Chọn bữa này</button>
          </div>
        ))}
        <div className="mt-4">
          <button className="w-full border rounded py-2">+ Món ngoài</button>
        </div>
      </div>
    </div>
  )
}
