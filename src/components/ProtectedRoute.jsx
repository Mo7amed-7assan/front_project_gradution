import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

/**
 * ProtectedRoute — multi-stage authentication guard.
 *
 * Stage gating rules:
 *   unauthenticated → /login
 *   unverified      → /verify-email  (email not confirmed)
 *   guest           → /verify-identity  (role still "guest")
 *   verified        → render children  (full access)
 *
 * The two stage-gate pages (/verify-email, /verify-identity) are
 * EXCLUDED from redirect loops via the `bypassStages` prop so their
 * own StageRoute wrapper handles the guard instead.
 */
export default function ProtectedRoute({ children }) {
  const { authStage, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <Spinner />
      </div>
    )
  }

  if (authStage === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: pathname }} />
  }

  if (authStage === 'unverified') {
    return <Navigate to="/verify-email" replace />
  }

  // Guest users can access /home only — all other protected routes redirect to /home
  if (authStage === 'guest' && pathname !== '/home' && pathname !== '/') {
    return <Navigate to="/home" replace />
  }
  // Guest on /home → allowed through

  // authStage === 'verified' — full access granted
  return children
}

/**
 * StageRoute — guards a page that should ONLY be visible during a specific
 * onboarding stage.  Prevents verified users from revisiting gate pages,
 * and unauthenticated users from accessing them at all.
 *
 * Usage:
 *   <StageRoute forStage="unverified"><VerifyEmailGate /></StageRoute>
 *   <StageRoute forStage="guest"><IdentityVerification /></StageRoute>
 */
export function StageRoute({ forStage, children }) {
  const { authStage, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
        <Spinner />
      </div>
    )
  }

  // Not logged in at all → go to login
  if (authStage === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  // Already past this stage → redirect to the correct destination
  if (authStage !== forStage) {
    if (authStage === 'unverified') return <Navigate to="/verify-email" replace />
    if (authStage === 'guest') return <Navigate to="/home" replace />
    return <Navigate to="/home" replace /> // verified users go home
  }

  return children
}
