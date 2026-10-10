// Roda o Lighthouse CI nos 4 perfis (celular/computador × claro/escuro), um de cada vez (npm run check:lighthouse).
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { chromium } from 'playwright';

// Porta livre: outra coisa (ou outro projeto) pode estar usando a 4324.
const port = await new Promise((resolve) => {
  const s = createServer().listen(0, '127.0.0.1', () => {
    const { port } = s.address();
    s.close(() => resolve(port));
  });
});

const chrome = process.env.CHROME_PATH ?? chromium.executablePath();
let failed = [];
for (const profile of ['mobile-light', 'mobile-dark', 'desktop-light', 'desktop-dark']) {
  console.log(`\n== Lighthouse CI: ${profile} ==`);
  const r = spawnSync('npx', ['lhci', 'autorun', '--config=lighthouserc.cjs'], { stdio: 'inherit', env: { ...process.env, LH_PROFILE: profile, LH_PORT: String(port), CHROME_PATH: chrome } });
  if (r.status !== 0) failed.push(profile);
}
if (failed.length) {
  console.error(`✗ lighthouse: falhou em ${failed.join(', ')}`);
  process.exit(1);
}
console.log('✓ lighthouse: 4 perfis × 7 páginas');
