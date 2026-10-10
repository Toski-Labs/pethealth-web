// Confere a Content-Security-Policy do HTML gerado (npm run check:csp, parte do npm run ci):
//  1. nenhum atributo style="…" (nem on*="…" ou javascript:): hashes da CSP não cobrem atributos, e não liberamos 'unsafe-inline';
//  2. cada <script> e <style> inline tem o hash na <meta http-equiv="content-security-policy">;
//  3. nenhum script de outra origem, e nada além do script do tema, do menu de configurações e (no Suporte) do copiar e-mail.
import { createHash } from 'node:crypto';
import { loadPages, report } from './lib.mjs';

const errors = [];
const sha = (s) => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;

for (const page of await loadPages()) {
  const where = page.url;
  const meta = page.root.querySelector('meta[http-equiv="content-security-policy"]');
  if (!meta) {
    errors.push(`${where}: sem <meta http-equiv="content-security-policy">`);
    continue;
  }
  const policy = meta.getAttribute('content') ?? '';
  const directive = (name) => policy.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? '';
  const scriptSrc = directive('script-src');
  const styleSrc = directive('style-src');
  if (/'unsafe-inline'|'unsafe-eval'/.test(policy)) errors.push(`${where}: a CSP não pode ter 'unsafe-inline' nem 'unsafe-eval'`);
  if (!policy.includes("default-src 'none'")) errors.push(`${where}: falta default-src 'none'`);

  // 1. Atributos inline
  for (const el of page.root.querySelectorAll('*')) {
    for (const attr of Object.keys(el.attributes)) {
      if (attr === 'style') errors.push(`${where}: <${el.rawTagName}> com style="${el.getAttribute('style')?.slice(0, 60)}"`);
      if (/^on/i.test(attr)) errors.push(`${where}: <${el.rawTagName}> com ${attr}="…"`);
      if (/^javascript:/i.test(el.getAttribute(attr) ?? '')) errors.push(`${where}: <${el.rawTagName}> com javascript: em ${attr}`);
    }
  }

  // 2. Hashes dos blocos inline
  for (const s of page.root.querySelectorAll('script')) {
    const type = s.getAttribute('type');
    if (type === 'application/ld+json') continue; // dados, não executa
    if (s.getAttribute('src')) {
      if (/^(https?:)?\/\//.test(s.getAttribute('src'))) errors.push(`${where}: script de outra origem: ${s.getAttribute('src')}`);
      continue;
    }
    if (!scriptSrc.includes(sha(s.textContent))) errors.push(`${where}: <script> inline sem hash na CSP (${s.textContent.trim().slice(0, 40)}…)`);
  }
  for (const s of page.root.querySelectorAll('style')) {
    if (!styleSrc.includes(sha(s.textContent))) errors.push(`${where}: <style> inline sem hash na CSP`);
  }
  for (const l of page.root.querySelectorAll('link[rel="stylesheet"], link[rel="preload"], img')) {
    const u = l.getAttribute('href') ?? l.getAttribute('src') ?? '';
    if (/^(https?:)?\/\//.test(u)) errors.push(`${where}: recurso de outra origem: ${u}`);
  }

  // 3. Quanto JS: o script do tema (inline) + o do menu de configurações; nada mais.
  // No Suporte entra um terceiro: copiar e-mail e fechar o menu do e-mail.
  const executable = page.root.querySelectorAll('script').filter((s) => s.getAttribute('type') !== 'application/ld+json');
  const allowed = /\/(suporte|support)$/.test(page.url) ? 3 : 2;
  if (executable.length > allowed) errors.push(`${where}: ${executable.length} scripts (esperado até ${allowed})`);
}
report('csp: sem style= inline, hashes completos, tema + menu (+ copiar e-mail no Suporte)', errors);
