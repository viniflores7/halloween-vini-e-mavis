import { lazyRepository } from '../lazyRepository'
import { createContestRepository } from './contestRepository'
import type { Contest, ContestRepository } from './types'

export const getContestRepository = lazyRepository<ContestRepository>(
  () =>
    import('../realtime/firestoreStore').then((m) =>
      createContestRepository(m.createFirestoreStore<Contest>('contests')),
    ),
  () => import('../realtime/demoStore').then((m) => createContestRepository(m.createDemoStore<Contest>('contests'))),
)

export * from './contestRules'
export * from './ranking'
export * from './timing'
export { ContestRuleError } from './types'
export type * from './types'
