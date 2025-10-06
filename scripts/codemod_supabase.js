const fs = require('fs');
const path = require('path');

const ROOTS = ['src/app/api', 'scripts']; // thư mục cần quét

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p, files);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry)) files.push(p);
  }
  return files;
}

function replaceInFile(file, pairs) {
  let text = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [from, to] of pairs) {
    const next = text.replace(from, to);
    if (next !== text) { text = next; changed = true; }
  }
  if (changed) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('patched:', file);
  }
}

const files = ROOTS.flatMap(r => walk(r));
for (const f of files) {
  replaceInFile(f, [
    // supabaseAdmin().from(...) -> supabaseAdmin().from(...)
    [/\bsupabaseAdmin\./g, 'supabaseAdmin().'],
    // (nếu có import nhầm client trong API) chuyển về admin
    [/@\/lib\/supabase\/client/g, '@/lib/supabase/admin'],
  ]);
}
console.log('Done.');
