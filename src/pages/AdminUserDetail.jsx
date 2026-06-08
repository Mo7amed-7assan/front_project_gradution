import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getUserById, updateUser, deleteUser } from '../services/adminUsers'
import { getVerificationByUserId } from '../services/adminVerification'
import { useAuth } from '../context/AuthContext'

const statusMap = {
  active:    { cls: 'badge-green',  label: 'Active' },
  pending:   { cls: 'badge-yellow', label: 'Pending' },
  suspended: { cls: 'bg-orange-500/10 text-orange-400 border border-orange-500/20 badge', label: 'Suspended' },
  banned:    { cls: 'badge-red',    label: 'Banned' },
  deleted:   { cls: 'badge-slate',  label: 'Deleted' },
}
const roleMap = {
  administrator: { cls: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 badge', label: 'Administrator' },
  moderator:     { cls: 'badge-blue',   label: 'Moderator' },
  regular_user:  { cls: 'badge-slate',  label: 'Regular User' },
  guest:         { cls: 'badge-yellow', label: 'Guest' },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const relativePath = path.startsWith('/') ? path.slice(1) : path;
  if (relativePath.startsWith('storage/')) {
    return `https://cofound.dpdns.org/${relativePath}`;
  }
  return `https://cofound.dpdns.org/storage/${relativePath}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

// ─── Reusable Components from AdminVerificationDetail ────────────────────────

function InfoRow({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm font-semibold text-[var(--text-primary)]">{children}</div>
    </div>
  )
}

function CompareRow({ label, cardValue, userValue }) {
  const cVal = cardValue ? cardValue.toString().trim() : '';
  const uVal = userValue ? userValue.toString().trim() : '';
  const match = cVal && uVal && cVal.toLowerCase() === uVal.toLowerCase();
  const hasValues = cVal && uVal;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3 border-b border-[var(--border-color)]/50 last:border-0 hover:bg-[var(--bg-hover)]/20 px-2 rounded-xl transition-colors duration-150">
      {/* Extracted Document Value */}
      <div className="bg-[var(--bg-hover)]/30 border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm font-semibold text-[var(--text-primary)] text-right shadow-sm truncate">
        {cardValue || <span className="text-[var(--text-hint)] italic font-normal">Not detected</span>}
      </div>

      {/* Matching Status */}
      <div className="text-center min-w-[90px] flex flex-col items-center">
        <div className="text-[9px] font-bold tracking-wider uppercase text-[var(--text-hint)] mb-1">
          {label}
        </div>
        {hasValues ? (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
            match ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {match ? '✓ Match' : '✗ Mismatch'}
          </span>
        ) : (
          <span className="text-[var(--text-hint)] text-sm font-semibold">—</span>
        )}
      </div>

      {/* User Registered Value */}
      <div className="bg-[var(--bg-hover)]/30 border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-sm truncate">
        {userValue || <span className="text-[var(--text-hint)] italic font-normal">Not provided</span>}
      </div>
    </div>
  );
}

function AICheckRow({ label, passed, confidence }) {
  let pct = confidence || 0;
  if (pct > 0 && pct <= 1) {
    pct = Math.round(pct * 100);
  } else {
    pct = Math.round(pct);
  }

  const passedStatus = Boolean(passed);

  return (
    <div className="py-3 border-b border-[var(--border-color)]/50 last:border-0 hover:bg-[var(--bg-hover)]/20 px-2 rounded-xl transition-colors duration-150">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border ${
            passedStatus ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {passedStatus ? '✓' : '✗'}
          </span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
        </div>
        <span className={`text-xs font-bold ${passedStatus ? 'text-emerald-400' : 'text-rose-400'}`}>
          {pct}% Match
        </span>
      </div>
      <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
            passedStatus ? 'from-emerald-400 to-emerald-500' : 'from-rose-400 to-rose-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ImagePreviewBox({ src, label, rotation, onRotate, onZoom }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-2xl overflow-hidden bg-[var(--bg-hover)]/30 border border-[var(--border-color)] aspect-[1.6] flex items-center justify-center group shadow-sm hover:shadow-md transition-all duration-200">
        {src && !imgError ? (
          <img
            src={src}
            alt={label}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        ) : (
          <div className="text-center text-[var(--text-hint)] flex flex-col items-center p-4">
            <span className="text-4xl mb-2">🪪</span>
            <span className="text-xs font-semibold">No Image Available</span>
          </div>
        )}

        {/* Hover overlay with blur controls */}
        {src && !imgError && (
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200 backdrop-blur-[2px]">
            <button
              onClick={onRotate}
              aria-label={`Rotate ${label}`}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-3.5 py-2 text-xs font-bold cursor-pointer transition-all duration-150 backdrop-blur-md flex items-center gap-1.5 shadow-md active:scale-95"
            >
              ↻ Rotate
            </button>
            <button
              onClick={onZoom}
              aria-label={`Zoom ${label}`}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-3.5 py-2 text-xs font-bold cursor-pointer transition-all duration-150 backdrop-blur-md flex items-center gap-1.5 shadow-md active:scale-95"
            >
              ⤢ Zoom
            </button>
          </div>
        )}
      </div>
      <div className="text-center text-xs font-bold tracking-wider uppercase text-[var(--text-hint)]">
        {label}
      </div>
    </div>
  );
}

function ZoomModal({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-slate-950/90 flex items-center justify-center p-6 backdrop-blur-md"
    >
      <button
        onClick={onClose}
        aria-label="Close zoom preview"
        className="absolute top-5 right-6 bg-white/10 hover:bg-white/25 border border-white/20 text-white w-10 h-10 rounded-full text-lg cursor-pointer flex items-center justify-center transition-colors shadow-lg"
      >
        ✕
      </button>
      <img
        src={src}
        alt="Full size document preview"
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10"
      />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [verificationData, setVerificationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [message, setMessage] = useState(null)
  const [formRole, setFormRole] = useState('')
  const [formStatus, setFormStatus] = useState('')

  // Preview and Zoom states for Verification Card
  const [rotationFront, setRotationFront] = useState(0)
  const [rotationBack, setRotationBack] = useState(0)
  const [zoomImage, setZoomImage] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getUserById(id)
        setItem(data)
        setFormRole(data?.role || '')
        setFormStatus(data?.account_status || '')

        // Fetch verification details for this user
        try {
          const verData = await getVerificationByUserId(id)
          setVerificationData(verData)
        } catch (verErr) {
          console.log('No verification record found for this user', verErr)
        }
      } catch (err) {
        console.error('Failed to load user', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user?.id])

  const handleUpdate = async () => {
    setProcessing(true)
    setMessage(null)
    try {
      const payload = {}
      if (formRole && formRole !== item.role) payload.role = formRole
      if (formStatus && formStatus !== item.account_status) payload.account_status = formStatus
      if (Object.keys(payload).length === 0) {
        setMessage({ type: 'info', text: 'No changes to save.' })
        setProcessing(false)
        return
      }
      await updateUser(id, payload)
      const data = await getUserById(id)
      setItem(data)
      setEditMode(false)
      setMessage({ type: 'success', text: 'User updated successfully.' })
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to update user' })
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Soft-delete this user? This action can be reversed.')) return
    setProcessing(true)
    try {
      await deleteUser(id)
      navigate('/admin/users')
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to delete user' })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!item) return <div className="p-8 text-rose-500 font-bold">User not found.</div>

  const statusBadge = statusMap[item.account_status?.toLowerCase()] || { cls: 'badge-slate', label: item.account_status || 'Unknown' }
  const roleBadge   = roleMap[item.role?.toLowerCase()]    || { cls: 'badge-slate', label: item.role || 'Unknown' }
  const initial     = (item.full_name || item.username || 'U').charAt(0).toUpperCase()

  // Parse automated checks
  const automatedChecks = (() => {
    try {
      const raw = verificationData?.automated_checks_data || verificationData?.automated_checks;
      if (raw) {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      }
      if (verificationData && (verificationData.liveness_check_passed !== undefined || verificationData.face_match_score !== undefined)) {
        const obj = {};
        if (verificationData.liveness_check_passed !== undefined && verificationData.liveness_check_passed !== null) {
          obj.liveness_check = {
            passed: verificationData.liveness_check_passed,
            confidence: verificationData.face_match_score !== null ? verificationData.face_match_score : 0
          };
        }
        if (verificationData.face_match_score !== undefined && verificationData.face_match_score !== null) {
          obj.face_match = {
            passed: verificationData.liveness_check_passed || verificationData.face_match_score > 0.8,
            confidence: verificationData.face_match_score
          };
        }
        return Object.keys(obj).length > 0 ? obj : null;
      }
      return null;
    } catch {
      return null;
    }
  })();

  const frontImgSrc = verificationData ? resolveImageUrl(verificationData.id_card_image_front || verificationData.image_front || verificationData.front_image || verificationData.id_card_image) : null;
  const backImgSrc = verificationData ? resolveImageUrl(verificationData.id_card_image_back || verificationData.image_back || verificationData.back_image) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {zoomImage && <ZoomModal src={zoomImage} onClose={() => setZoomImage(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/users" className="text-sm text-[#6C63FF] font-bold flex items-center gap-1 mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to Users
          </Link>
          <h1 className="page-title text-[var(--text-primary)]">User Detail</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditMode(!editMode)
              if (editMode) { setFormRole(item.role); setFormStatus(item.account_status) }
            }}
            className="btn-secondary text-sm"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={handleDelete} disabled={processing} className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50">
            {processing ? <Spinner /> : '🗑️ Soft-Delete'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'}`}>
          {message.text}
        </div>
      )}

      {/* Main User Card */}
      <div className="card p-0 overflow-hidden">
        {/* User Header */}
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#6C63FF] p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-3xl shadow-inner">
            {initial}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{item.full_name || item.name || item.username || 'Unknown'}</h2>
            <p className="text-[#EEEDFF] font-medium mt-0.5">{item.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`${roleBadge.cls} text-xs`}>{roleBadge.label}</span>
              <span className={`${statusBadge.cls} text-xs`}>{statusBadge.label}</span>
              {item.identity_verified && (
                <span className="badge badge-blue text-xs">✅ Verified</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-6">
            <InfoRow label="Username">@{item.username || 'N/A'}</InfoRow>
            <InfoRow label="Location">{item.location || '—'}</InfoRow>
            <InfoRow label="Registered">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown'}</InfoRow>
            <InfoRow label="Last Active">{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Unknown'}</InfoRow>
            <InfoRow label="Verification Level">{item.identity_verification_level || 'None'}</InfoRow>
            <InfoRow label="Identity Verified">{item.identity_verified ? '✅ Yes' : '❌ No'}</InfoRow>
          </div>

          {/* Edit Form */}
          {editMode && (
            <div className="pt-6 border-t border-[var(--border-color)] space-y-4">
              <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">Edit User</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Role</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="form-select">
                    <option value="administrator">Administrator</option>
                    <option value="moderator">Moderator</option>
                    <option value="regular_user">Regular User</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Account Status</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="form-select">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setEditMode(false); setFormRole(item.role); setFormStatus(item.account_status) }} className="btn-secondary flex-1">Discard</button>
                <button onClick={handleUpdate} disabled={processing} className="btn-primary flex-1">
                  {processing ? <Spinner /> : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification / Document Detail Grid in the Same Style as AdminVerificationDetail */}
      {verificationData ? (
        <div className="space-y-6">
          {/* Card 1: Identity Profile Cross-Check */}
          <div className="card p-6">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-5 mb-6">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  🪪 Identity Profile Cross-Check
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Verify extracted metadata against user credentials
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4">
              <div className="text-right text-xs font-bold tracking-wider uppercase text-[#6C63FF]">
                Extracted Document Value
              </div>
              <div className="min-w-[90px]" />
              <div className="text-xs font-bold tracking-wider uppercase text-sky-500">
                Profile Registered Value
              </div>
            </div>

            <CompareRow
              label="Full Name"
              cardValue={verificationData.full_name_on_card}
              userValue={item.full_name || item.name}
            />
            <CompareRow
              label="Date of Birth"
              cardValue={formatDate(verificationData.date_of_birth)}
              userValue={formatDate(item.date_of_birth || item.dob)}
            />
            <CompareRow
              label="Nationality"
              cardValue={verificationData.nationality}
              userValue={item.nationality || item.country}
            />
            <CompareRow
              label="ID Number"
              cardValue={verificationData.id_card_number || verificationData.id_number || verificationData.document_number}
              userValue={item.id_card_number || item.id_number}
            />

            {/* Document metadata info row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-6 border-t border-[var(--border-color)]">
              <InfoRow label="Document Type">
                {verificationData.document_type
                  ? verificationData.document_type.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
                  : (verificationData.submission_method ? `ID Card (${verificationData.submission_method})` : 'ID Card')}
              </InfoRow>
              <InfoRow label="Document Expiry">
                {formatDate(verificationData.expiry_date || verificationData.expiry)}
              </InfoRow>
              <InfoRow label="Issuing Country">
                {verificationData.issuing_country || verificationData.nationality}
              </InfoRow>
              <InfoRow label="Submitted Date">
                {verificationData.created_at || verificationData.submitted_at
                  ? new Date(verificationData.created_at || verificationData.submitted_at).toLocaleString()
                  : 'Unknown'}
              </InfoRow>
            </div>
          </div>

          {/* Card 2: Credential Document Review (Pictures) */}
          <div className="card p-6">
            <div className="mb-6">
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                📄 Credential Document Review
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Rotate document for alignment or zoom to inspect high-definition images.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ImagePreviewBox
                src={frontImgSrc}
                label="Front Side ID Card"
                rotation={rotationFront}
                onRotate={() => setRotationFront(r => (r + 90) % 360)}
                onZoom={() => frontImgSrc && setZoomImage(frontImgSrc)}
              />
              <ImagePreviewBox
                src={backImgSrc}
                label="Back Side ID Card"
                rotation={rotationBack}
                onRotate={() => setRotationBack(r => (r + 90) % 360)}
                onZoom={() => backImgSrc && setZoomImage(backImgSrc)}
              />
            </div>
          </div>

          {/* Card 3: Automated Agent Audit (AI verification checks) */}
          {automatedChecks ? (
            <div className="card p-6">
              <div className="mb-6">
                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  🤖 Automatic Agent Audit
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  System evaluation scores for image comparison and biometric detection
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {automatedChecks.face_match !== undefined && (
                  <AICheckRow
                    label="Face Verification Match"
                    passed={automatedChecks.face_match?.passed ?? automatedChecks.face_match}
                    confidence={automatedChecks.face_match?.confidence ?? (automatedChecks.face_match ? 0.95 : 0.2)}
                  />
                )}
                {automatedChecks.document_authenticity !== undefined && (
                  <AICheckRow
                    label="Document Authenticity Check"
                    passed={automatedChecks.document_authenticity?.passed ?? automatedChecks.document_authenticity}
                    confidence={automatedChecks.document_authenticity?.confidence ?? (automatedChecks.document_authenticity ? 0.9 : 0.3)}
                  />
                )}
                {automatedChecks.liveness_check !== undefined && (
                  <AICheckRow
                    label="Biometric Liveness Verification"
                    passed={automatedChecks.liveness_check?.passed ?? automatedChecks.liveness_check}
                    confidence={automatedChecks.liveness_check?.confidence ?? (automatedChecks.liveness_check ? 0.88 : 0.25)}
                  />
                )}
                {automatedChecks.name_match !== undefined && (
                  <AICheckRow
                    label="Optical Character Name Cross-Match"
                    passed={automatedChecks.name_match?.passed ?? automatedChecks.name_match}
                    confidence={automatedChecks.name_match?.confidence ?? (automatedChecks.name_match ? 0.92 : 0.35)}
                  />
                )}
                {automatedChecks.data_consistency !== undefined && (
                  <AICheckRow
                    label="Metadata Profile Consistency"
                    passed={automatedChecks.data_consistency?.passed ?? automatedChecks.data_consistency}
                    confidence={automatedChecks.data_consistency?.confidence ?? (automatedChecks.data_consistency ? 0.87 : 0.3)}
                  />
                )}
                {Object.entries(automatedChecks)
                  .filter(([key]) => !['face_match', 'document_authenticity', 'liveness_check', 'name_match', 'data_consistency'].includes(key))
                  .map(([key, val]) => (
                    <AICheckRow
                      key={key}
                      label={key.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      passed={typeof val === 'object' ? val?.passed : Boolean(val)}
                      confidence={typeof val === 'object' ? val?.confidence : (val ? 0.85 : 0.2)}
                    />
                  ))}
              </div>
            </div>
          ) : (
            <div className="card p-8 border-dashed border-2 border-[var(--border-color)] bg-[var(--bg-hover)]/10 flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2">🤖</span>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">No automated checks run</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
                This dossier lacks OCR and biometric computer vision reports. Manual review required.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-8 border-dashed border-2 border-[var(--border-color)] bg-[var(--bg-hover)]/10 flex flex-col items-center justify-center text-center">
          <span className="text-3xl mb-2">🪪</span>
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">No Verification Submitted</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
            This customer has not submitted any identity verification document or liveness check yet.
          </p>
        </div>
      )}
    </div>
  )
}
