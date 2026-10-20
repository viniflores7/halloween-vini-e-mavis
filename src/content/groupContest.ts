export const groupContestContent = {
  surprise: 'Surpresa!',
  surpriseTitle: 'Campeão de dupla ou trio',
  surpriseText: 'Quem veio combinando a fantasia também concorre!',
  buildingTitle: 'Monte as duplas e trios',
  buildingText: 'Toque em 2 ou 3 pessoas e crie o grupo. Você também pode entrar em um.',
  createGroup: (size: number) => (size === 3 ? 'Criar trio' : 'Criar dupla'),
  pickPeople: 'Escolha 2 ou 3 pessoas',
  groups: 'Grupos',
  noGroups: 'Nenhum grupo ainda',
  removeGroup: (name: string) => `Desfazer ${name}`,
  needsGroups: 'Crie pelo menos 2 grupos',
  reveal: 'Revelar duplas e trios',
  waitingBuilder: 'O anfitrião está formando as duplas e trios…',
  paradeKicker: 'Fantasia em grupo',
  paradeTitle: 'As duplas e trios',
  paradeOutro: 'Hora de votar!',
  ballotTitle: 'Qual o melhor grupo?',
  ballotText: 'Vale um voto só, e não dá para votar no seu grupo.',
  vote: (name: string) => `Votar em ${name}`,
  pick: 'Toque no grupo que você escolheu',
  sending: 'Enviando…',
  winnerKicker: 'Campeões de dupla ou trio',
  whoVotedWhom: 'Quem votou em quem',
  didNotVote: 'não votou',
  theEnd: 'Fim do concurso! Obrigado por participar.',
  home: 'Voltar ao início',
}

export function groupName(names: string[]) {
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} & ${names.at(-1)}`
}
