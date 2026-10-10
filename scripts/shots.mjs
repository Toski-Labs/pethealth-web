// Capturas das 7 páginas em 390 e 1280 px, claro e escuro (para comparar com o canvas). Uso: node scripts/shots.mjs <pasta> [base-url]
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { pages } from './lib.mjs';

const out = process.argv[2];
const base = process.argv[3] ?? 'http://127.0.0.1:4322';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  for (const width of [390, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(base + p.url, { waitUntil: 'networkidle' });
      await page.screenshot({ path: `${out}/${p.slug}-${width}-${scheme}.png`, fullPage: true });
    }
    await ctx.close();
  }
}
await browser.close();
