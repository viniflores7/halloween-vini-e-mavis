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
} from 'firebase/firestore'
import { firebaseApp } from '@/data/firebase'
import { RoomNotFoundError, type Player, type Room, type RoomSnapshot, type RoomStore } from './types'

export function createFirestoreRoomStore(): RoomStore {
  const app = firebaseApp()
  const auth = getAuth(app)
  const db = initializeFirestore(app, { ignoreUndefinedProperties: true })
  const roomRef = (code: string) => doc(db, 'rooms', code)
  const playersRef = (code: string) => collection(db, 'rooms', code, 'players')
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

  const playerId = () =>
    (signedIn ??= signIn().catch((error) => {
      signedIn = undefined
      throw error
    }))

  return {
    playerId,

    now: () => Date.now() + clockOffsetMs,

    async createRoom(room) {
      await playerId()
      return runTransaction(db, async (transaction) => {
        if ((await transaction.get(roomRef(room.code))).exists()) return false
        transaction.set(roomRef(room.code), room)
        return true
      })
    },

    async changeRoom(code, change) {
      await playerId()
      await runTransaction(
        db,
        async (transaction) => {
          const snapshot = await transaction.get(roomRef(code))
          if (!snapshot.exists()) throw new RoomNotFoundError(code)
          const next = change(snapshot.data() as Room)
          if (next) transaction.set(roomRef(code), next)
        },
        { maxAttempts: 15 },
      )
    },

    async roomExists(code) {
      await playerId()
      return (await getDoc(roomRef(code))).exists()
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
      const snapshot: Partial<RoomSnapshot> = {}
      const unsubscribers: (() => void)[] = []
      let stopped = false
      const emit = () => snapshot.room !== undefined && snapshot.players && onChange(snapshot as RoomSnapshot)

      playerId()
        .then(() => {
          if (stopped) return
          unsubscribers.push(
            onSnapshot(
              roomRef(code),
              (room) => {
                snapshot.room = room.exists() ? (room.data() as Room) : null
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
