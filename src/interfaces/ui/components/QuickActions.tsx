"use client";

import { Droplets, Activity, Pill, Salad } from "lucide-react";
import { useRouter } from "next/navigation";

// Kiểu props (nếu đang dùng từ nơi khác có thể giữ nguyên)
type QAProps = { icon: JSX.Element; label: string; to: string };

function QA({ icon, label, to }: QAProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(to)}
      className="flex flex-col items-center gap-2 p-3 rounded-xl2 bg-primaryTint text-ink tap"
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

export default function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2">
      <QA icon={<Droplets size={20} />} label="Water" to="/chat?flow=water" />
      <QA icon={<Activity size={20} />} label="Glucose" to="/chat?flow=glucose" />
      <QA icon={<Pill size={20} />} label="Insulin" to="/chat?flow=insulin" />
      <QA icon={<Salad size={20} />} label="Meal" to="/chat?flow=meal" />
    </div>
  );
}
