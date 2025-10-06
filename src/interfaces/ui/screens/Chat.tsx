"use client";

import Card from "../components/Card";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function Chat() {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParams = sp || new URLSearchParams();
  const flow = searchParams.get("flow") || "welcome";

  const blocks: Record<string, any[]> = {
    welcome: [
      <Card key="w1"><p className="font-semibold">Xin chào Tuấn Anh — Hôm nay ta làm gì?</p></Card>,
      <div key="w2" className="grid grid-cols-2 gap-2">
        <button onClick={()=>router.push("/chat?flow=glucose")} className="btn">Ghi đường huyết</button>
        <button onClick={()=>router.push("/chat?flow=med")} className="btn-outline">Nhắc thuốc</button>
        <button onClick={()=>router.push("/chat?flow=meal")} className="btn-outline">Gợi ý bữa</button>
        <button onClick={()=>router.push("/chat?flow=missions")} className="btn-outline">Nhận thưởng</button>
      </div>
    ],
    glucose: [
      <Card key="g1"><p className="font-semibold">Ghi đường huyết</p><p className="text-sm text-muted">Chọn thời điểm</p></Card>,
      <div key="g2" className="grid grid-cols-2 gap-2">
        <button onClick={()=>alert("Đã ghi FPG=115 mg/dL")} className="btn">Trước ăn (FPG)</button>
        <button onClick={()=>alert("Đã ghi PP2=162 mg/dL")} className="btn-outline">Sau ăn (PP2)</button>
      </div>
    ],
    med: [
      <Card key="m1"><p className="font-semibold">Nhắc thuốc</p><p className="text-sm text-muted">Đã đến giờ Metformin 500mg</p></Card>,
      <div key="m2" className="grid grid-cols-2 gap-2">
        <button onClick={()=>alert("Đã ghi: ĐÃ UỐNG")} className="btn">Đã uống</button>
        <button onClick={()=>alert("Đã ghi: QUÊN UỐNG")} className="btn-outline">Quên uống</button>
      </div>
    ],
    missions: [
      <Card key="t1"><p className="font-semibold">Nhiệm vụ hôm nay</p><ul className="list-disc pl-5 text-sm"><li>Uống 2,000 ml nước (+5)</li><li>Đi 5,000 bước (+5)</li><li>Ghi đường huyết 1 lần (+5)</li></ul></Card>,
      <div key="t2" className="grid grid-cols-2 gap-2">
        <button onClick={()=>alert("Đánh dấu hoàn thành")} className="btn">Hoàn thành</button>
        <button onClick={()=>router.push("/charts")} className="btn-outline">Xem tiến độ</button>
      </div>
    ],
    meal: [
      <Card key="l1"><p className="font-semibold">Gợi ý bữa ăn</p><p className="text-sm text-muted">Gạo lứt 80g + ức gà 120g + rau 200g</p></Card>,
      <div key="l2" className="grid grid-cols-2 gap-2">
        <button onClick={()=>alert("Đã nhận nhiệm vụ bữa ăn")} className="btn">Nhận nhiệm vụ</button>
        <button onClick={()=>router.push("/")} className="btn-outline">Về Trang chủ</button>
      </div>
    ]
  };

  return (
    <div className="px-4 pb-24 grid gap-3">
      {(blocks[flow] || blocks.welcome).map((b, i) => <div key={i}>{b}</div>)}
      <button onClick={()=>router.push("/")} className="btn-outline mt-2">← Quay về Trang chủ</button>
    </div>
  );
}
