"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Card from "../components/Card";
import { TrendingUp } from 'lucide-react';

const GlucoseLine = dynamic(() => import('@components/charts/GlucoseLine'), { 
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center"><p className="text-sm text-gray-500">Đang tải biểu đồ…</p></div>
});

type Point = { t: string; v: number };

export default function Charts() {
  const [win, setWin] = useState<"7d" | "30d">("7d");
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const userId = process.env.NEXT_PUBLIC_DEMO_USER_ID || "00000000-0000-0000-0000-000000000000";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr(null);
        const res = await fetch(`/api/chart/avg_glucose?window=${win}&userId=${userId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Fetch chart failed");
        // expect {points: [{day:"2025-09-01", value:123}, ...]}
        const points = json.points || [];
        setData(points.map((p: any) => ({ t: p.day, v: p.value })));
      } catch (e: any) {
        setErr(e?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, [win, userId]);

  const chartData = useMemo(() => data.map(d => ({ d: d.t?.slice(5) || '', glucose: d.v || 0 })), [data]);

  return (
    <div className="px-4 pb-24 grid gap-4">
      <Card>
        <div className="flex items-center justify-between">
          <p className="font-semibold">Đường huyết trung bình ({win.toUpperCase()})</p>
          <div className="flex gap-2">
            <button className={win==="7d" ? "btn" : "btn-outline"} onClick={()=>setWin("7d")}>7 ngày</button>
            <button className={win==="30d" ? "btn" : "btn-outline"} onClick={()=>setWin("30d")}>30 ngày</button>
          </div>
        </div>

        <div className="mt-2">
          {!loading && data.length === 0 ? (
            <div className="text-center py-12">
             <div className="mb-3 flex justify-center">
  <TrendingUp size={48} className="text-gray-400" />
</div>
              <p className="text-gray-500 mb-4">Chưa có dữ liệu, hãy ghi log đầu tiên.</p>
              <button onClick={()=>history.back()} className="btn btn-primary btn-md">
                + Ghi log
              </button>
            </div>
          ) : (
            <GlucoseLine data={chartData} loading={loading} error={err} />
          )}
        </div>
      </Card>

      <button onClick={()=>history.back()} className="btn-outline">← Quay về trước</button>
    </div>
  );
}
