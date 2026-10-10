// Lighthouse CI. Perfil por variável LH_PROFILE = mobile-light | mobile-dark | desktop-light | desktop-dark
// (scripts/lighthouse.mjs roda os quatro). Meta: 100 em desempenho, acessibilidade, boas práticas e SEO nas 7 páginas.
// A 404 é noindex e responde com status 404, por definição: o Lighthouse reprova SEO (is-crawlable) e boas práticas
// (errors-in-console, por causa do próprio status). Nela valem desempenho e acessibilidade.
const profile = process.env.LH_PROFILE || 'mobile-light';
const [form, theme] = profile.split('-');
const port = Number(process.env.LH_PORT || 4324); // scripts/lighthouse.mjs escolhe uma porta livre
const base = `http://127.0.0.1:${port}`;
const urls = ['/', '/en', '/privacidade', '/en/privacy', '/suporte', '/en/support', '/404'];
const full = ['performance', 'accessibility', 'best-practices', 'seo'];

module.exports = {
  ci: {
    collect: {
      url: urls.map((u) => base + u),
      numberOfRuns: 3, // a mediana das 3 vale: uma rodada lenta não derruba o CI
      startServerCommand: `node scripts/serve.mjs ${port}`,
      startServerReadyPattern: 'dist/ em',
      puppeteerScript: theme === 'dark' ? './lighthouse-dark.cjs' : undefined,
      // Sem chromeFlags: o sandbox do Chrome fica ligado (no GitHub Actions, o workflow libera o sandbox do Ubuntu).
      // Com puppeteerScript o LHCI abre o Chrome pelo Puppeteer e ignora chromeFlags: flags de verdade iriam em
      // puppeteerLaunchOptions.args.
      settings: {
        preset: form === 'desktop' ? 'desktop' : undefined,
      },
    },
    assert: {
      assertMatrix: [
        { matchingUrlPattern: '.*/404$', assertions: Object.fromEntries(full.slice(0, 2).map((c) => [`categories:${c}`, ['error', { minScore: 1, aggregationMethod: 'median' }]])) },
        { matchingUrlPattern: '^(?!.*/404$).*$', assertions: Object.fromEntries(full.map((c) => [`categories:${c}`, ['error', { minScore: 1, aggregationMethod: 'median' }]])) },
      ],
    },
    upload: { target: 'filesystem', outputDir: `.lighthouseci/${profile}` },
  },
};
