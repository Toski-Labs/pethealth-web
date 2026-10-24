# Pawta — site

Site do app Pawta, da Toski Labs: https://pawta.toski-labs.com.br

O app se chamava PetHealthTracker. O endereço antigo, `pethealth.toski-labs.com.br`, responde 301 para a mesma página no novo.

Estático, em português e inglês, sem cookies nem analytics. O único código de terceiros é o Firebase Remote Config das datas especiais (Halloween, Natal), baixado depois da página carregar e no máximo a cada 12 h; veja [`docs/PLANO.md`](docs/PLANO.md) › Datas especiais.

## Stack

- [Astro 7](https://astro.build) + TypeScript (strict), 100% estático
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- [Toski DS](https://toski-labs.github.io/toski-ds/) (`@toski-labs/ds`, tema `pawta`): tokens, ícones e componentes React renderizados só no build, sem JavaScript no navegador
- Outfit servida pelo próprio site (`@fontsource-variable/outfit`)
- Firebase Hosting, projeto `toski-labs`: site `pawta-toskilabs` (target `pawta`, o site) e `pethealth-toskilabs` (target `pethealth`, só os 301 do endereço antigo, pasta `redirect/`)

## Rodando

Precisa de Node 22.12 ou mais novo.

| Comando                    | O que faz                                                         |
| :------------------------- | :---------------------------------------------------------------- |
| `npm install`              | Instala as dependências                                           |
| `npm run dev`              | Servidor local em `localhost:4321`                                |
| `npm run build`            | Gera o site em `dist/` (antes, gera ícones e cards OG do DS)      |
| `npm run preview`          | Abre o `dist/` localmente                                         |
| `npm run deploy`           | Gera o site e publica no Firebase Hosting, site `pawta` (só quando você rodar) |
| `npm run deploy:redirect`  | Publica os 301 do endereço antigo, site `pethealth` (só quando você rodar) |
| `npm run ci`               | Tudo o que precisa passar antes de um PR (veja abaixo)            |

`npm run ci` roda: `astro check`, build, `check:csp` (sem `style=` inline, hashes da CSP), `check:seo` (inclui o sitemap: exatamente as 6 páginas, nenhum `.xml`), `check:links`, `check:redirects` (os 301 do site antigo no `firebase.json`), `check:jsonld`, axe e Lighthouse CI. Na primeira vez, `npx playwright install chromium`.

O deploy é manual (`npm run deploy` e `npm run deploy:redirect`, com `firebase login` feito antes); este repositório não faz deploy no CI.

O plano, as decisões e as pendências do DS estão em [`docs/PLANO.md`](docs/PLANO.md).
