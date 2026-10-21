export const costumeVotingContent = {
  paradeKicker: 'Concurso de melhor fantasia',
  paradeTitle: 'Os participantes',
  paradeOutro: 'Hora de votar!',
  title: 'Seu voto',
  instructionsBySize: [
    'Toque na fantasia que merece o 1º lugar. Toque de novo para desmarcar.',
    'Toque nas fantasias na ordem: 1º e 2º lugar. Toque de novo para desmarcar.',
    'Toque nas fantasias na ordem: 1º, 2º e 3º lugar. Toque de novo para desmarcar.',
  ],
  places: ['1º lugar', '2º lugar', '3º lugar'],
  placeShort: ['1º', '2º', '3º'],
  emptySlot: 'escolha',
  removePick: (name: string) => `Tirar ${name}`,
  submit: 'Enviar votos',
  pickMore: (missing: number) => (missing === 1 ? 'Falta escolher 1' : `Faltam escolher ${missing}`),
  sending: 'Enviando…',
}

export const votingProgressContent = {
  voted: 'Voto enviado!',
  missing: (count: number) => (count === 1 ? 'Falta 1 pessoa votar' : `Faltam ${count} pessoas votar`),
  everyoneVoted: 'Todo mundo votou! Apurando…',
  closeNow: 'Apurar agora',
  closeTitle: 'Apurar sem esperar quem falta?',
  closeText: 'Os votos de quem ainda não votou ficam de fora.',
  closeConfirm: 'Apurar',
  cancel: 'Cancelar',
}
