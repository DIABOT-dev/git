// src/lib/profile/formatters.ts
export const D = (v: any): string =>
  v === null || v === undefined || v === '' ? '—' : String(v);

export function formatDateDDMMYYYY(input?: string | null): string {
  if (!input) return '—';
  const d = new Date(input);
  if (isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

export function boolToYesNo(v: unknown): string {
  if (v === null || v === undefined) return '—';
  return v ? 'Có' : 'Không';
}

export function calcAge(dob?: string | null): string {
  if (!dob) return '—';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '—';
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return String(age);
}

export function calcBMI(height_cm?: number | null, weight_kg?: number | null): string {
  if (!height_cm || !weight_kg) return '—';
  const h = height_cm / 100;
  if (!h) return '—';
  const bmi = weight_kg / (h * h);
  return isFinite(bmi) ? bmi.toFixed(1) : '—';
}
