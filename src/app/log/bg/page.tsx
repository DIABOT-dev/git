"use client";

import { useRouter } from "next/navigation";
import { BGForm } from "@/modules/bg/ui/BGForm";

export default function BGLogPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-md px-[var(--sp-4)] py-[var(--sp-4)]">
      {/* Header: Back + Title (UI-only, không chứa validate/API) */}
      <div className="flex items-center gap-3 mb-[var(--sp-4)]">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Quay lại"
          className="h-10 w-10 rounded-full border border-black/10 flex items-center justify-center"
        >
          {/* mũi tên đơn giản bằng dấu < */}
          <span className="text-lg leading-none select-none">&lt;</span>
        </button>

        <h1 className="text-2xl font-bold">Ghi đường huyết</h1>
      </div>

      {/* Route chỉ compose từ module BG */}
      <BGForm />
    </main>
  );
}
