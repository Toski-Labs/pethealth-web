// axe-core nas 7 páginas, em claro e escuro, a 390 e 1280 px (npm run check:axe). Tema escuro pelo localStorage,
// o mesmo caminho do menu de configurações; menu de configurações também é testado aberto.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { pages, report } from './lib.mjs';
import { serve } from './serve.mjs';

const server = await serve(0);
const base = `http://127.0.0.1:${server.address().port}`;
const errors = [];
const browser = await chromium.launch();
let runs = 0;
for (const theme of ['light', 'dark']) {
  for (const width of [390, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await ctx.addInitScript((t) => localStorage.setItem('toski-theme', t), theme);
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(base + p.url, { waitUntil: 'networkidle' });
      if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== theme) errors.push(`${p.url}: tema ${theme} não aplicado`);
      const states = [['', null], ['menu aberto', '.toski-settings-trigger']];
      for (const [label, open] of states) {
        if (open) await page.click(open);
        const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
        runs++;
        for (const v of violations) errors.push(`${p.url} ${width}px ${theme} ${label}: ${v.id} (${v.nodes.length}) ${v.nodes[0].target.join(' ')}`);
      }
    }
    await ctx.close();
  }
}
await browser.close();
server.close();
report(`axe: ${runs} varreduras (7 páginas × claro/escuro × 390/1280, com o menu aberto)`, errors);
