import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function EmailVerify() {
  const { token } = useParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError('Verification token is required.')
        return
      }

      try {
        const res = await auth.emailVerify(token)
        navigate('/login', {
          replace: true,
          state: {
            message: res?.message || 'Email verified successfully. You can now sign in.'
          }
        })
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Email verification failed.')
      }
    }

    verify()
  }, [auth, navigate, token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-hover)]">
      <div className="w-full max-w-md bg-[var(--bg-surface)] p-8 rounded shadow text-center">
        <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>
        {error ? (
          <>
            <div className="mb-4 text-sm text-red-600">{error}</div>
            <Link to="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-[var(--text-secondary)]">
            <Spinner />
            <p className="text-sm">Verifying your email...</p>
          </div>
        )}
      </div>
    </div>
  )
}
