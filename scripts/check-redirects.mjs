// 301 do endereço antigo (npm run check:redirects): no firebase.json, o site "pethealth" manda cada página indexável
// para a mesma página no endereço novo, e o resto (sitemap, OG, ícones) pelo catch-all. O site "pawta" não redireciona.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pages, report, root, SITE } from './lib.mjs';

const errors = [];
const { hosting } = JSON.parse(await readFile(path.join(root, 'firebase.json'), 'utf8'));
const site = (target) => hosting.find((h) => h.target === target);
const pawta = site('pawta');
const old = site('pethealth');

if (!pawta || pawta.public !== 'dist') errors.push('firebase.json: falta o site "pawta" servindo dist/');
if (pawta?.redirects?.length) errors.push('firebase.json: o site "pawta" não deve redirecionar');
if (!old) errors.push('firebase.json: falta o site "pethealth" (redirecionamento)');
else {
  const rules = old.redirects ?? [];
  for (const p of pages.filter((x) => !x.noindex)) {
    const i = rules.findIndex((r) => r.source === p.url);
    const r = rules[i];
    if (!r) errors.push(`pethealth: falta o 301 de ${p.url}`);
    else if (r.destination !== `${SITE}${p.url}` || r.type !== 301) errors.push(`pethealth: ${p.url} vai para ${r.destination} (${r.type}); esperado 301 para ${SITE}${p.url}`);
  }
  const catchAll = rules.findIndex((r) => r.source === '/:path*');
  if (catchAll < 0) errors.push('pethealth: falta o catch-all /:path*');
  else {
    if (rules[catchAll].destination !== `${SITE}/:path` || rules[catchAll].type !== 301) errors.push('pethealth: o catch-all deve ser 301 para o mesmo caminho no endereço novo');
    if (catchAll !== rules.length - 1) errors.push('pethealth: o catch-all precisa ser a última regra');
  }
  if (old.rewrites?.length || old.headers?.length) errors.push('pethealth: o site antigo só redireciona (sem rewrites nem headers)');
}
report(`redirecionamentos: ${pages.filter((x) => !x.noindex).length} páginas + catch-all`, errors);
