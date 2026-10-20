export const roomEntryContent = {
  kicker: 'Jogatina',
  title: 'Among Us',
  intro: 'Crie uma sala ou entre com o código que o anfitrião passar.',
  codeLabel: 'Código da sala',
  join: 'Entrar',
  checking: 'Procurando…',
  notFound: 'Não achamos essa sala. Confere o código?',
  or: 'ou',
  create: 'Criar nova sala',
  creating: 'Criando…',
  rejoin: (code: string) => `Voltar para a sala ${code}`,
  back: 'Voltar',
  howItWorks: [
    'As tarefas e as mortes são presenciais.',
    'O app sorteia os impostores em segredo e conta o tempo da rodada.',
    'Achou um corpo? Denuncie. Desconfiou de alguém? Convoque uma reunião de emergência.',
  ],
}
