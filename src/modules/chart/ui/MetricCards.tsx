// src/modules/chart/ui/MetricCards.tsx
import React from "react";
import { KPI } from "../domain/types";
import Card from "@/interfaces/ui/components/atoms/Card";
import Stat from "@/interfaces/ui/components/atoms/Stat";

export default function MetricCards({ kpi }: { kpi: KPI }) {
  return (
    <div> {/* Wrapper div cho tiêu đề */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Chỉ số trung bình</h3> {/* Tiêu đề mới */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <Stat label="Đường huyết" value={kpi.bg_avg_7d?.toFixed(0) ?? "—"} hint="mg/dL" />
        </Card>
        <Card>
          <Stat label="Huyết áp trung bình" value={kpi.bp_sys_avg_7d && kpi.bp_dia_avg_7d ? `${kpi.bp_sys_avg_7d.toFixed(0)}/${kpi.bp_dia_avg_7d.toFixed(0)}` : "—"} />
        </Card>
        <Card>
          <Stat label="Cân nặng" value={kpi.weight_current?.toFixed(1) ?? "—"} hint={kpi.weight_delta_7d!=null?`${kpi.weight_delta_7d>0?"+":""}${kpi.weight_delta_7d} kg vs 7d`:undefined} />
        </Card>
        <Card>
          <Stat label="Nước uống" value={kpi.water_ml_avg_7d?.toFixed(0) ?? "—"} hint="ml/ngày" />
        </Card>
        <Card>
          <Stat label="Tiêm Insulin" value={kpi.insulin_units_avg_daily?.toFixed(1) ?? "—"} hint="IU/ngày" />
        </Card>
        {/* Thẻ "Bữa ăn trung bình" đã được loại bỏ */}
      </div>
    </div>
  );
}
