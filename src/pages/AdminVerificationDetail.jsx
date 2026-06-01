import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import {
  getVerificationById,
  claimVerification,
  escalateVerification,
  reviewVerification,
} from '../services/adminVerification';
import { useAuth } from '../context/AuthContext';

// ─── Status Map Configuration ───────────────────────────────────────────────
const statusMap = {
  pending:   { cls: 'bg-amber-50 text-amber-700 border border-amber-200 shadow-amber-100/50', label: 'Pending Review', icon: '⏳' },
  approved:  { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-emerald-100/50', label: 'Approved', icon: '✅' },
  rejected:  { cls: 'bg-rose-50 text-rose-700 border border-rose-200 shadow-rose-100/50', label: 'Rejected', icon: '❌' },
  submitted: { cls: 'bg-blue-50 text-blue-700 border border-blue-200 shadow-blue-100/50', label: 'Submitted', icon: '📤' },
};

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

// ─── Reusable Components ─────────────────────────────────────────────────────

function InfoRow({ label, value, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-800">
        {children || value || <span className="text-slate-300 italic">N/A</span>}
      </span>
    </div>
  );
}

function CompareRow({ label, cardValue, userValue }) {
  const cVal = cardValue ? cardValue.toString().trim() : '';
  const uVal = userValue ? userValue.toString().trim() : '';
  const match = cVal && uVal && cVal.toLowerCase() === uVal.toLowerCase();
  const hasValues = cVal && uVal;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 px-2 rounded-xl transition-colors duration-150">
      {/* Extracted Document Value */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 text-right shadow-sm truncate">
        {cardValue || <span className="text-slate-300 italic font-normal">Not detected</span>}
      </div>

      {/* Matching Status */}
      <div className="text-center min-w-[90px] flex flex-col items-center">
        <div className="text-[9px] font-bold tracking-wider uppercase text-slate-400 mb-1">
          {label}
        </div>
        {hasValues ? (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
            match ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}>
            {match ? '✓ Match' : '✗ Mismatch'}
          </span>
        ) : (
          <span className="text-slate-300 text-sm font-semibold">—</span>
        )}
      </div>

      {/* User Registered Value */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm truncate">
        {userValue || <span className="text-slate-300 italic font-normal">Not provided</span>}
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
    <div className="py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 px-2 rounded-xl transition-colors duration-150">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border ${
            passedStatus ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
          }`}>
            {passedStatus ? '✓' : '✗'}
          </span>
          <span className="text-sm font-semibold text-slate-700">{label}</span>
        </div>
        <span className={`text-xs font-bold ${passedStatus ? 'text-emerald-600' : 'text-rose-600'}`}>
          {pct}% Match
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
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
      <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 aspect-[1.6] flex items-center justify-center group shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
        {src && !imgError ? (
          <img
            src={src}
            alt={label}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        ) : (
          <div className="text-center text-slate-400 flex flex-col items-center p-4">
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
      <div className="text-center text-xs font-bold tracking-wider uppercase text-slate-400">
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

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9998] bg-slate-950/60 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center transform scale-100 transition-transform">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-center text-sm font-semibold text-slate-800 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm transition-all shadow-sm active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-all shadow-md active:scale-95 shadow-rose-500/20"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminVerificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Preserved States ──
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [decision, setDecision] = useState('approve');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState(null);

  // ── New States ──
  const [rotationFront, setRotationFront] = useState(0);
  const [rotationBack, setRotationBack] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [confirmEscalate, setConfirmEscalate] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  // ── Fetch Verification Data ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVerificationById(id);
      setData(res);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load verification detail.' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, user?.id]);

  // ── Parse Automated Checks Safely ──
  const automatedChecks = (() => {
    try {
      const raw = data?.automated_checks_data || data?.automated_checks;
      if (raw) {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      }
      
      // Fallback to root level fields if no nested automated_checks
      if (data && (data.liveness_check_passed !== undefined || data.face_match_score !== undefined)) {
        const obj = {};
        if (data.liveness_check_passed !== undefined && data.liveness_check_passed !== null) {
          obj.liveness_check = {
            passed: data.liveness_check_passed,
            confidence: data.face_match_score !== null ? data.face_match_score : 0
          };
        }
        if (data.face_match_score !== undefined && data.face_match_score !== null) {
          obj.face_match = {
            passed: data.liveness_check_passed || data.face_match_score > 0.8, // assume pass if score is high
            confidence: data.face_match_score
          };
        }
        return Object.keys(obj).length > 0 ? obj : null;
      }
      return null;
    } catch {
      return null;
    }
  })();

  // ── Preserved Handlers ──
  const handleClaim = async () => {
    setProcessing(true);
    setMessage(null);
    try {
      await claimVerification(id);
      setMessage({ type: 'success', text: 'Verification claimed successfully.' });
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to claim verification.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleEscalate = async () => {
    setConfirmEscalate(false);
    setProcessing(true);
    setMessage(null);
    try {
      await escalateVerification(id);
      setMessage({ type: 'success', text: 'Verification escalated successfully.' });
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to escalate verification.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReview = async () => {
    setConfirmReject(false);
    
    // Strict Validation Checks
    const errors = {};
    if (!decision) {
      errors.decision = 'Please select a review decision.';
    }
    if ((decision === 'reject' || decision === 'request_more_info') && notes.trim().length < 10) {
      errors.notes = 'Reason/notes (minimum 10 characters) are required for rejection or requesting more info.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);
    setProcessing(true);
    setMessage(null);

    try {
      let review_action = '';
      if (decision === 'approve') review_action = 'approved';
      else if (decision === 'reject') review_action = 'rejected';
      else if (decision === 'request_more_info') review_action = 'request_resubmission';

      const payload = {
        review_action,
        review_notes: notes || null
      };

      await reviewVerification(id, payload);
      navigate('/admin/verifications');
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to submit verification review.'
      });
    } finally {
      setProcessing(false);
      setIsSubmitting(false);
    }
  };

  // ── Action trigger with validations ──
  const handleDecisionClick = () => {
    const errors = {};
    if (!decision) {
      errors.decision = 'Please select a decision.';
    }
    if ((decision === 'reject' || decision === 'request_more_info') && notes.trim().length < 10) {
      errors.notes = 'Reason/notes (minimum 10 characters) are required for this decision.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors({});
    if (decision === 'reject') {
      setConfirmReject(true);
    } else {
      handleReview();
    }
  };

  // ── Loading / Empty States ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Spinner />
        <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading identity verification detail...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center p-8 bg-rose-50 border border-rose-100 rounded-3xl shadow-sm">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-lg font-bold text-rose-800 mt-3">Verification ID Not Found</h2>
        <p className="text-sm text-rose-600 mt-1">This verification submission does not exist or has been deleted.</p>
        <Link to="/admin/verifications" className="btn-primary mt-6">
          Back to list
        </Link>
      </div>
    );
  }

  // ── Field Mappings ──
  const status = data.status || data.verification_status || 'pending';
  const badge = statusMap[status.toLowerCase()] || { cls: 'bg-slate-100 text-slate-700', label: status, icon: '📋' };
  
  const userName = data.user?.full_name || data.user?.name || data.user_id || 'Unknown User';

  const frontImgSrc = resolveImageUrl(
    data.id_card_image_front_url ||
    data.id_card_image_front ||
    data.document_front_image_url ||
    data.documents?.front ||
    data.document_front ||
    null
  );
  
  const backImgSrc = resolveImageUrl(
    data.id_card_image_back_url ||
    data.id_card_image_back ||
    data.document_back_image_url ||
    data.documents?.back ||
    data.document_back ||
    null
  );

  return (
    <>
      {/* Dynamic Popups */}
      {zoomImage && <ZoomModal src={zoomImage} onClose={() => setZoomImage(null)} />}
      
      {confirmEscalate && (
        <ConfirmDialog
          message="Are you sure you want to escalate this verification file to administrator-level review? This indicates that standard automatic or manual validation is inconclusive."
          onConfirm={handleEscalate}
          onCancel={() => setConfirmEscalate(false)}
        />
      )}

      {confirmReject && (
        <ConfirmDialog
          message="Confirm rejection of this customer's verification. The customer will receive an alert detailing your notes so they can rectify their submission."
          onConfirm={handleReview}
          onCancel={() => setConfirmReject(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        
        {/* ── TOP HEADER BAR ── */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-6 border-b border-slate-200/60 mb-8">
          <div>
            <Link
              to="/admin/verifications"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primaryDark hover:text-brand-primary transition-colors mb-2"
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Verification Log
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Verification Review
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClaim}
              disabled={processing || status.toLowerCase() === 'approved'}
              className="btn-secondary flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              🤝 Claim Review
            </button>
            <button
              onClick={() => setConfirmEscalate(true)}
              disabled={processing}
              className="btn-secondary flex items-center gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50 active:scale-95"
            >
              ⬆️ Escalate File
            </button>
          </div>
        </header>

        {/* ── Alert message feedback ── */}
        {message && (
          <div className={`p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2 border shadow-sm ${
            message.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-rose-100/30'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-emerald-100/30'
          }`}>
            <span>{message.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{message.text}</span>
          </div>
        )}

        {/* ── Bento Grid Main Area (65/35 Layout) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          
          {/* ════ MAIN BLOCK (65%) ════ */}
          <div className="flex flex-col gap-6">
            
            {/* Bento Card 1: Identity Comparison */}
            <div className="card p-6 md:p-8 hover:shadow-md transition-all duration-300 border border-slate-200/60 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
                <div>
                  <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                    🪪 Identity Profile Cross-Check
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Verify extracted metadata against user credentials
                  </p>
                </div>
                <span className={`badge ${badge.cls} flex items-center gap-1 px-3 py-1 shadow-sm`}>
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </span>
              </div>

              {/* Grid headers */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-4">
                <div className="text-right text-xs font-black tracking-wider uppercase text-brand-primaryDark">
                  Extracted Document Value
                </div>
                <div className="min-w-[90px]" />
                <div className="text-xs font-black tracking-wider uppercase text-sky-600">
                  Profile Registered Value
                </div>
              </div>

              {/* Check fields */}
              <CompareRow
                label="Full Name"
                cardValue={data.full_name_on_card}
                userValue={data.user?.full_name || data.user?.name}
              />
              <CompareRow
                label="Date of Birth"
                cardValue={formatDate(data.date_of_birth)}
                userValue={formatDate(data.user?.date_of_birth || data.user?.dob)}
              />
              <CompareRow
                label="Nationality"
                cardValue={data.nationality}
                userValue={data.user?.nationality || data.user?.country}
              />
              <CompareRow
                label="ID Number"
                cardValue={data.id_card_number || data.id_number || data.document_number}
                userValue={data.user?.id_card_number || data.user?.id_number}
              />

              {/* Meta information details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-6 border-t border-slate-100">
                <InfoRow label="Document Type">
                  {data.document_type
                    ? data.document_type.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
                    : (data.submission_method ? `ID Card (${data.submission_method})` : 'ID Card')}
                </InfoRow>
                <InfoRow label="Document Expiry">
                  {formatDate(data.expiry_date || data.expiry)}
                </InfoRow>
                <InfoRow label="Issuing Country">
                  {data.issuing_country || data.nationality}
                </InfoRow>
                <InfoRow label="Submitted Date">
                  {data.created_at || data.submitted_at
                    ? new Date(data.created_at || data.submitted_at).toLocaleString()
                    : 'Unknown'}
                </InfoRow>
              </div>
            </div>

            {/* Bento Card 2: Document Previews */}
            <div className="card p-6 md:p-8 hover:shadow-md transition-all duration-300 border border-slate-200/60 bg-white">
              <div className="mb-6">
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  📄 Credential Document Review
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Rotate document for alignment or zoom to inspect high-definition holograms and signatures.
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

            {/* Bento Card 3: Automated AI Analysis */}
            {automatedChecks ? (
              <div className="card p-6 md:p-8 hover:shadow-md transition-all duration-300 border border-slate-200/60 bg-white">
                <div className="mb-6">
                  <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                    🤖 Automatic Agent Audit
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
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
                  
                  {/* Dynamic render for other keys in JSON */}
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
              <div className="card p-8 border-dashed border-2 border-slate-200/80 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                <span className="text-3xl mb-2">🤖</span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No automated checks run</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  This dossier lacks OCR and biometric computer vision reports. Manual review required.
                </p>
              </div>
            )}

          </div>

          {/* ════ SIDEBAR (35%) ════ */}
          <div className="flex flex-col gap-6">

            {/* Sidebar Card 1: LinkedIn-style User Profile */}
            <div className="card overflow-hidden hover:shadow-md transition-all duration-300 border border-slate-200/60 bg-white">
              {/* Cover Banner */}
              <div className="h-16 bg-gradient-to-r from-brand-primary to-indigo-600 w-full" />
              
              <div className="px-6 pb-6 text-center">
                {/* Overlapping Avatar */}
                <div className="relative inline-block -mt-10 mb-3">
                  <img
                    src={
                      resolveImageUrl(data.user?.profile_picture_url || data.user?.avatar) ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=EEEDFF&color=4F46E5&size=128`
                    }
                    alt={userName}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=EEEDFF&color=4F46E5&size=128`;
                    }}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  />
                  <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    status === 'approved' ? 'bg-emerald-500' : status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                </div>

                <h3 className="text-base font-black text-slate-800 flex items-center justify-center gap-1.5">
                  {userName}
                  {status === 'approved' && (
                    <span className="text-sky-500 text-sm" title="Verified Customer">
                      🛡️
                    </span>
                  )}
                </h3>
                
                <p className="text-xs text-slate-400">
                  @{data.user?.username || 'no-username'}
                </p>
                
                {data.user?.email && (
                  <p className="text-xs text-slate-300 mt-1 select-all">
                    {data.user.email}
                  </p>
                )}

                {data.user?.bio && (
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed border-t border-slate-50 pt-3">
                    "{data.user.bio}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 text-left mt-6 pt-4 border-t border-slate-100">
                  <InfoRow label="Profile ID">
                    <span className="font-mono text-[10px] break-all truncate block max-w-[120px]">
                      {data.user?.id || data.user_id}
                    </span>
                  </InfoRow>
                  <InfoRow label="Joined Date">
                    {data.user?.created_at ? new Date(data.user.created_at).toLocaleDateString() : 'N/A'}
                  </InfoRow>
                </div>

                {/* Social Connects */}
                {(data.user?.linkedin_url || data.user?.github_url || data.user?.website_url) && (
                  <div className="flex justify-center gap-3.5 mt-5 border-t border-slate-50 pt-4">
                    {data.user?.linkedin_url && (
                      <a href={data.user.linkedin_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    )}
                    {data.user?.github_url && (
                      <a href={data.user.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                    {data.user?.website_url && (
                      <a href={data.user.website_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-primaryDark transition-colors">
                        <svg className="w-5 h-5 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}

                <Link
                  to={`/admin/users/${data.user?.id || data.user_id}`}
                  className="mt-6 w-full inline-flex items-center justify-center py-2 bg-slate-50 hover:bg-brand-primaryLight border border-slate-200 text-slate-700 hover:text-brand-primaryDark text-xs font-bold rounded-xl transition-all duration-150 active:scale-95"
                >
                  View Complete Profile →
                </Link>
              </div>
            </div>

            {/* Sidebar Card 2: Sticky Decision Bar */}
            <div className="lg:sticky lg:top-6 flex flex-col gap-6">
              
              <div className="card p-6 border-brand-primary/25 shadow-md bg-white ring-1 ring-brand-primary/5">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  ⚖️ Adjudication Review
                </h3>

                {/* Validation Banner */}
                {validationErrors.decision && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl mb-4">
                    ⚠️ {validationErrors.decision}
                  </div>
                )}

                {/* Radio Choices */}
                <div className="flex flex-col gap-2 mb-4">
                  {[
                    { value: 'approve', label: '✅ Approve Verification', color: 'text-emerald-600', activeCls: 'border-emerald-500 bg-emerald-50/50 text-emerald-700 ring-2 ring-emerald-500/20' },
                    { value: 'request_more_info', label: '🔄 Request More Info', color: 'text-amber-600', activeCls: 'border-amber-500 bg-amber-50/50 text-amber-700 ring-2 ring-amber-500/20' },
                    { value: 'reject', label: '❌ Reject Customer', color: 'text-rose-600', activeCls: 'border-rose-500 bg-rose-50/50 text-rose-700 ring-2 ring-rose-500/20' },
                  ].map(opt => {
                    const isSelected = decision === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? opt.activeCls
                            : 'border-slate-100 hover:border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="decision"
                          value={opt.value}
                          checked={isSelected}
                          onChange={e => {
                            setDecision(e.target.value);
                            setValidationErrors(prev => ({ ...prev, decision: null }));
                          }}
                          className="w-4 h-4 focus:ring-0 cursor-pointer hidden"
                        />
                        <span className="font-extrabold text-sm">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Action Notes */}
                <div className="mb-5">
                  <label className="form-label text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
                    <span>Decision notes / reason</span>
                    {(decision === 'reject' || decision === 'request_more_info') && (
                      <span className="text-rose-500 text-[10px] lowercase font-normal">(required)</span>
                    )}
                  </label>
                  
                  <textarea
                    value={notes}
                    onChange={e => {
                      setNotes(e.target.value);
                      if (validationErrors.notes) {
                        setValidationErrors(prev => ({ ...prev, notes: null }));
                      }
                    }}
                    className={`form-input mt-1.5 focus:ring-brand-primary min-h-[90px] ${
                      validationErrors.notes ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
                    }`}
                    rows={4}
                    placeholder={
                      decision === 'reject'
                        ? 'Required: Specify card mismatch, blurry photos, or expired document details...'
                        : decision === 'request_more_info'
                        ? 'Required: Detail exactly which images or values the customer needs to re-upload...'
                        : 'Optional: Write validation metadata or notes for internal moderator logs...'
                    }
                  />

                  {validationErrors.notes && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-2 flex items-center gap-1">
                      <span>⚠️</span> {validationErrors.notes}
                    </p>
                  )}
                </div>

                {/* Submit action */}
                <button
                  onClick={handleDecisionClick}
                  disabled={isSubmitting || processing}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-md ${
                    decision === 'approve'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/20'
                      : decision === 'reject'
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/20'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20'
                  }`}
                >
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    <>
                      {decision === 'approve' && '✅ Execute Approval'}
                      {decision === 'reject' && '❌ Reject Submission'}
                      {decision === 'request_more_info' && '🔄 Request Re-submission'}
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}