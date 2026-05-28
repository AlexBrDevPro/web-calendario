import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider, ALLOWED_EMAILS, userIdFromEmail } from '../lib/firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userId, setUserId] = useState(null)   // 'alex' | 'dalia' | null
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const email = (u.email || '').toLowerCase()
        const allowed = ALLOWED_EMAILS.map((e) => e.toLowerCase())
        if (!allowed.includes(email)) {
          await signOut(auth)
          setUser(null)
          setUserId(null)
          setError('Tu cuenta (' + u.email + ') no tiene acceso a este calendario.')
        } else {
          setUser(u)
          setUserId(userIdFromEmail(email))
          setError(null)
        }
      } else {
        setUser(null)
        setUserId(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function login() {
    try {
      setError(null)
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      if (e && e.code === 'auth/popup-closed-by-user') return
      setError(e.message || 'Error al iniciar sesión')
    }
  }
  async function logout() {
    try { await signOut(auth) } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, userId, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
