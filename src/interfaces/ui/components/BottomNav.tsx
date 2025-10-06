// src/interfaces/ui/components/BottomNav.tsx
"use client";

import { Home, HeartPulse, User, Plus, Gift, BookOpen, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const BRAND = {
  primary: "#28bdbf",
  primaryHover: "#03c0bc",
  navBorder: "rgba(255,255,255,.18)",
  panelBorder: "rgba(40,189,191,.25)",
};

const Item = ({ to, icon, label }: { to: string; icon: JSX.Element; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === to;

  return (
    <Link
      href={to}
      className="flex flex-col items-center gap-1 py-1 rounded-xl transition-all"
      style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.9)" }}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="h-9 w-9 grid place-items-center rounded-full">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
};

export default function BottomNav() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const notOpen = (msg = "Tính năng này sẽ mở sau MVP. Vui lòng quay lại sau!") =>
    (window as any)?.toast?.info?.(msg) ?? alert(msg);

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[40]">
      {/* ===== Panel “Thêm” (gộp vào 1 file) ===== */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/25 flex justify-end"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="h-full w-80 max-w-[82vw] bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "rgba(0,0,0,.06)" }}
            >
              <p className="text-base font-semibold" style={{ color: BRAND.primary }}>
                Menu bổ sung
              </p>
              <button
                aria-label="Đóng"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-4 grid gap-3">
              <button
                onClick={() => notOpen("Quà tặng sẽ ra mắt sau MVP!")}
                className="h-12 w-full rounded-xl border text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#f2fbfb]"
                style={{ borderColor: BRAND.panelBorder, color: BRAND.primary }}
              >
                <Gift className="h-5 w-5" /> Quà tặng
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/learn");
                }}
                className="h-12 w-full rounded-xl border text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#f2fbfb]"
                style={{ borderColor: BRAND.panelBorder, color: BRAND.primary }}
              >
                <BookOpen className="h-5 w-5" /> Kiến thức
              </button>

              <button
                onClick={() => notOpen("Cộng đồng sẽ ra mắt sau MVP!")}
                className="h-12 w-full rounded-xl border text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#f2fbfb]"
                style={{ borderColor: BRAND.panelBorder, color: BRAND.primary }}
              >
                <Users className="h-5 w-5" /> Cộng đồng
              </button>

<button
  onClick={() => {
    setOpen(false);
    router.push("/settings");
  }}
  className="h-12 w-full rounded-xl border text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#f2fbfb]"
  style={{ borderColor: BRAND.panelBorder, color: BRAND.primary }}
>
  {/* dùng unicode hoặc icon gear nếu bạn đã import */}
  Cài đặt
</button>

              <button
                onClick={() => setOpen(false)}
                className="h-11 w-full mt-1 rounded-xl border font-semibold"
                style={{ borderColor: "rgba(0,0,0,.12)" }}
              >
                Đóng
              </button>
            </div>

            <div className="mt-auto px-4 pb-4 text-center text-xs text-gray-400">DIABOT • More</div>
          </div>
        </div>
      )}

      {/* ===== Thanh điều hướng chính ===== */}
      <nav
        className="mx-4 px-3 pt-2 pb-3 rounded-2xl shadow-[0_-12px_28px_rgba(0,0,0,.18)] border backdrop-blur"
        style={{ backgroundColor: BRAND.primary, borderColor: BRAND.navBorder }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = BRAND.primaryHover)}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = BRAND.primary)}
      >
        <div className="grid grid-cols-4 items-end text-white">
          <Item to="/" icon={<Home className="h-[22px] w-[22px]" />} label="Trang chủ" />
          <Item to="/chart" icon={<HeartPulse className="h-[22px] w-[22px]" />} label="Sức khỏe" />
          <Item to="/profile" icon={<User className="h-[22px] w-[22px]" />} label="Hồ sơ" />
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-1 py-2 rounded-xl text-white/90 hover:text-white"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="more-panel"
          >
            <div className="h-9 w-9 grid place-items-center">
              <Plus className="h-[22px] w-[22px]" />
            </div>
            <span className="text-xs font-semibold">Thêm</span>
          </button>
        </div>
      </nav>
    </div>
  );
  
}
