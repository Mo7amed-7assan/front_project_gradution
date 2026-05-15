import React, { useEffect, useState, useRef } from 'react'
import { submitVerification, getVerificationStatus } from '../services/verification'

export default function IdentityVerification(){
  const [status, setStatus] = useState(null)
  const [form, setForm] = useState({
    id_card_number: '',
    full_name_on_card: '',
    date_of_birth: '',
    nationality: '',
    expiry_date: '',
    submission_method: 'webcam',
    liveness_check_data: ''
  })
  const [images, setImages] = useState({ front: null, back: null, selfie: null })
  const [cameraActive, setCameraActive] = useState(false)
  const [currentCapture, setCurrentCapture] = useState(null) // 'front', 'back', 'selfie'
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fetchStatus = async () => {
    try {
      const res = await getVerificationStatus()
      setStatus(res?.data?.data)
    } catch (err) {
      // No existing verification
    }
  }

  useEffect(()=>{ fetchStatus() }, [])

  const handleChange = (k) => (e) => setForm(f=>({ ...f, [k]: e.target.value }))

  const startCamera = async (type) => {
    setCurrentCapture(type)
    setCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
    } catch (err) {
      alert('Camera access denied')
    }
  }

  const captureImage = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/png')
    setImages(prev => ({ ...prev, [currentCapture]: dataUrl }))
    stopCamera()
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
    setCameraActive(false)
    setCurrentCapture(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (!images.front || !images.back) {
        setError('Please capture both the front and back of your ID document.')
        setSubmitting(false)
        return
      }

      const formData = new FormData()
      formData.append('id_card_number', form.id_card_number)
      formData.append('full_name_on_card', form.full_name_on_card)
      formData.append('date_of_birth', form.date_of_birth)
      formData.append('nationality', form.nationality)
      formData.append('expiry_date', form.expiry_date)
      formData.append('submission_method', form.submission_method)
      if (form.liveness_check_data) {
        formData.append('liveness_check_data', form.liveness_check_data)
      }

      const frontFile = createFileFromDataURL(images.front, 'id_card_front.png')
      formData.append('id_card_image_front', frontFile)
      const backFile = createFileFromDataURL(images.back, 'id_card_back.png')
      formData.append('id_card_image_back', backFile)
      if (images.selfie) {
        const selfieFile = createFileFromDataURL(images.selfie, 'selfie.png')
        formData.append('selfie_image', selfieFile)
      }

      await submitVerification(formData)
      alert('Verification submitted')
      fetchStatus()
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally { setSubmitting(false) }
  }

  const createFileFromDataURL = (dataURL, filename) => {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Identity Verification</h2>
      {status && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p><strong>Status:</strong> {status.status}</p>
          {status.review_notes && <p><strong>Notes:</strong> {status.review_notes}</p>}
        </div>
      )}
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Card Number</label>
            <input value={form.id_card_number} onChange={handleChange('id_card_number')} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name on Card</label>
            <input value={form.full_name_on_card} onChange={handleChange('full_name_on_card')} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" value={form.date_of_birth} onChange={handleChange('date_of_birth')} required className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nationality</label>
            <input value={form.nationality} onChange={handleChange('nationality')} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input type="date" value={form.expiry_date} onChange={handleChange('expiry_date')} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Liveness Check Data</label>
          <textarea value={form.liveness_check_data} onChange={handleChange('liveness_check_data')} className="mt-1 block w-full border rounded px-3 py-2" rows={3} placeholder="JSON from liveness SDK" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Card Front</label>
            {images.front ? (
              <img src={images.front} alt="Front" className="w-full h-32 object-cover border rounded" />
            ) : (
              <button type="button" onClick={()=>startCamera('front')} className="mt-1 block w-full bg-blue-600 text-white px-4 py-2 rounded">Capture Front</button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Card Back</label>
            {images.back ? (
              <img src={images.back} alt="Back" className="w-full h-32 object-cover border rounded" />
            ) : (
              <button type="button" onClick={()=>startCamera('back')} className="mt-1 block w-full bg-blue-600 text-white px-4 py-2 rounded">Capture Back</button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Selfie</label>
            {images.selfie ? (
              <img src={images.selfie} alt="Selfie" className="w-full h-32 object-cover border rounded" />
            ) : (
              <button type="button" onClick={()=>startCamera('selfie')} className="mt-1 block w-full bg-blue-600 text-white px-4 py-2 rounded">Capture Selfie</button>
            )}
          </div>
        </div>

        {cameraActive && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded">
              <video ref={videoRef} autoPlay className="w-64 h-48 border"></video>
              <canvas ref={canvasRef} className="hidden"></canvas>
              <div className="mt-2 space-x-2">
                <button onClick={captureImage} className="bg-green-600 text-white px-4 py-2 rounded">Capture</button>
                <button onClick={stopCamera} className="bg-red-600 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div>
          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">{submitting ? 'Submitting...' : 'Submit Verification'}</button>
        </div>
      </form>
    </div>
  )
}