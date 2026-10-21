const violationMessages: Record<string, string> = {
  gameInProgress: 'A rodada já começou.',
  roomFull: 'A sala está cheia (15 jogadores).',
  notHost: 'Só o anfitrião pode fazer isso.',
  notEnoughPlayers: 'Precisa de pelo menos 2 jogadores.',
  notPlaying: 'Espera a rodada voltar para fazer isso.',
  notAlive: 'Fantasmas não podem fazer isso.',
  invalidVictim: 'Essa pessoa não pode ser denunciada.',
  noEmergencyLeft: 'Você já usou suas reuniões de emergência.',
  timeLimitReached: 'A rodada chegou ao limite de 3 horas.',
  notInMeeting: 'A votação já terminou.',
  alreadyVoted: 'Você já votou.',
  invalidVote: 'Não dá para votar nessa pessoa.',
  votingOpen: 'A votação ainda está aberta.',
  contestStarted: 'A votação já começou.',
  contestFull: 'A sala está cheia.',
  notEnoughParticipants: 'Precisa de pelo menos 4 participantes.',
  notVoting: 'A votação já terminou.',
  notParticipant: 'Você não está participando desta votação.',
  invalidBallot: 'Esse voto não vale. Confere as escolhas?',
  noVotes: 'Ninguém votou ainda.',
  notRevealing: 'Não tem nada para revelar agora.',
  notInResults: 'Espera o resultado sair.',
  invalidGroups: 'Monte pelo menos 2 grupos de 2 ou 3 pessoas.',
}

const fallback = 'Não deu certo agora. Confere a internet e tenta de novo.'

export function describeError(error: unknown) {
  const violation = (error as { violation?: string } | null)?.violation
  return (violation && violationMessages[violation]) || fallback
}
