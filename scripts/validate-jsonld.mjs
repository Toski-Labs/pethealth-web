// Valida o JSON-LD de cada página (npm run check:jsonld). É uma checagem estrutural offline: campos obrigatórios,
// referências por @id, URLs absolutas e "nada inventado" (sem offers/aggregateRating/review). A validação completa
// continua manual, em validator.schema.org e no Rich Results Test (docs/PLANO.md).
import { loadPages, report, SITE } from './lib.mjs';

const errors = [];
const isAbs = (u) => typeof u === 'string' && /^https:\/\//.test(u);
const need = (where, node, fields) => fields.forEach((f) => node[f] === undefined && errors.push(`${where}: ${node['@type']} sem ${f}`));

for (const p of await loadPages()) {
  const blocks = p.root.querySelectorAll('script[type="application/ld+json"]');
  if (p.noindex) {
    if (blocks.length) errors.push(`${p.url}: a 404 não deve ter JSON-LD`);
    continue;
  }
  if (blocks.length !== 1) { errors.push(`${p.url}: ${blocks.length} blocos JSON-LD (esperado 1)`); continue; }
  let data;
  try { data = JSON.parse(blocks[0].text); } catch (e) { errors.push(`${p.url}: JSON inválido (${e.message})`); continue; }
  if (data['@context'] !== 'https://schema.org') errors.push(`${p.url}: @context`);
  const graph = data['@graph'] ?? [];
  const ids = new Set(graph.map((n) => n['@id']).filter(Boolean));
  const types = graph.map((n) => n['@type']);
  const expected = ['Organization', 'WebSite', ...(p.slug.startsWith('app') ? ['MobileApplication'] : []), ...(p.slug.endsWith('suporte') || p.slug === 'support' ? ['FAQPage'] : [])];
  if (types.join() !== expected.join()) errors.push(`${p.url}: tipos ${types} (esperado ${expected})`);
  for (const n of graph) {
    const w = `${p.url} ${n['@type']}`;
    if (n['@type'] === 'Organization') { need(w, n, ['name', 'url', 'logo', 'email']); if (!isAbs(n.url) || !isAbs(n.logo)) errors.push(`${w}: url/logo precisam ser absolutos`); }
    if (n['@type'] === 'WebSite') { need(w, n, ['name', 'url', 'inLanguage', 'publisher']); if (!n.url?.startsWith(SITE)) errors.push(`${w}: url fora do site`); }
    if (n['@type'] === 'MobileApplication') {
      need(w, n, ['name', 'operatingSystem', 'applicationCategory', 'inLanguage', 'publisher', 'image']);
      if (n.operatingSystem !== 'iOS 18.0 or later') errors.push(`${w}: operatingSystem ${n.operatingSystem}`);
      for (const f of ['offers', 'aggregateRating', 'review']) if (f in n) errors.push(`${w}: ${f} não entra até o app estar na loja`);
      if (!isAbs(n.image)) errors.push(`${w}: image precisa ser absoluta`);
    }
    if (n['@type'] === 'FAQPage') {
      const q = n.mainEntity ?? [];
      const onPage = p.root.querySelectorAll('section[aria-labelledby="faq-titulo"] details > summary').map((s) => s.text.trim());
      if (q.length === 0 || q.length !== onPage.length) errors.push(`${w}: ${q.length} perguntas no JSON-LD e ${onPage.length} na página`);
      q.forEach((x, i) => { if (x.name !== onPage[i]) errors.push(`${w}: pergunta ${i + 1} diferente da página`); if (!x.acceptedAnswer?.text) errors.push(`${w}: pergunta ${i + 1} sem resposta`); });
    }
    if (n.publisher && !ids.has(n.publisher['@id']) && !isAbs(n.publisher['@id'])) errors.push(`${w}: publisher sem @id válido`);
  }
}
report('json-ld: Organization, WebSite, MobileApplication, FAQPage', errors);
