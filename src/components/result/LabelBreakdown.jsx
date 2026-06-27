import { useState, useEffect, useRef } from 'react'
import { buildAlerts, importantNotes, GRADE_LABEL, NL_OFFICIAL } from '../../lib/nutrilevel.js'
import { commaDecimal, numericPart, showRaw, pct as pctStr } from '../../lib/format.js'

const DETECT = [
  ['energi', 'ENERGI'],
  ['lemak', 'LEMAK TOTAL'],
  ['lemak_jenuh', 'LEMAK JENUH'],
  ['gula', 'GULA'],
  ['garam', 'GARAM'],
]

const NUTRIENTS = [
  ['Gula Total', 'gula', 'g'],
  ['Garam (Natrium)', 'garam', 'mg'],
  ['Lemak Jenuh', 'lemak_jenuh', 'g'],
  ['Lemak Total', 'lemak', 'g'],
  ['Sukrosa', 'sukrosa', 'g'],
  ['Laktosa', 'laktosa', 'g'],
]

const CALC_ROWS = [
  ['Total Gula', 'gula', 'gula', 'gula', '#F59E0B'],
  ['Total Lemak', 'lemak', 'lemak_jenuh', 'lemak', '#3B82F6'],
  ['Garam (Natrium)', 'garam', 'garam', 'natrium', '#EF4444'],
]

