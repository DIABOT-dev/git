// src/modules/meal/ui/components/Calendar.tsx
"use client";
import { useMemo, useState } from "react";

function startOfMonth(d: Date){ return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysInMonth(d: Date){ return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); }
function vnMonthName(d: Date){
  const m = d.toLocaleString("vi-VN", { month: "long" }).replace(/^\w/, c=>c.toUpperCase());
  return `${m} ${d.getFullYear()}`;
}
function chunk<T>(arr:T[], size:number){ const out:T[][]=[]; for(let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size)); return out; }

export default function Calendar({ onPickDate }:{ onPickDate:(iso:string)=>void }){
  const [cursor, setCursor] = useState(()=> new Date());
  const meta = useMemo(()=>{
    const first = startOfMonth(cursor);
    const dow = first.getDay();                 // 0=CN
    const blanks = ((dow + 6) % 7);             // Thứ 2 bắt đầu tuần
    const total = daysInMonth(cursor);
    const cells:(Date|null)[] = [];
    for(let i=0;i<blanks;i++) cells.push(null);
    for(let d=1; d<=total; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    // luôn đủ bội số 7 để chia tuần
    while (cells.length % 7 !== 0) cells.push(null);
    return { rows: chunk(cells, 7) };
  }, [cursor]);

  const todayStr = new Date().toDateString();

  // (Stub) ngày có cập nhật menu -> gắn New
  function isNewFor(_d: Date){ return false; }

  return (
    <div className="w-full">
      {/* Header tháng theo brand */}
      <div className="mb-3 flex items-center justify-between">
        <button
          className="rounded-full border w-9 h-9 grid place-items-center hover:bg-gray-50"
          onClick={()=> setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))}
          aria-label="Tháng trước"
        >‹</button>
        <h2 className="text-xl font-semibold text-teal-700">{vnMonthName(cursor)}</h2>
        <button
          className="rounded-full border w-9 h-9 grid place-items-center hover:bg-gray-50"
          onClick={()=> setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))}
          aria-label="Tháng sau"
        >›</button>
      </div>

      {/* Tên thứ */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 pb-2">
        {["T2","T3","T4","T5","T6","T7","CN"].map(d=>(
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Lưới tuần – chỉ kẻ 1 đường giữa các hàng */}
      <div className="divide-y">
        {meta.rows.map((row, ri)=>(
          <div key={ri} className="grid grid-cols-7 gap-x-1 py-2">
            {row.map((d, ci)=>{
              if (!d) return <div key={ci} className="h-12" />;
              const isToday = d.toDateString()===todayStr;
              const iso = d.toISOString();
              const hasNew = isNewFor(d);

              return (
                <button
                  key={ci}
                  onClick={()=> onPickDate(iso)}
                  className="group text-left px-2 h-12 focus:outline-none"
                >
                  <div className={"text-sm font-semibold " + (isToday ? "text-teal-700" : "text-gray-800")}>
                    {d.getDate()}
                  </div>
                  <div className="text-[11px] leading-4">
                    <span className="text-teal-600 group-hover:underline">Xem</span>
                    {hasNew && <span className="ml-1 text-amber-600 font-medium">New</span>}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

