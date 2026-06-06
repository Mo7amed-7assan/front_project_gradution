import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

const statusClass = (status) => {
  const value = `${status || ''}`.toLowerCase()
  if (value === 'accepted') return 'badge-green'
  if (value === 'pending') return 'badge-yellow'
  if (value === 'rejected') return 'badge-red'
  if (value === 'blocked') return 'badge-slate'
  return 'badge-slate'
}

export default function ConnectionsUI({
  user,
  connections,
  receivedRequests,
  sentRequests,
  loading,
  error,
  activeTab,
  setActiveTab,
  requestTab,
  setRequestTab,
  responding,
  removing,
  handleRespond,
  handleRemove,
  getOtherUser,
  getRequesterId,
  getRecipientId,
  normalizeKey,
  getCurrentUserId,
  children
}) {
  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex gap-4">
           <div className="h-10 w-32 skeleton rounded-xl" />
           <div className="h-10 w-32 skeleton rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const PersonSummary = ({ connection, person, fallbackId }) => {
    const otherUser = person || getOtherUser(connection)
    const isUserObject = otherUser && typeof otherUser === 'object'
    const displayId = fallbackId || (!isUserObject ? otherUser : null)
    const profileUrl = isUserObject ? otherUser.profile_picture_url : null
    const displayName = isUserObject
      ? otherUser.full_name || otherUser.username || `User #${displayId || 'Unknown'}`
      : `User #${displayId || 'Unknown'}`
    const username = isUserObject ? otherUser.username : null
    const linkId = isUserObject ? otherUser.id : displayId
    
    const initial = displayName.charAt(0).toUpperCase()

    return (
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <div className="relative shrink-0">
           {profileUrl ? (
             <img src={profileUrl} alt={displayName} className="w-14 h-14 rounded-full object-cover shadow-sm bg-slate-100" />
           ) : (
             <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white font-bold text-xl shadow-sm">
               {initial}
             </div>
           )}
           <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white bg-emerald-500"></div>
        </div>
        
        <div className="min-w-0 pr-4">
          <Link to={`/users/${linkId}`} className="font-bold text-slate-900 hover:text-brand-primary transition-colors text-base truncate block">
            {displayName}
          </Link>
          <p className="text-xs text-slate-500 truncate mt-0.5">{username ? `@${username}` : displayId || 'Connect to see more'}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
             <span className={statusClass(connection.status)}>{connection.status || 'pending'}</span>
             {connection.connection_type && (
               <span className="badge-slate capitalize">{connection.connection_type.replace('_', ' ')}</span>
             )}
          </div>
        </div>
      </div>
    )
  }

  const RequestCard = ({ request, mode }) => {
    const person = mode === 'sent' ? request.recipient : request.requester
    const fallbackId = mode === 'sent'
      ? request.recipient_id || request.recipient_uuid || request.recipient
      : request.requester_id || request.requester_uuid || request.requester

    return (
      <div className="card p-5 group flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-brand-primary">
        <PersonSummary connection={request} person={person} fallbackId={fallbackId} />
        
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 w-full sm:w-auto">
          {mode === 'received' ? (
            <>
              <button onClick={() => handleRespond(request.id, 'rejected')} disabled={responding === request.id} className="btn-ghost flex-1 sm:flex-none">
                {responding === request.id ? <Spinner /> : 'Decline'}
              </button>
              <button onClick={() => handleRespond(request.id, 'accepted')} disabled={responding === request.id} className="btn-primary flex-1 sm:flex-none shadow-brand-primary/30">
                {responding === request.id ? <Spinner /> : 'Accept'}
              </button>
            </>
          ) : (
            <button onClick={() => handleRemove(request.id, 'Withdraw this request?')} disabled={removing === request.id} className="btn-secondary text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex-1 sm:flex-none">
              {removing === request.id ? <Spinner /> : 'Withdraw'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">My Network</h1>
          <p className="page-subtitle">Grow your connections and collaborate with top talent.</p>
        </div>
        <Link to="/discover" className="btn-primary shrink-0 self-start sm:self-auto shadow-brand-primary/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          Discover People
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
           <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           {error}
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-fit">
        <button
          onClick={() => setActiveTab('connections')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'connections'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
              : 'text-slate-500 hover:text-brand-primary hover:bg-brand-primaryLight/50'
          }`}
        >
          Connections <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'connections' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{connections.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center ${
            activeTab === 'requests'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
              : 'text-slate-500 hover:text-brand-primary hover:bg-brand-primaryLight/50'
          }`}
        >
          Requests 
          {(receivedRequests.length > 0) && activeTab !== 'requests' && (
             <span className="flex h-2 w-2 relative ml-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
             </span>
          )}
          <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'requests' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{receivedRequests.length + sentRequests.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'connections' && (
          <div className="space-y-4">
            {connections.length === 0 ? (
              <div className="card p-12 text-center border-dashed border-2 border-slate-200">
                <div className="w-20 h-20 bg-brand-primaryLight rounded-3xl flex items-center justify-center mx-auto mb-5 rotate-3 hover:rotate-0 transition-transform">
                  <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No connections yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start building your professional network to collaborate on amazing projects.</p>
                <Link to="/discover" className="btn-primary shadow-brand-primary/30">Find Co-Founders</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map((connection) => (
                  <div key={connection.id} className="card p-5 group flex flex-col justify-between hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 transition-all">
                    <PersonSummary connection={connection} />
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 w-full">
                       <Link to={`/messages?user=${getOtherUser(connection)?.id}`} className="btn-secondary flex-1 shadow-none">
                         <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                         Message
                       </Link>
                       <button onClick={() => handleRemove(connection.id)} disabled={removing === connection.id} className="btn-ghost text-rose-600 hover:bg-rose-50 shrink-0">
                         {removing === connection.id ? <Spinner /> : 'Remove'}
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
              <button
                onClick={() => setRequestTab('received')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  requestTab === 'received' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Received ({receivedRequests.length})
              </button>
              <button
                onClick={() => setRequestTab('sent')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  requestTab === 'sent' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sent ({sentRequests.length})
              </button>
            </div>

            {requestTab === 'received' && (
              receivedRequests.length === 0 ? (
                <div className="card p-12 text-center bg-slate-50/50 border-dashed">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Inbox Zero</h3>
                  <p className="text-sm text-slate-500">You have no pending connection requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedRequests.map((request) => (
                    <RequestCard key={request.id} request={request} mode="received" />
                  ))}
                </div>
              )
            )}

            {requestTab === 'sent' && (
              sentRequests.length === 0 ? (
                <div className="card p-12 text-center bg-slate-50/50 border-dashed">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No sent requests</h3>
                  <p className="text-sm text-slate-500">You haven't reached out to anyone recently.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <RequestCard key={request.id} request={request} mode="sent" />
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
