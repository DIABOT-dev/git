"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MealFeedbackCardProps {
  feedback: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  className?: string;
}

/**
 * MealFeedbackCard Component
 *
 * Displays 3-sentence feedback after meal logging
 * Features:
 * - Mascot icon
 * - 3 lines of text (summary → tips → conclusion)
 * - Auto-dismiss after 5s (configurable)
 * - Manual close button
 */
export default function MealFeedbackCard({
  feedback,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 5000,
  className
}: MealFeedbackCardProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss && visible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, autoDismissDelay, visible]);

  function handleDismiss() {
    setVisible(false);
    onDismiss?.();
  }

  if (!visible) return null;

  // Split feedback into sentences for better display
  const sentences = feedback.split('. ').filter(Boolean);

  return (
    <div className={cn('meal-feedback-card', className)}>
      <div className="feedback-content">
        {/* Mascot Icon */}
        <div className="mascot-icon">
          <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>

        {/* Feedback Text */}
        <div className="feedback-text">
          {sentences.map((sentence, index) => (
            <p key={index} className="feedback-sentence">
              {sentence.trim()}.
            </p>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="close-button"
          aria-label="Đóng"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {autoDismiss && (
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{
              animation: `shrink ${autoDismissDelay}ms linear`
            }}
          />
        </div>
      )}

      <style jsx>{`
        .meal-feedback-card {
          @apply bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-md overflow-hidden;
        }

        .feedback-content {
          @apply p-4 flex items-start gap-3 relative;
        }

        .mascot-icon {
          @apply flex-shrink-0;
        }

        .feedback-text {
          @apply flex-1 space-y-2;
        }

        .feedback-sentence {
          @apply text-sm text-gray-700 leading-relaxed;
        }

        .feedback-sentence:first-child {
          @apply font-semibold;
        }

        .feedback-sentence:last-child {
          @apply text-blue-600 italic;
        }

        .close-button {
          @apply flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors;
        }

        .progress-bar-container {
          @apply h-1 bg-blue-100;
        }

        .progress-bar {
          @apply h-full bg-blue-400;
          width: 100%;
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
