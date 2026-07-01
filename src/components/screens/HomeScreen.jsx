import { useRef, useState } from 'react'
import hero from '../../assets/hero.png'
import contohLabel from '../../assets/contoh_labelInformasi.jpg'
import CameraModal from './CameraModal.jsx'
import NutriLevelDialog from '../result/NutriLevelDialog.jsx'
import { Button } from '@/components/ui/button'

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']
const MAX_MB = 5

const PHOTO_TIPS = [
  { title: 'Cahaya Merata', desc: 'Hindari pantulan dan bayangan agar teks label terlihat jelas oleh kamera.' },
  { title: 'Label Utuh', desc: 'Pastikan tabel Informasi Nilai Gizi tidak terlipat, basah, atau tertutup.' },
  { title: 'Posisi Lurus', desc: 'Pegang kemasan tegak lurus di depan kamera — jangan miring atau bersudut.' },
  { title: 'Tangan Stabil', desc: 'Tahan kamera sebentar agar hasil foto tajam dan tidak buram.' },
]

// Deteksi perangkat mobile berdasarkan user-agent dan pointer kasar
function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  const coarse =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches
  return mobileUA || (coarse && (navigator.maxTouchPoints || 0) > 0)
}

export default function HomeScreen({ onPhoto }) {
  const fileRef = useRef(null)
  const camRef = useRef(null)
  const howRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const [camera, setCamera] = useState(false)
  const [dialog, setDialog] = useState(false)
  const [err, setErr] = useState('')

  const pick = (file) => {
    if (!file) return
    if (!file.type || !file.type.startsWith('image/')) {
      setErr('Berkas harus berupa gambar (JPG, PNG, atau WEBP).')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErr(`Ukuran berkas melebihi ${MAX_MB}MB. Pilih gambar yang lebih kecil.`)
      return
    }
    setErr('')
    onPhoto(file)
  }

  // Mobile membuka kamera native perangkat; desktop membuka modal webcam.
  const openCamera = () => {
    if (isMobileDevice()) camRef.current?.click()
    else setCamera(true)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    pick(e.dataTransfer.files?.[0])
  }

  const scrollHow = () => howRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="ns-home">
      {/* Hero — judul full-width satu baris sebagai elemen dominan, ilustrasi mendampingi teks */}
      <section className="ns-hero">
        <div className="ns-hero-badge">
          <BadgeCheck /> Kesehatan Dimulai dari Apa yang Anda Minum
        </div>

        <h1 className="ns-hero-title">
          Kenali Nutrisi
          <span className="t-green ns-hero-title-line">Minuman</span>
        </h1>

        <p className="ns-hero-desc">
          Foto label Informasi Nilai Gizi pada kemasan minuman untuk mendapatkan hasil analisis
          nutrisi dan skor Nutri-Level secara otomatis.
        </p>

        <div className="ns-hero-art">
          <img src={hero} alt="Ilustrasi skor Nutri-Level untuk minuman" />
        </div>

        {/* Tombol pada baris sendiri — whitespace-normal + min-w-0 agar teks membungkus
            di dalam tombol (tidak meluap) saat layar menyempit. */}
        <div className="ns-hero-actions">
          <Button
            variant="dark"
            onClick={scrollHow}
            className="h-auto whitespace-normal py-2.5 text-center leading-tight max-sm:flex-1 max-sm:min-w-0 max-sm:text-[12px]"
          >
            Lihat Cara Kerja
          </Button>
          <Button
            variant="nutri"
            onClick={() => setDialog(true)}
            className="h-auto whitespace-normal py-2.5 text-center leading-tight max-sm:flex-1 max-sm:min-w-0 max-sm:text-[12px]"
          >
            <InfoIcon /> Tentang Nutri-Level
          </Button>
        </div>
      </section>

      {/* Sumber gambar: Kamera + Unggah */}
      <div className="ns-source-grid">
        {/* Kartu kamera */}
        <div className="ns-source-card camera" onClick={openCamera} role="button" tabIndex={0}>
          <div className="ns-source-icon green">
            <CameraIcon />
            <span className="ns-source-bolt">
              <BoltIcon />
            </span>
          </div>
          <div className="ns-source-title green">Ambil Foto Langsung</div>
          <div className="ns-source-sub">
            Gunakan kamera ponsel Anda untuk mengambil foto label nutrisi secara real-time.
          </div>
          <button className="ns-btn primary block" type="button">
            <ApertureIcon /> Buka Kamera
          </button>
          {/* capture="environment" memunculkan kamera belakang di perangkat mobile */}
          <input
            ref={camRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => {
              pick(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>

        {/* Kartu unggah */}
        <div
          className={`ns-source-card upload ${drag ? 'drag' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <div className="ns-source-icon gray">
            <UploadIcon />
          </div>
          <div className="ns-source-title">Unggah Dari Galeri</div>
          <div className="ns-source-sub">
            Seret dan lepas file di sini atau klik untuk memilih gambar dari penyimpanan Anda.
          </div>
          <button className="ns-btn soft block" type="button">
            Pilih File Gambar
          </button>
          <div className="ns-source-meta">Format: JPG, PNG, WEBP (Maks. {MAX_MB}MB)</div>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT.join(',')}
            hidden
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </div>
      </div>
      {err && <div className="ns-inline-error">{err}</div>}

      <section className="ns-how" ref={howRef}>
        <h2 className="ns-how-title">Cara Kerja</h2>
        <p className="ns-how-sub">Memahami apa yang ada di dalam minuman dengan teknologi AI otomatis.</p>
        <div className="ns-how-grid">
          <HowCard n="1" accent="indigo" icon={<CameraIcon />} title="Ambil Foto">
            Arahkan kamera ke bagian Informasi Nilai Gizi pada kemasan minuman dan pastikan teks
            terlihat jelas.
          </HowCard>
          <HowCard n="2" accent="teal" icon={<ScanIcon />} title="Baca Otomatis">
            AI membaca seluruh angka gizi dari label — gula, garam, lemak jenuh, dan lainnya.
          </HowCard>
          <HowCard n="3" accent="rose" icon={<TrendIcon />} title="Lihat Score Nutrisi">
            Lihat kandungan nutrisi dan dapatkan skor Nutri-Level.
          </HowCard>
        </div>
      </section>

      {/* Tips foto terbaik — daftar tips di kiri, contoh foto label di kanan */}
      <section className="ns-ptips">
        <div>
          <h2 className="ns-ptips-title">Tips Foto Terbaik</h2>
          <div className="ns-ptips-list">
            {PHOTO_TIPS.map((t) => (
              <div className="ns-ptips-item" key={t.title}>
                <span className="ns-ptips-check"><CheckIcon /></span>
                <div className="ns-ptips-text">
                  <h4>{t.title}</h4>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ns-ptips-photo">
          <LabelExample />
        </div>
      </section>

      {/* Footer */}
      <footer className="ns-footer">
        <div className="ns-footer-brand">
          <span className="ns-bn-blue">Nus</span><span className="ns-bn-green">ca</span>
        </div>
        <div className="ns-footer-note">
          © 2025 Nusca AI. Platform analisis nutrisi minuman kemasan berbasis AI.
        </div>
      </footer>

      {camera && (
        <CameraModal
          onClose={() => setCamera(false)}
          onCapture={(file) => {
            setCamera(false)
            pick(file)
          }}
        />
      )}
      {dialog && <NutriLevelDialog active={null} onClose={() => setDialog(false)} />}
    </div>
  )
}

function HowCard({ n, icon, title, children, accent }) {
  return (
    <div className={`ns-how-card accent-${accent}`}>
      <div className="ns-how-card-icon">{icon}</div>
      <div className="ns-how-card-text">
        <h4>{title}</h4>
        <p>{children}</p>
      </div>
      <span className="ns-how-card-num" aria-hidden="true">{n}</span>
    </div>
  )
}

function LabelExample() {
  return (
    <img
      src={contohLabel}
      alt="Contoh foto label Informasi Nilai Gizi"
      style={{ width: '80%', height: '100%', objectFit: 'cover', borderRadius: '18px' }}
    />
  )
}

// ── Ikon ─────────────────────────────────────────────────────────────────────
function BadgeCheck() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}
function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  )
}
function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}
function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" stroke="none">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
function ApertureIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m14.31 8 5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" />
    </svg>
  )
}
function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 12h10" />
    </svg>
  )
}
function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}
