import { gradeSummary, NL_OFFICIAL, NA_COLOR } from '../../lib/nutrilevel.js'

const GRADES = ['A', 'B', 'C', 'D']

export default function GradeCard({ calc, fields }) {
  const s = gradeSummary(calc, fields)
  const col = s.active ? NL_OFFICIAL[s.active] : NA_COLOR

  return (
    <div className="ns-grade-card">
      <div className="ns-grade-left">
        <div className="ns-grade-eyebrow">
          <span className="ns-grade-pill">Nutri-Level GGL</span>
          <span className="ns-grade-conf">
            <b>{s.conf}%</b> Keyakinan AI
          </span>
        </div>
        <div className="ns-grade-title">{s.title}</div>
        <div className="ns-grade-desc">{s.desc}</div>
      </div>

      <div className="ns-grade-right">
        <div className="ns-grade-pills">
          {GRADES.map((g) => {
            const on = g === s.active
            const gc = NL_OFFICIAL[g]
            return (
              <div
                className={`ns-grade-pill-item ${on ? 'on' : 'off'}`}
                key={g}
                style={on
                  ? { background: gc, color: '#fff', borderColor: gc }
                  : { opacity: 0.2 }
                }
              >
                {g}
              </div>
            )
          })}
        </div>
        <div className="ns-grade-score-row">
          <span className="ns-grade-score-lbl">Skor Nutri-Level</span>
          <span className="ns-grade-score-val" style={{ color: col }}>{s.scoreLbl}</span>
        </div>
        <div className="ns-grade-score-bar">
          <div className="ns-grade-score-fill" style={{ width: `${s.scorePct}%`, background: col }} />
        </div>
      </div>
    </div>
  )
}
