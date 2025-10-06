#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 FIXING IMPORT PATHS');
console.log('=====================');

let totalFixed = 0;

function walkDirectory(dir, callback) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      walkDirectory(fullPath, callback);
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
      callback(fullPath);
    }
  }
}

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let fileFixed = false;

  // Fix Supabase client imports - normalize to @/lib/supabase/admin
  const supabasePatterns = [
    /@\/lib\/supabase\/Client/g,
    /@\/lib\/supabase\/CLIENT/g,
    /@\/lib\/supabase\/clients/g,
    /@\/lib\/supabase\/browserClient/g,
    /@\/lib\/supabase\/serverClient/g,
    /@\/lib\/supabase\/adminClient/g,
    /@\/lib\/supabase\/admin/g,
    /@\/lib\/supabase\/server/g
  ];

  supabasePatterns.forEach(pattern => {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, '@/lib/supabase/admin');
      fileFixed = true;
    }
  });

  // Fix ChartPage imports - ensure exact case match
  const chartPagePatterns = [
    /@\/modules\/chart\/ui\/chartPage/g,
    /@\/modules\/chart\/ui\/chartpage/g,
    /@\/modules\/chart\/ui\/CHARTPAGE/g
  ];

  chartPagePatterns.forEach(pattern => {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, '@/modules/chart/ui/ChartPage');
      fileFixed = true;
    }
  });

  // Write back if changes were made
  if (fileFixed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    totalFixed++;
  }
}

// Process all TypeScript files in src directory
try {
  walkDirectory('src', fixImportsInFile);
  
  console.log('\n📊 SUMMARY');
  console.log('==========');
  console.log(`✅ Files fixed: ${totalFixed}`);
  
  if (totalFixed === 0) {
    console.log('ℹ️ No import path issues found');
  } else {
    console.log('🎉 All import paths have been normalized');
  }
} catch (error) {
  console.error('❌ Error fixing imports:', error.message);
  process.exit(1);
}