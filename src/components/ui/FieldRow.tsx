// src/components/ui/FieldRow.tsx
import React from 'react';

type Props = { label: string; value: React.ReactNode };

export default function FieldRow({ label, value }: Props) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right ml-4">{value}</span>
    </div>
  );
}