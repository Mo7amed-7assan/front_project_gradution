import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function ResetPassword() {
  const auth = useAuth()
  const navigate = useNavigate()
  const { token: tokenParamFromPath } = useParams()
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const tokenParam = tokenParamFromPath || searchParams.get('token') || ''
    setToken(tokenParam)
  }, [searchParams, tokenParamFromPath])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!token) {
      setError('Reset token is required.')
      return
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and a number.')
      return
    }
    if (password !== passwordConfirmation) {
      setError('Password confirmation does not match.')
      return
    }
    setLoading(true)
    try {
      await auth.passwordReset(token, password, passwordConfirmation)
      setMessage('Password reset successfully. You can now sign in.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-6">Reset Password</h1>
        {message && <div className="mb-4 text-sm text-green-600">{message}</div>}
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Reset Token</label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Enter reset token"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="New password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Confirm new password"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? <Spinner /> : 'Reset password'}
            </button>
          </div>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          Remembered your password? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
