import { useState, useEffect, useRef, useCallback } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Spinner } from '@/components/ui/spinner'

// ── Utilitas gambar ───────────────────────────────────────────────────────────

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

// Salin area crop (piksel TAMPILAN) ke canvas resolusi asli
function cropToCanvas(image, crop, maxSide = null) {
  const rect = image.getBoundingClientRect()
  const displayWidth = rect.width || image.width
  const displayHeight = rect.height || image.height
  const scaleX = image.naturalWidth / displayWidth
  const scaleY = image.naturalHeight / displayHeight
  let outW = Math.max(1, Math.round(crop.width * scaleX))
  let outH = Math.max(1, Math.round(crop.height * scaleY))
  if (maxSide && Math.max(outW, outH) > maxSide) {
    const k = maxSide / Math.max(outW, outH)
    outW = Math.max(1, Math.round(outW * k))
    outH = Math.max(1, Math.round(outH * k))
  }
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, outW, outH)
  return canvas
}

// Putar sumber gambar 90° → data URL baru agar crop tetap akurat
async function rotateSource(src, deg) {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalHeight
  canvas.height = img.naturalWidth
  const ctx = canvas.getContext('2d')
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((deg * Math.PI) / 180)
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
  return canvas.toDataURL('image/jpeg', 0.95)
}

