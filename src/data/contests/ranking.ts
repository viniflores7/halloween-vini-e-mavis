export const PLACE_POINTS = [3, 2, 1]

export interface CostumeScore {
  playerId: string
  points: number
  placeVotes: number[]
  place: number
}

export interface GroupScore {
  groupIndex: number
  votes: number
  place: number
}

// Ranking denso: empatados dividem o lugar e o próximo lugar vem logo em seguida (1º, 2º, 2º, 3º)
function withDensePlaces<T>(sorted: T[], sameScore: (a: T, b: T) => boolean) {
  let place = 0
  return sorted.map((item, index) => {
    if (index === 0 || !sameScore(sorted[index - 1], item)) place++
    return { ...item, place }
  })
}

// 3 pontos para 1º, 2 para 2º e 1 para 3º; no empate vence quem tem mais votos de 1º, depois de 2º
export function rankCostumes(participants: string[], ballots: Record<string, string[]>): CostumeScore[] {
  const scores = new Map(
    participants.map((id) => [id, { playerId: id, points: 0, placeVotes: PLACE_POINTS.map(() => 0) }]),
  )
  for (const picks of Object.values(ballots)) {
    picks.forEach((id, index) => {
      const score = scores.get(id)
      if (!score) return
      score.points += PLACE_POINTS[index]
      score.placeVotes[index]++
    })
  }
  const compare = (a: CostumeScore, b: CostumeScore) =>
    b.points - a.points || b.placeVotes[0] - a.placeVotes[0] || b.placeVotes[1] - a.placeVotes[1]
  const sorted = [...scores.values()].map((score) => ({ ...score, place: 0 })).sort(compare)
  return withDensePlaces(sorted, (a, b) => compare(a, b) === 0).filter((score) => score.points > 0)
}

export function rankGroups(groupCount: number, groupBallots: Record<string, number>): GroupScore[] {
  const votes = Array.from({ length: groupCount }, () => 0)
  for (const groupIndex of Object.values(groupBallots)) if (groupIndex in votes) votes[groupIndex]++
  const sorted = votes
    .map((count, groupIndex) => ({ groupIndex, votes: count, place: 0 }))
    .sort((a, b) => b.votes - a.votes)
  return withDensePlaces(sorted, (a, b) => a.votes === b.votes).filter((score) => score.votes > 0)
}

export const atPlace = <T extends { place: number }>(scores: T[], place: number) =>
  scores.filter((score) => score.place === place)

export const podiumSize = (scores: { place: number }[]) => Math.min(PLACE_POINTS.length, scores.at(-1)?.place ?? 0)
