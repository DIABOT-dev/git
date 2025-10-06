'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image'; // Thêm dòng này
type Meal = { id: string; ts: string; text?: string; portion?: string; image_url?: string };

export default function MealList() {
  const [items, setItems] = useState<Meal[]>([]);
  const load = async () => {
    const r = await fetch('/api/meal').then(r=>r.json());
    setItems(r.data ?? []);
  };
  useEffect(() => { load(); }, []);
  return (
    <ul className="grid gap-3">
      {items.map(m => (
        <li key={m.id} className="rounded-2xl border p-3 flex items-center gap-3">
          {m.image_url ? <Image src={m.image_url} alt="" width={64} height={64} className="w-16 h-16 rounded-xl object-cover" /> : null}
          <div className="text-sm">
            <div className="font-medium">{m.text || '—'}</div>
            <div className="text-gray-500">{new Date(m.ts).toLocaleString()} • {m.portion || 'khẩu phần ?'}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
