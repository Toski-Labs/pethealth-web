// Utilitários dos scripts de checagem: lista as páginas em dist/ e as URLs públicas.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

export const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const dist = path.join(root, 'dist');
export const SITE = 'https://pawta.toski-labs.com.br';

/** As 7 páginas: arquivo em dist/ → endereço público. */
export const pages = [
  { file: 'index.html', url: '/', lang: 'pt', slug: 'app' },
  { file: 'en.html', url: '/en', lang: 'en', slug: 'app-en' },
  { file: 'privacidade.html', url: '/privacidade', lang: 'pt', slug: 'privacidade' },
  { file: 'en/privacy.html', url: '/en/privacy', lang: 'en', slug: 'privacy' },
  { file: 'suporte.html', url: '/suporte', lang: 'pt', slug: 'suporte' },
  { file: 'en/support.html', url: '/en/support', lang: 'en', slug: 'support' },
  { file: '404.html', url: '/404', lang: 'pt', slug: '404', noindex: true },
];

export async function loadPages() {
  return Promise.all(
    pages.map(async (p) => {
      const html = await readFile(path.join(dist, p.file), 'utf8');
      return { ...p, html, root: parse(html, { comment: false }) };
    }),
  );
}

export async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

export function report(name, errors) {
  if (errors.length) {
    console.error(`✗ ${name}: ${errors.length} problema(s)`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✓ ${name}`);
}
