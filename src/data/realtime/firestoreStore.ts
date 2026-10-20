import { getAuth, signInAnonymously } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  initializeFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore'
import { firebaseApp } from '@/data/firebase'
import { DocNotFoundError, type LiveSnapshot, type LiveStore, type Player } from './types'

interface FirebaseSession {
  db: Firestore
  playerId(): Promise<string>
  now(): number
}

let session: FirebaseSession | undefined

function firebaseSession(): FirebaseSession {
  if (session) return session
  const app = firebaseApp()
  const auth = getAuth(app)
  const db = initializeFirestore(app, { ignoreUndefinedProperties: true })
  let clockOffsetMs = 0
  let signedIn: Promise<string> | undefined

  // Os celulares podem estar com o relógio alguns segundos diferente; o horário do servidor alinha o timer de todos
  async function syncClock(uid: string) {
    const ref = doc(db, 'clocks', uid)
    const sentAt = Date.now()
    await setDoc(ref, { at: serverTimestamp() })
    const acknowledgedAt = Date.now()
    const serverAt = (await getDocFromServer(ref)).get('at')?.toMillis()
    if (serverAt) clockOffsetMs = serverAt - (sentAt + acknowledgedAt) / 2
  }

  async function signIn() {
    await auth.authStateReady()
    const uid = auth.currentUser?.uid ?? (await signInAnonymously(auth)).user.uid
    syncClock(uid).catch(() => undefined)
    return uid
  }

  session = {
    db,
    playerId: () =>
      (signedIn ??= signIn().catch((error) => {
        signedIn = undefined
        throw error
      })),
    now: () => Date.now() + clockOffsetMs,
  }
  return session
}

export function createFirestoreStore<T extends { code: string }>(collectionName: string): LiveStore<T> {
  const { db, playerId, now } = firebaseSession()
  const docRef = (code: string) => doc(db, collectionName, code)
  const playersRef = (code: string) => collection(db, collectionName, code, 'players')

  return {
    playerId,
    now,

    async create(created) {
      await playerId()
      return runTransaction(db, async (transaction) => {
        if ((await transaction.get(docRef(created.code))).exists()) return false
        transaction.set(docRef(created.code), created)
        return true
      })
    },

    async change(code, change) {
      await playerId()
      await runTransaction(
        db,
        async (transaction) => {
          const snapshot = await transaction.get(docRef(code))
          if (!snapshot.exists()) throw new DocNotFoundError(code)
          const next = change(snapshot.data() as T)
          if (next) transaction.set(docRef(code), next)
        },
        { maxAttempts: 15 },
      )
    },

    async exists(code) {
      await playerId()
      return (await getDoc(docRef(code))).exists()
    },

    async savePlayer(code, { id, ...player }) {
      await playerId()
      await setDoc(doc(playersRef(code), id), player)
    },

    async removePlayer(code, id) {
      await playerId()
      await deleteDoc(doc(playersRef(code), id))
    },

    watch(code, onChange, onError) {
      const snapshot: Partial<LiveSnapshot<T>> = {}
      const unsubscribers: (() => void)[] = []
      let stopped = false
      const emit = () => snapshot.doc !== undefined && snapshot.players && onChange(snapshot as LiveSnapshot<T>)

      playerId()
        .then(() => {
          if (stopped) return
          unsubscribers.push(
            onSnapshot(
              docRef(code),
              (live) => {
                snapshot.doc = live.exists() ? (live.data() as T) : null
                emit()
              },
              onError,
            ),
            onSnapshot(
              playersRef(code),
              (players) => {
                snapshot.players = players.docs.map((player) => ({ ...player.data(), id: player.id }) as Player)
                emit()
              },
              onError,
            ),
          )
        })
        .catch(onError)

      return () => {
        stopped = true
        unsubscribers.forEach((unsubscribe) => unsubscribe())
      }
    },
  }
}
