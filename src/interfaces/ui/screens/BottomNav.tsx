"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Item = ({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center flex-1 py-2
        ${active ? "text-white font-semibold" : "text-white/80"} hover:text-white`}
    >
      <div className="text-xl">{icon}</div>
      <div className="text-[11px] leading-tight mt-1">{label}</div>
    </Link>
  );
};

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-primary-600 border-t border-primary-700 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
      <div className="mx-auto max-w-md flex">
        <Item href="/" label="Trang chủ" icon={<span>🏠</span>} />
        <Item href="/rewards" label="Quà tặng" icon={<span>🎁</span>} />
        <Item href="/health" label="Sức khỏe" icon={<span>❤️</span>} />
        <Item href="/more" label="Thêm" icon={<span>➕</span>} />
      </div>
    </nav>
  );
}
