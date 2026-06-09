import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'
import Spinner from '../components/Spinner'
import logoUrl from '../../logo.jpg'

export default function Register(){
  const auth = useAuth()
  const { t } = useI18n()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username may only contain letters, numbers, and underscores.')
      return
    }
    if (!termsAccepted) {
      setError('You must accept the terms and conditions.')
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
      navigate('/home')
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-primary)] font-sans relative">
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

      {/* Left Side: Graphic / Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2E] overflow-hidden items-center justify-center border-r border-[var(--border-color)]">
        <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-full max-w-[800px] h-[500px] bg-gradient-to-tr from-[#00D4AA]/20 to-indigo-500/20 blur-3xl rounded-full opacity-60 pointer-events-none"></div>
        <div className="relative z-10 px-12 text-center max-w-xl">
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">{t('register.heroTitle')}</h2>
          <p className="text-lg text-indigo-200/80 font-medium leading-relaxed">
            {t('register.heroSubtitle')}
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <Link to="/" className="flex items-center gap-3 mb-10 w-fit">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm border border-[var(--border-color)]">
              <img src={logoUrl} alt="CoFound Logo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
            </div>
            <span className="font-black text-2xl tracking-tight text-[var(--text-primary)]">CoFound</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-[var(--text-secondary)] font-medium mb-8">Let's get you set up to discover projects and connections.</p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Full Name</label>
                 <input value={fullName} onChange={e=>setFullName(e.target.value)} required placeholder="John Doe" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-hint)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium" />
               </div>
               <div>
                 <label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Username</label>
                 <input value={username} onChange={e=>setUsername(e.target.value)} required placeholder="john_doe" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-hint)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium" />
               </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@company.com" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-hint)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Password</label>
                 <div className="relative">
                   <input type={showPassword ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-hint)] rounded-xl px-4 py-3 pr-12 rtl:pr-4 rtl:pl-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium" />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-4 text-[var(--text-hint)] hover:text-indigo-500 transition-colors focus:outline-none"
                     aria-label={showPassword ? "Hide password" : "Show password"}
                   >
                     {showPassword ? (
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>
                     ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                     )}
                   </button>
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Confirm Password</label>
                 <div className="relative">
                   <input type={showConfirmPassword ? "text" : "password"} value={passwordConfirmation} onChange={e=>setPasswordConfirmation(e.target.value)} required placeholder="••••••••" className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-hint)] rounded-xl px-4 py-3 pr-12 rtl:pr-4 rtl:pl-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium" />
                   <button
                     type="button"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-4 text-[var(--text-hint)] hover:text-indigo-500 transition-colors focus:outline-none"
                     aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                   >
                     {showConfirmPassword ? (
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>
                     ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                     )}
                   </button>
                 </div>
               </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 w-4 h-4 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500 bg-[var(--bg-input)] cursor-pointer shrink-0" />
                <span className="text-sm font-medium text-[var(--text-secondary)] leading-tight">
                  I agree to the CoFound <a href="#" className="text-indigo-500 hover:text-indigo-400 font-bold transition-colors">Terms of Service</a> and <a href="#" className="text-indigo-500 hover:text-indigo-400 font-bold transition-colors">Privacy Policy</a>.
                </span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 py-3 rounded-xl font-bold text-base shadow-lg shadow-indigo-500/25 disabled:opacity-60 flex items-center justify-center mt-6 transition-all">
              {loading ? <Spinner/> : 'Create account'}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center justify-center text-sm font-medium pt-6 border-t border-[var(--border-color)] gap-4">
             <div className="text-[var(--text-secondary)]">
                Already have an account? <Link to="/login" className="text-indigo-500 hover:text-indigo-400 font-bold ml-1 transition-colors">Sign in</Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
