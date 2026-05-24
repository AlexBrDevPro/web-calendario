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
//  LISTA DE EMAILS AUTORIZADOS
//  Solo estos correos podrán entrar al calendario. Cualquier otro intento
//  cerrará la sesión automáticamente.
//
//  IMPORTANTE: cuando sepas el email de Dalia, añádelo aquí
//  Y TAMBIÉN en las reglas de seguridad de Firestore en la consola Firebase.
// =========================================================================
export const ALLOWED_EMAILS = [
  'alejandrobeamud@gmail.com',
  // 'email-de-dalia@gmail.com', ← AÑADIR aquí
]
