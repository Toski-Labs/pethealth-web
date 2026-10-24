import type { Lang } from '../i18n/ui';

/** Perguntas frequentes do Suporte. Alimentam a página e o FAQPage do JSON-LD (as mesmas perguntas). */
export const faq: Record<Lang, [question: string, answer: string][]> = {
  pt: [
    ['Como restauro minha compra?', 'Em Ajustes, toque no card do seu plano e em Restaurar compras, usando o mesmo ID Apple da assinatura. O Plus acompanha o seu ID Apple, então funciona em qualquer iPhone com ele.'],
    ['Como cancelo a assinatura?', 'Em Ajustes, toque em Gerenciar assinatura no card do plano, ou vá em Ajustes do iPhone › seu nome › Assinaturas. Você continua no Plus até o fim do período já pago.'],
    ['Como peço reembolso?', 'Quem decide os reembolsos é a Apple. No app, vá em Ajustes › Ajuda e feedback › Pedir reembolso, que abre o pedido direto na Apple.'],
    ['O que acontece com meus pets se eu sair do Plus?', 'Você escolhe um pet para continuar ativo. Os outros ficam congelados: dá para ver tudo, mas eles saem da tela inicial e do calendário e param de lembrar. Nada é apagado, e todos voltam quando você assinar de novo.'],
    ['O app funciona sem internet?', 'Sim. Tudo fica salvo no iPhone e sincroniza com a sua conta quando a conexão voltar.'],
    ['Os lembretes não estão chegando.', 'Confira se as notificações do Pawta estão ligadas em Ajustes do iPhone › Notificações. Se estiverem desligadas, o app também avisa em Ajustes › Notificações.'],
    ['Como excluo minha conta?', 'Em Ajustes › Conta › Excluir conta. Isso apaga os seus dados e os dos seus pets. A assinatura é cancelada à parte, na Apple.'],
  ],
  en: [
    ['How do I restore my purchase?', 'In Settings, tap your plan card and then Restore purchases, using the same Apple ID as your subscription. Plus follows your Apple ID, so it works on any iPhone signed in with it.'],
    ['How do I cancel my subscription?', 'In Settings, tap Manage subscription on the plan card, or go to iPhone Settings › your name › Subscriptions. You keep Plus until the end of the period you paid for.'],
    ['How do I ask for a refund?', 'Apple decides on refunds. In the app, go to Settings › Help & feedback › Request a refund, which opens the request with Apple.'],
    ['What happens to my pets if I leave Plus?', 'You choose one pet to keep active. The others are frozen: you can still see everything, but they leave the home screen and calendar and stop reminding you. Nothing is deleted, and they all come back when you subscribe again.'],
    ['Does the app work offline?', 'Yes. Everything is saved on your iPhone and syncs to your account when you’re back online.'],
    ['My reminders aren’t showing up.', 'Check that notifications for Pawta are on in iPhone Settings › Notifications. If they’re off, the app also lets you know in Settings › Notifications.'],
    ['How do I delete my account?', 'Go to Settings › Account › Delete account. This erases your data and your pets’ data. Your subscription is cancelled separately, with Apple.'],
  ],
};
