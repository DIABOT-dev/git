"use client";
import React from "react";
import Link from "next/link";
import ChartPage from "@/modules/chart/ui/ChartPage";
import { ChevronLeft } from 'lucide-react'; // Thêm import này
import AuthGate from '@/interfaces/ui/components/AuthGate'; // Thêm dòng này

export default function Page() {
  return (
    <AuthGate> {/* Bọc toàn bộ nội dung */}
    <main className="min-h-screen bg-white py-4"> {/* Thêm padding-y */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-screen-sm px-4 h-14 flex items-center gap-3">
          <button // Thay Link bằng button
            onClick={() => history.back()} // Sử dụng history.back() để quay lại
            aria-label="Quay lại"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-gray-50"
          >
            <ChevronLeft size={20} /> {/* Sử dụng icon ChevronLeft */}
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Biểu đồ tổng hợp</h1> {/* Đảm bảo màu chữ */}
        </div>
      </header>
      <section className="mx-auto max-w-screen-sm px-4 py-4"> {/* Giữ nguyên padding-x và thêm padding-y */}
        <ChartPage />
      </section>
    </main>
    </AuthGate>
  );
}
