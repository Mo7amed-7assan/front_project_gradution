import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Spinner from '../components/Spinner'
import logoUrl from '../../logo.jpg'

export default function ForgotPassword() {
  const auth = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      await auth.passwordForgot(email)
      setMessage('If an account exists with that email, a reset link has been sent.')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] text-[var(--text-primary)] font-sans px-4 relative overflow-hidden">
      {/* Theme Switcher */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-6 right-6 rtl:left-6 rtl:right-auto z-50 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      {/* Background Abstract */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[600px] bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-3xl rounded-full opacity-70 pointer-events-none"></div>

      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color)] p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
           <Link to="/" className="flex items-center gap-2 mb-6">
             <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-[var(--border-color)] shrink-0">
               <img src={logoUrl} alt="CoFound Logo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
             </div>
             <span className="font-black text-2xl tracking-tight text-[var(--text-primary)]">CoFound</span>
           </Link>
           
           <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
           <p className="text-[var(--text-secondary)] font-medium text-sm">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {message && (
           <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium flex items-center gap-2 text-center">
             <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
             {message}
           </div>
        )}
        
        {error && (
           <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium flex items-center gap-2">
             <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {error}
           </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-hint)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 py-3 rounded-xl font-bold text-base shadow-lg shadow-indigo-500/25 disabled:opacity-60 flex items-center justify-center transition-all"
          >
            {loading ? <Spinner /> : 'Send reset link'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium pt-6 border-t border-[var(--border-color)]">
          <Link to="/login" className="flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
