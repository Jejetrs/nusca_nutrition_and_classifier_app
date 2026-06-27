import { consumptionTips } from '../../lib/nutrilevel.js'

// Kartu "Saran Konsumsi" — indigo gelap, heading di kiri + 3 kolom saran.
export default function ConsumptionTips({ calc }) {
  const t = consumptionTips(calc)
  return (
    <div className="ns-tips-card">
      <div className="ns-tips-deco" />
      <div className="ns-tips-inner">
        <div className="ns-tips-head">
          <h3>Saran Konsumsi</h3>
          <p>Rekomendasi agar konsumsi minuman ini tetap sehat.</p>
        </div>
        <div className="ns-tips-cols">
          <Tip icon={<ScaleIcon />} title="Waktu Terbaik" body={t.time} />
          <Tip icon={<ClockIcon />} title="Batas Konsumsi" body={t.limit} />
          <Tip icon={<LeafIcon />} title="Alternatif Lebih Sehat" body={t.alt} />
        </div>
      </div>
    </div>
  )
}

function Tip({ icon, title, body }) {
  return (
    <div className="ns-tip-col">
      <div className="ns-tip-col-icon">{icon}</div>
      <div className="ns-tip-col-text">
        <div className="ns-tip-col-title">{title}</div>
        <div className="ns-tip-col-body">{body}</div>
      </div>
    </div>
  )
}

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7Zm10 0-3 7h6l-3-7ZM4 14a3 3 0 0 0 6 0M14 14a3 3 0 0 0 6 0M8 21h8" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  )
}
function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  )
}
