// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

import { createHash } from 'node:crypto';
import { themeScript } from './src/lib/theme-script.mjs';

const SITE = 'https://pawta.toski-labs.com.br';

// Mesma página em PT e EN (espelha src/i18n/ui.ts › routes). Usado no sitemap.
const pagePairs = [
  ['/', '/en'],
  ['/privacidade', '/en/privacy'],
  ['/suporte', '/en/support'],
];

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // Gera /privacidade.html em vez de /privacidade/index.html; o Firebase serve sem barra (cleanUrls).
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  markdown: { syntaxHighlight: false },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  // Content-Security-Policy em <meta>: o Astro calcula os hashes dos scripts e estilos inline.
  // frame-ancestors não vale em <meta>; fica no firebase.json. Atributos style="" não são cobertos
  // por hash: scripts/csp.mjs falha o build se algum HTML gerado tiver um.
  security: {
    csp: {
      // O script do tema é inline (is:inline) e o Astro não calcula o hash dele: entra aqui.
      scriptDirective: { hashes: [`sha256-${createHash('sha256').update(themeScript).digest('base64')}`] },
      directives: [
        "default-src 'none'",
        "img-src 'self' data:",
        "font-src 'self'",
        "manifest-src 'self'",
        "connect-src 'self'", // o Lighthouse baixa o robots.txt de dentro da página; sem isso o SEO perde pontos
        "base-uri 'none'",
        "form-action 'none'",
      ],
    },
  },
  integrations: [
    // Componentes do Toski DS (React), renderizados só no servidor: sem client:, sem JS no navegador.
    react(),
    // /sitemap-index.xml com as versões PT/EN ligadas (hreflang). A 404 fica de fora.
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        const pair = pagePairs.find((p) => p.some((path) => new URL(item.url).pathname === path));
        if (pair) {
          item.links = [
            { lang: 'pt-BR', url: SITE + pair[0] },
            { lang: 'en', url: SITE + pair[1] },
            { lang: 'x-default', url: SITE + pair[0] },
          ];
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
