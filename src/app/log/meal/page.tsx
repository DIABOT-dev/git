// src/app/log/meal/page.tsx
import dynamic from "next/dynamic";
import Link from "next/link"; // Đảm bảo dòng này có mặt

const MealDashboard = dynamic(() => import("../../../modules/meal/ui/MealDashboard"), { ssr: false });

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-screen-sm px-4 h-14 flex items-center gap-3">
          <Link // Component Link được sử dụng ở đây
            href="/"
            aria-label="Quay lại"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border hover:bg-gray-50"
          >
            ←
          </Link>
          <h1 className="text-lg font-semibold">Thực đơn theo lịch</h1>
        </div>
      </header>
      <section className="mx-auto max-w-screen-sm px-4 py-4">
        <MealDashboard />
      </section>
    </main>
  );
}
