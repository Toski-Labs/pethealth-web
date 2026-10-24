# Site do Pawta — plano de desenvolvimento

Fonte da verdade visual: canvas `site-pethealth` (SiteApp, SitePrivacidade/PrivacyEN, SiteSuporte/SupportEN, Site404). Base de código: `toski-labs-web` (somente leitura).
Stack: Astro 7 + TypeScript (strict) + Tailwind 4. Toski DS (`@toski-labs/ds` 0.6.0, fixado) como fonte única de tokens, componentes e assets. Hospedagem: Firebase Hosting, projeto `toski-labs`: site `pawta-toskilabs` em https://pawta.toski-labs.com.br; o `pethealth-toskilabs` (https://pethealth.toski-labs.com.br) só redireciona (ver "Pawta").
Regra: tudo gratuito, site estático, sem cookies, sem analytics. O único código de terceiros é o Firebase Remote Config das datas especiais, baixado depois do load e no máximo a cada 12 h (a política de privacidade diz isso).

## Decisões
- Rotas (vão para o App Store Connect: não mudam depois): `/` · `/privacidade` · `/suporte` e `/en` · `/en/privacy` · `/en/support`; `404` bilíngue e `noindex`. `build.format: 'file'`, `trailingSlash: 'never'`, `cleanUrls`, sem redirecionamento automático por idioma.
- Tema do produto: `<html data-product="pawta">` + `@toski-labs/ds/themes/pawta.css`. Claro e escuro automáticos, com o menu de configurações (tema e idioma) igual ao da Toski. A pílula PT/EN do canvas é da versão antiga e não entrou.
- Âncoras: `#recursos` e `#planos` em PT; `#features` e `#plans` em EN.
- Sem `motion.ts`, voltar ao topo, aviso de idioma nem campanhas (todos precisam de JS).
- Suporte, e-mail: o botão "Escrever e-mail" abre um menu (`<details>` nativo) com Gmail e Outlook (nova aba, `rel="noopener noreferrer"`, "abre em nova aba" no nome acessível) e o app de e-mail (`mailto:`), porque o `mailto:` sozinho não abre nada para quem não tem app configurado. O e-mail fica visível e selecionável. O botão "Copiar e-mail" aparece só com JavaScript e com a API de área de transferência; ao copiar, o texto vira "E-mail copiado" e o aviso sai num `aria-live`. O mesmo script fecha o menu ao escolher uma opção, ao clicar fora e com Esc. Sem JS o menu abre e fecha pelo `<summary>`.
- JavaScript no navegador: os scripts do tema e da data especial (inline, `<head>`), o do menu de configurações, o do Remote Config das datas especiais e, só no Suporte, o do e-mail (hash na CSP; `check:csp` aceita 5 scripts ali e 4 nas outras páginas).
- E-mail de suporte: toskilabs@gmail.com. Rodapé: © do ano do build.
- Política: igual à da Toski, exceto "Este site" (cita pawta.toski-labs.com.br). Saíram os itens "Campanhas" e "Downloads", que são do site da Toski e não existem aqui. A seção de direitos não fala em exportar, então a descrição diz "ver, corrigir ou excluir".
- SEO: títulos de 50–60 e descrições de 140–160 caracteres (`src/data/seo.ts`, conferidos por `check:seo`). `MobileApplication` com `LifestyleApplication` (constante `APP_CATEGORY` em `src/i18n/ui.ts`), `operatingSystem` "iOS 18.0 or later", sem `offers`, `aggregateRating` nem `review` até o app estar na loja. `FAQPage` no Suporte, com as mesmas perguntas.
- `<meta name="apple-itunes-app">` pronto e desligado: liga com `APP_STORE_ID` em `src/i18n/ui.ts`.
- Imagens de Open Graph (1200 × 630, PT e EN), ícones e favicon são gerados do DS por `scripts/generate-assets.mjs` (prebuild); a saída fica no `.gitignore`.
- CSP em `<meta>` (hashes calculados pelo Astro; o do script do tema vem de `src/lib/theme-script.mjs`), com `frame-ancestors 'none'` no `firebase.json`. Os hashes não cobrem atributos `style="…"`: `scripts/csp.mjs` falha se algum HTML gerado tiver `style=`, `on*=` ou `javascript:`. Sem `'unsafe-inline'`.
- Por isso não usamos `ProductIcon`, `ProductMascot` nem `Mascot` do DS (emitem `style=`): a arte vem dos SVGs do DS (`@toski-labs/ds/products/pawta/…`), inline, em `src/lib/art.ts`.
- Lighthouse: 100 em desempenho, acessibilidade, boas práticas e SEO nas 6 páginas indexáveis. A 404 (noindex e status 404) fica com desempenho e acessibilidade; SEO e boas práticas caem por definição (`is-crawlable`, `errors-in-console`).
- `connect-src 'self'` na CSP: o Lighthouse baixa o `robots.txt` de dentro da página, e com `'none'` o SEO perde pontos.

