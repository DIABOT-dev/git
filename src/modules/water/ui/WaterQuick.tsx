"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SaveWaterLog } from "@/modules/water/application/usecases/SaveWaterLog";

export default function WaterQuick() {
  const router = useRouter();
  const [toast, setToast] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("log_water_open"));
    }
  }, []);

  async function handleLog(amount: number) {
    if (loading) return;
    setLoading(true);
    try {
      await SaveWaterLog({
        amount_ml: amount,
        kind: "water",
        taken_at: new Date().toISOString(),
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("log_water_submit_success"));
      }
      setToast(`Đã ghi ${amount} ml nước`);
      setTimeout(() => router.push("/"), 1200);
    } catch (e) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("log_water_submit_error"));
      }
      setToast("Có lỗi xảy ra, thử lại nhé");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div
        className="p-4 rounded-2xl shadow-md"
        style={{ background: "var(--surface-card,#fff)" }}
      >
        <h1 className="text-xl font-semibold mb-6">Uống nước</h1>
        <p className="text-sm text-muted mb-3">Chọn nhanh lượng đã uống:</p>
        <div className="grid grid-cols-2 gap-3">
          {[200, 250].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleLog(v)}
              disabled={loading}
              className="min-h-[44px] rounded-xl text-[15.5px] font-semibold"
              style={{
                background: "var(--color-primary-600,#0ea5a4)",
                color: "#fff",
              }}
            >
              💧 {v} ml
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full mt-6 min-h-[44px] rounded-xl text-[15.5px]"
          style={{ background: "transparent", border: "1px solid #e5e7eb" }}
        >
          ← Quay lại
        </button>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className="px-4 py-3 rounded-xl shadow"
            style={{ background: "#111", color: "#fff" }}
            role="status"
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
