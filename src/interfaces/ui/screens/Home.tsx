"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "../components/Card";
import QuickActions from "../components/QuickActions";

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="px-4 pb-32 grid gap-3">
      <div className="bg-gradient-to-b from-primary/15 to-transparent rounded-xl3 p-4">
        <p className="text-sm text-muted">Kế hoạch hôm nay</p>
        <h2 className="text-2xl font-bold">Hãy hoàn thành các mục tiêu</h2>
      </div>

      <Card>
        <p className="font-semibold mb-1">Dữ liệu cá nhân</p>
        <p className="text-sm text-muted">Tổng hợp biểu đồ & nhật ký của bạn</p>
        <div className="mt-2">
          <Link href="/health" className="btn-outline">Mở bảng dữ liệu</Link>
        </div>
      </Card>

      <Card>
        <p className="font-semibold mb-1">Khám phá & nhận thưởng</p>
        <p className="text-sm text-muted">Hoàn thành thử thách để nhận điểm</p>
        <div className="mt-2">
          <Link href="/rewards" className="btn">Mở</Link>
        </div>
      </Card>

      <Card>
        <p className="font-semibold mb-1">Bắt đầu nhanh</p>
        <QuickActions />
      </Card>

      <Card>
        <p className="font-semibold mb-2">Bản tin cộng đồng</p>
        <div className="grid gap-3">
          <a className="block p-3 rounded-xl2 border hover:bg-gray-50" href="#" onClick={(e)=>e.preventDefault()}>
            <p className="font-semibold">5 thực đơn ít đường cho bữa sáng</p>
            <p className="text-sm text-muted">Bác sĩ Linh tổng hợp thực đơn từ 350–450 kcal…</p>
          </a>
          <a className="block p-3 rounded-xl2 border hover:bg-gray-50" href="#" onClick={(e)=>e.preventDefault()}>
            <p className="font-semibold">Đi bộ bao nhiêu phút để hạ đường huyết?</p>
            <p className="text-sm text-muted">Nghiên cứu cho thấy 7–10 phút sau bữa ăn giúp…</p>
          </a>
        </div>
      </Card>
    </div>
  );
}
