import React from 'react'
import Spinner from '../../components/Spinner'

export default function IdentityVerificationUI({
  status,
  form,
  images,
  cameraActive,
  currentCapture,
  videoRef,
  canvasRef,
  submitting,
  error,
  handleChange,
  startCamera,
  captureImage,
  stopCamera,
  handleSubmit
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">Identity Verification</h1>
          <p className="page-subtitle">Securely verify your identity to unlock all Co-Found features.</p>
        </div>
        <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
           End-to-End Encrypted
        </div>
      </div>

      {/* Status Banner */}
      {status && (
        <div className="card p-5 border-l-4 border-l-brand-primaryLight bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
               {status.verification_status === 'approved' ? (
                 <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               ) : status.verification_status === 'rejected' ? (
                 <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               ) : (
                 <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 mb-1">
                Verification Status: <span className="capitalize text-brand-primary">{status.status_label || status.verification_status}</span>
              </p>
              {status.rejection_reason ? (
                <p className="text-sm text-rose-600 font-medium">{status.rejection_reason}</p>
              ) : (
                <p className="text-xs text-slate-500">Your information is being processed securely. This may take up to 24 hours.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
           <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Document Uploads */}
        <div className="card overflow-hidden border-brand-primaryLight shadow-sm">
           <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center text-sm shadow-sm">1</div>
             <h2 className="text-lg font-bold text-brand-secondary">Document Capture</h2>
           </div>
           
           <div className="p-6 md:p-8">
             <p className="text-sm text-slate-500 mb-6">Please provide clear photos of your official ID card or passport. Make sure all text is readable and corners are visible.</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Front */}
               <div>
                 <label className="form-label mb-2 flex items-center justify-between">
                   <span>ID Card Front</span>
                   {images.front && <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Captured</span>}
                 </label>
                 <div className={`relative rounded-2xl overflow-hidden border-2 border-dashed ${images.front ? 'border-emerald-200' : 'border-slate-300'} bg-slate-50 aspect-video flex items-center justify-center group transition-colors`}>
                   {images.front ? (
                     <>
                       <img src={images.front} alt="Front" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button type="button" onClick={()=>startCamera('front')} className="btn-secondary text-xs">Retake Photo</button>
                       </div>
                     </>
                   ) : (
                     <div className="text-center p-4">
                       <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-primaryLight transition-colors">
                         <svg className="w-6 h-6 text-slate-400 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       </div>
                       <button type="button" onClick={()=>startCamera('front')} className="btn-primary text-xs w-full shadow-sm">Capture Front</button>
                     </div>
                   )}
                 </div>
               </div>
               
               {/* Back */}
               <div>
                 <label className="form-label mb-2 flex items-center justify-between">
                   <span>ID Card Back</span>
                   {images.back && <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Captured</span>}
                 </label>
                 <div className={`relative rounded-2xl overflow-hidden border-2 border-dashed ${images.back ? 'border-emerald-200' : 'border-slate-300'} bg-slate-50 aspect-video flex items-center justify-center group transition-colors`}>
                   {images.back ? (
                     <>
                       <img src={images.back} alt="Back" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button type="button" onClick={()=>startCamera('back')} className="btn-secondary text-xs">Retake Photo</button>
                       </div>
                     </>
                   ) : (
                     <div className="text-center p-4">
                       <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-primaryLight transition-colors">
                         <svg className="w-6 h-6 text-slate-400 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       </div>
                       <button type="button" onClick={()=>startCamera('back')} className="btn-primary text-xs w-full shadow-sm">Capture Back</button>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Step 2: Personal Information */}
        <div className="card overflow-hidden border-brand-primaryLight shadow-sm">
           <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center text-sm shadow-sm">2</div>
             <h2 className="text-lg font-bold text-brand-secondary">Personal Information</h2>
           </div>
           
           <div className="p-6 md:p-8 space-y-5">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                 <label className="form-label">Full Name exactly as on ID</label>
                 <input value={form.full_name_on_card} onChange={handleChange('full_name_on_card')} required className="form-input bg-slate-50" placeholder="e.g. John Doe" />
               </div>
               <div>
                 <label className="form-label">Document ID Number</label>
                 <input value={form.id_card_number} onChange={handleChange('id_card_number')} className="form-input bg-slate-50" placeholder="e.g. AB1234567" />
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <div>
                 <label className="form-label">Date of Birth</label>
                 <input type="date" value={form.date_of_birth} onChange={handleChange('date_of_birth')} required className="form-input bg-slate-50" />
               </div>
               <div>
                 <label className="form-label">Nationality</label>
                 <input value={form.nationality} onChange={handleChange('nationality')} className="form-input bg-slate-50" placeholder="e.g. US" />
               </div>
               <div>
                 <label className="form-label">Expiry Date</label>
                 <input type="date" value={form.expiry_date} onChange={handleChange('expiry_date')} className="form-input bg-slate-50" />
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
               <div>
                 <label className="form-label">Submission Method</label>
                 <select value={form.submission_method} onChange={handleChange('submission_method')} required className="form-select bg-slate-50">
                   <option value="webcam">Webcam Capture</option>
                   <option value="mobile_capture">Mobile Device</option>
                 </select>
               </div>
               <div>
                 <label className="form-label flex items-center gap-2">
                    Liveness Verification Data
                    <span className="text-[9px] uppercase tracking-wider bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Optional</span>
                 </label>
                 <textarea value={form.liveness_check_data} onChange={handleChange('liveness_check_data')} className="form-input bg-slate-50 resize-none h-11" rows={1} placeholder="Developer SDK output..." />
               </div>
             </div>
           </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={submitting || (!images.front || !images.back)} className="btn-primary px-8 py-3 text-base shadow-brand-primary/30">
            {submitting ? <Spinner /> : 'Submit Verification'}
          </button>
        </div>
      </form>

      {/* Camera Modal Overlay */}
      {cameraActive && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full flex flex-col items-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Align Your Document</h3>
            <p className="text-sm text-slate-500 mb-6 text-center">Please make sure the entire document is visible and well-lit.</p>
            
            <div className="relative w-full aspect-[1.58] bg-black rounded-2xl overflow-hidden mb-6 shadow-inner">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
              <div className="absolute inset-0 border-4 border-white/20 m-6 rounded-xl border-dashed"></div>
            </div>
            
            <canvas ref={canvasRef} className="hidden"></canvas>
            
            <div className="flex w-full gap-3">
              <button type="button" onClick={stopCamera} className="btn-secondary flex-1 py-3 text-base">Cancel</button>
              <button type="button" onClick={captureImage} className="btn-primary flex-1 py-3 text-base">Capture Photo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
