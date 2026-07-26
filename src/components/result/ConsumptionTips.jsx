import { consumptionTips } from '../../lib/nutrilevel.js'

const TIPS_CONFIG = [
  { id: 'time', title: 'Waktu Terbaik', key: 'time' },
  { id: 'limit', title: 'Batas Konsumsi', key: 'limit' },
  { id: 'alt', title: 'Alternatif Lebih Sehat', key: 'alt' }
]

export default function ConsumptionTips({ calc }) {
  const tips = consumptionTips(calc)

  return (
    <div className="ns-tips-card">
      <div className="ns-tips-head">
        <h3>Saran Konsumsi</h3>
        <p>Rekomendasi agar konsumsi minuman ini tetap sehat dan seimbang bagi metabolisme Anda.</p>
      </div>
      <div className="ns-tips-cols">
        {TIPS_CONFIG.map(({ id, title, key }) => (
          <TipCard 
            key={id} 
            iconId={id} 
            title={title} 
            body={tips[key]} 
          />
        ))}
      </div>
    </div>
  )
}

function TipCard({ iconId, title, body }) {
  return (
    <div className="ns-tip-card">
      <div className="ns-tip-icon">
        {iconId === 'time' && (
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )}
        {iconId === 'limit' && (
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
        {iconId === 'alt' && (
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6" />
          </svg>
        )}
      </div>
      <h4 className="ns-tip-title">{title}</h4>
      <p className="ns-tip-body">{body}</p>
    </div>
  )
}