## Pendências do DS
Nada disso foi editado no DS. Cada item vive em `src/styles/global.css` como variável local com o nome do token pedido e `TODO(ds)`; quando o DS publicar, apagar o bloco.
1. **`--toski-feature-card` e `--toski-on-feature-card`** exportados para a web (CSS e Tailwind: `bg-feature-card`, `text-on-feature-card`). Os valores já existem no `tokens.json` (`themes.pawta.featureCard` `#3E4C8A` claro / `#2C376A` escuro; `onFeatureCard` `#FFF8EE`), mas só saem para o app (`mobile.json`, Swift).
2. **Texto sobre o cartão de destaque:** `--toski-on-feature-card-accent` (`#C9D0F2`: título da seção e checks) e `--toski-on-feature-card-muted` (`rgb(255 248 238 / .8)`: texto corrido).
3. **Variantes de componente:** `Card variant="feature"`, `Kicker tone="feature"`, `CheckList tone="feature"` e `Pill variant="plus-inverse"` (fundo creme, letra Índigo). Hoje o bloco do PDF usa marcação local.
4. **Arte do 404:** dupla sem coração e a bolinha caída à direita (hoje composta em `src/lib/art.ts` com `pair-base-*` e `ball-indigo-*`). Além disso, a `ball-indigo-light` do DS é Índigo (`#3E4C8A`); o canvas usa lilás (`#A9B4E8`) também no claro.
5. **Folha de PDF sempre clara:** `--toski-sheet`, `-sheet-ink`, `-sheet-muted`, `-sheet-line`, `-sheet-rule`, `-sheet-badge`, `-sheet-badge-ink`, `-sheet-avatar` (hoje valores do `PdfCard` da Toski). O `surface` do DS escurece no tema escuro e não serve.
6. **Cores do rodapé e do celular ilustrado:** `--toski-footer-accent` (`#A9B4E8`, destaque do produto sobre o rodapé, que é escuro nos dois temas), `--toski-phone-bezel` (`#1B1511`) e `--toski-pet-avatar-2` (`#8FA07C`, `mobile.pet.avatars[1]`; o DS só exporta a lista para o app).
7. **CSP:** `Mascot`, `ProductIcon` e `ProductMascot` emitem `style="…"` (largura, `display`, variáveis de cor). Pedido: usar classes ou atributos de apresentação, sem `style=`. Até lá, não usamos os três.
8. **Datas especiais:** tokens sazonais (`--data-noite` `#2B2340`, `--data-abobora` `#E8873A`, `--data-natal` `#C8402E`, `--data-natal-texto` `#FFFFFF`, `--data-hero-halloween` `#E3DCF0`, `--data-hero-natal` `#F6E3DF`, hoje em `src/styles/datas.css`), a dupla fantasiada (claro e escuro), os ícones das datas e os enfeites (`public/datas/`), e o script do `<head>` que escolhe a data (`src/lib/datas-especiais.mjs`), para este site e o da Toski Labs não se separarem.

## Fases
- Fase 0: repositório, projeto Astro + Tailwind 4 + DS, i18n e rotas ✅
- Fase 1: layout, cabeçalho com menu de configurações, rodapé ✅
- Fase 2: página do app (PT/EN) ✅ · Privacidade ✅ · Suporte com FAQPage ✅ · 404 com a dupla ✅
- Fase 3: SEO (canonical, hreflang, metas, JSON-LD, sitemap, robots, OG, ícones, manifest) ✅
- Fase 4: `firebase.json` / `.firebaserc` (sem deploy) ✅
- Fase 5: `npm run ci` + workflow do GitHub Actions ✅

