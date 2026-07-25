import { NL_OFFICIAL, NL_DESC } from '../../lib/nutrilevel.js'
import { Separator } from '@/components/ui/separator'

const GRADES = ['A', 'B', 'C', 'D']

export default function NutriLevelDialog({ active, onClose }) {
  return (
    <div className="ns-modal-overlay" onClick={onClose}>
      <div className="ns-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="ns-dialog-head">
          <h3>Tentang Nutri-Level</h3>
          <button className="ns-icon-btn" onClick={onClose} aria-label="Tutup">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <Separator className="mb-5" />

        <div className="ns-dialog-body">
          <p className="ns-nlinfo-lead">
            <b>Nutri-Level</b> adalah label peringkat gizi (A–D) untuk minuman/pangan olahan sesuai{' '}
            <a
              href="https://jdih.kemkes.go.id/documents/keputusan-menteri-kesehatan-nomor-hk0107menkes3012026"
              target="_blank"
              rel="noopener noreferrer"
              className="ns-ext-link"
              title="Buka keputusan di JDIH"
              aria-label="Buka Kepmenkes di JDIH"
            >
              <b>Kepmenkes No. HK.01.07/MENKES/301/2026</b>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: 6, verticalAlign: 'text-bottom' }}
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6" />
                <path d="M10 14L21 3" />
              </svg>
            </a>. Level dihitung dari kandungan{' '}
            <b>Gula, Garam (natrium), dan Lemak Jenuh (GGL)</b> per 100 ml; level akhir mengikuti komponen yang{' '}
            <b>paling tinggi (terburuk)</b>.
          </p>

          <div className="ns-nlstrip">
            {GRADES.map((g) => {
              const on = g === active
              const col = NL_OFFICIAL[g]
              return (
                <div className={`ns-nlstrip-cell ${on ? 'on' : ''}`} key={g}>
                  <div
                    className="ns-nlstrip-letter"
                    style={
                      on
                        ? { background: col, color: '#fff' }
                        : { background: '#fff', color: col, border: `2px solid ${col}` }
                    }
                  >
                    {g}
                    {on && <div className="ns-nlstrip-arrow" style={{ borderTopColor: col }} />}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="ns-nlinfo-rows">
            {GRADES.map((g) => (
              <div className="ns-nlinfo-row" key={g}>
                <div className="ns-nlinfo-badge" style={{ background: NL_OFFICIAL[g] }}>
                  {g}
                </div>
                <div className="ns-nlinfo-text">
                  <b>Level {g}</b>{g === 'A' ? ': ' : ' — '}{NL_DESC[g]}
                </div>
              </div>
            ))}
          </div>

          <div className="ns-nlinfo-note">
            Warna mengikuti ketentuan resmi: A hijau tua, B hijau muda, C kuning, D merah. Level A juga
            mensyaratkan <b>tanpa pemanis</b> dan level B <b>hanya pemanis alami</b> — syarat ini diperiksa dari
            daftar komposisi, bukan dari tabel nilai gizi.
          </div>
        </div>
      </div>
    </div>
  )
}
