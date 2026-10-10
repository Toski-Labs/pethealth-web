# PetHealthTracker — site

Site do app PetHealthTracker, da Toski Labs: https://pethealth.toski-labs.com.br

Estático, em português e inglês, sem cookies, analytics nem scripts de terceiros.

## Stack

- [Astro 7](https://astro.build) + TypeScript (strict), 100% estático
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- [Toski DS](https://toski-labs.github.io/toski-ds/) (`@toski-labs/ds`, tema `pethealth`): tokens, ícones e componentes React renderizados só no build, sem JavaScript no navegador
- Outfit servida pelo próprio site (`@fontsource-variable/outfit`)
- Firebase Hosting (site `pethealth-toskilabs`, projeto `toski-labs`)

## Rodando

Precisa de Node 22.12 ou mais novo.

| Comando                    | O que faz                                                         |
| :------------------------- | :---------------------------------------------------------------- |
| `npm install`              | Instala as dependências                                           |
| `npm run dev`              | Servidor local em `localhost:4321`                                |
| `npm run build`            | Gera o site em `dist/` (antes, gera ícones e cards OG do DS)      |
| `npm run preview`          | Abre o `dist/` localmente                                         |
| `npm run ci`               | Tudo o que precisa passar antes de um PR (veja abaixo)            |

`npm run ci` roda: `astro check`, build, `check:csp` (sem `style=` inline, hashes da CSP), `check:seo`, `check:links`, `check:jsonld`, axe e Lighthouse CI. Na primeira vez, `npx playwright install chromium`.

O deploy é manual e só quando pedido; este repositório não faz deploy no CI.

O plano, as decisões e as pendências do DS estão em [`docs/PLANO.md`](docs/PLANO.md).
