"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function FAB_AI() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-24 z-[60] w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
        aria-label="AI Assistant"
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/25 z-[50] flex justify-end">
          <div className="w-80 max-w-[90vw] h-full bg-white shadow-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">AI Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-sm text-muted">
              AI Assistant đang được phát triển...
            </div>
          </div>
        </div>
      )}
    </>
  );
}