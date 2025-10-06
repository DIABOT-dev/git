import { ReactNode } from 'react';

interface StatProps {
  label: string;
  value: string | number;
  hint?: string;
  'data-testid'?: string;
}

export default function Stat({ label, value, hint, 'data-testid': testId }: StatProps) {
  return (
    <div className="stat" data-testid={testId}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}