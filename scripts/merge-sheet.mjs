// Merge a sheet into src/data/bank.json (dedupes by problem link, then title).
// Usage: node scripts/merge-sheet.mjs <file.json|file.csv> "<Sheet Name>"
// CSV/JSON columns: title, topic, subtopic, difficulty, leetcode, gfg, codingNinjas
import fs from 'node:fs';
const [file, source] = process.argv.slice(2);
if (!file || !source) { console.error('Usage: node scripts/merge-sheet.mjs <file> "<Sheet Name>"'); process.exit(1); }
const BANK = new URL('../src/data/bank.json', import.meta.url);
const bank = JSON.parse(fs.readFileSync(BANK, 'utf8'));
const txt = fs.readFileSync(file, 'utf8');
const split = (l) => { const o = []; let c = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { o.push(c); c = ''; } else c += ch; } o.push(c); return o.map((x) => x.trim()); };
let rows;
if (file.endsWith('.json')) rows = JSON.parse(txt);
else { const [h, ...ls] = txt.split(/\r?\n/).filter(Boolean); const hs = split(h); rows = ls.map((l) => Object.fromEntries(split(l).map((v, i) => [hs[i], v]))); }
const norm = (u) => (u || '').replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase();
const tnorm = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, '');
const byLink = new Map(), byTitle = new Map();
for (const q of bank) { for (const u of Object.values(q.platforms)) byLink.set(norm(u), q); byTitle.set(tnorm(q.title), q); }
let added = 0, merged = 0;
for (const r of rows) {
  const platforms = {}; if (r.leetcode) platforms.leetcode = r.leetcode; if (r.gfg) platforms.gfg = r.gfg; if (r.codingNinjas) platforms.codingNinjas = r.codingNinjas;
  const hit = Object.values(platforms).map((u) => byLink.get(norm(u))).find(Boolean) ?? byTitle.get(tnorm(r.title));
  if (hit) { if (!hit.sources.includes(source)) hit.sources.push(source); for (const [k, v] of Object.entries(platforms)) hit.platforms[k] ??= v; merged++; continue; }
  const q = { id: 'q' + (bank.length + 1), title: r.title, topic: r.topic || 'Extra', subtopic: r.subtopic || 'General', difficulty: r.difficulty || 'Medium', platforms, sources: [source] };
  bank.push(q); byTitle.set(tnorm(q.title), q); for (const u of Object.values(platforms)) byLink.set(norm(u), q); added++;
}
fs.writeFileSync(BANK, JSON.stringify(bank));
console.log(`${source}: ${added} added, ${merged} merged into existing. Total ${bank.length}`);