## Status (10 out 2026)
Leva 1 (`feat/site-v1`) pronta para PR (10 out 2026: menu e "Copiar e-mail" do Suporte conferidos no navegador, `npm run ci` completo verde, capturas 390/1280 claro e escuro do Suporte e do bloco de ajuda). `npm run ci` = `astro check` → build → `check:csp` → `check:seo` → `check:links` → `check:jsonld` → axe (7 páginas × claro/escuro × 390/1280, com o menu aberto) → Lighthouse CI (4 perfis × 7 páginas, em porta livre). Com outro projeto rodando ao mesmo tempo o desempenho oscila (vi 0,95 uma vez): rode o `ci` sozinho.

### Falta (fora desta leva)
- [!] `/.well-known/apple-app-site-association`: depende do Team ID da conta paga da Apple.
- Deploy (manual): `npm run deploy` (build + `firebase deploy --only hosting:pawta`) e, depois do domínio novo conectado, `npm run deploy:redirect` (site antigo). Primeiro deploy feito em 10 out 2026 em https://pethealth-toskilabs.web.app; o domínio `pethealth.toski-labs.com.br` já responde por esse site (CNAME). Falta criar o site `pawta-toskilabs` e ligar `pawta.toski-labs.com.br` (ver "Pawta").
- Link do rodapé para toski-labs.com.br só funciona quando o domínio apontar para o site da Toski (hoje em toski-labs.web.app).
- Link da App Store: botão "Em breve" vira link e `APP_STORE_ID` liga o banner do Safari.
- Preços (hoje "Em breve" / "Soon"), junto com o lançamento.
- Validação online, manual: Rich Results Test e validator.schema.org (`MobileApplication` sem `offers` não vira rich result; o FAQ só aparece no Google para sites oficiais e de saúde, mas o marcado é válido).
- Google Search Console: verificação pelo DNS, depois do deploy.
- Site da Toski (leva separada): card do projeto apontando para o subdomínio e 301 de `/pethealthtracker` (feito; no P.8 passa a apontar para `pawta`).

## Pawta (24 out 2026)
O app PetHealthTracker passou a se chamar **Pawta** (plano pago: **Pawta Plus**). A identidade visual não muda.
- Endereço novo: https://pawta.toski-labs.com.br. As rotas são as mesmas (já estão no App Store Connect), só muda o domínio: `SITE` em `astro.config.mjs` e `scripts/lib.mjs`, `robots.txt`, canonical, `hreflang`, `og:url` e sitemap.
- Firebase Hosting com dois sites no `firebase.json` (targets no `.firebaserc`): `pawta` → `pawta-toskilabs` serve `dist/`; `pethealth` → `pethealth-toskilabs` só responde 301, página por página (as 6 indexáveis vão para a mesma página no endereço novo) e um catch-all `/:path*` para o resto (sitemap, OG, ícones). A pasta `redirect/` existe só porque o site precisa de uma pasta pública; o 301 vem antes dela. `npm run check:redirects` confere as regras.
- Por que dois sites e não o redirecionamento de domínio do console: o domínio antigo continua com o certificado (não sai do ar) e os 301 ficam versionados e testados.
- Deploy em duas etapas: `npm run deploy` (site `pawta`) primeiro; `npm run deploy:redirect` (site `pethealth`) só depois que `pawta.toski-labs.com.br` estiver conectado e com SSL. Manter o site antigo e o CNAME `pethealth` por pelo menos um ano.
- Marca em texto: "Paw" + "ta" na cor de destaque (cabeçalho, rodapé, hero e OG), no mesmo padrão do Koti.
- SEO novo em `src/data/seo.ts`, com "vacinas" e "saúde pet" (o título da loja é "Vacina e Saúde Pet – Pawta"). JSON-LD continua `MobileApplication` (um `SoftwareApplication`), com `name` "Pawta".
- Privacidade: só o nome do app e o domínio de "Este site". A data (6 de outubro de 2026) e o conteúdo jurídico não mudam.
- `check:seo` confere o sitemap: o índice aponta só para o `sitemap-0.xml`, que lista exatamente as 6 páginas, sem nenhum `.xml`.
- O nome do pacote (`pethealth-web`) e a pasta ficam até o repositório ser renomeado.

