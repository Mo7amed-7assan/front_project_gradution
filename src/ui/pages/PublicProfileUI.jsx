import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

export default function PublicProfileUI({
  profile,
  portfolio,
  loading,
  error,
  actionMessage,
  actionMessageType,
  connectionStatus,
  connecting,
  isOwnProfile,
  canSendConnectionRequest,
  showInviteModal,
  setShowInviteModal,
  myProjects,
  selectedProject,
  setSelectedProject,
  invitationType,
  setInvitationType,
  inviting,
  ratingsData,
  editingRating,
  setEditingRating,
  editRatingForm,
  setEditRatingForm,
  editRatingComment,
  setEditRatingComment,
  editRatingVisibility,
  setEditRatingVisibility,
  handleConnect,
  handleOpenInvite,
  handleSendInvite,
  handleEndorse,
  handleUpdateRating,
  handleDeleteRating,
  INVITATION_TYPES,
  RATING_FIELDS,
  getProjectId,
  getRatingScore,
  getRatingFeedback,
  currentUser
}) {
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner />
    </div>
  )

  if (error) return (
    <div className="max-w-5xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      {error}
    </div>
  )

  if (!profile) return (
    <div className="max-w-5xl mx-auto p-12 text-center card border-dashed border-2 border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Profile not found</h3>
      <p className="text-slate-500">The user you are looking for does not exist or has been removed.</p>
    </div>
  )

  const initial = (profile.full_name || profile.username || 'U').charAt(0).toUpperCase()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Action Message */}
      {actionMessage && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center justify-between gap-4 animate-in slide-in-from-top-4 fade-in ${actionMessageType === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              {actionMessageType === 'error' ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
            </svg>
            {actionMessage}
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="card p-0 overflow-hidden relative">
        <div className="h-32 md:h-48 bg-gradient-to-r from-brand-primaryDark to-brand-primary w-full absolute top-0 left-0"></div>
        <div className="px-6 pb-6 pt-16 md:pt-28 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white p-1.5 shadow-xl shrink-0">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-brand-primaryLight to-brand-primary flex items-center justify-center text-white font-bold text-4xl shadow-inner">
                  {initial}
                </div>
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-black text-slate-900 leading-tight">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-brand-primary font-bold text-lg">
                  @{profile.username}
                </p>
                <div className="flex items-center gap-1.5 text-slate-500 font-medium mt-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {profile.location || 'Unknown location'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:pb-2">
              {!isOwnProfile && (
                <>
                  {connectionStatus && (
                    <button
                      onClick={handleConnect}
                      disabled={connecting || !canSendConnectionRequest}
                      className={`btn-primary shadow-brand-primary/30 flex items-center gap-2 ${
                        connectionStatus === 'connected'
                          ? '!bg-emerald-500 !shadow-emerald-500/30 cursor-default'
                          : connectionStatus === 'pending'
                          ? '!bg-amber-500 !shadow-amber-500/30 cursor-default'
                          : 'disabled:opacity-50'
                      }`}
                    >
                      {connecting ? <Spinner /> :
                       connectionStatus === 'connected' ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Connected</> :
                       connectionStatus === 'pending' ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Pending</> :
                       <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> Connect</>}
                    </button>
                  )}
                  <button
                    onClick={handleOpenInvite}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {!currentUser || currentUser?.role === 'guest' ? 'Register to Invite' : 'Invite to Project'}
                  </button>
                  <Link
                    to={`/reports/submit?userId=${profile.id}`}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-bold border border-rose-200 transition-colors flex items-center gap-1.5"
                  >
                    🚩 Report
                  </Link>
                </>
              )}
              {isOwnProfile && (
                <Link to="/profile" className="btn-secondary">
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: About & Links */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              About
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
              {profile.bio || 'This user hasn\'t written a bio yet.'}
            </p>
            
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {profile.email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{profile.email}</p>
                  </div>
                </div>
              )}
              {profile.website_url && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Website</p>
                    <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-primary hover:underline truncate block">
                      {profile.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
              {profile.github_url && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">GitHub</p>
                    <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-primary hover:underline truncate block">
                      {profile.github_url.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                    </a>
                  </div>
                </div>
              )}
              {profile.linkedin_url && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">LinkedIn</p>
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-primary hover:underline truncate block">
                      {profile.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ratings Summary */}
          <div className="card p-6 border-b-4 border-amber-400">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              Reputation
            </h2>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-black text-slate-900 leading-none">{Number(ratingsData.average).toFixed(1)}</span>
              <div className="flex flex-col pb-1">
                <div className="flex text-amber-400 text-sm">
                  {'★'.repeat(Math.round(ratingsData.average))}{'☆'.repeat(5 - Math.round(ratingsData.average))}
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">{ratingsData.count} reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skills, Portfolio, Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              Skills & Expertise
            </h2>
            {profile.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <div key={skill.id} className="group flex items-center bg-slate-50 border border-slate-100 rounded-xl overflow-hidden hover:border-brand-primary/30 transition-colors">
                    <div className="px-3 py-2 text-sm font-bold text-slate-800">
                      {skill.skill_name}
                    </div>
                    <div className="px-3 py-2 bg-slate-100/50 border-l border-slate-100 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <span className="text-brand-primaryDark">{skill.endorsements_count ?? 0}</span>
                      <svg className="w-3 h-3 text-brand-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                    </div>
                    {!isOwnProfile && (
                      <button
                        onClick={() => handleEndorse(skill.id)}
                        className="px-3 py-2 bg-brand-primaryLight/10 text-brand-primary hover:bg-brand-primary text-xs font-bold uppercase tracking-wider hover:text-white transition-colors border-l border-slate-100 opacity-0 group-hover:opacity-100"
                      >
                        Endorse
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center font-medium">No skills listed yet.</p>
            )}
          </div>

          {/* Portfolio */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Portfolio & Work
            </h2>
            {portfolio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.map((item) => (
                  <div key={item.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 transition-all group flex flex-col h-full">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-bold text-slate-900 group-hover:text-brand-primary transition-colors truncate">
                        {item.title}
                      </h3>
                      {item.external_url && (
                        <a href={item.external_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-brand-primary shadow-sm shrink-0 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{item.item_type || 'Project'}</p>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">
                      {item.description || 'No description provided.'}
                    </p>
                    {item.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {item.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-white text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                            {skill}
                          </span>
                        ))}
                        {item.skills.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider">
                            +{item.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center font-medium">No portfolio items added yet.</p>
            )}
          </div>

          {/* Reviews */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Reviews ({ratingsData.count})
            </h2>
            
            {ratingsData.items.length > 0 ? (
              <div className="space-y-4">
                {ratingsData.items.map(r => (
                  <div key={r.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-200/60">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-slate-900">{r.rater?.full_name || r.rater?.name || 'Unknown User'}</span>
                          <div className="flex items-center bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-100 text-xs">
                            <span className="text-amber-400 mr-1">★</span>
                            <span className="font-bold text-slate-700">{Number(getRatingScore(r)).toFixed(1)}</span>
                          </div>
                        </div>
                        {r.project && <p className="text-xs font-medium text-slate-500">Collaborated on: <span className="text-brand-primary">{r.project.title || r.project.name}</span></p>}
                      </div>
                      
                      {currentUser && (r.rater?.id === currentUser.id || r.rater_id === currentUser.id) && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => {
                            setEditingRating(r.id)
                            setEditRatingForm({
                              overall_rating: Math.round(getRatingScore(r)) || 5,
                              communication_rating: r.communication_rating || 5,
                              reliability_rating: r.reliability_rating || 5,
                              skill_rating: r.skill_rating || 5,
                              problem_solving_rating: r.problem_solving_rating || 5,
                              teamwork_rating: r.teamwork_rating || 5,
                            })
                            setEditRatingComment(getRatingFeedback(r))
                            setEditRatingVisibility(r.visibility || 'public')
                          }} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteRating(r.id)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {RATING_FIELDS.filter((field) => field.key !== 'overall_rating').map((field) => (
                        <div key={field.key} className="bg-white p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</span>
                          <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                            {r[field.key] || '-'} <span className="text-amber-400 text-xs">★</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {getRatingFeedback(r) && (
                      <div className="bg-white p-4 rounded-xl border border-slate-100 relative">
                        <svg className="w-6 h-6 text-slate-200 absolute -top-2 -left-2 bg-white" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                        <p className="text-sm text-slate-600 leading-relaxed italic pl-2 relative z-10">
                          {getRatingFeedback(r)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center font-medium">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Invite to Project</h3>
              <button onClick={() => setShowInviteModal(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {myProjects.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-brand-primaryLight/30 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">No active projects</h4>
                <p className="text-slate-500 text-sm mb-6">You need to create a project before you can send invitations.</p>
                <Link to="/projects/create" className="btn-primary w-full text-center block">
                  Create Project
                </Link>
              </div>
            ) : (
              <div className="space-y-5 mb-8">
                <div>
                  <label className="form-label">Select Project</label>
                  <select
                    value={selectedProject}
                    onChange={e => setSelectedProject(e.target.value)}
                    className="form-select bg-slate-50"
                  >
                    {myProjects.map(p => {
                      const projectId = getProjectId(p)
                      return (
                        <option key={projectId || p.title || p.name} value={projectId || ''}>{p.title || p.name}</option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="form-label">Invitation Role</label>
                  <select
                    value={invitationType}
                    onChange={e => setInvitationType(e.target.value)}
                    className="form-select bg-slate-50"
                  >
                    <option value={INVITATION_TYPES.TEAM_INVITE}>Team Member</option>
                    <option value={INVITATION_TYPES.COLLABORATION_REQUEST}>Collaborator</option>
                    <option value={INVITATION_TYPES.MENTORSHIP}>Mentor</option>
                  </select>
                </div>
              </div>
            )}
            
            {myProjects.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={inviting || !selectedProject}
                  className="btn-primary flex-1 shadow-brand-primary/30"
                >
                  {inviting ? <Spinner /> : 'Send Invitation'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Rating Modal */}
      {editingRating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Edit Rating</h3>
              <button onClick={() => setEditingRating(null)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                {RATING_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {field.label}
                      <span className="text-amber-500 flex gap-0.5">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} className={star <= editRatingForm[field.key] ? 'opacity-100' : 'opacity-30'}>★</span>
                        ))}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={editRatingForm[field.key]}
                      onChange={(e) => setEditRatingForm((prev) => ({ ...prev, [field.key]: parseInt(e.target.value) }))}
                      className="w-full accent-brand-primary"
                    />
                  </div>
                ))}
              </div>
              
              <div>
                <label className="form-label">Written Feedback</label>
                <textarea
                  value={editRatingComment}
                  onChange={(e) => setEditRatingComment(e.target.value)}
                  className="form-input bg-slate-50"
                  rows={4}
                  placeholder="Share details about your experience working with this person..."
                />
              </div>
              
              <div>
                <label className="form-label">Visibility</label>
                <select
                  value={editRatingVisibility}
                  onChange={(e) => setEditRatingVisibility(e.target.value)}
                  className="form-select bg-slate-50"
                >
                  <option value="public">Public - visible to everyone</option>
                  <option value="private">Private - visible only to connections</option>
                  <option value="anonymous">Anonymous - hides your name</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setEditingRating(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRating}
                className="btn-primary flex-1 shadow-brand-primary/30"
              >
                Save Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
