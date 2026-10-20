import { useState } from 'react'
import { describeError } from '@/content/errors'
import { groupContestContent as copy, groupName } from '@/content/groupContest'
import { getContestRepository, MAX_GROUP_SIZE, MIN_GROUP_SIZE, type Contest } from '@/data/contests'
import { findPlayer, type Player } from '@/data/realtime'
import { Avatar } from '@/shared/components/Avatar'
import { AvatarStack } from '@/shared/components/AvatarStack'
import { CloseIcon } from '@/shared/components/Icons'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'

interface GroupBuilderProps {
  contest: Contest
  participants: Player[]
}

export function GroupBuilder({ contest, participants }: GroupBuilderProps) {
  const [groups, setGroups] = useState<string[][]>([])
  const [selected, setSelected] = useState<string[]>([])
  const saving = useAsyncAction(describeError)
  const grouped = groups.flat()
  const available = participants.filter((player) => !grouped.includes(player.id))
  const canCreate = selected.length >= MIN_GROUP_SIZE && selected.length <= MAX_GROUP_SIZE
  const membersOf = (group: string[]) => group.flatMap((id) => findPlayer(participants, id) ?? [])

  const toggle = (id: string) =>
    setSelected((current) => {
      if (current.includes(id)) return current.filter((member) => member !== id)
      return current.length < MAX_GROUP_SIZE ? [...current, id] : current
    })

  function createGroup() {
    setGroups((current) => [...current, selected])
    setSelected([])
  }

  const reveal = () => saving.run(async () => (await getContestRepository()).setGroups(contest.code, groups))

  return (
    <div className="page group-builder">
      <header className="page-header">
        <h1 className="title">{copy.buildingTitle}</h1>
        <p className="muted small">{copy.buildingText}</p>
      </header>

      <ul className="group-builder__people">
        {available.map((player) => (
          <li key={player.id}>
            <button
              type="button"
              className={`group-builder__person ${selected.includes(player.id) ? 'is-selected' : ''}`}
              aria-pressed={selected.includes(player.id)}
              onClick={() => toggle(player.id)}
            >
              <Avatar player={player} size="md" />
              <span>{player.name}</span>
            </button>
          </li>
        ))}
      </ul>

      {available.length > 0 && (
        <button type="button" className="button button--block" disabled={!canCreate} onClick={createGroup}>
          {canCreate ? copy.createGroup(selected.length) : copy.pickPeople}
        </button>
      )}

      <section>
        <h2 className="label group-builder__title">
          {copy.groups} <span className="muted">{groups.length}</span>
        </h2>
        {groups.length === 0 ? (
          <p className="muted small">{copy.noGroups}</p>
        ) : (
          <ul className="group-builder__groups">
            {groups.map((group, index) => {
              const members = membersOf(group)
              const name = groupName(members.map((member) => member.name))
              return (
                <li key={group.join()} className="group-builder__group">
                  <AvatarStack players={members} size="sm" />
                  <span className="group-builder__group-name">{name}</span>
                  <button
                    type="button"
                    className="group-builder__remove"
                    aria-label={copy.removeGroup(name)}
                    onClick={() => setGroups((current) => current.filter((_, position) => position !== index))}
                  >
                    <CloseIcon width={16} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="dock">
        {saving.error && <p className="error center">{saving.error}</p>}
        {groups.length < 2 && <p className="muted center small">{copy.needsGroups}</p>}
        <button
          type="button"
          className="button button--primary button--block"
          disabled={groups.length < 2 || saving.pending}
          onClick={reveal}
        >
          {copy.reveal}
        </button>
      </div>
    </div>
  )
}
