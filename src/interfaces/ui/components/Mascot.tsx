"use client";

import { useState, useEffect } from 'react';

type MascotState = 'idle' | 'reminder' | 'meal' | 'report' | 'alert';

interface MascotProps {
  state?: MascotState;
  onClose?: () => void;
  onClick?: () => void;
}

export default function Mascot({ state = 'idle', onClose, onClick }: MascotProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentState, setCurrentState] = useState(state);

  useEffect(() => {
    setCurrentState(state);
  }, [state]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const getMascotContent = () => {
    switch (currentState) {
      case 'reminder':
        return {
          image: '💊',
          title: 'Nhắc thuốc',
          content: (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Đã đến giờ uống thuốc!</p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-800">Metformin 500mg</p>
                <p className="text-sm text-blue-600">Uống sau bữa sáng - 8:00 AM</p>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium">
                  Đã uống
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium">
                  Nhắc sau
                </button>
              </div>
            </div>
          ),
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };

      case 'meal':
        return {
          image: '🍽️',
          title: 'Thực đơn hôm nay',
          content: (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Gợi ý bữa ăn cho bạn:</p>
              <div className="space-y-2">
                <div className="bg-green-50 p-2 rounded-lg">
                  <p className="text-sm font-medium text-green-800">🥗 Salad rau củ</p>
                  <p className="text-xs text-green-600">Ít carb, nhiều chất xơ</p>
                </div>
                <div className="bg-green-50 p-2 rounded-lg">
                  <p className="text-sm font-medium text-green-800">🐟 Cá hồi nướng</p>
                  <p className="text-xs text-green-600">Protein cao, omega-3</p>
                </div>
              </div>
              <button className="w-full bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium">
                Xem thêm món
              </button>
            </div>
          ),
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };

      case 'report':
        return {
          image: '📊',
          title: 'Nhập báo cáo',
          content: (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Hãy nhập chỉ số đường huyết:</p>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="mg/dL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Chọn thời điểm</option>
                  <option value="fasting">Đói (FPG)</option>
                  <option value="post">Sau ăn (PP2)</option>
                  <option value="random">Ngẫu nhiên</option>
                </select>
              </div>
              <button className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium">
                Gửi báo cáo
              </button>
            </div>
          ),
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };

      case 'alert':
        return {
          image: '⚠️',
          title: 'Cảnh báo',
          content: (
            <div className="space-y-3">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="font-medium text-red-800">Đường huyết cao!</p>
                <p className="text-sm text-red-600">Chỉ số: 180 mg/dL</p>
                <p className="text-xs text-red-500 mt-1">Khuyến nghị: Kiểm tra lại sau 2 giờ</p>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium">
                  Gọi bác sĩ
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium">
                  Đã biết
                </button>
              </div>
            </div>
          ),
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };

      default: // idle
        return {
          image: '🤖',
          title: 'DIABOT',
          content: (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Xin chào! Tôi là trợ lý sức khỏe của bạn.</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setCurrentState('reminder')}
                  className="bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                >
                  💊 Thuốc
                </button>
                <button 
                  onClick={() => setCurrentState('meal')}
                  className="bg-green-100 text-green-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                >
                  🍽️ Thực đơn
                </button>
                <button 
                  onClick={() => setCurrentState('report')}
                  className="bg-purple-100 text-purple-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
                >
                  📊 Báo cáo
                </button>
                <button 
                  onClick={() => setCurrentState('alert')}
                  className="bg-red-100 text-red-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                >
                  ⚠️ Cảnh báo
                </button>
              </div>
            </div>
          ),
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const mascotContent = getMascotContent();

return (
  <div
    onClick={onClick}
    className={`${mascotContent.bgColor} ${mascotContent.borderColor} border-2 rounded-2xl shadow-lg p-4 relative animate-bounce-gentle`}
  >
    {/* Close button */}
    <button
      onClick={handleClose}
      className="absolute top-2 right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm transition-colors"
    >
      ×
    </button>

    {/* Mascot Avatar */}
    <div className="flex items-start space-x-3">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
        {mascotContent.image}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 text-sm mb-2">
          {mascotContent.title}
        </h3>
        {mascotContent.content}
      </div>
    </div>

    {/* Speech bubble tail */}
    <div className="absolute bottom-0 right-8 transform translate-y-full">
      <div
        className={`w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent ${
          currentState === 'alert'
            ? 'border-t-red-200'
            : currentState === 'reminder'
            ? 'border-t-blue-200'
            : currentState === 'meal'
            ? 'border-t-green-200'
            : currentState === 'report'
            ? 'border-t-blue-200'
            : 'border-t-gray-200'
        }`}
      />
    </div>
  </div>
);
}