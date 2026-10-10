import { APP_CATEGORY } from '../i18n/ui';
import { faq } from '../data/faq';
import type { Lang } from '../i18n/ui';

const ORG_ID = 'https://toski-labs.com.br/#organization';

/** App na página inicial. Sem offers, aggregateRating nem review até o app estar na App Store. */
export function mobileApplication(site: URL, url: string, description: string) {
  return {
    '@type': 'MobileApplication',
    '@id': new URL('/#app', site).href,
    name: 'PetHealthTracker',
    url,
    description,
    operatingSystem: 'iOS 18.0 or later',
    applicationCategory: APP_CATEGORY,
    inLanguage: ['pt-BR', 'en'],
    image: new URL('/icon-512.png', site).href,
    publisher: { '@id': ORG_ID },
  };
}

/** FAQPage do Suporte, com as mesmas perguntas da página. */
export function faqPage(lang: Lang, url: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    inLanguage: lang === 'pt' ? 'pt-BR' : 'en',
    mainEntity: faq[lang].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

export { ORG_ID };
