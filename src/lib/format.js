// lib/format.js — pembantu format angka & nilai (gaya Indonesia: koma desimal)

export function commaDecimal(n, digits = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return Number(n).toFixed(digits).replace('.', ',')
}

// "0 g" -> "0", "45 mg" -> "45", null -> null
export function numericPart(raw) {
  if (raw === null || raw === undefined || raw === '') return null
  const m = String(raw).match(/-?\d+(?:[.,]\d+)?/)
  return m ? m[0].replace(',', '.') : null
}

// Tampilkan nilai field apa adanya, "—" bila kosong
export function showRaw(raw, suffix = '') {
  if (raw === null || raw === undefined || raw === '') return '—'
  return `${raw}${suffix}`
}

// Bulatkan persen ke bilangan bulat + tanda %
export function pct(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return `${Math.round(n)}%`
}
