#!/usr/bin/env bash
set -e

BASE=${1:-http://localhost:3000}

echo "== EXTENDED MOAT TESTS =="

# 1) Privacy moat
echo "-- Privacy check"
node -e "import('./src/modules/ai/privacy.js').then(m=>{
  try { m.enforcePrivacy('u1','u1'); console.log('PASS same user'); } 
  catch(e){ console.error('FAIL same user'); }
  try { m.enforcePrivacy('u1','u2'); console.error('FAIL cross-user not blocked'); } 
  catch(e){ console.log('PASS cross-user blocked'); }
})"

# 2) Trends moat
echo "-- Trends check"
node -e "import('./src/modules/ai/trends.js').then(m=>{
  const ctx={metrics:{bg:[{value:100},{value:130}],weight:[{value:70},{value:72}]}}; 
  console.log(m.analyzeTrends(ctx));
})"

# 3) Habit moat
echo "-- Habit check"
node -e "import('./src/modules/ai/habit.js').then(m=>{
  const today=new Date().toISOString().slice(0,10);
  const logs=[{date:today,action:'drink water',done:true}];
  console.log(m.checkDailyHabits(logs));
  console.log('Coins:', m.rewardCoins(['a','b','c']));
})"

# 4) MealSuggest moat
echo "-- MealSuggest check"
node -e "import('./src/modules/ai/mealSuggest.js').then(m=>{
  const ctx={metrics:{bg:[{value:190}]}}; 
  console.log(m.suggestMeal(ctx));
})"

# 5) Guardrails Extended moat
echo "-- Guardrails Ext check"
node -e "import('./src/modules/ai/guardrails_ext.js').then(m=>{
  const ctx={metrics:{insulin:[{value:60}],weight:[{value:70},{value:64}]}}; 
  console.log(m.validateExtended(ctx));
})"

echo "== ALL EXTENDED MOAT TESTS DONE =="