const shared = {
  codeLabel: 'Código da sala',
  join: 'Entrar',
  checking: 'Procurando…',
  notFound: 'Não achamos essa sala. Confere o código?',
  or: 'ou',
  creating: 'Criando…',
  rejoin: (code: string) => `Voltar para a sala ${code}`,
  back: 'Voltar',
}

export const amongUsEntryContent = {
  ...shared,
  kicker: 'Jogatina',
  title: 'Among Us',
  intro: 'Crie uma sala ou entre com o código que o anfitrião passar.',
  create: 'Criar nova sala',
  howItWorks: [
    'As tarefas e as mortes são presenciais.',
    'O app sorteia os impostores em segredo e conta o tempo da rodada.',
    'Achou um corpo? Denuncie. Desconfiou de alguém? Convoque uma reunião de emergência.',
  ],
}

export const contestEntryContent = {
  ...shared,
  kicker: 'Concurso',
  title: 'Melhor fantasia',
  intro: 'Crie a sala de votação ou entre com o código que o anfitrião passar.',
  create: 'Criar sala de votação',
  howItWorks: [
    'Todo mundo entra com uma foto da fantasia.',
    'Cada um vota no 1º, 2º e 3º lugar (não vale votar em si mesmo).',
    'O resultado é revelado com suspense, do 3º para o 1º lugar.',
  ],
}

export type RoomEntryCopy = typeof amongUsEntryContent
