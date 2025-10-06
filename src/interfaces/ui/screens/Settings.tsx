"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, User, Shield, Bell, Bot, BookMarked, Info } from "lucide-react";

const brand = {
  bg: "#f5f7fb",
  primary: "#28bdbf",
};

export default function Settings() {
  const router = useRouter();

  // TODO: bind thực tế
  const displayName = "Đặng Tuấn Anh";
  const phone = "09895185688";
  const appVersion = "0.9.0-MVP";

  return (
    <div className="min-h-screen" style={{ background: brand.bg }}>
      {/* Header */}
      <div className="bg-gradient-to-b from-[#2cc7c9] to-[#22b3b5] text-white pt-10 pb-6 px-4">
        <h1 className="text-center text-lg font-semibold">Cài đặt</h1>
      </div>

      <div className="-mt-4 px-4 pb-24 space-y-10">
        {/* Tài khoản & Bảo mật */}
        <Section title="Tài khoản">
          <RowButton
            icon={<User className="h-5 w-5 text-[#28bdbf]" />}
            title={displayName}
            sub={phone}
            onClick={() => router.push("/profile")}
          />
          <Divider />
          <RowButton
            icon={<Shield className="h-5 w-5 text-[#28bdbf]" />}
            title="Bảo mật"
            sub="Mã PIN, sinh trắc học"
            onClick={() => router.push("/settings/account")} // stub
          />
        </Section>

        {/* Trợ lý AI */}
        <Section title="Trợ lý AI">
          <RowButton
            icon={<Bot className="h-5 w-5 text-[#28bdbf]" />}
            title="Persona"
            sub="Friend (mặc định)"
            onClick={() => router.push("/settings/ai")}
          />
          <Divider />
          <RowButton
            icon={<Bot className="h-5 w-5 text-[#28bdbf]" />}
            title="Mức hướng dẫn"
            sub="Chuẩn – gợi ý an toàn"
            onClick={() => alert("Mở cấu hình AI (TODO)")}
          />
        </Section>

        {/* Thông báo */}
        <Section title="Thông báo">
          <RowButton
            icon={<Bell className="h-5 w-5 text-[#28bdbf]" />}
            title="Nhắc đường huyết"
            sub="Bật"
            onClick={() => router.push("/settings/notifications")}
          />
          <Divider />
          <RowButton
            icon={<Bell className="h-5 w-5 text-[#28bdbf]" />}
            title="Nhắc uống nước"
            sub="Bật"
            onClick={() => router.push("/settings/notifications")}
          />
        </Section>

        {/* Quyền riêng tư & Dữ liệu */}
        <Section title="Quyền riêng tư">
          <RowButton
            icon={<BookMarked className="h-5 w-5 text-[#28bdbf]" />}
            title="Điều khoản sử dụng"
            onClick={() => router.push("/terms")}
          />
          <Divider />
          <RowButton
            icon={<Shield className="h-5 w-5 text-[#28bdbf]" />}
            title="Chính sách bảo mật"
            onClick={() => router.push("/privacy")}
          />
          <Divider />
          <RowButton
            icon={<Shield className="h-5 w-5 text-[#28bdbf]" />}
            title="Xuất dữ liệu"
            sub="CSV/PDF (sau MVP)"
            onClick={() => alert("Xuất dữ liệu sẽ mở sau MVP")}
          />
          <Divider />
          <RowButton
            icon={<Shield className="h-5 w-5 text-[#28bdbf]" />}
            title="Xóa tài khoản"
            sub="Xác nhận 2 bước"
            danger
            onClick={confirmDelete}
          />
        </Section>

        {/* Về ứng dụng */}
        <Section title="Về ứng dụng">
          <RowStatic
            icon={<Info className="h-5 w-5 text-[#28bdbf]" />}
            title="Phiên bản"
            right={appVersion}
          />
        </Section>
      </div>
    </div>
  );
}

/* ---- Small components ---- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="px-1 pb-2 text-[13.5px] font-semibold text-slate-700">{title}</p>
      <div className="rounded-2xl overflow-hidden divide-y bg-white border border-gray-100">
        {children}
      </div>
    </section>
  );
}

function RowButton({
  icon,
  title,
  sub,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 text-left ${
        danger ? "text-red-600" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="size-8 grid place-items-center rounded-lg bg-[#e9fbfb]">{icon}</div>
        <div>
          <p className="text-[15px] font-medium">{title}</p>
          {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400" />
    </button>
  );
}

function RowStatic({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: string;
}) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="size-8 grid place-items-center rounded-lg bg-[#e9fbfb]">{icon}</div>
        <p className="text-[15px]">{title}</p>
      </div>
      {right && <span className="text-xs text-slate-500">{right}</span>}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100" />;
}

function confirmDelete() {
  const ok = window.confirm(
    "Bạn chắc chắn muốn xóa tài khoản?\nHành động này không thể hoàn tác."
  );
  if (!ok) return;
  alert("Thực thi quy trình xoá tài khoản (xác nhận bước 2) – TODO.");
}
