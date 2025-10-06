// src/modules/chart/ui/ChartPage.tsx
import React from "react";
import { FetchChartData } from "../application/usecases/FetchChartData";
import { ChartVM, Metric, RangeOption } from "../domain/types";
import { track } from "../infrastructure/adapters/Telemetry";
import MetricCards from "./MetricCards";
import TrendChart from "./TrendChart";
import LogTimeline from "./LogTimeline";
import { Segmented } from "./components/ToggleGroup";
import { Skeleton } from "./components/Skeleton";
import { useEffect, useState } from 'react';
import { getFeatureFlag } from '../../../../config/feature-flags';

const metricOptions: { label: string; value: Metric }[] = [ // Đã bỏ "All" khỏi kiểu
  { label: "Đường huyết", value: "BG" },
  { label: "Huyết áp", value: "BP" },
  { label: "Tiêm Insulin", value: "Insulin" },
  { label: "Cân nặng", value: "Weight" },
  { label: "Nước uống", value: "Water" },
  { label: "Bữa ăn", value: "Meal" },
];

export default function ChartPage() {
  const [range, setRange] = React.useState<RangeOption>("7d");
  const [focus, setFocus] = React.useState<Metric>("BG"); // Đặt mặc định là "BG"
  const [vm, setVM] = React.useState<ChartVM | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isOffline, setIsOffline] = React.useState<boolean>(false);

  // Check CHART_FALLBACK flag
  const isChartFallbackEnabled = getFeatureFlag('CHART_FALLBACK');

  React.useEffect(() => {
    track("chart_open", { ts: Date.now() });
  }, []);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true); setError(null); setIsOffline(false);

    FetchChartData(range)
      .then((data) => { if (mounted) setVM(data); })
      .catch((e) => {
        if (mounted) {
          setError(e?.message || "Load error");
          // Check if error indicates network/offline issues
          if (e?.message?.includes('fetch') || e?.message?.includes('network')) {
            setIsOffline(true);
          }
          track("chart_error", { message: e?.message });
        }
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [range]);

  // Show placeholder when CHART_FALLBACK is disabled
  if (!isChartFallbackEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 p-4 rounded-2xl border border-blue-200 bg-blue-50 shadow-sm">
        <div className="text-6xl mb-4">⚙️</div>
        <h3 className="text-lg font-semibold text-blue-800">Đang chuyển sang chế độ cache sau live</h3>
        <p className="text-blue-600 max-w-sm">Chức năng biểu đồ tạm thời bị tắt. Hệ thống đang được cập nhật để tối ưu hiệu suất.</p>
        <div className="flex gap-3 mt-4">
          <a href="/log/bg" className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Tiếp tục ghi nhật ký
          </a>
        </div>
      </div>
    );
  }

  // Show offline state
  if (isOffline) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 p-4 rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
        <div className="text-6xl mb-4">🔌</div>
        <h3 className="text-lg font-semibold text-gray-800">Đang offline</h3>
        <p className="text-gray-600 max-w-sm">Không thể kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.</p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!loading && !error && (!vm || !vm.days || vm.days.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 p-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-800">Chưa có dữ liệu tuần này</h3>
        <p className="text-gray-600 max-w-sm">Bắt đầu ghi nhật ký để xem xu hướng sức khỏe của bạn</p>
        <div className="flex gap-3 mt-4">
          <a href="/log/bg" className="btn btn-primary">
            Ghi đường huyết
          </a>
          <a href="/log/meal" className="btn btn-ghost">
            Ghi bữa ăn
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Segmented
          ariaLabel="Chọn khoảng thời gian"
          value={range}
          onChange={(v) => { setRange(v); track("chart_toggle_range", { range: v }); }}
          options={[{label:"7 ngày", value:"7d"}, {label:"30 ngày", value:"30d"}] as any}
        />
        <div className="flex flex-col items-center gap-2 mt-3 sm:mt-0">
          <h3 className="text-base font-semibold text-gray-800">Chọn bảng báo cáo</h3>
          {/* Thay thế Segmented bằng lưới các nút tùy chỉnh */}
          <div className="grid grid-cols-3 gap-2 w-full"> {/* Sử dụng grid cho 3 cột */}
            {metricOptions.map((opt) => {
              const active = opt.value === focus;
              return (
                <button
                  key={opt.value}
                  onClick={() => setFocus(opt.value)}
                  className={`flex items-center justify-center h-12 rounded-xl border text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${active ? "bg-primary text-white shadow-sm border-primary" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading && <Skeleton className="h-24 rounded-2xl" />}
      {error && <div className="text-sm text-red-600 p-3 rounded-lg bg-red-50 border border-red-200">{error}</div>}
      {vm && <MetricCards kpi={vm.kpi} />}

      {loading && <Skeleton className="h-72 rounded-2xl" />}
      {vm && <TrendChart vm={vm} focus={focus} />}

      {vm && <LogTimeline range={range} metrics={[focus]} />} {/* Truyền focus trực tiếp */}

      {/* Thêm nút hướng dẫn xem báo cáo */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => alert("Hướng dẫn xem báo cáo sẽ được hiển thị tại đây.")} // Placeholder action
          className="px-5 py-2 rounded-xl font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
        >
          Hướng dẫn xem báo cáo
        </button>
      </div>
    </div>
  );
}
