// Datas especiais (Halloween, Natal): o calendário que decide o visual do site.
//
// Fonte: parâmetro `datas_especiais` (JSON) do Remote Config do projeto Firebase toski-labs, o mesmo que o site
// da Toski Labs lê; o app usa o mesmo formato no Remote Config do projeto dele. O padrão abaixo vale quando o
// Remote Config não respondeu, ainda não foi lido ou veio com erro. Formato e regras em docs/PLANO.md › Datas especiais.

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
 * Script do <head>, como texto (o build não mexe em texto, então o hash da CSP em astro.config.mjs bate com o HTML).
 * Roda antes da pintura e escolhe o tema; depois disso nada muda na página aberta.
 *
 * - Lê o último valor guardado do Remote Config e valida contra o padrão (`normalizar`): JSON inválido → padrão;
 *   tema ausente ou com algum campo inválido → padrão daquele tema; tema que o site não conhece → ignorado.
 * - Escolhe o tema (`temaDoDia`): ?tema= > ativo > forcar > datas (MM-DD no fuso do navegador; fim < início
 *   atravessa o ano). O tema precisa ter este site em `sites`.
 * - Marca o <html>: data-tema, data-tema-enfeites, data-tema-icone e --tema-fim (o fim da data escrito no idioma,
 *   que a faixa mostra com content: var(--tema-fim)). Troca favicon e apple-touch-icon (por isso o script fica
 *   depois dos <link> de ícone).
 * - ?tema=halloween|natal|nenhum vale até fechar a aba (?tema=auto volta ao calendário) e põe noindex na página.
 *
 * Qualquer erro deixa a página sem tema, nunca quebrada. Testes: scripts/check-datas.mjs.
 */
export const datasScript = `(function(){
var PADRAO=${JSON.stringify(DATAS_PADRAO)},CHAVES=${JSON.stringify(CHAVES)},SITE=${JSON.stringify(SITE_ID)};
var tem=function(o,k){return Object.prototype.hasOwnProperty.call(o,k)};
var DIAS=[31,29,31,30,31,30,31,31,30,31,30,31];
function dataOk(s){var m=typeof s==="string"&&/^(\\d\\d)-(\\d\\d)$/.exec(s);return !!m&&+m[1]>=1&&+m[1]<=12&&+m[2]>=1&&+m[2]<=DIAS[+m[1]-1]}
function temaOk(t){return !!t&&typeof t==="object"&&dataOk(t.inicio)&&dataOk(t.fim)&&typeof t.enfeites==="boolean"&&typeof t.icone==="boolean"&&Array.isArray(t.sites)&&t.sites.every(function(s){return typeof s==="string"})}
function normalizar(v){
  if(!v||typeof v!=="object"||Array.isArray(v))return PADRAO;
  var fonte=v.temas&&typeof v.temas==="object"&&!Array.isArray(v.temas)?v.temas:{},temas={};
  for(var id in PADRAO.temas)temas[id]=tem(fonte,id)&&temaOk(fonte[id])?fonte[id]:PADRAO.temas[id];
  return{ativo:typeof v.ativo==="boolean"?v.ativo:PADRAO.ativo,forcar:v.forcar==="nenhum"||(typeof v.forcar==="string"&&tem(temas,v.forcar))?v.forcar:"",temas:temas};
}
function temaDoDia(c,agora){
  if(!c.ativo)return null;
  var doSite=function(id){return c.temas[id].sites.indexOf(SITE)>=0};
  if(c.forcar)return c.forcar!=="nenhum"&&doSite(c.forcar)?c.forcar:null;
  var dois=function(n){return(n<10?"0":"")+n};
  var hoje=dois(agora.getMonth()+1)+"-"+dois(agora.getDate());
  for(var id in c.temas){
    var t=c.temas[id];
    if((t.inicio<=t.fim?hoje>=t.inicio&&hoje<=t.fim:hoje>=t.inicio||hoje<=t.fim)&&doSite(id))return id;
  }
  return null;
}
var html=document.documentElement,config=PADRAO,previa=null;
try{var salvo=localStorage.getItem(CHAVES.config);if(salvo)config=normalizar(JSON.parse(salvo))}catch(e){}
try{
  var pedido=new URLSearchParams(location.search).get("tema");
  if(pedido!==null){
    var robots=document.createElement("meta");robots.name="robots";robots.content="noindex";document.head.appendChild(robots);
    if(pedido==="auto")sessionStorage.removeItem(CHAVES.previa);
    else if(pedido==="nenhum"||tem(PADRAO.temas,pedido))sessionStorage.setItem(CHAVES.previa,pedido);
  }
  previa=sessionStorage.getItem(CHAVES.previa);
}catch(e){}
try{
  var tema=previa==="nenhum"?null:previa&&tem(config.temas,previa)?previa:temaDoDia(config,new Date());
  if(!tema)return;
  var t=config.temas[tema],fim=t.fim.split("-");
  html.style.setProperty("--tema-fim",JSON.stringify(new Intl.DateTimeFormat(html.lang,{day:"numeric",month:"long"}).format(new Date(2000,+fim[0]-1,+fim[1]))));
  html.setAttribute("data-tema",tema);
  if(t.enfeites)html.setAttribute("data-tema-enfeites","");
  if(t.icone){
    html.setAttribute("data-tema-icone","");
    var links=document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]');
    for(var i=0;i<links.length;i++)links[i].href="/datas/"+tema+(links[i].rel==="icon"?"/icone.svg":"/apple-touch-icon.png");
  }
}catch(e){}
})()`;
