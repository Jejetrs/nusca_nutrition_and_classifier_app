import { useEffect, useRef, useState } from 'react'
import { analyzeImage } from '../../api/client.js'
import { Spinner } from '@/components/ui/spinner'

const STAGES = [
  'Memindai label kemasan',
  'Menghitung Nutri-Level GGL',
  'Mengidentifikasi kandungan gizi',
]
const FRUITS = ['🍎', '🧃', '🍋', '🫐', '🥤', '🍊']

export default function ProcessingScreen({ blob, previewUrl, onDone, onError }) {
  const [active, setActive] = useState(0)
  const [error, setError] = useState('')
  const resultRef = useRef(null)
  const doneRef = useRef(false)

  useEffect(() => {
    if (!blob) { onError?.(); return }
    analyzeImage(blob)
      .then((r) => { resultRef.current = r })
      .catch((e) => setError(e.message || 'Analisis gagal.'))
  }, [blob])

  useEffect(() => {
    if (error) return
    const t = setInterval(() => {
      setActive((a) => {
        if (a < STAGES.length - 1) return a + 1
        if (resultRef.current && !doneRef.current) {
          doneRef.current = true
          clearInterval(t)
          setTimeout(() => onDone(resultRef.current), 450)
        }
        return a
      })
    }, 700)
    return () => clearInterval(t)
  }, [error, onDone])

  if (error) {
    return (
      <div className="ns-processing">
        <div className="ns-proc-error">
          <div className="ns-proc-error-icon">!</div>
          <h3>Analisis gagal</h3>
          <p>{error}</p>
          <button className="ns-btn primary" onClick={() => onError?.()}>
            Kembali & Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ns-processing">
      <div className="ns-scan-stage">
        <div className="ns-scan-chip"><CpuIcon /></div>

        {/* Cincin panduan samar + ripple ganda yang membesar dari kecil ke besar */}
        <span className="ns-scan-guide g1" aria-hidden="true" />
        <span className="ns-scan-guide g2" aria-hidden="true" />
        <span className="ns-ripple" aria-hidden="true" />
        <span className="ns-ripple rb" aria-hidden="true" />

        {/* Buah & minuman mengorbit melingkar */}
        <div className="ns-orbit" aria-hidden="true">
          {FRUITS.map((f, i) => {
            const a = (i / FRUITS.length) * 2 * Math.PI - Math.PI / 2
            const x = 50 + 41 * Math.cos(a)
            const y = 50 + 41 * Math.sin(a)
            return (
              <span className="ns-orbit-slot" key={i} style={{ left: `${x}%`, top: `${y}%` }}>
                <span className="ns-orbit-item">{f}</span>
              </span>
            )
          })}
        </div>

        {/* Lensa tengah: pratinjau label + garis pindai */}
        <div className="ns-lens">
          {previewUrl ? <img src={previewUrl} alt="Label sedang dianalisis" /> : null}
          <div className="ns-lens-line" />
        </div>
      </div>

      <h2 className="ns-proc-title">Sedang menganalisis label minuman…</h2>
      <p className="ns-proc-sub">
        Membaca kandungan gula, garam, dan lemak jenuh untuk menghitung skor kesehatan minuman.
      </p>

      <div className="ns-step-list">
        {STAGES.map((label, i) => {
          const state = i < active ? 'done' : i === active ? 'active' : 'wait'
          return (
            <div className="ns-step-row" key={i}>
              <div className={`ns-step-left ${state}`}>
                <div className="ns-step-ic">
                  {state === 'done' ? <CheckIcon /> : state === 'active' ? <SparkIcon /> : <DotIcon />}
                </div>
                {label}
              </div>
              <span className={`ns-step-status ${state}`}>
                {state === 'done' ? 'SELESAI' : state === 'active' ? 'MEMPROSES' : 'MENUNGGU'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="ns-loader-pill">
        <Spinner className="size-[18px] text-green-400" /> Sedang Memproses Label…
      </div>
    </div>
  )
}

function CpuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  )
}
function DotIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}
