// Links internos (npm run check:links): todo href/src interno aponta para um arquivo de dist/ e, se tiver #âncora, o id existe na página.
import { access } from 'node:fs/promises';
import path from 'node:path';
import { dist, loadPages, pages, report } from './lib.mjs';

const errors = [];
const loaded = await loadPages();
const byUrl = new Map(loaded.map((p) => [p.url, p]));
const ids = new Map(loaded.map((p) => [p.url, new Set(p.root.querySelectorAll('[id]').map((e) => e.getAttribute('id')))]));
const exists = (f) => access(path.join(dist, f)).then(() => true, () => false);

for (const page of loaded) {
  for (const el of page.root.querySelectorAll('[href], [src], [srcset]')) {
    const raw = el.getAttribute('href') ?? el.getAttribute('src');
    if (!raw || /^(mailto:|tel:|https?:|data:|\/\/)/.test(raw)) continue;
    const [pathname, hash] = raw.split('#');
    const target = pathname === '' ? page.url : new URL(pathname, `https://x${page.url === '/404' ? '/' : page.url}`).pathname;
    if (hash !== undefined && hash !== '') {
      const known = ids.get(target);
      if (!known) errors.push(`${page.url}: âncora em página desconhecida: ${raw}`);
      else if (!known.has(hash)) errors.push(`${page.url}: âncora inexistente ${raw}`);
    }
    if (pathname === '') continue;
    if (byUrl.has(target)) continue;
    if (target.endsWith('/') && target.length > 1) errors.push(`${page.url}: link com barra no fim: ${raw}`);
    else if (!(await exists(target.slice(1))) && !(await exists(`${target.slice(1)}.html`))) errors.push(`${page.url}: link quebrado ${raw}`);
  }
}
// Sitemap: lista as 6 páginas indexáveis e não a 404.
const sm = await (await import('node:fs/promises')).readFile(path.join(dist, 'sitemap-0.xml'), 'utf8');
for (const p of pages) {
  const loc = `https://pethealth.toski-labs.com.br${p.url === '/' ? '/' : p.url}`;
  if (p.noindex ? sm.includes(`<loc>${loc}</loc>`) : !sm.includes(`<loc>${loc}</loc>`)) errors.push(`sitemap: ${p.noindex ? 'contém' : 'não contém'} ${loc}`);
}
report(`links internos: ${loaded.length} páginas`, errors);
