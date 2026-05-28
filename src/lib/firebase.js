// Inicialización de Firebase + Firestore + Google Auth.
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// =========================================================================
//  MAPEO EMAIL → IDENTIDAD
//  Cada cuenta Google se asocia automáticamente a una identidad del calendario.
//  Cualquier email que no esté aquí NO podrá entrar.
// =========================================================================
export const EMAIL_TO_USER = {
  'alejandrobeamud@gmail.com': 'alex',
  'elrincondedalia@gmail.com': 'dalia',
}

// Derivado automáticamente: lista de emails permitidos.
export const ALLOWED_EMAILS = Object.keys(EMAIL_TO_USER)

// Devuelve el userId ('alex' | 'dalia') a partir del email, o null si no autorizado.
export function userIdFromEmail(email) {
  if (!email) return null
  return EMAIL_TO_USER[email.toLowerCase()] || null
}
