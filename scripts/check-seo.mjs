// SEO básico do HTML gerado (npm run check:seo): título e descrição (tamanho, únicos), canonical, hreflang, h1 único,
// níveis de título sem pular, Open Graph, noindex da 404, robots.txt, sitemap.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { dist, loadPages, report, SITE } from './lib.mjs';

const errors = [];
const pages = await loadPages();
const seen = { title: new Map(), description: new Map() };
const meta = (p, sel) => p.root.querySelector(sel)?.getAttribute('content');

for (const p of pages) {
  const title = p.root.querySelector('title')?.text ?? '';
  const description = meta(p, 'meta[name="description"]') ?? '';
  const w = p.url;
  if (!p.noindex) {
    if (title.length < 50 || title.length > 60) errors.push(`${w}: título com ${title.length} caracteres (50–60): ${title}`);
    if (description.length < 140 || description.length > 160) errors.push(`${w}: descrição com ${description.length} caracteres (140–160)`);
  }
  for (const k of ['title', 'description']) {
    const v = k === 'title' ? title : description;
    if (seen[k].has(v)) errors.push(`${w}: ${k} repetido (igual a ${seen[k].get(v)})`);
    seen[k].set(v, w);
  }
  const h1 = p.root.querySelectorAll('h1');
  if (h1.length !== 1) errors.push(`${w}: ${h1.length} <h1>`);
  let last = 0;
  for (const h of p.root.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    const level = Number(h.rawTagName[1]);
    if (last && level > last + 1) errors.push(`${w}: título pulou de h${last} para h${level} ("${h.text.trim().slice(0, 30)}")`);
    last = level;
  }
  for (const sel of ['header', 'nav', 'main', 'footer']) if (!p.root.querySelector(sel)) errors.push(`${w}: sem <${sel}>`);
  for (const s of p.root.querySelectorAll('main section')) if (!s.getAttribute('aria-labelledby') && !s.getAttribute('aria-label')) errors.push(`${w}: <section> sem aria-labelledby`);

  const robots = meta(p, 'meta[name="robots"]');
  if (p.noindex) {
    if (!robots?.includes('noindex')) errors.push(`${w}: a 404 precisa de noindex`);
    continue;
  }
  if (robots) errors.push(`${w}: meta robots inesperada: ${robots}`);
  const canonical = p.root.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (canonical !== `${SITE}${p.url}`) errors.push(`${w}: canonical ${canonical} (esperado ${SITE}${p.url})`);
  const alt = Object.fromEntries(p.root.querySelectorAll('link[rel="alternate"][hreflang]').map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]));
  const pt = pages.find((x) => x.lang === 'pt' && x.slug === (p.lang === 'pt' ? p.slug : p.slug.replace(/^app-en$/, 'app')) ) ;
  if (!alt['pt-BR'] || !alt.en || !alt['x-default']) errors.push(`${w}: hreflang incompleto (${Object.keys(alt)})`);
  else if (alt['x-default'] !== alt['pt-BR']) errors.push(`${w}: x-default deve apontar para o PT`);
  void pt;
  for (const prop of ['og:type', 'og:locale', 'og:locale:alternate', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt'])
    if (!meta(p, `meta[property="${prop}"]`)) errors.push(`${w}: falta ${prop}`);
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) if (!meta(p, `meta[name="${name}"]`)) errors.push(`${w}: falta ${name}`);
  if (meta(p, 'meta[property="og:url"]') !== canonical) errors.push(`${w}: og:url diferente do canonical`);
  if (meta(p, 'meta[name="apple-itunes-app"]')) console.log(`  (apple-itunes-app ligado em ${w})`);
  if (p.root.querySelectorAll('meta[name="theme-color"]').length !== 2) errors.push(`${w}: precisa de 2 theme-color (claro e escuro)`);
  for (const rel of ['icon', 'apple-touch-icon', 'manifest']) if (!p.root.querySelector(`link[rel="${rel}"]`)) errors.push(`${w}: falta link ${rel}`);
}
const robotsTxt = await readFile(path.join(dist, 'robots.txt'), 'utf8');
if (!robotsTxt.includes(`Sitemap: ${SITE}/sitemap-index.xml`)) errors.push('robots.txt não aponta para o sitemap-index.xml');
report('seo: títulos, descrições, canonical, hreflang, Open Graph, h1', errors);
