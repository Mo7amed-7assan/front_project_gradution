import React from 'react'
import Spinner from '../../components/Spinner'

export default function ProfileUI({
  user,
  activeTab,
  setActiveTab,
  profile,
  profileLoading,
  profileError,
  skills,
  skillsLoading,
  skillsError,
  portfolio,
  portfolioLoading,
  portfolioError,
  profileForm,
  profileSaving,
  profileSuccess,
  profileSavingError,
  passwordForm,
  passwordLoading,
  passwordSuccess,
  passwordError,
  skillModalOpen,
  skillForm,
  editingSkill,
  skillSaving,
  skillMessage,
  skillError,
  portfolioModalOpen,
  portfolioForm,
  editingPortfolio,
  portfolioSaving,
  portfolioMessage,
  portfolioActionError,
  handleProfileChange,
  handleSaveProfile,
  handleProfilePictureSelect,
  profilePictureUploading,
  profilePictureError,
  profilePicturePreview,
  setPasswordForm,
  handlePasswordChange,
  handleSkillModalOpen,
  setSkillModalOpen,
  handleSkillChange,
  handleSaveSkill,
  handleDeleteSkill,
  handlePortfolioModalOpen,
  setPortfolioModalOpen,
  handlePortfolioChange,
  handleSavePortfolio,
  handleDeletePortfolio
}) {
  if (profileLoading) return <div className="p-8 flex justify-center"><Spinner /></div>
  if (profileError) return <div className="p-8 text-rose-600 font-semibold text-center">{profileError}</div>
  if (!profile) return <div className="p-8 text-center text-slate-500">Profile not found.</div>

  return (
    <div className="space-y-6">
      {/* Header Profile Cover */}
      <div className="relative rounded-3xl overflow-hidden bg-brand-primaryDark h-48 sm:h-64 flex items-end p-6 md:p-8 shadow-xl shadow-brand-primary/10">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-secondaryDark/90 to-transparent z-0"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full">
           <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white shrink-0">
             <label htmlFor="profile-picture-input" className="absolute inset-0 cursor-pointer">
               <img
                 src={profilePicturePreview || profile?.profile_picture || user?.profile_picture || user?.avatar || user?.profile_picture_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=EEEDFF&color=4F46E5`}
                 alt={profile.full_name}
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center px-2">
                 <span className="text-xs text-white uppercase tracking-[0.22em] font-semibold">Change picture</span>
                 {profilePictureUploading && <span className="text-[11px] text-slate-200 mt-1">Uploading...</span>}
               </div>
             </label>
             <input
               id="profile-picture-input"
               type="file"
               accept="image/*"
               className="hidden"
               onChange={handleProfilePictureSelect}
             />
           </div>
           {profilePictureError && (
             <div className="mt-2 text-xs text-rose-600">{profilePictureError}</div>
           )}
           <div className="text-center sm:text-left flex-1 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{profile.full_name}</h1>
              <p className="text-brand-primaryLight text-sm font-medium mt-1">{profile.location || 'Global Visionary'}</p>
           </div>
           <div className="shrink-0 mb-2 hidden sm:block">
             <span className="badge-primary px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
               {user?.username ? `@${user.username}` : user?.email}
             </span>
           </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1 bg-white rounded-2xl shadow-sm border border-slate-100">
        {['about', 'skills', 'portfolio', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${
              activeTab === tab 
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
              : 'text-slate-500 hover:text-brand-primary hover:bg-brand-primaryLight/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="mt-6">
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="card p-6 md:p-8">
                <h2 className="text-xl font-bold text-brand-secondary mb-4 flex items-center gap-2">
                   <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   About Me
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {profile.bio || 'No bio available yet. Head over to settings to tell the world about your incredible journey.'}
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-lg font-bold text-brand-secondary mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Links & Social
                </h2>
                <div className="space-y-4">
                  {[
                    { label: 'Website', url: profile.website_url, icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
                    { label: 'GitHub', url: profile.github_url, icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
                    { label: 'LinkedIn', url: profile.linkedin_url, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-brand-primary hover:text-brand-primaryDark transition-colors group">
                           <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                           <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Not specified</span>
                      )}
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Contact</span>
                    <p className="text-sm font-medium text-slate-800 mt-1">{profile.email || user?.email || 'Hidden'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="card p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-brand-secondary">My Capabilities</h2>
                <p className="text-sm text-slate-500 mt-1">Showcase your expertise and level of proficiency.</p>
              </div>
              <button onClick={() => handleSkillModalOpen()} className="btn-primary shrink-0">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                 Add New Skill
              </button>
            </div>
            
            {(skillMessage || skillError) && (
               <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${skillError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                 {skillError || skillMessage}
               </div>
            )}

            {skillsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
              </div>
            ) : skillsError ? (
              <div className="text-rose-600 text-sm font-medium">{skillsError}</div>
            ) : skills.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl">
                <div className="w-16 h-16 bg-brand-primaryLight rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No skills documented</h3>
                <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">Founders and teammates search for specific skills. Add yours to stand out.</p>
                <button onClick={() => handleSkillModalOpen()} className="btn-secondary text-brand-primary">Add Your First Skill</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="group p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                       <button onClick={() => handleSkillModalOpen(skill)} className="p-1.5 rounded-lg bg-slate-100 text-brand-primary hover:bg-brand-primaryLight transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                       </button>
                       <button onClick={() => handleDeleteSkill(skill.id)} className="p-1.5 rounded-lg bg-slate-100 text-rose-600 hover:bg-rose-100 transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2 pr-12">{skill.skill_name}</h3>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        Lvl {skill.proficiency_level}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {skill.years_experience ?? 0} yrs
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                       <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${(skill.proficiency_level / 5) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="card p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-brand-secondary">My Portfolio</h2>
                <p className="text-sm text-slate-500 mt-1">Showcase projects, code, designs, or articles you've created.</p>
              </div>
              <button onClick={() => handlePortfolioModalOpen()} className="btn-primary shrink-0">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                 Add Item
              </button>
            </div>
            
            {(portfolioMessage || portfolioActionError) && (
               <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${portfolioActionError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                 {portfolioActionError || portfolioMessage}
               </div>
            )}

            {portfolioLoading ? (
               <div className="space-y-4">
                 {[1,2].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
               </div>
            ) : portfolioError ? (
               <div className="text-rose-600 text-sm font-medium">{portfolioError}</div>
            ) : portfolio.length === 0 ? (
               <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl">
                <div className="w-16 h-16 bg-brand-primaryLight rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No portfolio items</h3>
                <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">The best way to prove your skills is to show what you've built.</p>
                <button onClick={() => handlePortfolioModalOpen()} className="btn-secondary text-brand-primary">Create First Item</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolio.map((item) => (
                  <div key={item.id} className="group flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:shadow-brand-primary/10 hover:border-brand-primary/30 transition-all relative">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-gradient-to-l from-white via-white to-transparent">
                       <button onClick={() => handlePortfolioModalOpen(item)} className="p-1.5 rounded-lg text-brand-primary hover:bg-brand-primaryLight transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                       </button>
                       <button onClick={() => handleDeletePortfolio(item.id)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                         <span className="badge-primary">{item.item_type || 'Link'}</span>
                         {item.visibility !== 'public' && <span className="badge-slate text-[10px] uppercase">Private</span>}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight pr-12">{item.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4">{item.description || 'No description provided.'}</p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-1.5 overflow-hidden pr-2">
                         {item.skills?.slice(0, 3).map((skill, idx) => (
                           <span key={idx} className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 whitespace-nowrap">{skill}</span>
                         ))}
                         {(item.skills?.length || 0) > 3 && <span className="text-xs text-slate-400">+{item.skills.length - 3}</span>}
                       </div>
                       
                       {item.external_url && (
                         <a href={item.external_url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primaryLight text-brand-primary hover:bg-brand-primary hover:text-white transition-colors shrink-0">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                         </a>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 md:p-8">
              <h2 className="text-xl font-bold text-brand-secondary mb-6">Profile Details</h2>
              {profileSuccess && <div className="mb-4 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium">{profileSuccess}</div>}
              {profileSavingError && <div className="mb-4 px-4 py-3 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium">{profileSavingError}</div>}
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input value={profileForm.full_name} onChange={handleProfileChange('full_name')} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <input value={profileForm.location} onChange={handleProfileChange('location')} className="form-input" placeholder="e.g. San Francisco, CA" />
                </div>
                <div>
                  <label className="form-label">Bio</label>
                  <textarea value={profileForm.bio} onChange={handleProfileChange('bio')} className="form-input resize-none" rows={4} placeholder="Tell us about yourself..." />
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Social Links</h3>
                  <div>
                    <label className="form-label text-xs">Website URL</label>
                    <input type="url" value={profileForm.website_url} onChange={handleProfileChange('website_url')} className="form-input" placeholder="https://" />
                  </div>
                  <div>
                    <label className="form-label text-xs">GitHub URL</label>
                    <input type="url" value={profileForm.github_url} onChange={handleProfileChange('github_url')} className="form-input" placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="form-label text-xs">LinkedIn URL</label>
                    <input type="url" value={profileForm.linkedin_url} onChange={handleProfileChange('linkedin_url')} className="form-input" placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={profileSaving} className="btn-primary w-full sm:w-auto">
                    {profileSaving ? <Spinner /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            <div className="card p-6 md:p-8 h-fit">
              <h2 className="text-xl font-bold text-brand-secondary mb-6">Security</h2>
              {passwordSuccess && <div className="mb-4 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium">{passwordSuccess}</div>}
              {passwordError && <div className="mb-4 px-4 py-3 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium">{passwordError}</div>}
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="form-label">Current Password</label>
                  <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm(p => ({ ...p, current_password: e.target.value }))} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">New Password</label>
                  <input type="password" value={passwordForm.password} onChange={(e) => setPasswordForm(p => ({ ...p, password: e.target.value }))} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" value={passwordForm.password_confirmation} onChange={(e) => setPasswordForm(p => ({ ...p, password_confirmation: e.target.value }))} className="form-input" required />
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={passwordLoading} className="btn-secondary text-brand-primary w-full sm:w-auto">
                    {passwordLoading ? <Spinner /> : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {skillModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 transform transition-all">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h2>
            {skillError && <div className="mb-4 text-sm font-semibold text-rose-600 bg-rose-50 p-3 rounded-xl">{skillError}</div>}
            
            <form onSubmit={handleSaveSkill} className="space-y-5">
              <div>
                <label className="form-label">Skill Name</label>
                <input disabled={Boolean(editingSkill)} value={skillForm.skill_name} onChange={handleSkillChange('skill_name')} className="form-input disabled:bg-slate-50 disabled:text-slate-400" placeholder="e.g. React Native" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Proficiency (1-5)</label>
                  <select value={skillForm.proficiency_level} onChange={handleSkillChange('proficiency_level')} className="form-select" required>
                    {[1,2,3,4,5].map(lvl => <option key={lvl} value={lvl}>Level {lvl}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Years Experience</label>
                  <input type="number" min="0" value={skillForm.years_experience} onChange={handleSkillChange('years_experience')} className="form-input" placeholder="e.g. 3" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setSkillModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={skillSaving} className="btn-primary">
                  {skillSaving ? <Spinner /> : editingSkill ? 'Save Changes' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {portfolioModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 transform transition-all my-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{editingPortfolio ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
            {portfolioActionError && <div className="mb-4 text-sm font-semibold text-rose-600 bg-rose-50 p-3 rounded-xl">{portfolioActionError}</div>}
            
            <form onSubmit={handleSavePortfolio} className="space-y-5">
              <div>
                <label className="form-label">Project Title</label>
                <input value={portfolioForm.title} onChange={handlePortfolioChange('title')} className="form-input" placeholder="What did you build?" required />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea value={portfolioForm.description} onChange={handlePortfolioChange('description')} className="form-input resize-none" rows={4} placeholder="Briefly describe the project, your role, and the impact..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">External URL</label>
                  <input type="url" value={portfolioForm.external_url} onChange={handlePortfolioChange('external_url')} className="form-input" placeholder="https://" />
                </div>
                <div>
                  <label className="form-label">Content Type</label>
                  <select value={portfolioForm.item_type} onChange={handlePortfolioChange('item_type')} className="form-select">
                    <option value="link">Website / Link</option>
                    <option value="code">Code Repository</option>
                    <option value="image">Design / Image</option>
                    <option value="document">Case Study / Doc</option>
                    <option value="video">Video Demo</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Visibility</label>
                  <select value={portfolioForm.visibility} onChange={handlePortfolioChange('visibility')} className="form-select">
                    <option value="public">Public (Everyone)</option>
                    <option value="connections">Connections Only</option>
                    <option value="private">Private (Only Me)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Technologies Used</label>
                  <input value={portfolioForm.skills} onChange={handlePortfolioChange('skills')} className="form-input" placeholder="e.g. React, Node, Figma" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setPortfolioModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={portfolioSaving} className="btn-primary">
                  {portfolioSaving ? <Spinner /> : editingPortfolio ? 'Save Changes' : 'Publish Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
