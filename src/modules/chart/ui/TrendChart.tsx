import React from "react";
import { ChartVM, Metric } from "../domain/types";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend, ResponsiveContainer,
} from "recharts";

type Props = { vm: ChartVM; focus: Metric | "All" };

export default function TrendChart({ vm, focus }: Props) {
  const data = vm.days.map(d => ({
    date: d.date,
    BG: d.bg_avg,
    BP_SYS: d.bp_sys_avg,
    BP_DIA: d.bp_dia_avg,
    Weight: d.weight_kg,
    Water: d.water_ml,
    Insulin: d.insulin_units,
    Meal: d.meals_count,
  }));

  const primaryColor = "var(--color-primary)";
  const secondaryColor = "var(--color-primary-600)";

  if (focus === "BG" || focus === "Weight") {
    return (
      <ChartFrame>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" stroke="var(--color-text-muted)" />
          <YAxis stroke="var(--color-text-muted)" />
          <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', maxWidth: '200px', wordBreak: 'break-word' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '16px' }} />
          <Line type="monotone" dataKey={focus} stroke={primaryColor} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ChartFrame>
    );
  }

  if (focus === "BP") {
    return (
      <ChartFrame>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" stroke="var(--color-text-muted)" />
          <YAxis stroke="var(--color-text-muted)" />
          <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', maxWidth: '200px', wordBreak: 'break-word' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '16px' }} />
          <Line type="monotone" dataKey="BP_SYS" stroke={primaryColor} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="BP_DIA" stroke={secondaryColor} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ChartFrame>
    );
  }

  if (focus === "Water" || focus === "Insulin" || focus === "Meal") {
    return (
      <ChartFrame>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" stroke="var(--color-text-muted)" />
          <YAxis stroke="var(--color-text-muted)" />
          <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', maxWidth: '200px', wordBreak: 'break-word' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '16px' }} />
          <Bar dataKey={focus} fill={primaryColor} />
        </BarChart>
      </ChartFrame>
    );
  }

  // All → hiển thị BG + Weight (gọn, dễ đọc). Có thể mở rộng nếu muốn.
  return (
    <ChartFrame>
      <ComposedAll data={data} />
    </ChartFrame>
  );
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-2 bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>{children as any}</ResponsiveContainer>
      </div>
    </div>
  );
}

function ComposedAll({ data }: { data: any[] }) {
  const primaryColor = "var(--color-primary)";
  const secondaryColor = "var(--color-primary-600)";
  return (
    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
      <XAxis dataKey="date" stroke="var(--color-text-muted)" />
      <YAxis stroke="var(--color-text-muted)" />
      <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
      <Legend wrapperStyle={{ paddingTop: '10px' }} />
      <Line type="monotone" dataKey="BG" stroke={primaryColor} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
      <Line type="monotone" dataKey="Weight" stroke={secondaryColor} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
    </LineChart>
  );
}
