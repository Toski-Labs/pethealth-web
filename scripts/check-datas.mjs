// Datas especiais (npm run check:datas):
//  1. o script do <head> (src/lib/datas-especiais.mjs › datasScript), rodado como está, com data, localStorage e
//     ?tema= de mentira: escolha do tema por data (véspera, primeiro dia, último dia, virada do ano), JSON inválido,
//     campos inválidos, sites, ativo, forcar e ?tema=;
//  2. no dist/: nenhum link nem o sitemap com ?tema=;
//  3. no Chromium, sobre o dist/: tema antes da pintura, ícones da data, ?tema= com noindex e canonical limpo,
//     nenhuma violação de CSP nem erro na página.
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { CHAVES, datasScript } from '../src/lib/datas-especiais.mjs';
import { dist, loadPages, report } from './lib.mjs';
import { serve } from './serve.mjs';

const errors = [];
const eq = (label, got, want) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) errors.push(`${label}: veio ${JSON.stringify(got)}, esperado ${JSON.stringify(want)}`);
};

// ---------- 1. Script do <head> isolado ----------

const memoria = (inicial = {}) => {
  const m = new Map(Object.entries(inicial));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
};

/** Roda o script num "navegador" de mentira. `agora`: [mês (1–12), dia, hora, minuto] no fuso local. */
function rodar({ agora, salvo, busca = '', sessao = memoria(), lang = 'pt-BR', semStorage = false }) {
  const attrs = {};
  const vars = {};
  const metas = [];
  const links = [
    { rel: 'icon', href: '/favicon.svg' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
  ];
  const [mes, dia, hora = 12, minuto = 0] = agora;
  const instante = new Date(2026, mes - 1, dia, hora, minuto).getTime();
  class FakeDate extends Date {
    constructor(...a) {
      if (a.length) super(...a);
      else super(instante);
    }
  }
  const local = semStorage
    ? new Proxy({}, { get: () => { throw new Error('SecurityError'); } })
    : memoria(salvo === undefined ? {} : { [CHAVES.config]: salvo });
  const document = {
    documentElement: { lang, setAttribute: (k, v) => (attrs[k] = v), style: { setProperty: (k, v) => (vars[k] = v) } },
    head: { appendChild: (el) => metas.push(el) },
    createElement: () => ({}),
    querySelectorAll: () => links,
  };
  vm.runInNewContext(datasScript, { document, location: { search: busca }, localStorage: local, sessionStorage: sessao, URLSearchParams, Intl, Date: FakeDate, JSON });
  return {
    tema: attrs['data-tema'] ?? null,
    enfeites: 'data-tema-enfeites' in attrs,
    icone: 'data-tema-icone' in attrs,
    fim: vars['--tema-fim'] ?? null,
    noindex: metas.some((m) => m.name === 'robots' && m.content === 'noindex'),
    favicon: links[0].href,
    touch: links[1].href,
  };
}

const tema = (agora, extra = {}) => rodar({ agora, ...extra }).tema;
const rc = (obj) => JSON.stringify(obj);
const H = (o = {}) => ({ inicio: '10-24', fim: '10-31', enfeites: true, icone: true, sites: ['pawta', 'toski'], ...o });
const N = (o = {}) => ({ inicio: '12-01', fim: '01-06', enfeites: true, icone: true, sites: ['pawta', 'toski'], ...o });

// Calendário padrão: véspera, primeiro dia, último dia e o dia seguinte; Natal atravessando o ano.
eq('véspera do Halloween (23/10 23:59)', tema([10, 23, 23, 59]), null);
eq('primeiro dia do Halloween (24/10 00:00)', tema([10, 24, 0, 0]), 'halloween');
eq('último dia do Halloween (31/10 23:59)', tema([10, 31, 23, 59]), 'halloween');
eq('dia seguinte ao Halloween (1/11 00:00)', tema([11, 1, 0, 0]), null);
eq('véspera do Natal (30/11 23:59)', tema([11, 30, 23, 59]), null);
eq('primeiro dia do Natal (1/12 00:00)', tema([12, 1, 0, 0]), 'natal');
eq('Natal, 31/12 23:59', tema([12, 31, 23, 59]), 'natal');
eq('Natal, virada do ano (1/1 00:00)', tema([1, 1, 0, 0]), 'natal');
eq('último dia do Natal (6/1 23:59)', tema([1, 6, 23, 59]), 'natal');
eq('dia seguinte ao Natal (7/1 00:00)', tema([1, 7, 0, 0]), null);
eq('fora das datas (10/3)', tema([3, 10]), null);

// O que o tema marca
const h = rodar({ agora: [10, 25] });
eq('Halloween: enfeites e ícone', [h.enfeites, h.icone], [true, true]);
eq('Halloween: favicon da data', [h.favicon, h.touch], ['/datas/halloween/icone.svg', '/datas/halloween/apple-touch-icon.png']);
eq('Halloween: fim em PT', h.fim, '"31 de outubro"');
eq('Halloween: fim em EN', rodar({ agora: [10, 25], lang: 'en' }).fim, '"October 31"');
eq('Natal: fim em PT', rodar({ agora: [12, 2] }).fim, '"6 de janeiro"');
eq('Natal: fim em EN', rodar({ agora: [12, 2], lang: 'en' }).fim, '"January 6"');
const fora = rodar({ agora: [3, 10] });
eq('fora das datas: nada muda', [fora.tema, fora.fim, fora.favicon, fora.noindex], [null, null, '/favicon.svg', false]);

// Remote Config guardado
eq('JSON inválido → padrão', tema([10, 25], { salvo: '{oops' }), 'halloween');
for (const lixo of ['null', '[]', '42', '"texto"', '{}']) eq(`valor ${lixo} → padrão`, tema([10, 25], { salvo: lixo }), 'halloween');
eq('datas mudadas pelo Remote Config (dentro)', tema([10, 20], { salvo: rc({ ativo: true, forcar: '', temas: { halloween: H({ inicio: '10-18', fim: '10-22' }), natal: N() } }) }), 'halloween');
eq('datas mudadas pelo Remote Config (fora)', tema([10, 25], { salvo: rc({ ativo: true, forcar: '', temas: { halloween: H({ inicio: '10-18', fim: '10-22' }), natal: N() } }) }), null);
eq('fim mudado pelo Remote Config vai para a faixa', rodar({ agora: [10, 25], salvo: rc({ temas: { halloween: H({ fim: '11-02' }) } }) }).fim, '"2 de novembro"');
eq('tema ausente no Remote Config → padrão dele', tema([12, 2], { salvo: rc({ ativo: true, temas: { halloween: H() } }) }), 'natal');
eq('data inválida (31-10) → padrão do tema', tema([10, 25], { salvo: rc({ temas: { halloween: H({ inicio: '31-10' }) } }) }), 'halloween');
eq('data inexistente (02-30) → padrão do tema', tema([2, 28], { salvo: rc({ temas: { halloween: H({ inicio: '02-27', fim: '02-30' }) } }) }), null);
eq('campo com tipo errado → padrão do tema', tema([10, 25], { salvo: rc({ temas: { halloween: H({ inicio: '10-01', fim: '10-02', enfeites: 'sim' }) } }) }), 'halloween');
eq('sites sem pawta → nada', tema([10, 25], { salvo: rc({ temas: { halloween: H({ sites: ['toski'] }) } }) }), null);
eq('sites com tipo errado → padrão do tema', tema([10, 25], { salvo: rc({ temas: { halloween: H({ sites: 'pawta' }) } }) }), 'halloween');
eq('tema desconhecido é ignorado', tema([2, 15], { salvo: rc({ temas: { carnaval: { inicio: '02-10', fim: '02-20', enfeites: true, icone: true, sites: ['pawta'] } } }) }), null);
eq('ativo: false desliga', tema([10, 25], { salvo: rc({ ativo: false, temas: { halloween: H() } }) }), null);
eq('ativo inválido → padrão (ligado)', tema([10, 25], { salvo: rc({ ativo: 'sim' }) }), 'halloween');
eq('enfeites: false', rodar({ agora: [10, 25], salvo: rc({ temas: { halloween: H({ enfeites: false }) } }) }).enfeites, false);
const semIcone = rodar({ agora: [10, 25], salvo: rc({ temas: { halloween: H({ icone: false }) } }) });
eq('icone: false mantém o favicon', [semIcone.tema, semIcone.icone, semIcone.favicon], ['halloween', false, '/favicon.svg']);

// forcar
eq('forcar natal em março', tema([3, 10], { salvo: rc({ forcar: 'natal' }) }), 'natal');
eq('forcar nenhum no Halloween', tema([10, 25], { salvo: rc({ forcar: 'nenhum' }) }), null);
eq('forcar desconhecido é ignorado', tema([10, 25], { salvo: rc({ forcar: 'carnaval' }) }), 'halloween');
eq('forcar respeita sites', tema([3, 10], { salvo: rc({ forcar: 'natal', temas: { natal: N({ sites: ['toski'] }) } }) }), null);
eq('ativo: false vence forcar', tema([3, 10], { salvo: rc({ ativo: false, forcar: 'natal' }) }), null);

// ?tema=
const sessao = memoria();
const previa = rodar({ agora: [3, 10], busca: '?tema=natal', sessao });
eq('?tema=natal em março', [previa.tema, previa.noindex], ['natal', true]);
const depois = rodar({ agora: [3, 10], sessao });
eq('?tema= continua na aba, sem noindex nas outras páginas', [depois.tema, depois.noindex], ['natal', false]);
eq('?tema=auto volta ao calendário', rodar({ agora: [3, 10], busca: '?tema=auto', sessao }).tema, null);
eq('?tema=nenhum no Halloween', tema([10, 25], { busca: '?tema=nenhum' }), null);
eq('?tema= vence ativo: false', tema([3, 10], { busca: '?tema=halloween', salvo: rc({ ativo: false }) }), 'halloween');
const invalido = rodar({ agora: [10, 25], busca: '?tema=xyz' });
eq('?tema= desconhecido: calendário, com noindex', [invalido.tema, invalido.noindex], ['halloween', true]);

// Navegador que bloqueia o storage (navegação privada antiga, cookies bloqueados)
eq('sem localStorage/sessionStorage → calendário padrão', tema([10, 25], { semStorage: true }), 'halloween');

// ---------- 2. ?tema= fora dos links e do sitemap ----------

for (const p of await loadPages()) {
  for (const el of p.root.querySelectorAll('[href]')) if (/[?&]tema=/.test(el.getAttribute('href'))) errors.push(`${p.url}: link com ?tema=`);
}
if (/tema=/.test(await readFile(path.join(dist, 'sitemap-0.xml'), 'utf8'))) errors.push('sitemap com ?tema=');

// ---------- 3. No navegador, sobre o dist/ ----------

const server = await serve(0);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();

/** Abre `url` com o relógio em `quando` (horário local). Devolve a página e os problemas de CSP/JS. */
async function abrir(url, quando, { ctx: contexto, init } = {}) {
  const ctx = contexto ?? (await browser.newContext({ viewport: { width: 1280, height: 900 } }));
  const page = await ctx.newPage();
  const problemas = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || /Content Security Policy/i.test(m.text())) problemas.push(m.text());
  });
  page.on('pageerror', (e) => problemas.push(String(e)));
  if (init) await page.addInitScript(...init);
  await page.clock.setFixedTime(quando);
  await page.goto(base + url, { waitUntil: 'load' });
  return { ctx, page, problemas };
}
const info = (page) =>
  page.evaluate(() => ({
    tema: document.documentElement.dataset.tema ?? null,
    fim: getComputedStyle(document.documentElement).getPropertyValue('--tema-fim').trim(),
    favicon: document.querySelector('link[rel="icon"]').getAttribute('href'),
    touch: document.querySelector('link[rel="apple-touch-icon"]').getAttribute('href'),
    noindex: !!document.querySelector('meta[name="robots"][content*="noindex"]'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
  }));

{
  const { ctx, page, problemas } = await abrir('/', new Date(2026, 9, 24, 0, 1));
  const i = await info(page);
  eq('navegador, 24/10: Halloween', [i.tema, i.fim, i.favicon, i.touch], ['halloween', '"31 de outubro"', '/datas/halloween/icone.svg', '/datas/halloween/apple-touch-icon.png']);
  eq('navegador, 24/10: sem noindex', i.noindex, false);
  for (const p of problemas) errors.push(`/ (24/10): ${p}`);
  await ctx.close();
}
{
  const { ctx, page, problemas } = await abrir('/en', new Date(2026, 9, 23, 23, 59));
  const i = await info(page);
  eq('navegador, 23/10: sem tema', [i.tema, i.favicon], [null, '/favicon.svg']);
  for (const p of problemas) errors.push(`/en (23/10): ${p}`);
  await ctx.close();
}
{
  const { ctx, page, problemas } = await abrir('/en?tema=natal', new Date(2026, 2, 10, 12));
  const i = await info(page);
  eq('navegador, ?tema=natal em março', [i.tema, i.fim, i.noindex], ['natal', '"January 6"', true]);
  eq('?tema= fora do canonical', i.canonical, 'https://pawta.toski-labs.com.br/en');
  await page.goto(base + '/en/privacy', { waitUntil: 'load' });
  const j = await info(page);
  eq('?tema= vale nas outras páginas da aba, sem noindex', [j.tema, j.noindex], ['natal', false]);
  for (const p of problemas) errors.push(`?tema=natal: ${p}`);
  await ctx.close();
}
{
  const { ctx, page, problemas } = await abrir('/', new Date(2026, 9, 25, 12), {
    init: [(k) => localStorage.setItem(k, '{isso não é json'), CHAVES.config],
  });
  eq('navegador, JSON guardado inválido → padrão', (await info(page)).tema, 'halloween');
  for (const p of problemas) errors.push(`JSON inválido: ${p}`);
  await ctx.close();
}

await browser.close();
server.close();
report('datas: escolha do tema (datas, virada do ano, JSON, sites, ativo, forcar, ?tema=) e no navegador', errors);
