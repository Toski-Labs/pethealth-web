import type { Lang, PageKey } from '../i18n/ui';

/**
 * Título (50–60 caracteres) e descrição (140–160) de cada página, por idioma.
 * scripts/check-links.mjs confere os tamanhos no HTML gerado.
 */
export const seo: Record<Lang, Record<PageKey, { title: string; description: string }>> = {
  pt: {
    app: {
      title: 'PetHealthTracker: app para iPhone de vacinas e lembretes',
      description: 'PetHealthTracker é um app para iPhone com as vacinas, remédios e lembretes do seu pet num lugar só. Calendário, histórico de saúde e PDF para o veterinário.',
    },
    privacy: {
      title: 'Política de Privacidade do PetHealthTracker, app para iPhone',
      description: 'Veja quais dados o app para iPhone PetHealthTracker guarda, por quê, com quem os compartilha e como você pode ver, corrigir ou excluir tudo.',
    },
    support: {
      title: 'Suporte do PetHealthTracker, app para iPhone de vacinas',
      description: 'Ajuda com o app para iPhone PetHealthTracker: assinatura, restaurar compra, conta, vacinas, remédios e lembretes. Fale com a Toski Labs por e-mail.',
    },
  },
  en: {
    app: {
      title: 'PetHealthTracker: iPhone app for pet vaccines & reminders',
      description: 'PetHealthTracker is an iPhone app for your pet’s vaccines, medicines and reminders in one place. Calendar, health history and a PDF to share with the vet.',
    },
    privacy: {
      title: 'Privacy Policy | PetHealthTracker, an iPhone app for pets',
      description: 'See what data the PetHealthTracker iPhone app stores, why it is stored, who it is shared with, and how you can view, correct or delete everything.',
    },
    support: {
      title: 'Support | PetHealthTracker, iPhone app for pet vaccines',
      description: 'Help with the PetHealthTracker iPhone app: subscription, restoring purchases, your account, vaccines, medicines and reminders. Email Toski Labs.',
    },
  },
};

/** 404: bilíngue, noindex. */
export const notFound = { title: 'Página não encontrada | PetHealthTracker', description: 'Esta página não existe. This page does not exist.' };
