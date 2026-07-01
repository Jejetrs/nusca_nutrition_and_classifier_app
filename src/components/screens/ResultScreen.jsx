import { useState } from 'react'
import GradeCard from '../result/GradeCard.jsx'
import ComponentsSection from '../result/ComponentsSection.jsx'
import LabelBreakdown from '../result/LabelBreakdown.jsx'
import IntakeChart from '../result/IntakeChart.jsx'
import ConsumptionTips from '../result/ConsumptionTips.jsx'
import NutriLevelDialog from '../result/NutriLevelDialog.jsx'
import { Button } from '@/components/ui/button'

export default function ResultScreen({ result, onRestart }) {
  const { mode, fields, calc, panel_image: panelImage } = result
  const [dialog, setDialog] = useState(false)
  const verified = mode === 'model' ? 'Dianalisis AI' : 'Mode Demo · contoh ilustrasi'

  return (
    <div className="ns-result">
      {/* Header */}
      <div className="ns-result-header">
        <div>
          <h2>Hasil Analisis</h2>
          <div className="ns-meta">{verified} &middot; Dipindai baru saja</div>
        </div>
        <div className="ns-header-actions">
          <button className="ns-icon-btn square" onClick={() => window.print()} title="Cetak / simpan PDF" aria-label="Cetak">
            <PrintIcon />
          </button>
          <Button variant="nutri" size="sm" className="min-w-0 whitespace-normal" onClick={() => setDialog(true)}>
            <InfoIcon /> Tentang Nutri-Level
          </Button>
        </div>
      </div>

      <GradeCard calc={calc} fields={fields} />
      <ComponentsSection calc={calc} fields={fields} />
      <LabelBreakdown calc={calc} fields={fields} panelImage={panelImage} mode={mode} />
      <IntakeChart calc={calc} />
      <ConsumptionTips calc={calc} />

      {/* Aksi bawah */}
      <div className="ns-result-footer">
        <button className="ns-btn blue lg" onClick={onRestart}>
          <ReturnIcon /> Pindai Minuman Lain
        </button>
      </div>

      {dialog && <NutriLevelDialog active={calc.level_akhir} onClose={() => setDialog(false)} />}
    </div>
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
function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  )
}
function ReturnIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H9" />
    </svg>
  )
}
