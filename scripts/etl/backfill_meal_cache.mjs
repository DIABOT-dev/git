#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

/**
 * Calculate ISO week number for Bangkok timezone
 * Week starts on Monday (ISO standard)
 */
function getIsoWeekBangkok(date) {
  // Convert to Bangkok timezone
  const bangkokDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  
  // ISO week calculation
  const thursday = new Date(bangkokDate);
  thursday.setDate(bangkokDate.getDate() - ((bangkokDate.getDay() + 6) % 7) + 3);
  
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);
  
  return parseInt(`${thursday.getFullYear()}${weekNumber.toString().padStart(2, '0')}`);
}

/**
 * Get week start date for display
 */
function getWeekStartDate(date) {
  const bangkokDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const monday = new Date(bangkokDate);
  monday.setDate(bangkokDate.getDate() - ((bangkokDate.getDay() + 6) % 7));
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Calculate estimated calories and carbs from meal items
 */
function estimateNutrition(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { kcal_est: 0, carb_g_est: 0 };
  }

  // Simple estimation based on meal names
  let totalKcal = 0;
  let totalCarbs = 0;

  items.forEach(item => {
    const name = (item.name || '').toLowerCase();
    
    // Basic calorie estimation
    if (name.includes('cơm') || name.includes('rice')) {
      totalKcal += 200;
      totalCarbs += 45;
    } else if (name.includes('phở') || name.includes('bún')) {
      totalKcal += 350;
      totalCarbs += 60;
    } else if (name.includes('gà') || name.includes('chicken')) {
      totalKcal += 150;
      totalCarbs += 0;
    } else if (name.includes('salad') || name.includes('rau')) {
      totalKcal += 50;
      totalCarbs += 10;
    } else {
      // Default for unknown foods
      totalKcal += 100;
      totalCarbs += 15;
    }
  });

  return {
    kcal_est: Math.round(totalKcal),
    carb_g_est: Math.round(totalCarbs)
  };
}

/**
 * Get top foods from meal items
 */
function getTopFoods(items, limit = 5) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const foodCounts = {};
  
  items.forEach(item => {
    const name = item.name || 'Unknown';
    foodCounts[name] = (foodCounts[name] || 0) + 1;
  });

  return Object.entries(foodCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

async function backfillMealCache() {
  console.log('🍽️ MEAL CACHE BACKFILL - Starting...');
  console.log('=====================================');
  
  const startTime = Date.now();
  let totalUpserted = 0;

  try {
    // Calculate date range for 8 weeks
    const now = new Date();
    const eightWeeksAgo = new Date(now.getTime() - (8 * 7 * 24 * 60 * 60 * 1000));
    
    console.log(`📅 Processing meal logs from ${eightWeeksAgo.toISOString()} to ${now.toISOString()}`);

    // Fetch all meal logs from the last 8 weeks
    const { data: mealLogs, error: fetchError } = await supabaseAdmin
      .from('meal_logs')
      .select('user_id, items, carbs_g, calories_kcal, taken_at')
      .gte('taken_at', eightWeeksAgo.toISOString())
      .order('taken_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch meal logs: ${fetchError.message}`);
    }

    console.log(`📊 Found ${mealLogs?.length || 0} meal logs to process`);

    if (!mealLogs || mealLogs.length === 0) {
      console.log('ℹ️ No meal logs found - nothing to backfill');
      return;
    }

    // Group by user_id and week
    const weeklyData = {};

    mealLogs.forEach(log => {
      const week = getIsoWeekBangkok(new Date(log.taken_at));
      const key = `${log.user_id}-${week}`;
      
      if (!weeklyData[key]) {
        weeklyData[key] = {
          profile_id: log.user_id,
          week,
          week_start: getWeekStartDate(new Date(log.taken_at)),
          meals: [],
          total_meals: 0,
          all_items: []
        };
      }
      
      weeklyData[key].meals.push(log);
      weeklyData[key].total_meals++;
      
      if (log.items && Array.isArray(log.items)) {
        weeklyData[key].all_items.push(...log.items);
      }
    });

    console.log(`🔄 Processing ${Object.keys(weeklyData).length} user-week combinations`);

    // Process each week's data
    const upsertPromises = Object.values(weeklyData).map(async (weekData) => {
      const nutrition = estimateNutrition(weekData.all_items);
      const topFoods = getTopFoods(weekData.all_items);
      
      const summary = {
        total_meals: weekData.total_meals,
        kcal_est: nutrition.kcal_est,
        carb_g_est: nutrition.carb_g_est,
        top_foods: topFoods,
        week_start: weekData.week_start,
        week_label: `Tuần ${weekData.week.toString().slice(-2)}/${weekData.week.toString().slice(0, 4)}`
      };

               const { error } = await supabaseAdmin
      .from('cache_meal_week')
      .upsert({
        profile_id: weekData.profile_id,
        week_start: weekData.week_start,
        summary,
        updated_at: new Date().toISOString()
      }, { onConflict: 'profile_id,week_start' }); // <-- Đúng cú phápct


      if (error) {
        console.error(`❌ Failed to upsert week ${weekData.week} for user ${weekData.profile_id}:`, error.message);
        return false;
      }

      return true;
    });

    // Execute all upserts
    const results = await Promise.all(upsertPromises);
    totalUpserted = results.filter(Boolean).length;

    const duration = Date.now() - startTime;
    
    console.log('\n📋 BACKFILL SUMMARY');
    console.log('==================');
    console.log(`✅ Records upserted: ${totalUpserted}`);
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`📈 Success rate: ${((totalUpserted / Object.keys(weeklyData).length) * 100).toFixed(1)}%`);
    
    if (totalUpserted === Object.keys(weeklyData).length) {
      console.log('🎉 BACKFILL COMPLETED SUCCESSFULLY');
    } else {
      console.log('⚠️ BACKFILL COMPLETED WITH SOME FAILURES');
    }

  } catch (error) {
    console.error('\n❌ BACKFILL FAILED');
    console.error('==================');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run backfill if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  backfillMealCache().catch(console.error);
}

export { backfillMealCache };