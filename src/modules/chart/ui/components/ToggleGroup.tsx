// src/modules/chart/ui/components/ToggleGroup.tsx
import React from "react";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-wrap items-center gap-2 p-2 rounded-xl border bg-gray-100" // Đã thay đổi gap, p và rounded
      style={{ borderColor: "var(--color-border)" }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`px-3 h-9 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${ // Đã thay đổi px và rounded
              active ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