export default function LabelBreakdown({ calc, fields, panelImage, mode }) {
  const alerts = buildAlerts(calc, fields)
  // Peringatan (warning) tingkat label: catatan estimasi/asumsi + catatan mode demo.
  const notes = importantNotes(calc, mode)
  const warnings = [...notes.important]
  if (notes.demo) {
    warnings.push(
      '“Garam” memakai nilai natrium (mg); “Lemak Jenuh” dipakai untuk perhitungan Nutri-Level (bukan lemak total). Nilai di bawah hanya contoh ilustrasi (mode demo).',
    )
  }
  const tags = DETECT.filter(([k]) => fields[k]).map(([, t]) => t)
  const [zoom, setZoom] = useState(false)

  return (
    <div className="ns-results-container">
      {/* KIRI — Label teranalisis (section tersendiri) */}
      <section className="ns-result-card ns-results-left">
        {/* Pesan diurutkan berdasarkan urgensi: ALERT → WARNING → INFO, di ATAS box ANALYZED LABEL */}
        {alerts.length > 0 && (
          <div className="ns-alert">
            <div className="ns-alert-head">
              <span className="ns-alert-ic">
                <WarnIcon />
              </span>
              Perhatian!
            </div>
            <div className="ns-alert-body">
              {alerts.map((a, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: a }} />
              ))}
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="ns-warn">
            <div className="ns-warn-head">
              <span className="ns-warn-ic">
                <TriangleIcon />
              </span>
              Peringatan
            </div>
            <div className="ns-warn-body">
              {warnings.map((w, i) => (
                <div key={i}>{w}</div>
              ))}
            </div>
          </div>
        )}

        <div className="ns-info-box">
          <div className="ns-info-head">
            <span className="ns-info-ic">
              <InfoIcon />
            </span>
            Info
          </div>
          <div className="ns-info-body">
            Perhitungan Nutri-Level mengikuti kandungan <b>Gula, Garam (natrium), dan Lemak Jenuh</b> per
            100 ml. Level akhir ditentukan oleh komponen dengan kandungan tertinggi.
          </div>
        </div>

        <div className="ns-analyzed-card">
          <div className="ns-analyzed-head">
            <span>ANALYZED LABEL</span>
            {panelImage && (
              <button className="ns-analyzed-full" onClick={() => setZoom(true)}>
                <EyeIcon /> Lihat Penuh
              </button>
            )}
          </div>
          {panelImage ? (
            <div className="ns-analyzed-content">
              <img src={panelImage} alt="Label gizi teranalisis" className="ns-analyzed-img" onClick={() => setZoom(true)} />
              <div className="ns-detect-badges">
                {tags.map((t) => (
                  <span className="ns-detect-badge" key={t}>
                    {t} TERDETEKSI
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="ns-analyzed-empty">Gambar tidak tersedia</div>
          )}
        </div>
      </section>

      {/* KANAN — Rincian detail (section tersendiri) */}
      <section className="ns-result-card ns-results-right">
        <div className="ns-bd-block">
          <div className="ns-bd-eyebrow">Informasi Penyajian Per Kemasan</div>
          <div className="ns-serving-grid">
            <Serving label="Takaran Saji" value={showRaw(fields.takaran)} />
            <Serving label="Sajian/Kemasan" value={showRaw(fields.sajian)} />
            <Serving label="Jumlah/Kemasan" value={showRaw(fields.jumlah_per_kemasan)} />
          </div>
        </div>

        <div className="ns-bd-block">
          <div className="ns-bd-eyebrow">Kandungan Gizi</div>
          {NUTRIENTS.map(([label, key, unit]) => {
            const n = numericPart(fields[key])
            const missingSaturated = key === 'lemak_jenuh' && (fields[key] === null || fields[key] === undefined || fields[key] === '')
            // Tampilkan nilai apa adanya hasil deteksi (16,0 -> "16"; 4,5 -> "4,5").
            // Jika label lemak jenuh tidak ditemukan, asumsikan nilai 0.
            const display = n != null
              ? `${String(Number(n)).replace('.', ',')} ${unit}`
              : missingSaturated
              ? `0 ${unit}`
              : '—'
            return (
              <div className="ns-nutrient-row" key={key}>
                <span>{label}</span>
                <b>{display}</b>
              </div>
            )
          })}
        </div>

        <div className="ns-bd-block last">
          <div className="ns-bd-eyebrow">Hasil Perhitungan Nutri-Level (Per 100 ml)</div>
          {CALC_ROWS.map(([name, p100Key, lvKey, pctKey, color]) => {
            const p100 = calc.per100[p100Key]
            const unit = p100Key === 'garam' ? 'mg' : 'g'
            const display = p100 != null ? `${commaDecimal(p100)}${unit}` : '—'
            const lv = calc.level[lvKey]
            const pv = calc.pct_harian_kemasan[pctKey]
            const showPct = p100 != null && pv != null
            const fill = showPct ? Math.min(pv, 100) : 0
            return (
              <div className="ns-calc-row" key={name}>
                <div className="ns-calc-top">
                  <span>{name}</span>
                  <b style={{ color: lv ? NL_OFFICIAL[lv] : undefined }}>{display}</b>
                </div>
                <div className="ns-calc-lvl">{GRADE_LABEL[lv] || ''}</div>
                <div className="ns-calc-bar">
                  <div style={{ width: `${fill}%`, background: color }} />
                </div>
                <div className="ns-calc-daily">{showPct ? pctStr(pv) : '—'} NILAI HARIAN</div>
              </div>
            )
          })}
        </div>
      </section>

      {zoom && panelImage && (
        <Lightbox src={panelImage} onClose={() => setZoom(false)} />
      )}
    </div>
  )
}

// ── Lightbox layar penuh: kartu di TENGAH, layar membeku (tanpa scroll), + zoom in/out ──
function Lightbox({ src, onClose }) {
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)

  // Bekukan scroll halaman selama lightbox terbuka.
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow
    const prevBody = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === '+' || e.key === '=') zoomIn()
      else if (e.key === '-' || e.key === '_') zoomOut()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const clampReset = (s) => {
    if (s <= 1) setPos({ x: 0, y: 0 })
  }
  const zoomIn = () => setScale((s) => Math.min(4, +(s + 0.4).toFixed(2)))
  const zoomOut = () =>
    setScale((s) => {
      const next = Math.max(1, +(s - 0.4).toFixed(2))
      clampReset(next)
      return next
    })
  const resetZoom = () => {
    setScale(1)
    setPos({ x: 0, y: 0 })
  }

  // Geser (pan) saat ter-zoom.
  const onPointerDown = (e) => {
    if (scale <= 1) return
    dragRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }
  const onPointerMove = (e) => {
    if (!dragRef.current) return
    setPos({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y })
  }
  const onPointerUp = () => {
    dragRef.current = null
  }
  // Zoom dengan roda mouse.
  const onWheel = (e) => {
    e.preventDefault()
    if (e.deltaY < 0) zoomIn()
    else zoomOut()
  }

  return (
    <div className="ns-lightbox" onClick={onClose}>
      <div
        className="ns-lightbox-card"
        onClick={(e) => e.stopPropagation()}
        onWheel={onWheel}
      >
        <button className="ns-lightbox-close" onClick={onClose} aria-label="Tutup">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div
          className={`ns-lightbox-imgwrap ${scale > 1 ? 'pannable' : ''}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <img
            src={src}
            alt="Label gizi (penuh)"
            draggable={false}
            style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
          />
        </div>

        <div className="ns-lightbox-zoom" onClick={(e) => e.stopPropagation()}>
          <button onClick={zoomOut} disabled={scale <= 1} aria-label="Perkecil" title="Perkecil">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14" /></svg>
          </button>
          <span className="ns-lightbox-zoomval">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={scale >= 4} aria-label="Perbesar" title="Perbesar">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <button onClick={resetZoom} disabled={scale === 1} aria-label="Atur ulang" title="Atur ulang" className="ns-lightbox-reset">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function Serving({ label, value }) {
  return (
    <div className="ns-serving-cell">
      <div className="ns-serving-label">{label}</div>
      <div className="ns-serving-value">{value}</div>
    </div>
  )
}

function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
}
function TriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
}
function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
