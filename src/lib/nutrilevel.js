// lib/nutrilevel.js
// =================
// Perhitungan angka dilakukan di backend; modul ini hanya memetakan hasil ke
// warna, label, ambang, insight Kepmenkes, peringatan, dan saran konsumsi.

import { commaDecimal, pct as pctStr } from './format.js'

// ── Warna level (A terbaik → D terburuk) ─────────────────────────────────────
export const LEVEL = {
  A: { bg: '#16A34A', soft: '#DCFCE7', text: '#166534' },
  B: { bg: '#84CC16', soft: '#ECFCCB', text: '#3F6212' },
  C: { bg: '#F59E0B', soft: '#FEF3C7', text: '#92400E' },
  D: { bg: '#EF4444', soft: '#FEE2E2', text: '#991B1B' },
}
export const NA_COLOR = '#94A3B8'
export const gradeColor = (g) => (LEVEL[g] ? LEVEL[g].bg : NA_COLOR)

export const NL_OFFICIAL = { A: '#1A7A3D', B: '#7AB829', C: '#F4A81D', D: '#C0241B' }

// ── Ambang Nutri-Level per 100 ml (batas atas A,B,C) ─────────────────────────
export const NL_BATAS = {
  gula: [1.0, 5.0, 10.0], // g
  garam: [5.0, 120.0, 500.0], // mg natrium
  lemak_jenuh: [0.7, 1.2, 2.8], // g
}

export const QUALITY = {
  A: 'Sangat Baik',
  B: 'Kualitas Baik',
  C: 'Kualitas Sedang',
  D: 'Perlu Diperhatikan',
}
export const GRADE_LABEL = { A: 'Sangat Rendah', B: 'Rendah', C: 'Sedang', D: 'Tinggi' }

const SCORE_MAP = {
  A: [100, 'SANGAT BAIK'],
  B: [82, 'BAIK'],
  C: [55, 'SEDANG'],
  D: [30, 'TINGGI'],
}

const PENENTU_LBL = {
  gula: 'gula',
  garam: 'garam (natrium)',
  lemak_jenuh: 'lemak jenuh',
}

// ── Ringkasan grade utama (judul, deskripsi, skor, keyakinan) ────────────────
export function gradeSummary(calc, fields) {
  const level = calc.level_akhir
  const core = ['takaran', 'gula', 'lemak_jenuh', 'garam']
  const present = core.filter((k) => fields[k]).length
  const conf = Math.round(72 + (28 * present) / core.length)
  const pen = PENENTU_LBL[calc.penentu] || 'salah satu komponen'

  if (!level) {
    return {
      conf,
      title: 'Belum Dapat Dinilai',
      desc:
        'Label belum terbaca lengkap. Pastikan foto mencakup seluruh tabel Informasi ' +
        'Nilai Gizi termasuk takaran saji dalam ml.',
      scorePct: 0,
      scoreLbl: 'TIDAK TERSEDIA',
      scoreCol: NA_COLOR,
      active: null,
    }
  }

  let desc
  if (level === 'A' || level === 'B') {
    desc =
      'Minuman ini tergolong sehat. Kandungan gula, garam, dan lemak jenuh berada dalam ' +
      'batas yang baik untuk dikonsumsi sehari-hari.'
  } else if (level === 'C') {
    desc = `Minuman ini cukup sehat, namun kandungan ${pen} tergolong sedang. Sebaiknya dikonsumsi secukupnya dan tidak berlebihan.`
  } else {
    desc = `Kandungan ${pen} pada minuman ini cukup tinggi. Sebaiknya dibatasi dan diimbangi dengan pola makan sehat.`
  }

  const [scorePct, scoreLbl] = SCORE_MAP[level]
  return { conf, title: QUALITY[level], desc, scorePct, scoreLbl, scoreCol: gradeColor(level), active: level }
}

// ── Insight per komponen (band Kepmenkes + wawasan kesehatan) ────────────────
const INSIGHT = {
  gula: {
    A: 'kandungan gula sangat rendah — aman untuk konsumsi rutin.',
    B: 'gula tergolong rendah — masih relatif aman, tetap perhatikan porsi.',
    C: 'gula tergolong sedang — batasi agar total gula harian tetap terjaga.',
    D: 'gula tinggi — konsumsi berlebih berisiko bagi berat badan & gula darah.',
  },
  lemak_jenuh: {
    A: 'lemak jenuh sangat rendah — baik bagi kesehatan jantung.',
    B: 'lemak jenuh rendah — masih dalam batas wajar.',
    C: 'lemak jenuh sedang — batasi untuk menjaga kolesterol.',
    D: 'lemak jenuh tinggi — berlebih dapat meningkatkan kolesterol jahat.',
  },
  garam: {
    A: 'natrium sangat rendah — ramah untuk tekanan darah.',
    B: 'natrium rendah — relatif aman untuk konsumsi harian.',
    C: 'natrium sedang — perhatikan total garam dari sumber lain.',
    D: 'natrium tinggi — berlebih berisiko menaikkan tekanan darah.',
  },
}

