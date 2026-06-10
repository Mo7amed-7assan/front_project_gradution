import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

const statusConfig = {
  accepted:  { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',  dot: 'bg-emerald-500' },
  pending:   { bg: 'bg-amber-50 text-amber-700 border-amber-200',        dot: 'bg-amber-500' },
  declined:  { bg: 'bg-rose-50 text-rose-700 border-rose-200',           dot: 'bg-rose-500' },
  rejected:  { bg: 'bg-rose-50 text-rose-700 border-rose-200',           dot: 'bg-rose-500' },
  withdrawn: { bg: 'bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border-color)]',       dot: 'bg-slate-400' },
  expired:   { bg: 'bg-[var(--bg-hover)] text-[var(--text-secondary)] border-[var(--border-color)]',       dot: 'bg-slate-400' },
}

const getStatusConfig = (status) => statusConfig[`${status || 'pending'}`.toLowerCase()] || statusConfig.pending

const formatLabel = (value, fallback = 'Member') => `${value || fallback}`.replaceAll('_', ' ')

const isPending = (status) => !status || `${status}`.toLowerCase() === 'pending'

const getPersonName = (person, fallback) => {
  if (!person || typeof person !== 'object') return fallback
  return person.full_name || person.name || person.username || fallback
}

const getProjectId = (invitation) =>
  invitation?.project?.id || invitation?.project?.uuid || invitation?.project_id || invitation?.project_uuid

const getProjectTitle = (invitation) =>
  invitation?.project?.title || invitation?.project?.name || `Project ${getProjectId(invitation) || ''}`.trim()

function InvitationCard({ invitation, mode, processing, handleRespond, handleWithdraw }) {
  const projectId = getProjectId(invitation)
  const person = mode === 'sent' ? invitation.recipient || invitation.invitee : invitation.sender || invitation.inviter
  const personFallback = mode === 'sent' ? 'someone' : 'Someone'
  const status = invitation.status || 'pending'
  const sc = getStatusConfig(status)
  const isProcessing = processing === invitation.id
  const personName = getPersonName(person, personFallback)
  const initial = personName.charAt(0).toUpperCase()

  return (
    <div className="card p-5 hover:border-brand-primary/30 transition-colors group">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primaryLight to-brand-primary flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm">
          {initial}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[var(--text-primary)] text-base">
            {mode === 'sent'
              ? <>You invited <span className="text-brand-primary">{personName}</span></>
              : <><span className="text-brand-primary">{personName}</span> invited you</>
            }
          </p>

          <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[var(--text-hint)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            {projectId ? (
              <Link to={`/projects/${projectId}`} className="text-brand-primary font-semibold hover:underline">
                {getProjectTitle(invitation)}
              </Link>
            ) : (
              <span className="font-semibold text-[var(--text-primary)]">{getProjectTitle(invitation)}</span>
            )}
          </p>

          {invitation.message && (
            <div className="mt-2 p-3 bg-[var(--bg-hover)] rounded-xl border border-[var(--border-color)] text-sm text-[var(--text-secondary)] italic">
              "{invitation.message}"
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${sc.bg} capitalize`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
              {formatLabel(status, 'Pending')}
            </span>
            {(invitation.invitation_type || invitation.role) && (
              <span className="text-xs font-bold text-[var(--text-secondary)] px-2.5 py-1 bg-[var(--bg-hover)] rounded-full capitalize">
                {formatLabel(invitation.invitation_type || invitation.role)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {mode === 'received' && isPending(invitation.status) && (
            <>
              <button
                onClick={() => handleRespond(invitation.id, 'accepted')}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/20"
              >
                {isProcessing ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                )}
                Accept
              </button>
              <button
                onClick={() => handleRespond(invitation.id, 'declined')}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-hover)] hover:bg-rose-50 text-[var(--text-secondary)] hover:text-rose-600 border border-[var(--border-color)] hover:border-rose-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Decline
              </button>
            </>
          )}
          {mode === 'sent' && isPending(invitation.status) && (
            <button
              onClick={() => handleWithdraw(invitation.id)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-hover)] hover:bg-slate-200 text-[var(--text-secondary)] rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isProcessing ? '...' : 'Withdraw'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function InvitationsUI({
  received,
  sent,
  loading,
  error,
  activeTab,
  setActiveTab,
  processing,
  handleRespond,
  handleWithdraw
}) {
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-10 bg-[var(--bg-hover)] rounded-2xl w-48 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-hover)] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-[var(--bg-hover)] rounded-xl w-2/5" />
                <div className="h-4 bg-[var(--bg-hover)] rounded-xl w-1/3" />
                <div className="h-6 bg-[var(--bg-hover)] rounded-full w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const tabs = [
    { id: 'received', label: 'Received', count: received.length, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg> },
    { id: 'sent',     label: 'Sent',     count: sent.length,     icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> },
  ]

  const currentList = activeTab === 'received' ? received : sent
  const pendingCount = received.filter(i => isPending(i.status)).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">Invitations</h1>
          <p className="page-subtitle">Manage your incoming and outgoing project invitations.</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold px-4 py-2.5 rounded-2xl self-start">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {pendingCount} pending
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-hover)] p-1 rounded-2xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--bg-surface)] text-brand-primary shadow-sm shadow-slate-200'
                : 'text-[var(--text-secondary)] hover:text-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === tab.id ? 'bg-brand-primary text-white' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="card text-center py-20 px-4 border-2 border-dashed border-[var(--border-color)]">
          <div className="w-20 h-20 bg-[var(--bg-hover)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border-color)] shadow-sm">
            {activeTab === 'received'
              ? <svg className="w-9 h-9 text-[var(--text-hint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              : <svg className="w-9 h-9 text-[var(--text-hint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            }
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            {activeTab === 'received' ? 'No received invitations' : 'No sent invitations'}
          </h3>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
            {activeTab === 'received'
              ? 'When project owners invite you to collaborate, invitations will appear here.'
              : 'Invitations you send to collaborators will appear here.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              mode={activeTab}
              processing={processing}
              handleRespond={handleRespond}
              handleWithdraw={handleWithdraw}
            />
          ))}
        </div>
      )}
    </div>
  )
}
