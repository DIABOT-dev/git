// src/modules/meal/infrastructure/FeatureStoreRepo.ts
// Query Feature Store tables (user_daily_features, user_meal_patterns, user_habit_scores)

import { supabaseAdmin } from '@/lib/supabase/admin';

export interface DailyFeatures {
  date: string;
  carb_g_total: number;
  protein_g_total: number;
  fat_g_total: number;
  dinner_pct: number;
  late_meal_count: number;
  fried_count: number;
  steamed_count: number;
  water_ml: number;
  water_target_pct: number;
}

export interface MealPattern {
  meal_type: string;
  dish: string;
  portion_avg: number;
  freq_7d: number;
}

export interface HabitScore {
  date: string;
  cluster: string;
  score: number;
}

/**
 * Feature Store Repository
 * Reads from ETL-generated tables, with fallback to raw logs
 */
export class FeatureStoreRepo {
  /**
   * Get daily features for a specific date
   * With timeout guard (150ms)
   */
  async getDailyFeatures(userId: string, date: string): Promise<DailyFeatures | null> {
    try {
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 150)
      );

      const queryPromise = supabaseAdmin
        .from('user_daily_features')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .limit(1) // Performance: explicit limit
        .maybeSingle();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching daily features:', error);
      return null; // Fallback to null, caller will use fallback logic
    }
  }

  /**
   * Get daily features for yesterday
   */
  async getYesterdayFeatures(userId: string): Promise<DailyFeatures | null> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    return this.getDailyFeatures(userId, dateStr);
  }

  /**
   * Get meal patterns for last 7 days
   * With timeout guard (150ms) and explicit limits
   */
  async getMealPatterns(userId: string, mealType?: string): Promise<MealPattern[]> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 150)
      );

      let query = supabaseAdmin
        .from('user_meal_patterns')
        .select('meal_type, dish, portion_avg, freq_7d') // Explicit columns
        .eq('user_id', userId)
        .order('freq_7d', { ascending: false })
        .limit(10); // Performance: top 10 only

      if (mealType) {
        query = query.eq('meal_type', mealType);
      }

      const result = await Promise.race([query, timeoutPromise]);
      const { data, error } = result as any;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching meal patterns:', error);
      return []; // Fallback to empty array
    }
  }

  /**
   * Get latest habit scores
   */
  async getHabitScores(userId: string): Promise<HabitScore[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_habit_scores')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching habit scores:', error);
      return [];
    }
  }

  /**
   * Fallback: compute features from raw meal_logs if Feature Store is empty
   */
  async computeFeaturesFromLogs(userId: string, daysBack: number = 1): Promise<Partial<DailyFeatures>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const { data, error } = await supabaseAdmin
        .from('meal_logs')
        .select('carbs_g, protein_g, fat_g, meal_type, cooking_method, taken_at')
        .eq('user_id', userId)
        .gte('taken_at', startDate.toISOString());

      if (error) throw error;
      if (!data || data.length === 0) return {};

      // Aggregate
      let totalCarb = 0;
      let totalProtein = 0;
      let totalFat = 0;
      let friedCount = 0;

      for (const log of data) {
        totalCarb += log.carbs_g || 0;
        totalProtein += log.protein_g || 0;
        totalFat += log.fat_g || 0;
        if (log.cooking_method === 'fried') friedCount++;
      }

      return {
        carb_g_total: totalCarb,
        protein_g_total: totalProtein,
        fat_g_total: totalFat,
        fried_count: friedCount
      };
    } catch (error) {
      console.error('Error computing features from logs:', error);
      return {};
    }
  }

  /**
   * Get features with automatic fallback
   */
  async getFeaturesWithFallback(userId: string): Promise<Partial<DailyFeatures>> {
    // Try Feature Store first
    const features = await this.getYesterdayFeatures(userId);
    if (features) return features;

    // Fallback to raw logs
    console.warn('Feature Store empty, computing from raw logs');
    return this.computeFeaturesFromLogs(userId, 1);
  }
}
