// scripts/scan_unicode.ts
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const ROOT = join(process.cwd(), "src");
const NON_ASCII = /[^\x00-\x7F]/; // bất kỳ ký tự ngoài ASCII
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) walk(p, out);
    else if ([...EXTS].some(ext => name.name.endsWith(ext))) out.push(p);
  }
  return out;
}

const offenders: {file: string, line: number, preview: string}[] = [];
for (const file of walk(ROOT)) {
  const content = readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (NON_ASCII.test(line)) {
      offenders.push({ file, line: i + 1, preview: line.trim().slice(0, 160) });
    }
  });
}

if (offenders.length) {
  console.error("❌ Non-ASCII characters detected in source files:");
  offenders.forEach(o => console.error(`- ${o.file}:${o.line}  ${o.preview}`));
  process.exit(1);
} else {
  console.log("✅ No non-ASCII characters found in source.");
}