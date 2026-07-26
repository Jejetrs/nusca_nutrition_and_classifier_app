import { consumptionTips } from '../../lib/nutrilevel.js'

// Icons configuration
const ICONS = {
  time: { 
    path: 'M12 3v18M3 9h18M3 9l2-3h10l-2 3zm10 0l2-3h10l-2 3M4 14a2 2 0 0 0 4 0M16 14a2 2 0 0 0 4 0',
    viewBox: '0 0 24 24'
  },
  limit: { 
    path: 'M12 1v22M1 12h22',
    viewBox: '0 0 24 24'
  },
  alt: { 
    path: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z M2 21c0-3 1.85-5.36 5.08-6',
    viewBox: '0 0 24 24'
  }
}

const TIPS_CONFIG = [
  { id: 'time', icon: 'time', title: 'Waktu Terbaik', key: 'time' },
  { id: 'limit', icon: 'limit', title: 'Batas Konsumsi', key: 'limit' },
  { id: 'alt', icon: 'alt', title: 'Alternatif Lebih Sehat', key: 'alt' }
]

export default function ConsumptionTips({ calc }) {
  const tips = consumptionTips(calc)

  return (
    <div className="ns-tips-card">
      <div className="ns-tips-inner">
        <div className="ns-tips-head">
          <h3>Saran Konsumsi</h3>
          <p>Rekomendasi agar konsumsi minuman ini tetap sehat dan seimbang bagi metabolisme Anda.</p>
        </div>
        <div className="ns-tips-cols">
          {TIPS_CONFIG.map(({ id, icon, title, key }) => (
            <TipCard 
              key={id} 
              icon={icon} 
              title={title} 
              body={tips[key]} 
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function TipCard({ icon, title, body }) {
  const iconConfig = ICONS[icon]
  
  return (
    <div className="ns-tip-card">
      <div className="ns-tip-icon">
        <svg 
          viewBox={iconConfig.viewBox} 
          width="28" 
          height="28" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d={iconConfig.path} />
        </svg>
      </div>
      <div className="ns-tip-content">
        <h4 className="ns-tip-title">{title}</h4>
        <p className="ns-tip-body">{body}</p>
      </div>
    </div>
  )
}
