import { groupName } from '@/content/groupContest'
import type { Contest } from '@/data/contests'
import { findPlayer, type Player } from '@/data/realtime'

export function contestGroups(contest: Contest, players: Player[]) {
  return contest.groups.map((group, index) => {
    const members = group.members.flatMap((id) => findPlayer(players, id) ?? [])
    return { index, members, name: groupName(members.map((member) => member.name)) }
  })
}

export type ContestGroup = ReturnType<typeof contestGroups>[number]
