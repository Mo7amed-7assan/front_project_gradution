import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

/**
 * Route guard with three tiers:
 *
 *   1. Unauthenticated  → /login
 *   2. role=guest       → /verification  (backend returns 403 GUEST_ACCESS_RESTRICTED
 *                          on protected endpoints; redirect before that happens)
 *   3. Authenticated    → render children
 *
 * Pages that guests may visit (e.g. /verification itself) must NOT be wrapped
 * in <ProtectedRoute> — or pass allowGuest={true}.
 */
export default function ProtectedRoute({ children, allowGuest = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const isGuest = user.role === 'guest'

  if (isGuest && !allowGuest) {
    // Guest landed on a protected page — send them to verify identity
    return <Navigate to="/verification" replace />
  }

  return children
}