const fx = (x) => String(x).replace('.', ',')

export function bandText(fkey, lv, unit) {
  const [a, b, c] = NL_BATAS[fkey]
  return {
    A: `≤ ${fx(a)} ${unit}/100 ml`,
    B: `${fx(a)}–${fx(b)} ${unit}/100 ml`,
    C: `${fx(b)}–${fx(c)} ${unit}/100 ml`,
    D: `> ${fx(c)} ${unit}/100 ml`,
  }[lv]
}

export function componentInsight(fkey, lv) {
  if (!lv || !INSIGHT[fkey]) return null
  return INSIGHT[fkey][lv]
}

// tampil pada skala A-D mini
export function scaleBounds(fkey) {
  const [a, b, c] = NL_BATAS[fkey]
  return { A: `≤${fx(a)}`, B: `≤${fx(b)}`, C: `≤${fx(c)}`, D: `>${fx(c)}` }
}

// ── Peringatan (komponen level C/D) ──────────────────────────────────────────
export function buildAlerts(calc, fields) {
  const lbl = PENENTU_LBL
  const pctKey = { gula: 'gula', garam: 'natrium', lemak_jenuh: 'lemak' }
  const unit = { gula: 'g', garam: 'mg', lemak_jenuh: 'g' }
  const out = []
  for (const key of ['gula', 'garam', 'lemak_jenuh']) {
    const lv = calc.level[key]
    if (lv === 'C' || lv === 'D') {
      const raw = fields[key] != null && fields[key] !== '' ? fields[key] : key === 'lemak_jenuh' ? '0' : '?'
      const p100 = calc.per100[key]
      const p = p100 != null ? calc.pct_harian_kemasan[pctKey[key]] : null
      const p100s = p100 != null ? `${commaDecimal(p100)} ${unit[key]}/100 ml` : ''
      if (p != null) {
        out.push(
          `Minuman ini mengandung <strong>${raw}</strong> ${lbl[key]} per sajian (≈ ${p100s}). ` +
            `Setara <strong>${pctStr(p)}</strong> dari batas konsumsi harian.`,
        )
      } else {
        const tinggi = lv === 'D' ? 'tinggi' : 'sedang'
        out.push(
          `Minuman ini mengandung <strong>${raw}</strong> ${lbl[key]} per sajian (${p100s}). ` +
            `Kandungan ini tergolong <strong>${tinggi}</strong>.`,
        )
      }
    }
  }
  return out
}

// ── Saran konsumsi (3 kolom) ─────────────────────────────────────────────────
export function consumptionTips(calc) {
  if (!calc.level_akhir) {
    return {
      time: 'Tidak ada saran',
      limit: 'Tidak ada saran',
      alt: 'Tidak ada saran',
    }
  }

  const lv = calc.level
  const vol = calc.vol_ml != null ? calc.vol_ml : '—'

  let time =
    'Waktu terbaik menikmati minuman ini adalah siang hari, saat metabolisme sedang aktif.'
  let limit =
    `Cukup 1 sajian (${vol} ml) per hari agar asupan gula, garam, dan lemak jenuh tetap terjaga.`
  let alt =
    'Untuk konsumsi rutin, pilih minuman dengan gula di bawah 5 g dan natrium di bawah 120 mg per 100 ml.'

  if (lv.gula === 'C' || lv.gula === 'D') {
    time =
      'Hindari minum ini menjelang tidur — kandungan gula tinggi bisa mengganggu metabolisme malam hari.'
    limit =
      'Perbanyak air putih dan batasi minuman ini agar total asupan gula harian tetap aman.'
  }
  if (lv.garam === 'C' || lv.garam === 'D') {
    alt =
      'Jika sudah minum ini, kurangi makanan dan minuman tinggi garam lainnya di hari yang sama.'
  }
  if (lv.lemak_jenuh === 'C' || lv.lemak_jenuh === 'D') {
    alt =
      'Untuk sehari-hari, pilih minuman dengan lemak jenuh di bawah 0,7 g per 100 ml sebagai alternatif.'
  }
  return { time, limit, alt }
}

// ── Catatan penting (estimasi/asumsi + catatan mode demo) ────────────────────
export function importantNotes(calc, mode) {
  const notes = calc.catatan || []
  const keys = ['estimasi', 'asumsi', 'tidak', 'proksi', 'level a']
  const important = notes
    .filter((c) => keys.some((t) => c.toLowerCase().includes(t)))
    .slice(0, 4)
  return { important, demo: mode === 'demo' }
}

// Deskripsi resmi tiap level (dialog)
export const NL_DESC = {
  A: 'Pilihan paling baik — kandungan gula, garam, dan lemak jenuh paling rendah.',
  B: 'Pilihan baik — kandungan GGL tergolong rendah.',
  C: 'Konsumsi secukupnya — kandungan GGL tergolong sedang.',
  D: 'Batasi konsumsi — kandungan GGL tergolong tinggi.',
}
