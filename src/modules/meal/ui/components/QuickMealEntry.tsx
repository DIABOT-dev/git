"use client";

import { useState, useEffect } from 'react';
import Button from '@/interfaces/ui/components/atoms/Button';
import { cn } from '@/lib/utils';

interface MealSuggestion {
  id: string;
  name: string;
  kcal: number;
  carb_g: number;
  protein_g: number;
  fat_g: number;
  confidence?: number;
  adjustment_note?: string;
  items?: any[];
}

interface QuickMealEntryProps {
  mealType: 'breakfast' | 'lunch' | 'dinner';
  onSelect: (suggestion: MealSuggestion) => void;
  userId: string;
  className?: string;
}

/**
 * QuickMealEntry Component
 *
 * Displays 3 quick suggestions + "Copy yesterday" + "Custom" options
 * Fetches from GET /api/meal/suggest (cached 15 min)
 * 1-tap confirm to log meal
 */
export default function QuickMealEntry({
  mealType,
  onSelect,
  userId,
  className
}: QuickMealEntryProps) {
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [copyYesterday, setCopyYesterday] = useState<MealSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, [mealType, userId]);

  async function fetchSuggestions() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/meal/suggest?mealType=${mealType}`,
        {
          headers: {
            'x-debug-user-id': userId
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setCopyYesterday(data.copy_yesterday);
    } catch (err: any) {
      console.error('Error fetching suggestions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(suggestion: MealSuggestion) {
    onSelect(suggestion);
  }

  if (loading) {
    return (
      <div className={cn('quick-meal-entry', className)}>
        <div className="text-center py-4 text-gray-500">
          Đang tải gợi ý...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('quick-meal-entry', className)}>
        <div className="text-center py-4 text-red-500">
          Không thể tải gợi ý. <button onClick={fetchSuggestions} className="underline">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('quick-meal-entry space-y-3', className)}>
      <h3 className="text-sm font-semibold text-gray-700">Gợi ý nhanh</h3>

      <div className="grid gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => handleSelect(suggestion)}
            className="suggestion-chip"
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="font-medium">{suggestion.name}</div>
                <div className="text-xs text-gray-500">
                  {suggestion.kcal} kcal • Carb {suggestion.carb_g}g • Đạm {suggestion.protein_g}g
                </div>
                {suggestion.adjustment_note && (
                  <div className="text-xs text-blue-600 mt-1">
                    {suggestion.adjustment_note}
                  </div>
                )}
              </div>
              <div className="ml-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}

        {copyYesterday && (
          <button
            onClick={() => handleSelect(copyYesterday)}
            className="suggestion-chip border-dashed"
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="font-medium">{copyYesterday.name}</div>
                <div className="text-xs text-gray-500">
                  {copyYesterday.kcal} kcal • Carb {copyYesterday.carb_g}g
                </div>
              </div>
              <div className="ml-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSelect({
            id: 'custom',
            name: 'Tự nhập món ăn',
            kcal: 0,
            carb_g: 0,
            protein_g: 0,
            fat_g: 0
          })}
          className="w-full"
        >
          + Tự nhập món ăn
        </Button>
      </div>

      <style jsx>{`
        .suggestion-chip {
          @apply w-full p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left;
        }
        .suggestion-chip.border-dashed {
          @apply border-dashed;
        }
      `}</style>
    </div>
  );
}
