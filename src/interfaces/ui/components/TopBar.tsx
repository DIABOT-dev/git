"use client";

import { ChevronLeft, Bell, Settings, ShieldCheck } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function TopBar(){
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  
  return (
    <header className="flex items-center justify-between py-3 px-4 bg-white border-b border-gray-100">
      <div className="flex items-center gap-2">
        {!isHome && (
          <button 
            aria-label="Quay lại" 
            className="tap p-1 rounded-lg hover:bg-gray-100" 
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-6 w-6"/>
          </button>
        )}
        <div className="h-9 w-9 rounded-full bg-green-500 text-white grid place-items-center font-bold">AI</div>
        <div><p className="text-sm font-semibold">Xin chào, Tuấn Anh</p><p className="text-sm text-muted">Điểm thưởng: <span className="font-semibold text-primary">3,249</span></p></div>
      </div>
      <div className="flex items-center gap-3 text-gray-500">
        <button className="p-1 rounded-lg hover:bg-gray-100"><ShieldCheck className="h-5 w-5"/></button>
        <button className="p-1 rounded-lg hover:bg-gray-100"><Bell className="h-5 w-5"/></button>
        <button className="p-1 rounded-lg hover:bg-gray-100"><Settings className="h-5 w-5"/></button>
      </div>
    </header>
  )
}