## Datas especiais (24 out 2026)

Halloween e Natal mudam o visual do site; o calendário vem do Remote Config, com um padrão embutido. Decisões na aba "Datas especiais" do canvas (24 out 2026).

**Parâmetro `datas_especiais`** (JSON) no Remote Config do projeto **`toski-labs`**, o mesmo do site da Toski Labs (que lê o mesmo parâmetro, S.19). O app usa o mesmo formato no Remote Config do projeto dele: são dois lugares para colar o mesmo JSON.

```json
{
  "ativo": true,
  "forcar": "",
  "temas": {
    "halloween": { "inicio": "10-24", "fim": "10-31", "enfeites": true, "icone": true, "sites": ["pawta", "toski"] },
    "natal": { "inicio": "12-01", "fim": "01-06", "enfeites": true, "icone": true, "sites": ["pawta", "toski"] }
  }
}
```

- `inicio` e `fim`: `MM-DD`, dias inteiros, no fuso do navegador. Repetem todo ano. `fim` menor que `inicio` atravessa o ano (Natal).
- `sites`: onde a data aparece (`pawta`, `toski`). Site fora da lista não mostra nada daquele tema.
- `enfeites: false`: fica a faixa, a dupla e o ícone, sem os enfeites. `icone: false`: favicon e ícones de sempre.
- `ativo: false` desliga tudo. `forcar`: `"halloween"`, `"natal"` ou `"nenhum"` ignora as datas (vale para todo mundo); vazio não força.
- Prioridade: `?tema=` > `ativo` > `forcar` > datas. Dois temas na mesma data: vale o primeiro da lista.
- Erros: JSON inválido ou ausente → padrão embutido. Tema ausente ou com campo inválido → padrão daquele tema. Tema que o site não conhece é ignorado. Nada disso quebra a página.
- Padrão embutido e validação: `src/lib/datas-especiais.mjs`.

**Remote Config no navegador** (`src/components/datas/DatasRemoteConfig.astro`, config pública em `src/lib/firebase.ts`, a do app Web "site"): depois do `load`, com o navegador ocioso, no máximo a cada 12 h, e só no endereço publicado. Guarda o valor em `localStorage` (`toski-datas-especiais`); vale a partir da próxima visita (nada muda com a página aberta). Firebase: ~20 KB gzip, só nessas consultas. CSP: `connect-src` com `firebaseinstallations.googleapis.com` e `firebaseremoteconfig.googleapis.com`. A política ganhou o item "Datas especiais" em "Este site" (PT e EN).

**Escolha do tema** (`datasScript` em `src/lib/datas-especiais.mjs`, inline no `<head>` logo depois dos `<link>` de ícone, hash na CSP): lê o padrão embutido e o último valor guardado do Remote Config, escolhe o tema pela data local do navegador e marca o `<html>` antes da pintura (`data-tema`, `data-tema-enfeites`, `data-tema-icone` e `--tema-fim`, o fim da data já escrito no idioma). Troca o favicon e o `apple-touch-icon` pelos de `public/datas/<tema>/`. Valor novo do Remote Config só vale na próxima visita: nada troca depois que a página aparece. O script é texto (não função convertida) porque o build reescreve funções e o hash deixaria de bater.

**Conferir em qualquer dia:** `?tema=halloween`, `?tema=natal`, `?tema=nenhum` (vale até fechar a aba; `?tema=auto` volta ao calendário). A página com `?tema=` ganha `noindex`; o canonical não leva a query e o sitemap não muda. `npm run check:datas` testa a escolha (véspera, primeiro e último dia, virada do ano, JSON inválido, `sites`, `ativo`, `forcar`, `?tema=`) e, no Chromium, o tema antes da pintura, os ícones e a CSP.

