import { isFirebaseConfigured } from './firebase'

// Carrega o SDK do Firebase só quando ele está configurado; senão usa o modo demonstração
export function lazyRepository<T>(loadFirestore: () => Promise<T>, loadDemo: () => Promise<T>) {
  let repository: Promise<T> | undefined
  return () => (repository ??= isFirebaseConfigured ? loadFirestore() : loadDemo())
}
