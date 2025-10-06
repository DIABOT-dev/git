// scripts/db_seed_demo.ts
import { supabaseAdmin } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import { nowIso } from '@/lib/time';

const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2';

async function seedDemoData() {
  console.log("🚀 Seeding demo data for user:", DEMO_USER_ID);
  const sb = supabaseAdmin;

  // Clear existing demo data for this user (optional, but good for repeatable seeds)
  await sb.from('glucose_logs').delete().eq('user_id', DEMO_USER_ID);
  await sb.from('water_logs').delete().eq('user_id', DEMO_USER_ID);
  await sb.from('meal_logs').delete().eq('user_id', DEMO_USER_ID);

  // Insert demo glucose logs
  const glucoseLogs = [
    { user_id: DEMO_USER_ID, value_mgdl: 110, tag: 'fasting', taken_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, value_mgdl: 145, tag: 'after_meal', taken_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, value_mgdl: 105, tag: 'fasting', taken_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, value_mgdl: 130, tag: 'after_meal', taken_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, value_mgdl: 115, tag: 'fasting', taken_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, value_mgdl: 160, tag: 'after_meal', taken_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, value_mgdl: 120, tag: 'fasting', taken_at: nowIso() },
  ];
  const { error: bgError } = await sb.from('glucose_logs').insert(glucoseLogs);
  if (bgError) console.error("Error seeding glucose logs:", bgError.message);
  else console.log("✅ Seeded glucose logs.");

  // Insert demo water logs
  const waterLogs = [
    { user_id: DEMO_USER_ID, amount_ml: 1500, kind: 'water', taken_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, amount_ml: 2000, kind: 'water', taken_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, amount_ml: 1800, kind: 'water', taken_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, amount_ml: 1600, kind: 'water', taken_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, amount_ml: 2200, kind: 'water', taken_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, amount_ml: 1900, kind: 'water', taken_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, amount_ml: 2100, kind: 'water', taken_at: nowIso() },
  ];
  const { error: waterError } = await sb.from('water_logs').insert(waterLogs);
  if (waterError) console.error("Error seeding water logs:", waterError.message);
  else console.log("✅ Seeded water logs.");

  // Insert demo meal logs
  const mealLogs = [
    { user_id: DEMO_USER_ID, items: [{ name: 'Bún chả', imageUrl: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }], taken_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, items: [{ name: 'Cơm gà', imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }], taken_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, items: [{ name: 'Phở bò', imageUrl: 'https://images.pexels.com/photos/2092906/pexels-photo-2092906.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }], taken_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { user_id: DEMO_USER_ID, items: [{ name: 'Salad', imageUrl: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }], taken_at: nowIso() },
  ];
  const { error: mealError } = await sb.from('meal_logs').insert(mealLogs);
  if (mealError) console.error("Error seeding meal logs:", mealError.message);
  else console.log("✅ Seeded meal logs.");

  // Backfill meal cache for demo user
  console.log("🔄 Backfilling meal cache for demo user...");
  try {
    const { backfillMealCache } = await import('./etl/backfill_meal_cache.mjs');
    await backfillMealCache();
    console.log("✅ Meal cache backfill completed.");
  } catch (error) {
    console.error("⚠️ Meal cache backfill failed:", error.message);
  }

  console.log("🎉 Demo data seeding complete.");
}

seedDemoData().catch(console.error);
