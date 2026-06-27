import { useEffect, useRef, useState } from 'react'

// Modal kamera live: getUserMedia → tangkap frame → File JPEG.
// Digunakan hanya di desktop; HP menggunakan input capture="environment" langsung.
export default function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setReady(true)
        }
      } catch {
        setError('Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan, lalu coba lagi.')
      }
    }
    start()
    return () => {
      cancelled = true
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `kamera-${Date.now()}.jpg`, { type: 'image/jpeg' })
          onCapture(file)
        }
      },
      'image/jpeg',
      0.92,
    )
  }

  return (
    <div className="ns-modal-overlay ns-camera-overlay" onClick={onClose}>
      <div className="ns-camera-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ns-camera-head">
          <div className="ns-camera-title">
            <span className="ns-live-pill">
              <span className="ns-live-dot" /> KAMERA LANGSUNG
            </span>
            Pindai Informasi Nilai Gizi
          </div>
          <button className="ns-icon-btn" onClick={onClose} aria-label="Tutup kamera">
            <CloseIcon />
          </button>
        </div>

        <div className="ns-camera-stage">
          {error ? (
            <div className="ns-camera-error">{error}</div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="ns-camera-video" />
              <div className="ns-camera-frame">
                <span className="c tl" />
                <span className="c tr" />
                <span className="c bl" />
                <span className="c br" />
                <div className="ns-camera-hint">Posisikan label di dalam bingkai</div>
              </div>
            </>
          )}
        </div>

        <div className="ns-camera-actions">
          <button className="ns-btn ghost" onClick={onClose}>Batal</button>
          <button className="ns-btn primary" onClick={capture} disabled={!ready || !!error}>
            <CameraIcon /> Ambil Foto
          </button>
        </div>
        <div className="ns-camera-tips">
          Gunakan cahaya alami · Ketuk untuk fokus · Hindari label miring
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}
