import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function Register(){
  const auth = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username may only contain letters, numbers, and underscores.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        full_name: fullName,
        username,
        email,
        password,
        password_confirmation: passwordConfirmation
      }
      const res = await auth.register(payload)
      navigate('/login', {
        replace: true,
        state: {
          message: res?.message || 'Registration successful. Please check your email to verify your account before signing in.'
        }
      })
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || err.message || 'Registration failed')
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
        <h1 className="text-2xl font-semibold mb-6">Create an account</h1>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input value={fullName} onChange={e=>setFullName(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm password</label>
            <input type="password" value={passwordConfirmation} onChange={e=>setPasswordConfirmation(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60">
              {loading ? <Spinner/> : 'Create account'}
            </button>
          </div>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <button
            type="button"
            onClick={handleGuest}
            disabled={loading}
            className="text-left text-blue-600 hover:underline disabled:opacity-60"
          >
            Continue as Guest
          </button>
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
