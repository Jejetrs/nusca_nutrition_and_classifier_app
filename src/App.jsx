import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import HomeScreen from './components/screens/HomeScreen.jsx'
import CropScreen from './components/screens/CropScreen.jsx'
import ProcessingScreen from './components/screens/ProcessingScreen.jsx'
import ResultScreen from './components/screens/ResultScreen.jsx'
import { getHealth } from './api/client.js'

// Alur: 'beranda' -> 'pangkas' -> 'memproses' -> 'hasil'
export default function App() {
  const [step, setStep] = useState('beranda')
  const [original, setOriginal] = useState(null) // { url, name }
  const [cropped, setCropped] = useState(null) // Blob
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState({ mode: 'demo', message: '' })

  // Sidebar: terbuka secara default di layar lebar, tertutup di layar kecil.
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  )

  useEffect(() => {
    getHealth().then((h) => setStatus({ mode: h.mode, message: h.message }))
  }, [])

  // Selalu gulir ke atas setiap kali langkah berubah. Kontainer scroll bisa
  // berbeda (window, body, root, atau .ns-main), jadi reset semuanya.
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
    if (original?.url) URL.revokeObjectURL(original.url)
    setOriginal(null)
    setCropped(null)
    setResult(null)
    setStep('beranda')
  }, [original])

  const handlePhoto = (file) => {
    if (original?.url) URL.revokeObjectURL(original.url)
    setOriginal({ url: URL.createObjectURL(file), name: file.name || 'label.jpg' })
    setStep('pangkas')
  }

  const handleCropped = (blob) => {
    setCropped(blob)
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
        onClose={() => setSidebarOpen(false)}
      />

      {/* Tirai gelap saat drawer terbuka di mobile */}
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
