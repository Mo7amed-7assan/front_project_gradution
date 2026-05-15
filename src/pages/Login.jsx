import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const auth = useAuth()

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await auth.login(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      const status = err?.response?.status
      const message = err?.response?.data?.message || err?.message || 'Login failed'
      if (status === 423) {
        const lockedUntil = err?.response?.data?.locked_until
        setError(`${message}${lockedUntil ? ` Locked until ${lockedUntil}.` : ''}`)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    setError(null)
    setLoading(true)
    try {
      await auth.guest()
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || err?.message || 'Guest login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-6">Sign in to Co-Found</h1>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Password"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <button
            type="button"
            onClick={handleGuest}
            className="text-left text-blue-600 hover:underline"
          >
            Continue as Guest
          </button>
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  )
}
