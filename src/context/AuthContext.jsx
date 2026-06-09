import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import Cookies from 'js-cookie'
import api from '../services/api'
import {
  authLogin,
  authRegister,
  authGuest,
  authEmailVerify,
  authPasswordForgot,
  authPasswordReset,
  resendVerificationEmail,
  getAccessToken,
  getAuthUser,
} from '../services/auth'
import { trackUserPresence } from '../services/realtimeChat'

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizeUser = (value) => {
  const user = value?.user || value
  if (!user) return null
  const id = user.id || user.user_id || user.data?.id
  return { ...user, id }
}

/**
 * Derive which onboarding stage the user is currently in.
 *
 * Stage map:
 *   'unauthenticated' → no session at all
 *   'unverified'      → logged in but email not yet confirmed
 *   'guest'           → email verified but role is still "guest"
 *   'verified'        → role is "regular_user" (or admin — full access)
 */
export function getAuthStage(user) {
  if (!user) return 'unauthenticated'
  // Backend may return email_verified_at (Laravel) or email_verified (bool)
  const emailVerified =
    !!(user.email_verified_at || user.email_verified === true || user.email_verified === 1)
  if (!emailVerified) return 'unverified'
  if (user.role === 'guest') return 'guest'
  return 'verified'
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Derived stage — never wipes the token, just recomputes on user change
  const authStage = useMemo(() => getAuthStage(user), [user])

  // ── fetchMe: hydrate user from the backend ─────────────────────────────────
  const fetchMe = async () => {
    const token = Cookies.get('cf_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      // Try /auth/me first (returns role + email_verified_at fields); fall back to /profile
      let res
      try {
        res = await api.get('/auth/me')
      } catch {
        res = await api.get('/profile')
      }
      const u =
        res?.data?.data?.user ||
        res?.data?.data ||
        res?.data?.user ||
        res?.data
      setUser(normalizeUser(u))
    } catch (err) {
      Cookies.remove('cf_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track realtime presence only for fully verified users
  useEffect(() => {
    if (!user?.id || authStage !== 'verified') return undefined
    return trackUserPresence(user.id)
  }, [user?.id, authStage])

  // ── Auth actions ───────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await authLogin(email, password)
    const token = getAccessToken(res)
    const userObj = getAuthUser(res)
    if (!token) throw new Error('No token returned from API')
    Cookies.set('cf_token', token, { secure: true, sameSite: 'lax' })
    setUser(normalizeUser(userObj))
    return res
  }

  const register = async (payload) => {
    const res = await authRegister(payload)
    const token = getAccessToken(res)
    const userObj = getAuthUser(res)
    if (token) Cookies.set('cf_token', token, { secure: true, sameSite: 'lax' })
    setUser(normalizeUser(userObj))
    return res
  }

  const guest = async () => {
    const res = await authGuest()
    const token = getAccessToken(res)
    const userObj = getAuthUser(res)
    if (!token) throw new Error('No token returned from API')
    Cookies.set('cf_token', token, { secure: true, sameSite: 'lax' })
    setUser(normalizeUser(userObj))
    return res
  }

  const passwordForgot = async (email) => {
    const res = await authPasswordForgot(email)
    return res
  }

  const emailVerify = async (token) => {
    const res = await authEmailVerify(token)
    return res
  }

  const passwordReset = async (token, password, password_confirmation) => {
    const res = await authPasswordReset(token, password, password_confirmation)
    return res
  }

  /**
   * Resend the verification email.
   * Requires an active session token (the user is logged in but unverified).
   */
  const resendVerification = async () => {
    const res = await resendVerificationEmail()
    return res
  }

  const logout = () => {
    Cookies.remove('cf_token')
    setUser(null)
    try { window.location.href = '/login' } catch (e) {}
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authStage,
        login,
        register,
        logout,
        fetchMe,
        guest,
        emailVerify,
        passwordForgot,
        passwordReset,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
