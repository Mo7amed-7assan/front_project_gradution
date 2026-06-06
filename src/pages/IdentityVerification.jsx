import React, { useEffect, useState, useRef } from 'react'
import { submitVerification, getVerificationStatus } from '../services/verification'
import IdentityVerificationUI from '../ui/pages/IdentityVerificationUI'

export default function IdentityVerification(){
  const [status, setStatus] = useState(null)
  const [images, setImages] = useState({ front: null, back: null })
  const [cameraActive, setCameraActive] = useState(false)
  const [currentCapture, setCurrentCapture] = useState(null) // 'front' or 'back'
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fetchStatus = async () => {
    try {
      const res = await getVerificationStatus()
      setStatus(res)
    } catch (err) {
      // No existing verification
    }
  }

  useEffect(()=>{ fetchStatus() }, [])

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
      const frontFile = createFileFromDataURL(images.front, 'id_card_front.png')
      formData.append('id_card_image_front', frontFile)
      const backFile = createFileFromDataURL(images.back, 'id_card_back.png')
      formData.append('id_card_image_back', backFile)

      await submitVerification(formData)
      fetchStatus()
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally { setSubmitting(false) }
  }

  return (
    <IdentityVerificationUI
      status={status}
      images={images}
      cameraActive={cameraActive}
      currentCapture={currentCapture}
      videoRef={videoRef}
      canvasRef={canvasRef}
      submitting={submitting}
      error={error}
      startCamera={startCamera}
      captureImage={captureImage}
      stopCamera={stopCamera}
      handleSubmit={handleSubmit}
    />
  )
}
