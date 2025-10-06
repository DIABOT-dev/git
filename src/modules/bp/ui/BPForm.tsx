"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SaveBPLog } from "@/modules/bp/application/usecases/SaveBPLog";
import type { BPLog } from "../domain/types";

function nowLocalISO(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function BPForm() {
  const router = useRouter();

  // 🟢 State cho form
  const [systolic, setSystolic] = React.useState<string>("");
  const [diastolic, setDiastolic] = React.useState<string>("");
  const [pulse, setPulse] = React.useState<string>(""); // 👈 THÊM STATE Ở ĐÂY
  const [takenAt, setTakenAt] = React.useState<string>(nowLocalISO());
  const [submitting, setSubmitting] = React.useState(false);
  const [toast, setToast] = React.useState<{message: string; type: 'success'|'error'} | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // 🟢 Truyền dữ liệu vào usecase
    const dto: BPLog = {
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      pulse: pulse ? Number(pulse) : undefined,
      taken_at: new Date(takenAt).toISOString(),
    };

    const sys = Number(systolic);
    const dia = Number(diastolic);
    if (sys < 80 || sys > 200 || dia < 50 || dia > 120) {
      setToast({message: 'Tâm thu 80-200 mmHg, tâm trương 50-120 mmHg', type: 'error'});
      setSubmitting(false);
      return;
    }

    try {
      await SaveBPLog(dto);
      setToast({message: 'Đã ghi huyết áp!', type: 'success'});
      setTimeout(() => router.back(), 1000);
    } catch (err: any) {
      setToast({message: 'Có lỗi. Vui lòng thử lại.', type: 'error'});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-[100svh] flex flex-col"
      style={{ background: "var(--surface-bg,#f7f8f9)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3"
        style={{
          background: "var(--surface-bg,#f7f8f9)",
          borderBottom: "1px solid var(--border,#ececec)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl"
          aria-label="Quay lại"
          style={{
            background: "var(--surface-card,#fff)",
            boxShadow: "var(--shadow-card,0 1px 2px rgba(16,24,40,.06))",
            border: "1px solid var(--border,#e5e7eb)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1
          className="text-[1.125rem] font-bold"
          style={{ color: "var(--text-primary,#0f172a)" }}
        >
          Ghi huyết áp
        </h1>
      </header>

      {/* Body */}
      <div className="grow flex">
        <div className="w-full max-w-[640px] mx-auto px-4 pt-8 pb-24 md:pt-16">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl p-4 md:p-6"
            style={{
              background: "var(--surface-card,#fff)",
              boxShadow: "var(--shadow-card,0 6px 24px rgba(16,24,40,.06))",
              border: "1px solid var(--border,#e5e7eb)",
            }}
          >
            {/* Systolic */}
            <div className="mb-4">
              <label htmlFor="systolic" className="block mb-2 font-semibold">
                Tâm thu (mmHg)
              </label>
              <input
                id="systolic"
                type="number"
                inputMode="numeric"
                required
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="118"
                className="w-full h-12 px-4 rounded-2xl outline-none"
              />
            </div>

            {/* Diastolic */}
            <div className="mb-4">
              <label htmlFor="diastolic" className="block mb-2 font-semibold">
                Tâm trương (mmHg)
              </label>
              <input
                id="diastolic"
                type="number"
                inputMode="numeric"
                required
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="78"
                className="w-full h-12 px-4 rounded-2xl outline-none"
              />
            </div>

            {/* Pulse */}
            <div className="mb-4">
              <label htmlFor="pulse" className="block mb-2 font-semibold">
                Nhịp tim (lần/phút)
              </label>
              <input
                id="pulse"
                type="number"
                inputMode="numeric"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="70"
                className="w-full h-12 px-4 rounded-2xl outline-none"
              />
              {/* 🟢 Hướng dẫn cho người dùng */}
              <p className="text-sm text-gray-500 mt-1">
                Thường hiển thị trên máy đo: SYS/DIA mmHg, DIA - mmHg, PULSE/min
              </p>
            </div>

            {/* Time */}
            <div className="mb-6">
              <label htmlFor="taken_at" className="block mb-2 font-semibold">
                Thời gian đo
              </label>
              <input
                id="taken_at"
                type="datetime-local"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl outline-none"
                max={nowLocalISO()}
              />
            </div>

            {/* Submit */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 rounded-2xl font-extrabold tracking-wide text-white"
                style={{
                  background: "var(--color-primary-700,#0e7490)",
                  opacity: submitting ? 0.75 : 1,
                }}
              >
                {submitting ? "Đang lưu…" : "Ghi lại"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {toast && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white z-50`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
