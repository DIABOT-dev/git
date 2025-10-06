'use client';
type Props = { title: string; description: string; onRequest?: () => void };
export function PermissionRationale({ title, description, onRequest }: Props) {
  return (
    <div className="rounded-2xl border p-4 space-y-2">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <button className="px-4 py-2 rounded-2xl bg-blue-600 text-white" onClick={onRequest}>
        Bật quyền
      </button>
    </div>
  );
}
