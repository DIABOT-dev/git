'use client';
export default function ExportButton() {
  const onClick = () => window.open('/api/export', '_blank');
  return <button onClick={onClick} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Export 7 ngày (CSV)</button>;
}
