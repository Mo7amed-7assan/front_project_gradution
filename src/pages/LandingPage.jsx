import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useI18n } from '../context/I18nContext'
import { useAuth } from '../context/AuthContext'
import logoUrl from '../../logo.jpg'

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const { locale, setLocale, t } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true })
    }
  }, [user, navigate])

  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans transition-colors duration-300 scroll-smooth">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-[var(--bg-surface)]/80 backdrop-blur-md border-b border-[var(--border-color)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between flex-wrap gap-2">
          
          <div className="flex items-center gap-8">
            {/* Far Left: Official Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-sm border border-[var(--border-color)]">
                 <img src={logoUrl} alt="CoFound Logo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
              </div>
              <span className="font-black text-xl tracking-tight text-[var(--text-primary)]">CoFound</span>
            </Link>

            {/* Center-Left: Links */}
            <nav className="hidden md:flex items-center gap-6 font-bold text-sm">
              <a href="#why-cofound" className="text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors">{t('landing.navWhy')}</a>
              <a href="#features" className="text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors">{t('landing.navFeatures')}</a>
              <a href="#about" className="text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors">{t('landing.navAbout')}</a>
            </nav>
          </div>

          {/* Far Right: Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center bg-[var(--bg-input)] rounded-full p-1 border border-[var(--border-color)]">


              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-all flex items-center justify-center w-8 h-8"
                title="Toggle Theme"
              >
                {isDark ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            <Link to="/login" className="hidden sm:block text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors px-2">
              {t('landing.signIn')}
            </Link>
            
            <Link to="/register" className="btn-primary py-2 px-5 text-sm font-bold shadow-lg shadow-indigo-500/20 whitespace-nowrap bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0">
              {t('landing.getStarted')}
            </Link>
          </div>
        </div>
      </header>

      <main className="overflow-hidden relative pb-20">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-gradient-to-br from-indigo-500/15 to-[#00D4AA]/10 blur-3xl -z-10 rounded-full opacity-60 pointer-events-none"></div>

        {/* Hero Section */}
        <div className="pt-20 sm:pt-28 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-[var(--text-primary)] tracking-tight leading-[1.15] mb-6 drop-shadow-sm">
            {t('landing.heroTitle')}
          </h1>
          
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed font-medium">
            {t('landing.heroSubtitle')}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto btn-primary px-8 py-4 text-base sm:text-lg font-bold shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0">
              {t('landing.getStarted')}
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-bold rounded-xl border-2 border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-hover)] transition-all flex items-center justify-center">
              {t('landing.exploreProjects')}
            </Link>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="mt-10 mb-20 max-w-4xl mx-auto px-4 text-center relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-8 opacity-70">
            {t('landing.trustedBy')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-2 font-black text-xl text-[var(--text-primary)]"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> StartupHub</div>
            <div className="flex items-center gap-2 font-black text-xl text-[var(--text-primary)]"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg> InnovateX</div>
            <div className="flex items-center gap-2 font-black text-xl text-[var(--text-primary)]"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4z"/></svg> AI Ventures</div>
            <div className="flex items-center gap-2 font-black text-xl text-[var(--text-primary)]"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> FounderTech</div>
          </div>
        </div>

        {/* Embedded Platform Preview (Mockup Grid) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mb-24">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* View 1: The Social Core */}
              <div className="col-span-1 lg:col-span-3 rounded-[2rem] p-2 sm:p-4 bg-gradient-to-b from-[var(--border-color)] to-transparent shadow-2xl">
                 <div className="rounded-[1.5rem] bg-[var(--bg-page)] border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col h-[500px]">
                    {/* Browser Header Bar */}
                    <div className="h-12 border-b border-[var(--border-color)] flex items-center px-4 gap-2 bg-[var(--bg-surface)]/80 backdrop-blur-md">
                       <div className="flex gap-1.5 shrink-0">
                          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                       </div>
                       <div className="mx-auto h-6 w-48 max-w-[50%] bg-[var(--bg-input)] rounded-md flex items-center justify-center text-[10px] text-[var(--text-hint)] font-bold tracking-wider">
                          app.cofound.com
                       </div>
                       <div className="w-10 shrink-0"></div> {/* Spacer for balance */}
                    </div>
                    {/* App Content */}
                    <div className="flex-1 flex overflow-hidden">
                       <div className="hidden md:flex w-64 border-r border-[var(--border-color)] bg-[var(--bg-surface)] p-5 flex-col gap-5">
                          <div className="flex items-center gap-4 mb-2">
                             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                               <div className="w-6 h-6 rounded-full bg-indigo-500 opacity-80"></div>
                             </div>
                             <div className="flex flex-col gap-2">
                               <div className="h-2.5 w-24 bg-[var(--text-primary)] rounded opacity-80"></div>
                               <div className="h-2 w-16 bg-[var(--text-hint)] rounded opacity-50"></div>
                             </div>
                          </div>
                          <div className="h-2 w-20 bg-[var(--text-hint)] rounded opacity-50 mt-4 mb-2"></div>
                          {[1, 2, 3].map(i => (
                             <div key={i} className="flex items-center gap-3">
                               <div className="w-6 h-6 rounded bg-[var(--bg-input)] shrink-0"></div>
                               <div className="h-2 w-20 bg-[var(--bg-input)] rounded"></div>
                             </div>
                          ))}
                          <div className="mt-auto h-10 w-full bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                             <div className="h-2 w-16 bg-indigo-500/60 rounded"></div>
                          </div>
                       </div>
                       
                       <div className="flex-1 bg-[var(--bg-page)] p-6 overflow-hidden flex flex-col gap-6">
                          <div className="h-8 border-b border-[var(--border-color)] flex items-center gap-4 pb-4 mb-2">
                             <div className="h-3 w-16 bg-[var(--text-primary)] rounded opacity-80"></div>
                             <div className="h-3 w-16 bg-[var(--text-hint)] rounded opacity-40"></div>
                          </div>
                          <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm relative">
                             <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0"></div>
                                  <div className="flex flex-col gap-2">
                                     <div className="h-2.5 w-32 bg-[var(--text-primary)] rounded opacity-80"></div>
                                     <div className="h-2 w-20 bg-[var(--text-hint)] rounded opacity-50"></div>
                                  </div>
                               </div>
                               <div className="w-20 h-6 bg-[#00D4AA]/10 rounded-full border border-[#00D4AA]/20 flex items-center justify-center">
                                  <div className="h-1.5 w-10 bg-[#00D4AA]/60 rounded"></div>
                               </div>
                             </div>
                             <div className="space-y-2 mb-4">
                                <div className="h-2 w-full bg-[var(--bg-input)] rounded"></div>
                                <div className="h-2 w-4/5 bg-[var(--bg-input)] rounded"></div>
                             </div>
                             <div className="flex gap-2">
                                <div className="h-8 w-24 bg-[var(--bg-input)] rounded-lg"></div>
                                <div className="h-8 w-8 bg-[var(--bg-input)] rounded-lg"></div>
                             </div>
                          </div>
                          
                          <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm opacity-50">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-input)] shrink-0"></div>
                                <div className="flex flex-col gap-2">
                                   <div className="h-2.5 w-24 bg-[var(--bg-input)] rounded"></div>
                                   <div className="h-2 w-16 bg-[var(--bg-input)] rounded"></div>
                                </div>
                             </div>
                             <div className="space-y-2">
                                <div className="h-2 w-3/4 bg-[var(--bg-input)] rounded"></div>
                                <div className="h-2 w-1/2 bg-[var(--bg-input)] rounded"></div>
                             </div>
                          </div>
                       </div>

                       <div className="hidden lg:flex w-72 border-l border-[var(--border-color)] bg-[var(--bg-surface)] p-5 flex-col gap-5">
                          <div className="h-3 w-32 bg-[var(--text-primary)] rounded opacity-80 mb-2"></div>
                          <div className="h-20 w-full bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] flex items-center p-4 gap-3">
                             <div className="w-10 h-10 rounded-full bg-[var(--bg-page)] shrink-0"></div>
                             <div className="flex flex-col gap-2">
                               <div className="h-2 w-20 bg-[var(--bg-page)] rounded opacity-80"></div>
                               <div className="h-1.5 w-12 bg-[var(--bg-page)] rounded opacity-50"></div>
                             </div>
                          </div>
                          <div className="h-20 w-full bg-[var(--bg-input)] rounded-xl border border-[var(--border-color)] flex items-center p-4 gap-3 opacity-60">
                             <div className="w-10 h-10 rounded-full bg-[var(--bg-page)] shrink-0"></div>
                             <div className="flex flex-col gap-2">
                               <div className="h-2 w-20 bg-[var(--bg-page)] rounded opacity-80"></div>
                               <div className="h-1.5 w-12 bg-[var(--bg-page)] rounded opacity-50"></div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* View 2: The Real-Time Workspace */}
              <div className="col-span-1 lg:col-span-2 rounded-[2rem] p-2 sm:p-4 bg-gradient-to-b from-[var(--border-color)] to-transparent shadow-xl relative mt-8 lg:mt-0 lg:-mt-12 z-10 transition-transform hover:-translate-y-2 duration-300">
                 <div className="rounded-[1.5rem] bg-[var(--bg-page)] border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col h-[400px]">
                    <div className="h-10 border-b border-[var(--border-color)] flex items-center px-4 gap-2 bg-[var(--bg-surface)]">
                       <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                       </div>
                       <div className="mx-auto flex items-center gap-2 h-5 bg-[var(--bg-input)] px-4 rounded text-[10px] text-[var(--text-hint)] font-bold">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          Real-Time Workspace
                       </div>
                       <div className="w-10"></div>
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                       <div className="w-[35%] border-r border-[var(--border-color)] bg-[var(--bg-surface)] p-3 flex flex-col gap-2">
                          <div className="flex gap-1 bg-[var(--bg-input)] p-1 rounded-lg mb-2">
                             <div className="h-6 w-1/2 bg-[var(--bg-surface)] rounded shadow-sm flex items-center justify-center">
                               <div className="h-1.5 w-8 bg-[var(--text-primary)] opacity-60 rounded"></div>
                             </div>
                             <div className="h-6 w-1/2 rounded flex items-center justify-center">
                               <div className="h-1.5 w-8 bg-[var(--text-hint)] opacity-40 rounded"></div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 relative">
                             <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00D4AA]"></div>
                             <div className="w-8 h-8 rounded-full bg-indigo-500/20 shrink-0"></div>
                             <div className="flex flex-col gap-1.5 flex-1">
                                <div className="h-2 w-16 bg-indigo-500/80 rounded"></div>
                                <div className="h-1.5 w-10 bg-[var(--text-hint)] rounded"></div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 p-2.5 opacity-60">
                             <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] shrink-0"></div>
                             <div className="flex flex-col gap-1.5">
                                <div className="h-2 w-20 bg-[var(--text-primary)] rounded"></div>
                                <div className="h-1.5 w-12 bg-[var(--text-hint)] rounded"></div>
                             </div>
                          </div>
                       </div>
                       <div className="flex-1 bg-[var(--bg-page)] p-4 flex flex-col justify-end gap-3 relative">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-10">
                             <svg className="w-12 h-12 mb-3 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                             <div className="h-2 w-24 bg-[var(--text-primary)] rounded"></div>
                          </div>
                          
                          <div className="flex items-end gap-2 w-4/5 z-10">
                             <div className="w-6 h-6 rounded-full bg-[var(--bg-input)] shrink-0"></div>
                             <div className="p-3 bg-[var(--bg-surface)] rounded-2xl rounded-bl-none border border-[var(--border-color)]">
                                <div className="h-2 w-32 bg-[var(--text-primary)] rounded opacity-80 mb-2"></div>
                                <div className="h-2 w-24 bg-[var(--text-primary)] rounded opacity-60"></div>
                             </div>
                          </div>
                          
                          <div className="flex items-end gap-2 w-3/4 self-end flex-row-reverse z-10">
                             <div className="p-3 bg-indigo-500 rounded-2xl rounded-br-none shadow-md">
                                <div className="h-2 w-28 bg-white/90 rounded mb-2"></div>
                                <div className="h-2 w-16 bg-white/70 rounded"></div>
                             </div>
                          </div>
                          
                          <div className="mt-2 h-10 w-full bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] flex items-center px-3 z-10">
                             <div className="h-2 w-32 bg-[var(--text-hint)] opacity-40 rounded"></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* View 3: The Discovery Hub */}
              <div className="col-span-1 rounded-[2rem] p-2 sm:p-4 bg-gradient-to-b from-[var(--border-color)] to-transparent shadow-xl relative mt-8 lg:mt-0 lg:translate-y-8 z-0 transition-transform hover:-translate-y-2 duration-300">
                 <div className="rounded-[1.5rem] bg-[var(--bg-page)] border border-[var(--border-color)] shadow-xl overflow-hidden flex flex-col h-[400px]">
                    <div className="h-10 border-b border-[var(--border-color)] flex items-center px-4 gap-2 bg-[var(--bg-surface)]">
                       <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                       </div>
                       <div className="mx-auto flex items-center gap-2 h-5 bg-[var(--bg-input)] px-4 rounded text-[10px] text-[var(--text-hint)] font-bold">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          Discovery Hub
                       </div>
                       <div className="w-10"></div>
                    </div>
                    <div className="flex-1 bg-[var(--bg-page)] p-4 flex flex-col gap-4 overflow-hidden">
                       <div className="flex gap-2 mb-2">
                          <div className="h-8 flex-1 bg-[var(--bg-input)] rounded-lg flex items-center px-3">
                             <div className="h-1.5 w-16 bg-[var(--text-hint)] opacity-40 rounded"></div>
                          </div>
                          <div className="h-8 w-16 bg-indigo-500 rounded-lg shadow flex items-center justify-center">
                             <div className="h-1.5 w-8 bg-white/70 rounded"></div>
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[1, 2, 3, 4].map(i => (
                             <div key={i} className={`bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] p-3 flex flex-col gap-3 ${i > 2 ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-2">
                                   <div className={`w-8 h-8 rounded-full bg-[var(--bg-input)] shrink-0 ${i === 1 ? 'border-2 border-[#00D4AA]' : ''}`}></div>
                                   <div className="flex flex-col gap-1.5 flex-1">
                                      <div className="h-1.5 w-full bg-[var(--text-primary)] opacity-70 rounded"></div>
                                      <div className="h-1.5 w-2/3 bg-[var(--text-hint)] opacity-50 rounded"></div>
                                   </div>
                                </div>
                                <div className="mt-auto flex justify-end gap-1">
                                   <div className="h-5 w-12 bg-[var(--bg-input)] rounded-md"></div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

           </div>
        </div>

        {/* Why CoFound (Problem & Solution) Section */}
        <div id="why-cofound" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">{t('landing.whyTitle')}</h2>
            <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            {/* The Challenge */}
            <div className="bg-rose-500/5 border border-rose-500/20 p-4 sm:p-10 w-full rounded-3xl relative">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{t('landing.challengeTitle')}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed font-medium text-lg">
                {t('landing.challengeDesc')}
              </p>
            </div>

            {/* The Solution */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 sm:p-10 w-full rounded-3xl relative">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{t('landing.solutionTitle')}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed font-medium text-lg">
                {t('landing.solutionDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">{t('landing.howItWorksTitle')}</h2>
            <div className="w-16 h-1 bg-[#00D4AA] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-indigo-500/20 via-[#00D4AA]/50 to-indigo-500/20 z-0"></div>
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xl flex items-center justify-center text-2xl font-black text-indigo-500 mb-6">1</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('landing.step1Title')}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed font-medium max-w-xs">{t('landing.step1Desc')}</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center mt-8 md:mt-0">
              <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xl flex items-center justify-center text-2xl font-black text-[#00D4AA] mb-6">2</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('landing.step2Title')}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed font-medium max-w-xs">{t('landing.step2Desc')}</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center mt-8 md:mt-0">
              <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-xl flex items-center justify-center text-2xl font-black text-violet-500 mb-6">3</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('landing.step3Title')}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed font-medium max-w-xs">{t('landing.step3Desc')}</p>
            </div>
          </div>
        </div>

        {/* Features Grid Section */}
        <div id="features" className="bg-[var(--bg-surface)] border-y border-[var(--border-color)] mt-12 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
               <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">{t('landing.features')}</h2>
               <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full"></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Feature 1 */}
                <div className="bg-[var(--bg-page)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                   <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                   </div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('landing.feature1Title')}</h3>
                   <p className="text-[var(--text-secondary)] leading-relaxed font-medium">{t('landing.feature1Desc')}</p>
                </div>

                {/* Feature 2 */}
                <div className="bg-[var(--bg-page)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                   <div className="w-14 h-14 bg-[#00D4AA]/10 text-[#00D4AA] rounded-2xl flex items-center justify-center mb-6">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                   </div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('landing.feature2Title')}</h3>
                   <p className="text-[var(--text-secondary)] leading-relaxed font-medium">{t('landing.feature2Desc')}</p>
                </div>

                {/* Feature 3 */}
                <div className="bg-[var(--bg-page)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                   <div className="w-14 h-14 bg-violet-500/10 text-violet-500 rounded-2xl flex items-center justify-center mb-6">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('landing.feature3Title')}</h3>
                   <p className="text-[var(--text-secondary)] leading-relaxed font-medium">{t('landing.feature3Desc')}</p>
                </div>

                {/* Feature 4 */}
                <div className="bg-[var(--bg-page)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                   <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                   </div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{t('landing.feature4Title')}</h3>
                   <p className="text-[var(--text-secondary)] leading-relaxed font-medium">{t('landing.feature4Desc')}</p>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Multi-Column Footer */}
      <footer id="about" className="bg-[var(--bg-page)] border-t border-[var(--border-color)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
            
            {/* Column 1: Brand */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-[var(--border-color)]">
                    <img src={logoUrl} alt="CoFound Logo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                 </div>
                 <span className="font-black text-xl tracking-tight text-[var(--text-primary)]">CoFound</span>
              </Link>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 max-w-xs font-medium">
                {t('landing.heroSubtitle')}
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>

            {/* Column 2: Product */}
            <div>
              <h4 className="font-bold text-[var(--text-primary)] mb-4">{t('landing.footerProduct')}</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">{t('landing.features')}</a></li>
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">{t('landing.footerIntegrations')}</a></li>
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">{t('landing.footerSolutions')}</a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="font-bold text-[var(--text-primary)] mb-4">{t('landing.footerCompany')}</h4>
              <ul className="space-y-3">
                <li><a href="#about" className="text-sm text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">{t('landing.footerAboutUs')}</a></li>
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">{t('landing.footerCareers')}</a></li>
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">{t('landing.footerContact')}</a></li>
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div>
              <h4 className="font-bold text-[var(--text-primary)] mb-4">{t('landing.footerResources')}</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">{t('landing.footerDocs')}</a></li>
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">{t('landing.footerHelp')}</a></li>
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-indigo-500 transition-colors">{t('landing.footerCommunity')}</a></li>
              </ul>
            </div>
            
          </div>
          
          <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-4">
             <p className="text-sm text-[var(--text-secondary)] font-medium">{t('landing.footerCopyright')}</p>
             <div className="flex gap-6 text-sm text-[var(--text-secondary)]">
                <Link to="/privacy" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-indigo-500 transition-colors">Terms of Service</Link>
                <Link to="/support" className="hover:text-indigo-500 transition-colors">Support</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
