# Site do PetHealthTracker — plano de desenvolvimento

Fonte da verdade visual: canvas `site-pethealth` (SiteApp, SitePrivacidade/PrivacyEN, SiteSuporte/SupportEN, Site404). Base de código: `toski-labs-web` (somente leitura).
Stack: Astro 7 + TypeScript (strict) + Tailwind 4. Toski DS (`@toski-labs/ds` 0.5.3, fixado) como fonte única de tokens, componentes e assets. Hospedagem: Firebase Hosting, site `pethealth-toskilabs` no projeto `toski-labs`, em https://pethealth.toski-labs.com.br.
Regra: tudo gratuito, site estático, sem cookies, sem analytics, sem scripts de terceiros (a política de privacidade diz isso).

## Decisões
- Rotas (vão para o App Store Connect: não mudam depois): `/` · `/privacidade` · `/suporte` e `/en` · `/en/privacy` · `/en/support`; `404` bilíngue e `noindex`. `build.format: 'file'`, `trailingSlash: 'never'`, `cleanUrls`, sem redirecionamento automático por idioma.
- Tema do produto: `<html data-product="pethealth">` + `@toski-labs/ds/themes/pethealth.css`. Claro e escuro automáticos, com o menu de configurações (tema e idioma) igual ao da Toski. A pílula PT/EN do canvas é da versão antiga e não entrou.
- Âncoras: `#recursos` e `#planos` em PT; `#features` e `#plans` em EN.
- Sem `motion.ts`, voltar ao topo, aviso de idioma nem campanhas (todos precisam de JS).
- Suporte, e-mail: o botão "Escrever e-mail" abre um menu (`<details>` nativo) com Gmail e Outlook (nova aba, `rel="noopener noreferrer"`, "abre em nova aba" no nome acessível) e o app de e-mail (`mailto:`), porque o `mailto:` sozinho não abre nada para quem não tem app configurado. O e-mail fica visível e selecionável. O botão "Copiar e-mail" aparece só com JavaScript e com a API de área de transferência; ao copiar, o texto vira "E-mail copiado" e o aviso sai num `aria-live`. O mesmo script fecha o menu ao escolher uma opção, ao clicar fora e com Esc. Sem JS o menu abre e fecha pelo `<summary>`.
- JavaScript no navegador: o script do tema (inline, `<head>`), o do menu de configurações e, só no Suporte, o do e-mail (hash na CSP; `check:csp` aceita 3 scripts ali e 2 nas outras páginas).
- E-mail de suporte: toskilabs@gmail.com. Rodapé: © do ano do build.
- Política: igual à da Toski, exceto "Este site" (cita pethealth.toski-labs.com.br). Saíram os itens "Campanhas" e "Downloads", que são do site da Toski e não existem aqui. A seção de direitos não fala em exportar, então a descrição diz "ver, corrigir ou excluir".
- SEO: títulos de 50–60 e descrições de 140–160 caracteres (`src/data/seo.ts`, conferidos por `check:seo`). `MobileApplication` com `LifestyleApplication` (constante `APP_CATEGORY` em `src/i18n/ui.ts`), `operatingSystem` "iOS 18.0 or later", sem `offers`, `aggregateRating` nem `review` até o app estar na loja. `FAQPage` no Suporte, com as mesmas perguntas.
- `<meta name="apple-itunes-app">` pronto e desligado: liga com `APP_STORE_ID` em `src/i18n/ui.ts`.
- Imagens de Open Graph (1200 × 630, PT e EN), ícones e favicon são gerados do DS por `scripts/generate-assets.mjs` (prebuild); a saída fica no `.gitignore`.
- CSP em `<meta>` (hashes calculados pelo Astro; o do script do tema vem de `src/lib/theme-script.mjs`), com `frame-ancestors 'none'` no `firebase.json`. Os hashes não cobrem atributos `style="…"`: `scripts/csp.mjs` falha se algum HTML gerado tiver `style=`, `on*=` ou `javascript:`. Sem `'unsafe-inline'`.
- Por isso não usamos `ProductIcon`, `ProductMascot` nem `Mascot` do DS (emitem `style=`): a arte vem dos SVGs do DS (`@toski-labs/ds/products/pethealth/…`), inline, em `src/lib/art.ts`.
- Lighthouse: 100 em desempenho, acessibilidade, boas práticas e SEO nas 6 páginas indexáveis. A 404 (noindex e status 404) fica com desempenho e acessibilidade; SEO e boas práticas caem por definição (`is-crawlable`, `errors-in-console`).
- `connect-src 'self'` na CSP: o Lighthouse baixa o `robots.txt` de dentro da página, e com `'none'` o SEO perde pontos.

