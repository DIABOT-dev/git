// src/app/me/page.tsx
import { redirect } from 'next/navigation';
export default function MeRedirect() {
  redirect('/profile'); // 308 by framework
}
