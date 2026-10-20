export const roundEndContent = {
  crewmatesWin: 'Vitória dos tripulantes',
  impostorsWin: 'Vitória dos impostores',
  noWinner: 'Rodada encerrada',
  youWon: 'Você venceu!',
  youLost: 'Você perdeu…',
  reasons: {
    impostorsEliminated: 'Todos os impostores foram eliminados.',
    impostorsOutnumber: 'Os impostores ficaram em maioria.',
    timeLimit: 'A rodada chegou ao limite de 3 horas.',
  },
  impostorsWere: (count: number) => (count === 1 ? 'O impostor era' : 'Os impostores eram'),
  playAgain: 'Voltar ao lobby',
  waitingHost: 'Aguardando o anfitrião voltar ao lobby',
}
