import {
  NL_OFFICIAL,
  NA_COLOR,
  componentInsight,
  bandText,
  scaleBounds,
} from '../../lib/nutrilevel.js'
import { pct as pctStr, commaDecimal } from '../../lib/format.js'

const GRADES = ['A', 'B', 'C', 'D']

// Tiga komponen GGL sesuai pedoman Kemenkes.
// kemKey = kunci nilai per kemasan utuh; lemak jenuh tidak punya nilai per kemasan.
const CARDS = [
  { fkey: 'gula', title: 'Gula', unit: 'g', pctKey: 'gula', kemKey: 'gula_g' },
  { fkey: 'garam', title: 'Garam (Natrium)', unit: 'mg', pctKey: 'natrium', kemKey: 'natrium_mg' },
  { fkey: 'lemak_jenuh', title: 'Lemak Jenuh', unit: 'g', pctKey: 'lemak', kemKey: null },
]

// 16,0 -> "16" ; 4,5 -> "4,5"
const asIs = (n) => String(Number(n)).replace('.', ',')

export default function ComponentsSection({ calc, fields }) {
  return (
    <div className="ns-ggl-grid">
      {CARDS.map((c) => (
        <ComponentCard key={c.fkey} comp={c} calc={calc} fields={fields} />
      ))}
    </div>
  )
}

function ComponentCard({ comp, calc, fields }) {
  const { fkey, title, unit, pctKey, kemKey } = comp
  const lv = calc.level[fkey]
  const p100 = calc.per100[fkey]
  const col = lv ? NL_OFFICIAL[lv] : NA_COLOR
  const pv = calc.pct_harian_kemasan[pctKey]
  const insight = componentInsight(fkey, lv)
  const bounds = scaleBounds(fkey)

  const hasField = fields[fkey] != null && fields[fkey] !== ''
  const valTxt = p100 != null ? `${commaDecimal(p100)} ${unit} / 100 ml` : 'per 100 ml tidak tersedia'
  const raw = hasField ? fields[fkey] : fkey === 'lemak_jenuh' ? '0' : '—'
  const showPct = hasField && p100 != null && pv != null
  const kemVal = kemKey && calc.per_kemasan ? calc.per_kemasan[kemKey] : null
  const kemTxt = kemVal != null ? `${asIs(kemVal)} ${unit}` : null

  const thresholdText = getDailyThresholdText(fkey)

  // Catatan komposisi gula: sukrosa & laktosa (laktosa dikurangi saat hitung level)
  const chips = []
  if (fkey === 'gula') {
    if (fields.sukrosa) chips.push(`sukrosa ${fields.sukrosa}`)
    if (fields.laktosa) chips.push(`laktosa ${fields.laktosa} (dikurangi)`)
  }

  return (
    <div className="ns-ggl-card">
      <div className="ns-ggl-head">
        <div className="ns-ggl-head-left">
          <span className="ns-ggl-title">{title}</span>
          <div className="ns-ggl-value" style={{ color: col }}>{valTxt}</div>
        </div>
        <div className="ns-ggl-badge">
          <div className="ns-ggl-badge-circle" style={{ background: col }}>{lv || '?'}</div>
          <div className="ns-ggl-badge-info">
            <b>{showPct ? pctStr(pv) : '—'}</b>
            <small>{title.toLowerCase()}</small>
          </div>
        </div>
      </div>

      <div className="ns-ggl-detail">
        <span>per sajian <b>{raw}</b></span>
        {kemTxt && <span>per kemasan <b>{kemTxt}</b></span>}
      </div>

      {chips.length > 0 && (
        <div className="ns-ggl-chips">
          {chips.map((c) => <span key={c}>{c}</span>)}
        </div>
      )}

      <div className="ns-ggl-scale">
        {GRADES.map((g) => {
          const on = g === lv
          const gc = NL_OFFICIAL[g]
          return (
            <span
              key={g}
              className={`ns-ggl-scale-item ${on ? 'on' : 'off'}`}
              style={on ? { background: gc, color: '#fff', borderColor: gc } : undefined}
            >
              {g}
              <small>{bounds[g]}</small>
            </span>
          )
        })}
      </div>

      {insight ? (
        <div className={`ns-ggl-insight ins-${lv.toLowerCase()}`}>
          <div className="ns-ggl-insight-rule">Level {lv}: {bandText(fkey, lv, unit)}</div>
          <div className="ns-ggl-insight-threshold">Konsumsi normal: {thresholdText}</div>
          <div className="ns-ggl-insight-text">{cap(insight)}</div>
        </div>
      ) : (
        <p className="ns-ggl-note">Data komponen belum tersedia dari label.</p>
      )}
    </div>
  )
}

function getDailyThresholdText(fkey) {
  return {
    gula: '50 g gula per hari',
    garam: '5 g garam per hari',
    lemak_jenuh: '67 g lemak jenuh per hari',
  }[fkey] || 'Batas harian tidak tersedia'
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
