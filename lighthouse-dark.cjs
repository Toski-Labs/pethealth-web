// Chamado pelo Lighthouse CI antes de cada página: grava o tema escuro no localStorage (o mesmo caminho do menu de configurações).
module.exports = async (browser, context) => {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    try { localStorage.setItem('toski-theme', 'dark'); } catch (e) {}
  });
  await page.goto(context.url);
  await page.close();
};
