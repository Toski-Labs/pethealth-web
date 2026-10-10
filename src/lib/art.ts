/**
 * Arte do PetHealthTracker vinda do Toski DS (@toski-labs/ds/products/pethealth), inline no HTML.
 * Não usamos ProductIcon/ProductMascot/Mascot do pacote: eles emitem style="" e a CSP não permite.
 * Ver docs/PLANO.md › Pendências do DS.
 */
import iconLight from '@toski-labs/ds/products/pethealth/icon/pethealth-icon-light.svg?raw';
import iconDark from '@toski-labs/ds/products/pethealth/icon/pethealth-icon-dark.svg?raw';
import pairBaseLight from '@toski-labs/ds/products/pethealth/mascots/pair-base-light.svg?raw';
import pairBaseDark from '@toski-labs/ds/products/pethealth/mascots/pair-base-dark.svg?raw';
import ballLight from '@toski-labs/ds/products/pethealth/mascots/ball-indigo-light.svg?raw';
import ballDark from '@toski-labs/ds/products/pethealth/mascots/ball-indigo-dark.svg?raw';

export type Mode = 'light' | 'dark';

const inner = (svg: string) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/<title>[^<]*<\/title>/, '');
const viewBox = (svg: string) => svg.match(/viewBox="([^"]+)"/)![1];

/** Ajusta um SVG do DS: tira metadados, define largura, acessibilidade e ids únicos. */
function tune(svg: string, uid: string, width: number | string, label?: string): string {
  const w = typeof width === 'number' ? `${width}` : width;
  const [, , vw, vh] = viewBox(svg).split(/\s+/).map(Number);
  const h = typeof width === 'number' ? `${Math.round((width * vh) / vw)}` : 'auto';
  const a11y = label ? `role="img" aria-label="${label.replace(/"/g, '&quot;')}"` : 'aria-hidden="true"';
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox(svg)}" width="${w}" height="${h}" ${a11y} focusable="false">${inner(svg)}</svg>`;
  for (const id of new Set([...out.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))) {
    out = out.replaceAll(`id="${id}"`, `id="${uid}-${id}"`).replaceAll(`url(#${id})`, `url(#${uid}-${id})`);
  }
  return out;
}

const icons: Record<Mode, string> = { light: iconLight, dark: iconDark };

/** Ícone do app (claro e escuro; o CSS do DS mostra o do tema ativo via data-art). */
export function appIcon(uid: string, size: number, label?: string): { mode: Mode; html: string }[] {
  return (['light', 'dark'] as const).map((mode) => ({ mode, html: tune(icons[mode], `${uid}${mode}`, size, label) }));
}

/** Dupla do 404: dupla sem coração e a bolinha lilás caída à direita, numa só figura. */
export function fallenBallPair(uid: string, label: string): { mode: Mode; html: string }[] {
  const pairs: Record<Mode, string> = { light: pairBaseLight, dark: pairBaseDark };
  const balls: Record<Mode, string> = { light: ballLight, dark: ballDark };
  return (['light', 'dark'] as const).map((mode) => {
    // Bolinha do DS (centro 222,150 · raio 18) reduzida e levada para a direita do chão.
    const ball = `<g opacity="0.6" transform="translate(${446 - 222 * 0.722} ${190 - 150 * 0.722}) scale(0.722)">${inner(balls[mode])}</g>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 14 450 192" width="100%">${inner(pairs[mode])}${ball}</svg>`;
    return { mode, html: tune(svg, `${uid}${mode}`, '100%', label) };
  });
}
