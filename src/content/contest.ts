export const contestContent = {
  closedText: 'A votação já começou. Não dá mais para entrar nesta sala.',
  back: 'Concurso',
  shareTitle: 'Concurso de melhor fantasia · Halloween Vini e Mavis',
  shareText: (code: string) => `Entra na sala ${code} do concurso de melhor fantasia!`,
  participants: 'Participantes',
  howItWorks:
    'Cada um vota no 1º, 2º e 3º lugar (com menos de 4 pessoas, em menos lugares). Vale 3, 2 e 1 ponto, e não dá para votar em si mesmo.',
  start: 'Começar votação',
  starting: 'Começando…',
  needsParticipants: (missing: number) =>
    `Falta${missing > 1 ? 'm' : ''} ${missing} participante${missing > 1 ? 's' : ''} para começar`,
  waitingHost: 'Aguardando o anfitrião começar a votação',
  editProfile: 'Editar meu perfil',
  leave: 'Sair da sala',
  leaveTitle: 'Sair da sala?',
  leaveConfirm: 'Sair',
  cancel: 'Cancelar',
}
