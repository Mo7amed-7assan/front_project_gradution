import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'
import Cookies from 'js-cookie'

const RESEND_COOLDOWN = 60

// ─── Shared decorative pieces ──────────────────────────────────────────────
function GridBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="veg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#veg-grid)" className="text-[var(--border)] opacity-30" />
    </svg>
  )
}
function GlowOrbs() {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #6C63FF 0%, transparent 70%)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]" style={{ background: 'radial-gradient(circle, #00D4AA 0%, transparent 70%)' }} />
    </>
  )
}
function TopBar({ isDark, toggleTheme }) {
  return (
    <header className="absolute top-0 inset-x-0 flex items-center justify-between px-6 py-4 z-10">
      <div className="flex items-center gap-2 select-none">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #00D4AA 100%)' }}>CF</div>
        <span className="font-bold text-[var(--text-primary)] tracking-tight">CoFound</span>
      </div>
      <button id="veg-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme"
        className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#6C63FF] transition-all duration-200 cursor-pointer">
        {isDark
          ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
          : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        }
      </button>
    </header>
  )
}

// ─── TOKEN MODE: auto-verify the ?token= on mount ──────────────────────────
function TokenVerifier({ token }) {
  const { emailVerify, fetchMe } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { isRTL } = useI18n()
  const navigate = useNavigate()

  // state: 'verifying' | 'success' | 'error'
  const [phase, setPhase]   = useState('verifying')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const res = await emailVerify(token)
        if (cancelled) return
        // Some backends return a new token after verification
        const newToken = res?.data?.access_token || res?.access_token
        if (newToken) Cookies.set('cf_token', newToken, { secure: true, sameSite: 'lax' })
        // Refresh user state — authStage will now be 'guest'
        await fetchMe()
        if (cancelled) return
        setPhase('success')
        // Small delay so user sees the success state, then navigate
        setTimeout(() => { if (!cancelled) navigate('/verify-identity', { replace: true }) }, 1800)
      } catch (err) {
        if (cancelled) return
        setErrMsg(err?.response?.data?.message || 'Verification failed. The link may have expired.')
        setPhase('error')
      }
    }
    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const card = isDark
    ? 'linear-gradient(145deg, rgba(30,30,53,0.97) 0%, rgba(26,26,46,0.97) 100%)'
    : 'rgba(255,255,255,0.98)'

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-300" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
      <GridBackground /><GlowOrbs />
      <TopBar isDark={isDark} toggleTheme={toggleTheme} />
      <main className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl p-10 text-center" style={{ backdropFilter: 'blur(20px)', background: card }}>
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #6C63FF, #00D4AA)' }} />

          {phase === 'verifying' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-[#6C63FF]/20 border-t-[#6C63FF] animate-spin" />
              </div>
              <h1 className="text-xl font-bold mb-2">Verifying your email…</h1>
              <p className="text-sm text-[var(--text-secondary)]">Please wait a moment.</p>
            </>
          )}

          {phase === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(34,197,94,0.15))' }}>
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
              </div>
              <h1 className="text-xl font-bold mb-2 text-emerald-400">Email Verified!</h1>
              <p className="text-sm text-[var(--text-secondary)]">Redirecting you to the next step…</p>
            </>
          )}

          {phase === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </div>
              </div>
              <h1 className="text-xl font-bold mb-2 text-red-400">Verification Failed</h1>
              <p className="text-sm text-[var(--text-secondary)] mb-6">{errMsg}</p>
              <a href="/login" className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)' }}>
                Back to Sign In
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// ─── GATE MODE: "check your inbox" UI for unverified logged-in users ────────
function EmailCheckGate() {
  const { user, logout, resendVerification, authStage, loading } = useAuth()
  const { t, isRTL } = useI18n()
  const { isDark, toggleTheme } = useTheme()

  const [cooldown, setCooldown]         = useState(0)
  const [resendStatus, setResendStatus] = useState(null)
  const [resendMsg, setResendMsg]       = useState('')
  const [sending, setSending]           = useState(false)

  // Redirect if not in the right stage
  if (!loading && authStage === 'unauthenticated') return <Navigate to="/login" replace />
  if (!loading && authStage === 'guest')           return <Navigate to="/verify-identity" replace />
  if (!loading && authStage === 'verified')        return <Navigate to="/home" replace />

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || sending) return
    setSending(true); setResendStatus(null); setResendMsg('')
    try {
      await resendVerification()
      setResendStatus('success')
      setResendMsg(t('verifyEmail.resendSuccess'))
      setCooldown(RESEND_COOLDOWN)
    } catch (err) {
      setResendStatus('error')
      setResendMsg(err?.response?.data?.message || t('verifyEmail.resendError'))
    } finally { setSending(false) }
  }, [cooldown, sending, resendVerification, t])

  const card = isDark
    ? 'linear-gradient(145deg, rgba(30,30,53,0.95) 0%, rgba(26,26,46,0.95) 100%)'
    : 'rgba(255,255,255,0.97)'

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-300" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GridBackground /><GlowOrbs />
      <TopBar isDark={isDark} toggleTheme={toggleTheme} />

      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl p-8 sm:p-10" style={{ backdropFilter: 'blur(20px)', background: card }}>
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #6C63FF, #00D4AA)' }} />

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(0,212,170,0.15) 100%)' }}>
              <span aria-hidden="true" className="absolute inset-0 rounded-2xl animate-ping opacity-20" style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4AA)' }} />
              <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                <defs><linearGradient id="eml-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#6C63FF"/><stop offset="1" stopColor="#00D4AA"/></linearGradient></defs>
                <path d="M10 16a2 2 0 0 1 2-2h24a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V16z" stroke="url(#eml-g)" strokeWidth="2" fill="none"/>
                <path d="M10 16l14 10 14-10" stroke="url(#eml-g)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Stage badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(108,99,255,0.12)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] animate-pulse" />
              {isRTL ? 'الخطوة ١ من ٣ — التحقق من البريد' : 'Step 1 of 3 — Email Verification'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">{t('verifyEmail.title')}</h1>
          <p className="text-center text-[var(--text-secondary)] text-sm mb-1">{t('verifyEmail.subtitle')}</p>

          {/* Email pill */}
          <div className="flex justify-center mt-3 mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium" style={{ borderColor: isDark ? '#2D2D4E' : '#E8EAED', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(108,99,255,0.04)' }}>
              <svg className="w-3.5 h-3.5 shrink-0 text-[#6C63FF]" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
              <span className="truncate max-w-[220px]">{user?.email || '—'}</span>
            </div>
          </div>

          <p className="text-center text-[var(--text-secondary)] text-sm leading-relaxed mb-6 px-2">{t('verifyEmail.instruction')}</p>

          {/* Status */}
          {resendStatus && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm text-center font-medium ${resendStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {resendMsg}
            </div>
          )}

          {/* Resend button */}
          <button id="veg-resend-btn" onClick={handleResend} disabled={cooldown > 0 || sending}
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
            style={{ background: cooldown > 0 ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)') : 'linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)', color: cooldown > 0 ? 'var(--text-secondary)' : '#fff', boxShadow: cooldown > 0 ? 'none' : '0 4px 20px rgba(108,99,255,0.35)' }}>
            {cooldown === 0 && !sending && <span aria-hidden="true" className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />}
            <span className="relative flex items-center justify-center gap-2">
              {sending && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
              {cooldown > 0 ? t('verifyEmail.resendCooldown', cooldown) : t('verifyEmail.resendBtn')}
            </span>
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-secondary)]">{t('verifyEmail.noEmail')}</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <button id="veg-logout-btn" onClick={logout}
            className="w-full py-2.5 px-6 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#6C63FF] transition-all duration-200 cursor-pointer">
            {t('verifyEmail.logoutBtn')}
          </button>
        </div>
        <p className="text-center text-xs text-[var(--text-secondary)] mt-5 opacity-70">
          {isRTL ? 'تأكد من فحص مجلد الرسائل المزعجة وأحيانًا يتأخر الوصول بضع دقائق.' : 'Emails may take a few minutes. Check your spam folder if needed.'}
        </p>
      </main>
    </div>
  )
}

// ─── Root export: decides mode based on ?token= presence ──────────────────
export default function VerifyEmailGate() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  // Token present → auto-verify mode; otherwise → gate/check-inbox mode
  return token ? <TokenVerifier token={token} /> : <EmailCheckGate />
}
