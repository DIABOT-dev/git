// src/modules/water/ui/WaterForm.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SaveWaterLog } from "@/modules/water/application/usecases/SaveWaterLog";
import { SaveWaterLogDTO, WaterKind } from "@/modules/water/domain/types";
import { validateWater } from "@/modules/water/domain/validators";

const pad = (n: number) => `${n}`.padStart(2, "0");
const localDatetimeValue = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

export default function WaterForm() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [kind, setKind] = useState<WaterKind>("water");
  const [takenAt, setTakenAt] = useState<string>(localDatetimeValue());
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const disabled = useMemo(
    () => submitting || !amount || Number(amount) <= 0 || Number(amount) > 5000 || !takenAt,
    [submitting, amount, takenAt]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);

    const numAmount = Number(amount);
    const dto: SaveWaterLogDTO = {
      amount_ml: isNaN(numAmount) ? 0 : numAmount,
      kind,
      taken_at: new Date(takenAt).toISOString(),
    };

    const validationResult = validateWater(dto);
    if (!validationResult.ok) {
      setToast(`Lỗi: ${validationResult.errors.join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      await SaveWaterLog(dto);
      setToast("Đã ghi lượng nước!");
      setAmount(""); // Clear input after successful save
      router.back(); // Go back to previous page (e.g., dashboard)
    } catch (error: unknown) {
      setToast((error instanceof Error ? error.message : String(error)) ?? "Có lỗi khi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/85">
        <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="Quay lại"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-2xl border border-black/10 flex items-center justify-center text-xl leading-none"
          >
            ‹
          </button>
          <h1 className="text-lg font-semibold">Ghi nước uống</h1>
        </div>
      </header>

      <main className="mx-auto max-w-screen-sm w-full flex-1 px-4 pt-4">
        <form onSubmit={handleSubmit} className="relative flex min-h-[60vh] flex-col gap-5 pb-28" noValidate>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-800">Lượng nước (ml)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={5000}
                  step="1"
                  placeholder="VD: 250"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 rounded-2xl border border-black/10 px-4 text-base outline-none
                             focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
                  required
                />
                <p className="text-xs text-black/45">Khoảng hợp lệ: 1–5000 ml.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-800">Loại nước</label>
                <div className="flex gap-2">
                  {(["water", "tea", "other"] as WaterKind[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKind(k)}
                      className={`flex-1 h-12 rounded-2xl border ${
                        kind === k ? "bg-[var(--color-primary-600)] text-white" : "bg-white"
                      }`}
                    >
                      {k === "water" ? "Nước lọc" : k === "tea" ? "Trà" : "Khác"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-800">Thời gian</label>
                <input
                  type="datetime-local"
                  value={takenAt}
                  onChange={(e) => setTakenAt(e.target.value)}
                  className="h-12 rounded-2xl border border-black/10 px-4 text-base outline-none
                             focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
                  required
                />
              </div>
            </div>
          </div>

          <div
            className="sticky + bottom-10 inset-x-0 bottom-0 px-4 pb-[env(safe-area-inset-bottom,12px)] pt-3"
            style={{
              background:
                "linear-gradient(180deg, rgba(247,248,249,0) 0%, var(--surface-bg,#f7f8f9) 40%, var(--surface-bg,#f7f8f9) 100%)",
            }}
          >
            <div className="mx-auto max-w-screen-sm">
              <button
                type="submit"
                disabled={disabled}
                className="h-12 w-full rounded-2xl font-semibold text-white shadow-md
                           disabled:opacity-60 disabled:cursor-not-allowed
                           bg-gradient-to-r from-brand to-brand2
                           transition active:scale-[0.99]"
                style={{
                  background:
                    "linear-gradient(90deg, var(--brand-primary,#28bdbf) 0%, var(--brand-accent,#03c0bc) 100%)",
                }}
              >
                {submitting ? "Đang lưu..." : "Lưu nước uống"}
              </button>
            </div>
          </div>
        </form>
      </main>
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 p-3 bg-black text-white rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
