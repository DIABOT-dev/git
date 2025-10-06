"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'danger';
  duration?: number;
  onClose?: () => void;
  'data-testid'?: string;
}

export default function Toast({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose,
  'data-testid': testId 
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div 
      className={cn(
        'toast',
        type === 'error' ? 'toast-danger' : `toast-${type}`
      )}
      data-testid={testId}
    >
      {message}
    </div>
  );
}