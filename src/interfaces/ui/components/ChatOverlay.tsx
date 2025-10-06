"use client";

import { X } from 'lucide-react'
import Card from '@/interfaces/ui/components/atoms/Card'

export default function ChatOverlay({open,onClose}:{open:boolean,onClose:()=>void}){
  if(!open) return null
   
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-end z-[70]" role="dialog" aria-modal="true">
      <div className="w-96 max-w-[90vw] h-full bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur">
          <p className="font-semibold">Trò chuyện với DIABOT</p>
          <button aria-label="Đóng" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5"/>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-3 grid gap-2">
          <Card><p className="text-sm">Xin chào Tuấn Anh — Hôm nay ta làm gì?</p></Card>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-3 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm">Ghi đường huyết</button>
            <button className="px-3 py-2 border border-green-500 text-green-500 rounded-lg font-semibold text-sm">Nhắc thuốc</button>
            <button className="px-3 py-2 border border-green-500 text-green-500 rounded-lg font-semibold text-sm">Gợi ý bữa</button>
            <button className="px-3 py-2 border border-green-500 text-green-500 rounded-lg font-semibold text-sm">Xem biểu đồ</button>
          </div>
          <Card><p className="text-sm">Bạn có thể hỏi: “Đường huyết hôm qua bao nhiêu?” hoặc “Ghi tôi 2 viên Metformin”.</p></Card>
        </div>
        <div className="p-3 border-t flex gap-2 items-center">
          <input className="flex-1 rounded-xl border px-4 py-3 text-base" placeholder="Nói hoặc gõ để hỏi DIABOT..."/>
          <button title="Ghi âm (demo)" className="px-3 py-2 border border-gray-300 rounded-lg">🎙️</button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold">Gửi</button>
        </div>
      </div>
    </div>
  )
}