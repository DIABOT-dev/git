#!/usr/bin/env node

/**
 * DIABOT V4 - Stability Check
 * Kiểm tra các yếu tố ảnh hưởng đến độ ổn định build
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIABOT STABILITY CHECK');
console.log('========================');

let issues = 0;

// Check 1: Node version consistency
function checkNodeVersion() {
  console.log('\n1️⃣ Node Version Consistency...');
  
  try {
    const nvmrc = fs.readFileSync('.nvmrc', 'utf8').trim();
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const engines = packageJson.engines?.node;
    
    console.log(`   📄 .nvmrc: ${nvmrc}`);
    console.log(`   📦 package.json engines: ${engines || 'NOT SET'}`);
    console.log(`   🏃 Current: ${process.version}`);
    
    if (!engines) {
      console.log('   ❌ ERROR: No engines field in package.json');
      issues++;
    } else {
      console.log('   ✅ Node version constraints defined');
    }
  } catch (error) {
    console.log('   ❌ ERROR: Missing .nvmrc or package.json');
    issues++;
  }
}

// Check 2: Component Accessibility
function checkA11y() {
  console.log('\n2️⃣ Accessibility Check...');
  
  const components = [
    'src/interfaces/ui/components/atoms/Button.tsx',
    'src/interfaces/ui/components/atoms/Input.tsx',
    'src/interfaces/ui/components/atoms/Card.tsx'
  ];
  
  let passed = 0;
  for (const comp of components) {
    try {
      const content = fs.readFileSync(comp, 'utf8');
      const hasAriaLabel = /aria-label|aria-labelledby/.test(content);
      const hasDataTestId = /data-testid/.test(content);
      const componentPassed = hasAriaLabel || hasDataTestId;
      
      console.log(`   ${componentPassed ? '✅' : '❌'} ${comp.split('/').pop()}: ${componentPassed ? 'PASS' : 'FAIL'}`);
      if (componentPassed) passed++;
    } catch {
      console.log(`   ⚠️ ${comp.split('/').pop()}: FILE_NOT_FOUND`);
    }
  }
  
  console.log(`   📊 A11y: ${passed}/${components.length} passed`);
  return passed >= Math.ceil(components.length * 0.7); // 70% threshold
}

// Check 3: API Health
async function checkAPIHealth() {
  console.log('\n3️⃣ API Health Check...');
  
  const endpoints = [
    { path: '/api/ai/demo', method: 'GET' },
    { path: '/api/profile/subscription', method: 'GET', needsAuth: true },
    { path: '/api/profile/goals', method: 'GET', needsAuth: true }
  ];
  
  let passed = 0;
  for (const endpoint of endpoints) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(endpoint.needsAuth ? { 'x-debug-user-id': 'a9d5518d-ee4c-49ca-8b20-5a2d4aaa16a2' } : {})
      };
      
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers
      });
      
      const success = response.status < 500; // Accept 4xx as "working" (auth/validation errors)
      console.log(`   ${success ? '✅' : '❌'} ${endpoint.method} ${endpoint.path}: ${response.status} ${success ? 'PASS' : 'FAIL'}`);
      if (success) passed++;
    } catch (error) {
      console.log(`   ❌ ${endpoint.method} ${endpoint.path}: NETWORK_ERROR`);
    }
  }
  
  console.log(`   📊 API Health: ${passed}/${endpoints.length} passed`);
  return passed === endpoints.length;
}

// Check 4: Feature Flags
function checkFeatureFlags() {
  console.log('\n4️⃣ Feature Flags Check...');
  
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const flags = [
      { name: 'AI Agent', pattern: /NEXT_PUBLIC_AI_AGENT=demo/, required: false },
      { name: 'Chart Demo', pattern: /NEXT_PUBLIC_CHART_USE_DEMO=true/, required: false },
      { name: 'Meal Mock', pattern: /MEAL_MOCK_MODE=true/, required: false }
    ];
    
    let configured = 0;
    for (const flag of flags) {
      const found = flag.pattern.test(envContent);
      console.log(`   ${found ? '✅' : '⚪'} ${flag.name}: ${found ? 'CONFIGURED' : 'DEFAULT'}`);
      if (found) configured++;
    }
    
    console.log(`   📊 Feature Flags: ${configured}/${flags.length} configured`);
    return true; // Always pass, just informational
  } catch {
    console.log('   ⚠️ .env.local not found - using defaults');
    return true;
  }
}

// Main execution
async function main() {
  const results = await Promise.all([
    checkNodeVersion(),
    checkA11y(),
    checkAPIHealth(),
    checkFeatureFlags()
  ]);
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('\n📋 SUMMARY');
  console.log('==========');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 ALL STABILITY CHECKS PASSED');
    process.exit(0);
  } else {
    console.log('⚠️ SOME CHECKS FAILED - Review above');
    process.exit(1);
  }
}

main().catch(console.error);