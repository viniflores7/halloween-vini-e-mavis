import { initializeApp, type FirebaseApp } from 'firebase/app'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId)
export const isDemoMode = !isFirebaseConfigured

let app: FirebaseApp | undefined

export function firebaseApp() {
  app ??= initializeApp(config)
  return app
}
