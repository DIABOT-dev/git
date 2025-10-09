import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/admin';

type Reminder = {
  id: string; type: 'med' | 'meal' | 'sleep';
  title: string; time: string; // "HH:mm"
};

const store = new Map<string, Reminder[]>(); // userId -> reminders

export async function GET() {
  const supabase = getServerClient;
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user?.id ?? 'demo';
  return NextResponse.json({ ok: true, data: store.get(uid) ?? [] });
}

export async function POST(req: Request) {
  const supabase = getServerClient;
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user?.id ?? 'demo';
  const body = await req.json();
  const item: Reminder = {
    id: crypto.randomUUID(),
    type: body.type ?? 'med',
    title: body.title ?? 'Untitled',
    time: body.time ?? '08:00',
  };
  const list = store.get(uid) ?? [];
  list.push(item);
  store.set(uid, list);
  return NextResponse.json({ ok: true, data: item }, { status: 201 });
}
