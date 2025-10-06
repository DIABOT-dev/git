import Link from "next/link";

export default function LogPage() {
  const items = [
    { href: "/log/bg", label: "Đường huyết" },
    { href: "/log/meal", label: "Bữa ăn" },
    { href: "/log/water", label: "Nước uống" },
    { href: "/log/insulin", label: "Insulin" },
    { href: "/log/weight", label: "Cân nặng" },
    { href: "/log/bp", label: "Huyết áp" },
  ];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Nhật ký sức khỏe</h1>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:bg-gray-50 transition"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
