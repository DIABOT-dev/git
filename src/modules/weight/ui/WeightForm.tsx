// src/modules/weight/ui/WeightForm.tsx
"use client";

import { useMemo, useState } from "react";
import { SaveWeightLog } from "@/modules/weight/application/usecases/SaveWeightLog";
import { WeightLogDTO } from "@/modules/weight/domain/types";
import { validateWeightLog } from "@/modules/weight/domain/validators";

const pad = (n: number) => `${n}`.padStart(2, "0");
const localDatetimeValue = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

export default function WeightForm() {
  const [weight, setWeight] = useState<string>("");
  const [takenAt, setTakenAt] = useState<string>(localDatetimeValue());
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success'|'error'} | null>(null);

  
  const disabled = useMemo(
    () => submitting || !weight || Number(weight) < 25 || Number(weight) > 300 || !takenAt,
    [submitting, weight, takenAt]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dto: WeightLogDTO = {
      weight_kg: Number(weight),
      taken_at: new Date(takenAt).toISOString(),
    };
    const err = validateWeightLog(dto);
    if (err) {
      setToast({message: 'Cân nặng phải từ 25-300 kg', type: 'error'});
      return;
    }

    try {
      setSubmitting(true);
      await SaveWeightLog(dto);
      setToast({message: 'Đã lưu cân nặng!', type: 'success'});
      setTimeout(() => history.back(), 1000);
    } catch (error: unknown) {
      setToast({message: 'Có lỗi khi lưu. Vui lòng thử lại.', type: 'error'});
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
            onClick={() => history.back()}
            className="h-10 w-10 rounded-2xl border border-black/10 flex items-center justify-center text-xl leading-none"
          >
            ‹
          </button>
          <h1 className="text-lg font-semibold">Ghi cân nặng</h1>
        </div>
      </header>

      <main className="mx-auto max-w-screen-sm w-full flex-1 px-4 pt-4">
        <form onSubmit={handleSubmit} className="relative flex min-h-[60vh] flex-col gap-5 pb-28" noValidate>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-800">Cân nặng (kg)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={25}
                  max={300}
                  step="0.1"
                  placeholder="VD: 67.2"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="h-12 rounded-2xl border border-black/10 px-4 text-base outline-none
                             focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
                  required
                />
                <p className="text-xs text-black/45">Khoảng hợp lệ: 25–300 kg.</p>
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
                {submitting ? "Đang lưu..." : "Lưu cân nặng"}
              </button>
            </div>
          </div>
        </form>
      </main>
      {toast && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