**Visual** (`src/styles/datas.css`, `src/components/datas/FaixaData.astro`; canvas `SzSiteHalloween`, `SzSiteNatal`, `SzDupla`, `SzIcones`):
- Faixa no topo, em todas as páginas (PT e EN, com o fim da data): Halloween roxa-noite com texto abóbora; Natal vermelha com texto branco. É um `<aside>` com rótulo "Data especial".
- Ícone da data no cabeçalho e acima do "Pawta" na Home; favicon e `apple-touch-icon` da data (o PNG é gerado no build a partir de `icone.svg`).
- Hero da Home: o celular continua; a dupla fantasiada senta na borda de baixo do círculo, o cachorro à esquerda e o gato à direita do celular (a mesma ilustração cortada ao meio, as beiradas atrás da moldura). Entre ~640 e ~830 px o círculo é quase da largura do celular e a dupla sai. No claro, o círculo fica no tom da data.
- Enfeites: Halloween, três fantasminhas flutuando nos cantos de cima do círculo; Natal, a guirlanda entre a faixa e o cabeçalho (em todas as páginas), balançando. Reduzir movimento deixa tudo parado. Tudo `aria-hidden`.
- As ilustrações são `background-image`: sem a data, nada de `/datas/` é baixado; com a data, só as dela (dupla clara ou escura conforme o tema).
- Arquivos em `public/datas/<tema>/`, um por ilustração, sem depender do CSS do site (o site da Toski Labs usa os mesmos). O `fantasminha.svg` veio do `toski-labs-web` (PR #5), para os dois sites terem o mesmo. A `bengalinha.svg` fica para quem quiser usar sozinha (aqui ela está dentro da guirlanda).
- Peso: sempre, ~2,6 KB gzip por página (script do `<head>`, CSS e faixa) + 1,8 KB do script do Remote Config (cache longo). Halloween ativo: +2,6 KB (fantasminha 0,3, dupla 1,0, ícone 1,3). Natal ativo: +3,2 KB (guirlanda 1,1, dupla 1,0, ícone 1,1). O `apple-touch-icon` (3,6 KB) só baixa ao adicionar à tela de início.
- Cores sem token no DS: `TODO(ds)` no topo de `datas.css`.
- Testes: `check:datas` confere que enfeites e dupla não cobrem texto, links nem botões de 360 a 1440 px, sem rolagem lateral, as imagens baixadas e o movimento; o axe roda Halloween e Natal em 4 páginas, claro e escuro (contraste da faixa).

## Cache do HTML (24 out 2026)
- Antes: cada página tinha a própria regra `max-age=0, must-revalidate` no `firebase.json` (com `cleanUrls`, o Firebase casa o `source` com a URL pedida, `/privacidade`, e não com o arquivo, então `**/*.html` não pegava). Uma página nova esquecida voltava ao padrão do Firebase, `max-age=3600`, e depois de um deploy o visitante ficava com o HTML antigo apontando para arquivos de `/_astro/` que já não existiam (imagens quebradas). A 404, o sitemap e o `robots.txt` saíam com 1 hora; favicon, `site.webmanifest` e `/og/` com 7 dias, sem hash no nome.
- Agora (como o `toski-labs-web` no PR #5): `**` com `Cache-Control: no-cache` (o navegador confere a cada visita; com ETag, volta 304 sem baixar de novo) e só `/_astro/**` (nome com hash) com `public, max-age=31536000, immutable`, por último. Quando duas regras definem o mesmo cabeçalho, o Firebase usa a de baixo. `/datas/` não tem hash: fica `no-cache`, e trocar um desenho chega na hora.
- `npm run check:cache` (no `npm run ci`) confere os cabeçalhos pelo `scripts/serve.mjs`, que aplica as regras como o Firebase (pela URL pedida, a de baixo vence).

## CI (GitHub Actions)
- `.github/workflows/ci.yml` roda `npm run ci` em PR, em `ubuntu-24.04` (fixo; o `ubuntu-latest` vira Ubuntu 26 em 19/out), com `actions/checkout@v7` e `actions/setup-node@v7` (Node 24).
- O Ubuntu do runner bloqueia o sandbox do Chrome ("No usable sandbox!"), e o Lighthouse CI abre o Chrome pelo Puppeteer nos perfis escuros (ignora `chromeFlags`). O workflow libera o sandbox com `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0`; não usamos `--no-sandbox`.
- Lighthouse: 3 rodadas por página, com a mediana nas asserções (limites em 100).
