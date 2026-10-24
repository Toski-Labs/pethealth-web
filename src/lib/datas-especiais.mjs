// Datas especiais (Halloween, Natal): o calendário que decide o visual do site.
//
// Fonte: parâmetro `datas_especiais` (JSON) do Remote Config do projeto Firebase toski-labs, o mesmo que o site
// da Toski Labs lê; o app usa o mesmo formato no Remote Config do projeto dele. O padrão abaixo vale quando o
// Remote Config não respondeu, ainda não foi lido ou veio com erro. Formato e regras em docs/PLANO.md › Datas especiais.
//
// As funções daqui rodam também no script do <head> (texto inline com hash na CSP): sem import, sem sintaxe
// moderna além de ES2017 e sem depender de nada de fora delas.

/** Este site na lista `sites` de cada tema. */
export const SITE_ID = 'pawta';

/** Chaves no navegador (mesmo prefixo de STORAGE em src/i18n/ui.ts). */
export const CHAVES = {
  config: 'toski-datas-especiais', // último valor do Remote Config (texto JSON), lido na próxima visita
  lidoEm: 'toski-datas-especiais-em', // quando o Remote Config foi consultado pela última vez (ms)
  previa: 'toski-tema-previa', // ?tema= (sessionStorage, até fechar a aba)
};

/** Padrão embutido. Os temas que o site conhece são exatamente estes (com arte em public/datas/<tema>/). */
export const DATAS_PADRAO = {
  ativo: true,
  forcar: '',
  temas: {
    halloween: { inicio: '10-24', fim: '10-31', enfeites: true, icone: true, sites: ['pawta', 'toski'] },
    natal: { inicio: '12-01', fim: '01-06', enfeites: true, icone: true, sites: ['pawta', 'toski'] },
  },
};

/**
 * Valida o valor do Remote Config (já convertido de JSON) contra o padrão. Nunca lança erro.
 * Valor inválido inteiro → padrão. Tema ausente ou com algum campo inválido → padrão daquele tema.
 * Temas que o padrão não conhece são ignorados (o site não tem arte para eles).
 */
export function normalizar(valor, padrao) {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return padrao;
  var dias = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var dataOk = function (s) {
    var m = typeof s === 'string' && /^(\d\d)-(\d\d)$/.exec(s);
    return !!m && +m[1] >= 1 && +m[1] <= 12 && +m[2] >= 1 && +m[2] <= dias[+m[1] - 1];
  };
  var fonte = valor.temas && typeof valor.temas === 'object' && !Array.isArray(valor.temas) ? valor.temas : {};
  var temas = {};
  for (var id in padrao.temas) {
    var t = Object.prototype.hasOwnProperty.call(fonte, id) ? fonte[id] : null;
    var ok =
      !!t &&
      typeof t === 'object' &&
      dataOk(t.inicio) &&
      dataOk(t.fim) &&
      typeof t.enfeites === 'boolean' &&
      typeof t.icone === 'boolean' &&
      Array.isArray(t.sites) &&
      t.sites.every(function (s) {
        return typeof s === 'string';
      });
    temas[id] = ok ? { inicio: t.inicio, fim: t.fim, enfeites: t.enfeites, icone: t.icone, sites: t.sites.slice() } : padrao.temas[id];
  }
  var forcar = valor.forcar === 'nenhum' || Object.prototype.hasOwnProperty.call(temas, valor.forcar) ? valor.forcar : '';
  return { ativo: typeof valor.ativo === 'boolean' ? valor.ativo : padrao.ativo, forcar: forcar, temas: temas };
}

/** Lê o texto guardado (JSON do Remote Config) e devolve a configuração válida. Nunca lança erro. */
export function lerConfig(texto, padrao) {
  if (!texto) return padrao;
  try {
    return normalizar(JSON.parse(texto), padrao);
  } catch (e) {
    return padrao;
  }
}
