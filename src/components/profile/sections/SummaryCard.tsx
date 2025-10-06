// src/components/profile/sections/SummaryCard.tsx
import React from 'react';
import FieldRow from '@/components/ui/FieldRow';
import { D, calcAge, calcBMI } from '@/lib/profile/formatters';

type Props = {
  sex?: string | null;
  goal?: string | null;
  dob?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
};

export default function SummaryCard(props: Props) {
  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm">
      <h3 className="font-semibold mb-2">Tổng quan</h3>
      <FieldRow label="Tuổi" value={D(calcAge(props.dob))} />
      <FieldRow label="Giới tính" value={D(props.sex)} />
      <FieldRow label="Mục tiêu" value={D(props.goal)} />
      <FieldRow label="BMI" value={D(calcBMI(props.height_cm ?? undefined, props.weight_kg ?? undefined))} />
    </div>
  );
}
