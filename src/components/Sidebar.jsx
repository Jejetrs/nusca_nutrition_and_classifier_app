import logo from '../assets/logo.png'

const STEPS = [
  { key: 'capture', title: '1. Foto Label', icon: IconCamera },
  { key: 'crop', title: '2. Pangkas', icon: IconCrop },
  { key: 'analyze', title: '3. Analisis', icon: IconAnalyze },
]

const STEP_INDEX = { beranda: 0, pangkas: 1, memproses: 2, hasil: 2 }

const SUBS = {
  beranda: ['Kamera Aktif', 'Langkah Berikutnya', 'Memproses'],
  pangkas: ['Selesai', 'Sedang dipangkas', 'Memproses'],
  memproses: ['Selesai', 'Selesai', 'Memproses...'],
  hasil: ['Selesai', 'Selesai', 'Selesai'],
}

export default function Sidebar({ step, mode, message, open, onClose }) {
  const active = STEP_INDEX[step] ?? 0
  const subs = SUBS[step] || SUBS.beranda
  const allDone = step === 'hasil'
  const backendStatus = mode === 'model'
    ? (message ? message.replace(/\s*\([^)]*\)/, '') : 'Model AI siap')
    : 'Mode demo — model belum aktif'
  const backendStatusLine = mode === 'model'
    ? 'Model AI Aktif'
    : 'Mode demo — model belum aktif'

  return (
    <aside className={`ns-sidebar ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="ns-sidebar-top">
        <div className="ns-brand">
          <div className="ns-logo">
            <img src={logo} alt="NutriScan AI" />
          </div>
          <div className="ns-brand-text">
            <div className="ns-brand-name">
              <span className="ns-bn-blue">Nus</span><span className="ns-bn-green">ca</span>
            </div>
            <div className="ns-brand-sub">Nutrition Scanner & Classifier</div>
          </div>
        </div>
        <button className="ns-sb-close" onClick={onClose} aria-label="Tutup menu samping" title="Tutup menu">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>

      <div className="ns-progress-label">Progress Saat Ini</div>

      <div className="ns-steps">
        {STEPS.map((s, i) => {
          const state = allDone || i < active ? 'done' : i === active ? 'active' : ''
          const Icon = s.icon
          return (
            <div className={`ns-step ${state}`} key={s.key}>
              <div className="ns-step-rail" />
              {/* Ikon langkah aktif diberi animasi pulse */}
              <div className={`ns-dot ${state === 'active' ? 'ns-dot-pulse' : ''}`}>
                {state === 'done' ? <IconCheck /> : <Icon />}
              </div>
              <div className="ns-step-info">
                <div className="ns-step-title">{s.title}</div>
                <div className="ns-step-sub">{subs[i]}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="ns-sidebar-status">
        <div className="ns-status-pill">
          <span className="ns-status-glow" />
          {backendStatus}
        </div>
      </div>
    </aside>
  )
}

// ── Ikon ─────────────────────────────────────────────────────────────────────
function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}
function IconCrop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
    </svg>
  )
}
function IconAnalyze() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
