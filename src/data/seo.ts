import type { Lang, PageKey } from '../i18n/ui';

/**
 * Título (50–60 caracteres) e descrição (140–160) de cada página, por idioma.
 * scripts/check-links.mjs confere os tamanhos no HTML gerado.
 */
export const seo: Record<Lang, Record<PageKey, { title: string; description: string }>> = {
  pt: {
    app: {
      title: 'Pawta: vacinas e saúde do seu pet num app para iPhone',
      description: 'Pawta é um app para iPhone com as vacinas, remédios e lembretes do seu pet num lugar só. Calendário, histórico de saúde e PDF para o veterinário.',
    },
    privacy: {
      title: 'Política de Privacidade do Pawta, app para iPhone de pets',
      description: 'Veja quais dados o Pawta, app para iPhone de vacinas e saúde do seu pet, guarda, por quê, com quem compartilha e como ver, corrigir ou excluir tudo.',
    },
    support: {
      title: 'Suporte do Pawta: ajuda com o app de vacinas e saúde pet',
      description: 'Ajuda com o Pawta, app para iPhone de vacinas e saúde pet: assinatura do Pawta Plus, restaurar compra, conta e lembretes. Fale com a Toski Labs.',
    },
  },
  en: {
    app: {
      title: 'Pawta: pet vaccine & health tracker app for iPhone',
      description: 'Pawta is an iPhone app for your pet’s vaccines, medicines and reminders in one place. Calendar, health history and a PDF to share with the vet.',
    },
    privacy: {
      title: 'Privacy Policy | Pawta, the pet health app for iPhone',
      description: 'See what data Pawta, the iPhone app for your pet’s vaccines and health, stores, why, who it’s shared with, and how to view, correct or delete it all.',
    },
    support: {
      title: 'Support | Pawta, the pet vaccine & health app for iPhone',
      description: 'Help with Pawta, the iPhone app for pet vaccines and health: Pawta Plus subscription, restoring purchases, your account and reminders. Email Toski Labs.',
    },
  },
};

/** 404: bilíngue, noindex. */
export const notFound = { title: 'Página não encontrada | Pawta', description: 'Esta página não existe. This page does not exist.' };
