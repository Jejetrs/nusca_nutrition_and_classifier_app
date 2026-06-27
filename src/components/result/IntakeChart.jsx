import { pct as pctStr } from '../../lib/format.js'

const COLOR_OPTIMAL = '#16A34A'
const COLOR_SEDANG = '#F59E0B'
const COLOR_BERLEBIH = '#EF4444'

function barColor(pct) {
  if (pct == null) return COLOR_OPTIMAL
  if (pct >= 100) return COLOR_BERLEBIH
  if (pct >= 50)  return COLOR_SEDANG
  return COLOR_OPTIMAL
}

// Grafik batang: % asupan per kemasan terhadap batas harian (Permenkes 30/2013)
export default function IntakeChart({ calc }) {
  const p = calc.pct_harian_kemasan
  const bars = [
    ['Gula',    p.gula,    barColor(p.gula)],
    ['Natrium', p.natrium, barColor(p.natrium)],
    ['Lemak',   p.lemak,   barColor(p.lemak)],
  ].filter(([, v]) => v != null)

  if (bars.length === 0) return null

  const MAXH = 150
  const CEIL = 120
  const guide = Math.round((100 / CEIL) * MAXH)

  return (
    <div className="ns-chart-card">
      <div className="ns-chart-head">
        <div className="ns-chart-title">Asupan vs Batas Harian</div>
        <div className="ns-chart-legend">
          <Legend color={COLOR_OPTIMAL} label="Optimal" />
          <Legend color={COLOR_SEDANG}  label="Sedang" />
          <Legend color={COLOR_BERLEBIH} label="Berlebih" />
        </div>
      </div>
      <div className="ns-chart-sub">
        % terhadap batas konsumsi harian · per kemasan utuh
      </div>

      <div className="ns-chart-plot">
        <div className="ns-chart-yaxis">% Batas Harian</div>
        <div className="ns-chart-grid">
          <div className="ns-guide ns-guide-100" style={{ bottom: guide + 26 }}>
            <span className="ns-guide-tag">100%</span>
          </div>
          <div className="ns-guide ns-guide-0" style={{ bottom: 26 }}>
            <span className="ns-guide-tag">0%</span>
          </div>

          <div className="ns-bars" style={{ height: MAXH + 26 }}>
            {bars.map(([name, val, color]) => {
              const capped = Math.min(Math.max(val, 0), CEIL)
              const h = val > 0 ? Math.max(6, Math.round((capped / CEIL) * MAXH)) : 3
              return (
                <div className="ns-bar-col" key={name}>
                  <div className="ns-bar-track" style={{ height: MAXH }}>
                    <div className="ns-bar-pct" style={{ bottom: h + 6, color }}>
                      {pctStr(val)}
                    </div>
                    <div className="ns-bar-fill" style={{ height: h, background: color }} />
                  </div>
                  <div className="ns-bar-label">{name}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div className="ns-legend-item">
      <span className="ns-legend-dot" style={{ background: color }} />
      {label}
    </div>
  )
}
