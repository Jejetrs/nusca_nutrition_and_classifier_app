import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import HomeScreen from './components/screens/HomeScreen.jsx'
import CropScreen from './components/screens/CropScreen.jsx'
import ProcessingScreen from './components/screens/ProcessingScreen.jsx'
import ResultScreen from './components/screens/ResultScreen.jsx'
import { getHealth } from './api/client.js'

const STORAGE_KEY = 'ns-app-state'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function dataUrlToBlob(dataUrl) {
  const [header, body] = dataUrl.split(',')
  const isBase64 = header.includes('base64')
  const raw = isBase64 ? atob(body) : decodeURIComponent(body)
  const mime = header.match(/:(.*?);/)[1]
  const u8 = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) {
    u8[i] = raw.charCodeAt(i)
  }
  return new Blob([u8], { type: mime })
}

// Alur: 'beranda' -> 'pangkas' -> 'memproses' -> 'hasil'
export default function App() {
  const [step, setStep] = useState('beranda')
  const [original, setOriginal] = useState(null) // { url, dataUrl, name }
  const [cropped, setCropped] = useState(null)
  const [croppedDataUrl, setCroppedDataUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState({ mode: 'demo', message: '' })

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  )

  useEffect(() => {
    getHealth().then((h) => setStatus({ mode: h.mode, message: h.message }))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const stored = JSON.parse(raw)
      if (stored.originalDataUrl) {
        setOriginal({
          url: stored.originalDataUrl,
          dataUrl: stored.originalDataUrl,
          name: stored.originalName || 'label.jpg',
        })
      }
      if (stored.croppedDataUrl) {
        setCropped(dataUrlToBlob(stored.croppedDataUrl))
        setCroppedDataUrl(stored.croppedDataUrl)
      }
      if (stored.step) {
        setStep(stored.step)
      }
    } catch (error) {
      console.warn('Gagal memuat state dari sessionStorage', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const state = {
      step,
      originalDataUrl: original?.dataUrl || null,
      originalName: original?.name || null,
      croppedDataUrl,
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [step, original, croppedDataUrl])

  // Selalu gulir ke atas setiap kali langkah berubah
  useEffect(() => {
    const main = document.querySelector('.ns-main')
    if (main) main.scrollTop = 0
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [step])

  // Saat berpindah ke layar besar, pastikan sidebar tampil; saat menyempit, sembunyikan.
  useEffect(() => {
    const onResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const reset = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY)
    }
    setOriginal(null)
    setCropped(null)
    setCroppedDataUrl(null)
    setResult(null)
    setStep('beranda')
  }, [])

  const handlePhoto = async (file) => {
    const dataUrl = await fileToDataUrl(file)
    setOriginal({ url: dataUrl, dataUrl, name: file.name || 'label.jpg' })
    setStep('pangkas')
  }

  const handleCropped = async (blob) => {
    const dataUrl = await blobToDataUrl(blob)
    setCropped(blob)
    setCroppedDataUrl(dataUrl)
    setStep('memproses')
  }

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }

  return (
    <div className={`ns-app ${sidebarOpen ? '' : 'sb-collapsed'}`}>
      <Sidebar
        step={step}
        mode={status.mode}
        message={status.message}
        open={sidebarOpen}
        onBrandClick={() => {
          setStep('beranda')
          if (window.innerWidth < 1024) setSidebarOpen(false)
        }}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Bg gelap saat drawer terbuka di mobile */}
      <div className="ns-backdrop" onClick={() => setSidebarOpen(false)} />

      {/* Tombol untuk membuka kembali sidebar saat sedang tertutup */}
      {!sidebarOpen && (
        <button
          className="ns-sb-open"
          onClick={() => setSidebarOpen(true)}
          aria-label="Buka menu samping"
          title="Buka menu"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}

      <main className="ns-main">
        {step === 'beranda' && (
          <HomeScreen onPhoto={(f) => { closeOnMobile(); handlePhoto(f) }} mode={status.mode} />
        )}
        {step === 'pangkas' && (
          <CropScreen
            image={original}
            onConfirm={handleCropped}
            onBack={() => setStep('beranda')}
          />
        )}
        {step === 'memproses' && (
          <ProcessingScreen
            blob={cropped}
            previewUrl={original?.url}
            onDone={(r) => {
              setResult(r)
              setStep('hasil')
            }}
            onError={() => setStep('pangkas')}
          />
        )}
        {step === 'hasil' && result && (
          <ResultScreen
            result={result}
            previewUrl={original?.url}
            onRestart={reset}
          />
        )}
      </main>
    </div>
  )
}
