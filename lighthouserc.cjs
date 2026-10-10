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
      numberOfRuns: 1,
      startServerCommand: `node scripts/serve.mjs ${port}`,
      startServerReadyPattern: 'dist/ em',
      puppeteerScript: theme === 'dark' ? './lighthouse-dark.cjs' : undefined,
      settings: {
        preset: form === 'desktop' ? 'desktop' : undefined,
        chromeFlags: '--no-sandbox',
        // O 404 volta com status 404 de propósito.
        skipAudits: [],
      },
    },
    assert: {
      assertMatrix: [
        { matchingUrlPattern: '.*/404$', assertions: Object.fromEntries(full.slice(0, 2).map((c) => [`categories:${c}`, ['error', { minScore: 1 }]])) },
        { matchingUrlPattern: '^(?!.*/404$).*$', assertions: Object.fromEntries(full.map((c) => [`categories:${c}`, ['error', { minScore: 1 }]])) },
      ],
    },
    upload: { target: 'filesystem', outputDir: `.lighthouseci/${profile}` },
  },
};
