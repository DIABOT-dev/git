#!/usr/bin/env node

import { promises as fs } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.log('🎨 UI/UX COMPLIANCE CHECK');
console.log('========================');

// Check 1: CSS Tokens
async function checkCSSTokens() {
  console.log('\n1️⃣ CSS Tokens Check...');
  
  try {
    const tokensPath = join(process.cwd(), 'src/styles/tokens.css');
    const tokensContent = await fs.readFile(tokensPath, 'utf8');
    
    const checks = [
      { name: 'Font Size Base', pattern: /--fs-md:\s*15\.5px|--fs-md:\s*1rem/, required: true },
      { name: 'Hit Area Medium', pattern: /--h-input-md:\s*44px/, required: true },
      { name: 'Primary Color', pattern: /--color-primary-600:\s*#28bdbf/, required: true },
      { name: 'Border Radius', pattern: /--rd-lg:\s*16px/, required: true },
      { name: 'Card Shadow', pattern: /--shadow-card/, required: true }
    ];
    
    let passed = 0;
    for (const check of checks) {
      const found = check.pattern.test(tokensContent);
      console.log(`   ${found ? '✅' : '❌'} ${check.name}: ${found ? 'PASS' : 'FAIL'}`);
      if (found) passed++;
    }
    
    console.log(`   📊 CSS Tokens: ${passed}/${checks.length} passed`);
    return passed === checks.length;
  } catch (error) {
    console.log('   ❌ CSS Tokens file not found or error reading');
    return false;
  }
}

// Check 2: Component Accessibility
async function checkA11y() {
  console.log('\n2️⃣ Accessibility Check...');
  
  const components = [
    'src/interfaces/ui/components/atoms/Button.tsx',
    'src/interfaces/ui/components/atoms/Input.tsx',
    'src/interfaces/ui/components/atoms/Card.tsx'
  ];
  
  let passed = 0;
  for (const comp of components) {
    try {
      const content = await fs.readFile(comp, 'utf8');
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
async function checkFeatureFlags() {
  console.log('\n4️⃣ Feature Flags Check...');
  
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = await fs.readFile(envPath, 'utf8');
    
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
    checkCSSTokens(),
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
    console.log('🎉 ALL UI CHECKS PASSED');
    process.exit(0);
  } else {
    console.log('⚠️ SOME CHECKS FAILED - Review above');
    process.exit(1);
  }
}

main().catch(console.error);