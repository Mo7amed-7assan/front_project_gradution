import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const FAQ_ITEMS = [
  {
    q: 'How do I verify my email address?',
    a: 'After registering, check your inbox for a verification email from Co-Found. Click the link inside. If you don\'t see it, check your spam folder or request a new one from the verify email page.',
  },
  {
    q: 'I didn\'t receive my password reset email.',
    a: 'Check your spam or junk folder first. If it\'s not there, make sure you entered the correct email address and try again. Reset links expire after 60 minutes.',
  },
  {
    q: 'How do I accept a connection request or invitation?',
    a: 'Open the Connections page or Invitations page from the navigation. All pending requests appear there — you can accept or decline from the list.',
  },
  {
    q: 'How do I apply to a project?',
    a: 'Browse projects at /projects, open the project you\'re interested in, and click the Apply button on the project details page.',
  },
  {
    q: 'Can I delete my account?',
    a: 'Yes. Go to your Profile settings and scroll to the bottom. You\'ll find an option to permanently delete your account and all associated data.',
  },
  {
    q: 'How does identity verification work?',
    a: 'After verifying your email you\'ll be prompted to complete identity verification. Upload a valid ID document and a selfie. Our team reviews submissions within 24–48 hours.',
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#2D2D4E] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-white hover:text-[#6C63FF] transition-colors"
      >
        <span>{q}</span>
        <svg
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="pb-4 text-sm text-slate-400 leading-relaxed pr-8">{a}</p>
      )}
    </div>
  )
}

export default function Support() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus]   = useState(null) // 'sending' | 'sent' | 'error'
  const [errMsg, setErrMsg]   = useState('')

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setErrMsg('')
    try {
      // POST to the backend support endpoint
      const res = await fetch('/api/v1/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      // If backend endpoint doesn't exist yet, fall back gracefully
      // by opening the user's mail client
      setStatus('error')
      setErrMsg('Our contact form is temporarily unavailable. Please email us directly at support@cofound.dpdns.org')
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B2E] text-white">

      {/* Top bar */}
      <header className="h-14 bg-[#1E1E35] border-b border-[#2D2D4E] flex items-center px-6 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.jpg" alt="Co-Found" className="w-7 h-7 rounded-lg object-cover border border-[#2D2D4E]" />
          <span className="font-bold text-white tracking-tight">Co-Found</span>
        </Link>
        <span className="text-[#2D2D4E]">|</span>
        <span className="text-sm text-slate-400">Support</span>
        <Link to="/" className="ml-auto text-sm text-[#6C63FF] hover:text-[#4F46E5] transition-colors">
          ← Back
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00D4AA] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
            Help Centre
          </div>
          <h1 className="text-3xl font-extrabold mb-3 tracking-tight">How can we help?</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Find answers to common questions below, or send us a message and
            we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

          {/* FAQ */}
          <div>
            <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#6C63FF] to-[#00D4AA]" />
              Frequently asked questions
            </h2>
            <div className="bg-[#1A1A3E] border border-[#2D2D4E] rounded-2xl px-6 py-2">
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>

            {/* Direct contact links */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="mailto:support@cofound.dpdns.org"
                className="flex items-center gap-3 bg-[#1A1A3E] border border-[#2D2D4E] rounded-xl p-4 hover:border-[#6C63FF]/50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                  style={{ background: 'rgba(108,99,255,.12)', border: '1px solid rgba(108,99,255,.2)' }}>
                  ✉️
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-[#6C63FF] transition-colors">Email support</p>
                  <p className="text-[11px] text-slate-500">support@cofound.dpdns.org</p>
                </div>
              </a>
              <a
                href="mailto:abuse@cofound.dpdns.org"
                className="flex items-center gap-3 bg-[#1A1A3E] border border-[#2D2D4E] rounded-xl p-4 hover:border-[#EF4444]/50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                  style={{ background: 'rgba(239,68,68,.10)', border: '1px solid rgba(239,68,68,.2)' }}>
                  🚨
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-[#EF4444] transition-colors">Report abuse</p>
                  <p className="text-[11px] text-slate-500">abuse@cofound.dpdns.org</p>
                </div>
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#6C63FF] to-[#00D4AA]" />
              Send us a message
            </h2>
            <div className="bg-[#1A1A3E] border border-[#2D2D4E] rounded-2xl p-6">

              {status === 'sent' ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'linear-gradient(135deg, rgba(0,212,170,.15), rgba(34,197,94,.15))' }}>
                    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-bold text-white mb-1">Message sent!</p>
                  <p className="text-sm text-slate-400">We'll get back to you within 24 hours.</p>
                  <button
                    onClick={() => setStatus(null)}
                    className="mt-4 text-xs text-[#6C63FF] hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  {status === 'error' && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                      {errMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Your name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Alex Johnson"
                      className="w-full bg-[#12122A] border border-[#2D2D4E] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#6C63FF] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="alex@example.com"
                      className="w-full bg-[#12122A] border border-[#2D2D4E] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#6C63FF] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <select
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full bg-[#12122A] border border-[#2D2D4E] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6C63FF] transition-colors appearance-none"
                    >
                      <option value="" disabled>Select a topic…</option>
                      <option value="account">Account issue</option>
                      <option value="verification">Email or identity verification</option>
                      <option value="project">Project or application</option>
                      <option value="connection">Connection or invitation</option>
                      <option value="billing">Billing</option>
                      <option value="abuse">Report abuse or spam</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your issue in as much detail as possible…"
                      className="w-full bg-[#12122A] border border-[#2D2D4E] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#6C63FF] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full py-3 px-6 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #6C63FF, #4F46E5)',
                      boxShadow: '0 4px 16px rgba(108,99,255,.30)',
                    }}
                  >
                    {status === 'sending' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending…
                      </span>
                    ) : 'Send message'}
                  </button>

                </form>
              )}
            </div>
          </div>

        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-500">
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
        </div>

      </div>
    </div>
  )
}
