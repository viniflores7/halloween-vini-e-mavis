const violationMessages: Record<string, string> = {
  gameInProgress: 'A rodada já começou.',
  roomFull: 'A sala está cheia (15 jogadores).',
  notHost: 'Só o anfitrião pode fazer isso.',
  notEnoughPlayers: 'Precisa de pelo menos 3 jogadores.',
  notPlaying: 'Espera a rodada voltar para fazer isso.',
  notAlive: 'Fantasmas não podem fazer isso.',
  invalidVictim: 'Essa pessoa não pode ser denunciada.',
  noEmergencyLeft: 'Você já usou suas reuniões de emergência.',
  timeUp: 'O tempo da rodada acabou.',
  notInMeeting: 'A votação já terminou.',
  alreadyVoted: 'Você já votou.',
  invalidVote: 'Não dá para votar nessa pessoa.',
  votingOpen: 'A votação ainda está aberta.',
}

const fallback = 'Não deu certo agora. Confere a internet e tenta de novo.'

export function describeError(error: unknown) {
  const violation = (error as { violation?: string } | null)?.violation
  return (violation && violationMessages[violation]) || fallback
}
