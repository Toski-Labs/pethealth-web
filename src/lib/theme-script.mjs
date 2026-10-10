// Script do <head> que aplica o tema salvo antes da pintura (sem piscar). É uma constante para a CSP poder
// calcular o hash (astro.config.mjs). Chave do localStorage: STORAGE.theme, em src/i18n/ui.ts.
export const themeScript = `try{var t=localStorage.getItem("toski-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
