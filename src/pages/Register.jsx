import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function Register(){
  const auth = useAuth()
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
      await auth.register(payload)
      window.location.href = '/dashboard'
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || err.message || 'Registration failed')
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
      </div>
    </div>
  )
}