function gcd(a, b) {
  a = Math.round(a); b = Math.round(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}

// Crop awal: kotak 80% di tengah
function defaultCrop(w, h) {
  return {
    percent: { unit: '%', x: 10, y: 10, width: 80, height: 80 },
    pixel: { unit: 'px', x: w * 0.1, y: h * 0.1, width: w * 0.8, height: h * 0.8 },
  }
}

// Klem nilai zoom ke rentang [min, max]
const ZOOM_MIN = 1
const ZOOM_MAX = 4
const ZOOM_STEP = 0.25

export default function CropScreen({ image, onConfirm, onBack }) {
  const [imgSrc, setImgSrc] = useState(image?.url || null)
  const [crop, setCrop] = useState(null)
  const [pixelCrop, setPixelCrop] = useState(null)
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [rotating, setRotating] = useState(false)
  // Zoom: nilai float, diterapkan via CSS transform pada kontainer gambar
  const [zoom, setZoom] = useState(1)
  const imgRef = useRef(null)
  const debRef = useRef(null)

  useEffect(() => {
    setImgSrc(image?.url || null)
    setZoom(1)
  }, [image])

  const onImageLoad = useCallback((e) => {
    const img = e.currentTarget
    const d = defaultCrop(img.width, img.height)
    setCrop(d.percent)
    setPixelCrop(d.pixel)
  }, [])

  // Pratinjau hasil — di-debounce agar ringan
  useEffect(() => {
    if (!pixelCrop || !imgRef.current || pixelCrop.width < 1) return
    clearTimeout(debRef.current)
    debRef.current = setTimeout(() => {
      try {
        const canvas = cropToCanvas(imgRef.current, pixelCrop, 360)
        setPreview(canvas.toDataURL('image/jpeg', 0.8))
      } catch { /* abaikan sementara gambar belum siap */ }
    }, 160)
    return () => clearTimeout(debRef.current)
  }, [pixelCrop, imgSrc])

  const rotate = async (deg) => {
    if (!imgSrc || rotating || busy) return
    setRotating(true)
    try {
      const next = await rotateSource(imgSrc, deg)
      setPreview(null); setPixelCrop(null); setCrop(null)
      setImgSrc(next); setZoom(1)
    } finally { setRotating(false) }
  }

  // Zoom in/out — klem ke ZOOM_MIN..ZOOM_MAX
  const zoomIn  = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))
  const zoomReset = () => setZoom(1)

  const confirm = async () => {
    if (!pixelCrop || !imgRef.current || pixelCrop.width < 1) return
    setBusy(true)
    cropToCanvas(imgRef.current, pixelCrop).toBlob(
      (blob) => { setBusy(false); if (blob) onConfirm(blob) },
      'image/jpeg', 0.92,
    )
  }

  // Meta dimensi keluaran
  let outW = 0, outH = 0
  if (pixelCrop && imgRef.current) {
    const sX = imgRef.current.naturalWidth / imgRef.current.width
    const sY = imgRef.current.naturalHeight / imgRef.current.height
    outW = Math.round(pixelCrop.width * sX)
    outH = Math.round(pixelCrop.height * sY)
  }
  const minSide = Math.min(outW, outH)
  const g = outW && outH ? gcd(outW, outH) : 1
  const ratio = outW && outH ? `${Math.round(outW / g)}:${Math.round(outH / g)}` : '—'
  const quality = minSide >= 700 ? { t: 'Tinggi', cls: 'ok' } : minSide >= 400 ? { t: 'Cukup', cls: 'warn' } : { t: 'Rendah', cls: 'low' }
  const hasCrop = !!pixelCrop && pixelCrop.width >= 1

  return (
    <div className="ns-crop">
      <div className="ns-crop-header">
        <h2>Pangkas Area Label</h2>
        <p>
          Tarik sudut atau sisi kotak untuk menyesuaikan area secara bebas. Gunakan zoom untuk
          memperbesar detail. Pastikan seluruh tabel Informasi Nilai Gizi berada di dalam kotak.
        </p>
      </div>

      <div className="ns-crop-tip">
        <TipIcon />
        Geser tepi kotak untuk memangkas manual. Semakin pas pada tabel gizi, semakin akurat hasilnya.
      </div>

      <div className="ns-crop-stage">
        <div className="ns-cropper-box">
          {imgSrc && (
            /* Wrapper ini menerima transform zoom; ReactCrop bekerja di dalamnya */
            <div
              className="ns-crop-zoom-wrap"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              <ReactCrop
                crop={crop || undefined}
                onChange={(_, percent) => setCrop(percent)}
                onComplete={(px) => setPixelCrop(px)}
                keepSelection
                minWidth={40}
                minHeight={40}
                ruleOfThirds
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Gambar label untuk dipangkas"
                  onLoad={onImageLoad}
                  className="ns-crop-img"
                />
              </ReactCrop>
            </div>
          )}
          {rotating && (
            <div className="ns-crop-spinner">
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-5" /> Memutar…
              </span>
            </div>
          )}

          <div className="ns-zoom-controls">
            <button className="ns-zoom-btn" onClick={zoomOut} disabled={zoom <= ZOOM_MIN} title="Perkecil">
              <MinusIcon />
            </button>
            <button className="ns-zoom-reset" onClick={zoomReset} title="Reset zoom">
              {Math.round(zoom * 100)}%
            </button>
            <button className="ns-zoom-btn" onClick={zoomIn} disabled={zoom >= ZOOM_MAX} title="Perbesar">
              <PlusIcon />
            </button>
          </div>
        </div>

        {/* Panel pratinjau hasil crop */}
        <aside className="ns-crop-preview">
          <div className="ns-cp-head">
            <span>Pratinjau Hasil</span>
            <EyeIcon />
          </div>
          <div className="ns-cp-img">
            {preview
              ? <img src={preview} alt="Pratinjau area terpilih" />
              : <div className="ns-cp-empty" />}
          </div>
          <div className="ns-cp-selected">
            <span className="ns-cp-dot" /> AREA TERPILIH
          </div>
          <div className="ns-cp-meta">
            <div className="ns-cp-row">
              <span>UKURAN GAMBAR</span>
              <b>{hasCrop ? `${outW} × ${outH}px` : '—'}</b>
            </div>
            <div className="ns-cp-row">
              <span>RASIO ASPEK</span>
              <b>{ratio}</b>
            </div>
            <div className="ns-cp-row">
              <span>KUALITAS</span>
              <span className={`ns-cp-badge ${quality.cls}`}>
                <CheckMini /> {hasCrop ? quality.t : '—'}
              </span>
            </div>
            <div className="ns-cp-row">
              <span>ZOOM</span>
              <b>{Math.round(zoom * 100)}%</b>
            </div>
          </div>
        </aside>
      </div>

      <div className="ns-crop-actions">
        <div className="ns-crop-tools">
          <button className="ns-btn ghost sm" onClick={() => rotate(-90)} disabled={busy || rotating}>
            <RotateLeft /> Putar Kiri
          </button>
          <button className="ns-btn ghost sm" onClick={() => rotate(90)} disabled={busy || rotating}>
            <RotateRight /> Putar Kanan
          </button>
        </div>
        <div className="ns-crop-actions-r">
          <button className="ns-btn outline sm" onClick={onBack} disabled={busy || rotating}>
            Foto Ulang
          </button>
          <button className="ns-btn primary" onClick={confirm} disabled={!hasCrop || busy || rotating}>
            {busy ? 'Memproses…' : 'Konfirmasi & Analisis'} <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Ikon ─────────────────────────────────────────────────────────────────────
function TipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function CheckMini() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
function RotateLeft() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v6h6" /><path d="M3 8a9 9 0 1 0 3-5" />
    </svg>
  )
}
function RotateRight() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6" /><path d="M21 8a9 9 0 1 1-3-5" />
    </svg>
  )
}
function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  )
}
