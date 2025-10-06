// scripts/smoke.mjs
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 3001; // Consistent with package.json start:prod
const BASE_URL = `http://localhost:${PORT}`;
const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID || 'a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2';
const SMOKE_SKIP_AI = process.env.SMOKE_SKIP_AI === '1'; // <--- Thêm dòng này

const wait = ms => new Promise(r => setTimeout(r, ms));
// ...

async function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...options });
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}: ${cmd} ${args.join(' ')}`));
      }
    });
    child.on('error', err => reject(err));
  });
}

async function fetchWithRetry(url, options = {}, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status >= 500) { // Retry on server errors
        console.warn(`Attempt ${i + 1}: Server error ${response.status} for ${url}. Retrying...`);
        await wait(delay);
        continue;
      }
      return response; // Don't retry on client errors (4xx)
    } catch (error) {
      console.warn(`Attempt ${i + 1}: Fetch error for ${url}: ${error.message}. Retrying...`);
      await wait(delay);
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries.`);
}

let serverProcess = null;

async function cleanup() {
  if (serverProcess) {
    console.log('Stopping Next.js server...');
    serverProcess.kill('SIGTERM');
    await wait(2000); // Give it a moment to shut down
  }
}

process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(0); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });

async function main() {
  console.log('--- Running Smoke Tests ---');

  try {
    // 1. Build the Next.js application
    console.log('Building Next.js application...');
    await runCommand('npm', ['run', 'build:ci']);
    console.log('Build complete.');

    // 2. Start the Next.js server in the background
    console.log(`Starting Next.js server on port ${PORT}...`);
    serverProcess = spawn('npm', ['run', 'start:prod'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: String(PORT) }
    });

    // 3. Wait for the server to be ready
    console.log(`Waiting for server to be ready at ${BASE_URL}/api/health...`);
    let serverReady = false;
    for (let i = 0; i < 30; i++) { // Max 30 seconds wait
      try {
        const res = await fetch(`${BASE_URL}/api/health`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok === true) {
            serverReady = true;
            break;
          }
        }
      } catch (e) {
        // Ignore fetch errors during startup checks
      }
      await wait(1000);
    }

    if (!serverReady) {
      throw new Error('Next.js server did not start in time.');
    }
    console.log('Next.js server is ready.');

    // 4. Run tests
    console.log('\n--- API Tests ---');

    // Test 1: GET /api/health
    console.log('Testing GET /api/health...');
    const healthRes = await fetchWithRetry(`${BASE_URL}/api/health`);
    if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.status}`);
    const healthData = await healthRes.json();
    if (!healthData.ok) throw new Error(`Health check returned ok: false`);
    console.log('✅ GET /api/health: PASS');

   

    // Test 2: POST /api/log/water
    console.log('Testing POST /api/log/water...');
    const waterPayload = { ml: 250, taken_at: new Date().toISOString() }; // Changed to ml
    const waterRes = await fetchWithRetry(`${BASE_URL}/api/log/water`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-debug-user-id': DEMO_USER_ID // Use debug user ID for testing
      },
      body: JSON.stringify(waterPayload)
    });
    if (waterRes.status !== 201) {
      const errorBody = await waterRes.text();
      throw new Error(`Water log failed: ${waterRes.status} - ${errorBody}`);
    }
    console.log('✅ POST /api/log/water: PASS');


    // Test 3: GET /api/charts/bg?range=7d
    if (!SMOKE_SKIP_AI) {
      console.log('Testing GET /api/charts/bg?range=7d...');
      const chartRes = await fetchWithRetry(`${BASE_URL}/api/charts/bg?range=7d`, {
        headers: {
          'x-debug-user-id': DEMO_USER_ID // Use debug user ID for testing
        }
      });
      if (!chartRes.ok) throw new Error(`Chart data fetch failed: ${chartRes.status}`);
      const chartData = await chartRes.json();
      // The requirement is "trả về JSON hợp lệ". Let's check for 'ok: true' and 'data' array.
      if (!chartData.ok || !Array.isArray(chartData.data)) throw new Error(`Invalid chart data format`);
      console.log('✅ GET /api/charts/bg?range=7d: PASS');
    } else {
      console.log('⏩ Skipping GET /api/charts/bg?range=7d (SMOKE_SKIP_AI is set)');
    }

    // Test 4: GET /api/etl/weekly (from existing smoke.mjs)
    console.log('Testing GET /api/etl/weekly...');
    const etlWeeklyRes = await fetchWithRetry(`${BASE_URL}/api/etl/weekly`);
    if (!etlWeeklyRes.ok) throw new Error(`ETL Weekly check failed: ${etlWeeklyRes.status}`);
    const etlWeeklyData = await etlWeeklyRes.json();
    if (!etlWeeklyData.ok) throw new Error(`ETL Weekly returned ok: false`);
    console.log('✅ GET /api/etl/weekly: PASS');

    // Test 5: GET /api/charts/meal?range=7d (meal cache verification)
    if (!SMOKE_SKIP_AI) {
      console.log('Testing GET /api/charts/meal?range=7d...');
      const mealChartRes = await fetchWithRetry(`${BASE_URL}/api/charts/meal?range=7d`, {
        headers: {
          'x-debug-user-id': DEMO_USER_ID
        }
      });
      if (!mealChartRes.ok) throw new Error(`Meal chart fetch failed: ${mealChartRes.status}`);
      const mealChartData = await mealChartRes.json();
      if (!mealChartData.ok || !Array.isArray(mealChartData.data)) {
        throw new Error(`Invalid meal chart data format: expected ok:true and data:Array`);
      }
      console.log(`✅ GET /api/charts/meal?range=7d: PASS (${mealChartData.data.length} weeks returned)`);
    } else {
      console.log('⏩ Skipping GET /api/charts/meal?range=7d (SMOKE_SKIP_AI is set)');
    }

    console.log('\n--- All Smoke Tests Passed! 🎉 ---');
    process.exit(0);

  } catch (error) {
    console.error('\n--- Smoke Tests Failed! ❌ ---');
    console.error(error);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

main();
