// /src/components/BackHomeBar.tsx
"use client";
import Link from "next/link";

export default function BackHomeBar({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-10 mb-4 flex items-center gap-3 border-b bg-white/80 p-4 backdrop-blur">
      <Link
        href="/"
        className="rounded-xl border px-3 py-1.5 text-sm hover:bg-muted"
        aria-label="Về trang chủ"
      >
        ← Trang chủ
      </Link>
      <h1 className="text-lg font-semibold">{title}</h1>
    </div>
  );
}
