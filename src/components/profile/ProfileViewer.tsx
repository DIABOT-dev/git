// src/components/profile/ProfileViewer.tsx
'use client';

import React from 'react';
import FieldRow from '@/components/ui/FieldRow';
import SummaryCard from './sections/SummaryCard';
import { D, formatDateDDMMYYYY, boolToYesNo } from '@/lib/profile/formatters';

type Conditions = {
  diabetes?: boolean;
  hypertension?: boolean;
  gout?: boolean;
  obesity?: boolean;
  other?: string;
};

type Goals = {
  primaryGoal?: string;
  targetWeight?: number;
  targetHbA1c?: number;
  dailySteps?: number;
  waterCups?: number;
};

type PersonaPrefs = {
  ai_persona?: 'friend' | 'coach' | 'advisor';
  guidance_level?: 'minimal' | 'detailed';
  low_ask_mode?: boolean;
};

type Profile = {
  id: string;
  dob?: string | null;
  sex?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  waist_cm?: number | null;
  goal?: string | null;
  conditions?: Conditions | null;
  prefs?: { goals?: Goals } & PersonaPrefs | null;
};

type Props = {
  profile: Profile;
  goals?: Goals | null;        // optional override if đã fetch riêng
  prefs?: PersonaPrefs | null;  // optional override
};

export default function ProfileViewer({ profile, goals, prefs }: Props) {
  const c = (profile.conditions ?? {}) as Conditions;
  const g = (goals ?? profile.prefs?.goals ?? {}) as Goals;
  const p = (prefs ?? profile.prefs ?? {}) as PersonaPrefs;

  return (
    <section className="space-y-4">
      <SummaryCard
        sex={profile.sex}
        goal={profile.goal ?? g?.primaryGoal}
        dob={profile.dob}
        height_cm={profile.height_cm}
        weight_kg={profile.weight_kg}
      />

      {/* Thông tin cơ bản */}
      <div className="rounded-2xl border p-4 bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Thông tin cơ bản</h3>
        <FieldRow label="Ngày sinh" value={D(formatDateDDMMYYYY(profile.dob ?? undefined))} />
        <FieldRow label="Chiều cao (cm)" value={D(profile.height_cm)} />
        <FieldRow label="Cân nặng (kg)" value={D(profile.weight_kg)} />
        <FieldRow label="Vòng eo (cm)" value={D(profile.waist_cm)} />
      </div>

      {/* Tình trạng sức khỏe */}
      <div className="rounded-2xl border p-4 bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Tình trạng sức khỏe</h3>
        <FieldRow label="Tiểu đường" value={D(boolToYesNo(c.diabetes))} />
        <FieldRow label="Huyết áp cao" value={D(boolToYesNo(c.hypertension))} />
        <FieldRow label="Gout" value={D(boolToYesNo(c.gout))} />
        <FieldRow label="Béo phì" value={D(boolToYesNo(c.obesity))} />
        <FieldRow label="Khác" value={D(c.other)} />
      </div>

      {/* Mục tiêu */}
      <div className="rounded-2xl border p-4 bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Mục tiêu</h3>
        <FieldRow label="Mục tiêu chính" value={D(g.primaryGoal)} />
        <FieldRow label="Cân nặng mục tiêu (kg)" value={D(g.targetWeight)} />
        <FieldRow label="HbA1c mục tiêu (%)" value={D(g.targetHbA1c)} />
        <FieldRow label="Bước chân/ngày" value={D(g.dailySteps)} />
        <FieldRow label="Nước/ngày (cốc)" value={D(g.waterCups)} />
      </div>

      {/* Tuỳ chọn AI */}
      <div className="rounded-2xl border p-4 bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Trợ lý AI</h3>
        <FieldRow label="Phong cách AI" value={D(p.ai_persona)} />
        <FieldRow label="Mức độ hướng dẫn" value={D(p.guidance_level)} />
        <FieldRow label="Chế độ hỏi ít" value={D(typeof p.low_ask_mode === 'boolean' ? (p.low_ask_mode ? 'Bật' : 'Tắt') : '—')} />
      </div>
    </section>
  );
}