## Pendências do DS
Nada disso foi editado no DS. Cada item vive em `src/styles/global.css` como variável local com o nome do token pedido e `TODO(ds)`; quando o DS publicar, apagar o bloco.
1. **`--toski-feature-card` e `--toski-on-feature-card`** exportados para a web (CSS e Tailwind: `bg-feature-card`, `text-on-feature-card`). Os valores já existem no `tokens.json` (`themes.pethealth.featureCard` `#3E4C8A` claro / `#2C376A` escuro; `onFeatureCard` `#FFF8EE`), mas só saem para o app (`mobile.json`, Swift).
2. **Texto sobre o cartão de destaque:** `--toski-on-feature-card-accent` (`#C9D0F2`: título da seção e checks) e `--toski-on-feature-card-muted` (`rgb(255 248 238 / .8)`: texto corrido).
3. **Variantes de componente:** `Card variant="feature"`, `Kicker tone="feature"`, `CheckList tone="feature"` e `Pill variant="plus-inverse"` (fundo creme, letra Índigo). Hoje o bloco do PDF usa marcação local.
4. **Arte do 404:** dupla sem coração e a bolinha caída à direita (hoje composta em `src/lib/art.ts` com `pair-base-*` e `ball-indigo-*`). Além disso, a `ball-indigo-light` do DS é Índigo (`#3E4C8A`); o canvas usa lilás (`#A9B4E8`) também no claro.
5. **Folha de PDF sempre clara:** `--toski-sheet`, `-sheet-ink`, `-sheet-muted`, `-sheet-line`, `-sheet-rule`, `-sheet-badge`, `-sheet-badge-ink`, `-sheet-avatar` (hoje valores do `PdfCard` da Toski). O `surface` do DS escurece no tema escuro e não serve.
6. **Cores do rodapé e do celular ilustrado:** `--toski-footer-accent` (`#A9B4E8`, destaque do produto sobre o rodapé, que é escuro nos dois temas), `--toski-phone-bezel` (`#1B1511`) e `--toski-pet-avatar-2` (`#8FA07C`, `mobile.pet.avatars[1]`; o DS só exporta a lista para o app).
7. **CSP:** `Mascot`, `ProductIcon` e `ProductMascot` emitem `style="…"` (largura, `display`, variáveis de cor). Pedido: usar classes ou atributos de apresentação, sem `style=`. Até lá, não usamos os três.

## Fases
- Fase 0: repositório, projeto Astro + Tailwind 4 + DS, i18n e rotas ✅
- Fase 1: layout, cabeçalho com menu de configurações, rodapé ✅
- Fase 2: página do app (PT/EN) ✅ · Privacidade ✅ · Suporte com FAQPage ✅ · 404 com a dupla ✅
- Fase 3: SEO (canonical, hreflang, metas, JSON-LD, sitemap, robots, OG, ícones, manifest) ✅
- Fase 4: `firebase.json` / `.firebaserc` (sem deploy) ✅
- Fase 5: `npm run ci` + workflow do GitHub Actions ✅

## Status (10 out 2026)
Leva 1 (`feat/site-v1`) pronta para PR (10 out 2026: menu e "Copiar e-mail" do Suporte conferidos no navegador, `npm run ci` completo verde, capturas 390/1280 claro e escuro do Suporte e do bloco de ajuda). `npm run ci` = `astro check` → build → `check:csp` → `check:seo` → `check:links` → `check:jsonld` → axe (7 páginas × claro/escuro × 390/1280, com o menu aberto) → Lighthouse CI (4 perfis × 7 páginas).

### Falta (fora desta leva)
- [!] `/.well-known/apple-app-site-association`: depende do Team ID da conta paga da Apple.
- Deploy (manual, só quando pedido): criar o site `pethealth-toskilabs` no console do Firebase, apontar o domínio `pethealth.toski-labs.com.br`, `npm run build` e `firebase deploy --only hosting`.
- Link do rodapé para toski-labs.com.br só funciona quando o domínio apontar para o site da Toski (hoje em toski-labs.web.app).
- Link da App Store: botão "Em breve" vira link e `APP_STORE_ID` liga o banner do Safari.
- Preços (hoje "Em breve" / "Soon"), junto com o lançamento.
- Validação online, manual: Rich Results Test e validator.schema.org (`MobileApplication` sem `offers` não vira rich result; o FAQ só aparece no Google para sites oficiais e de saúde, mas o marcado é válido).
- Google Search Console: verificação pelo DNS, depois do deploy.
- Site da Toski (leva separada): card do projeto apontando para o subdomínio e 301 de `/pethealthtracker`.
