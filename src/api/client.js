// api/client.js — komunikasi dengan backend FastAPI

// Base URL: harus didefinisikan lewat VITE_API_BASE di environment.
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
const url = (path) => `${BASE}${path}`

export async function getHealth() {
  try {
    const r = await fetch(url('/status'))
    if (!r.ok) throw new Error('health gagal')
    const json = await r.json() // { mode, message }
    return { status: 'ok', mode: json.mode, message: json.message }
  } catch {
    return { status: 'error', mode: 'demo', message: 'Backend tidak terjangkau' }
  }
}

// Kirim blob/file gambar panel gizi -> hasil analisis JSON.
export async function analyzeImage(blob, filename = 'label.jpg') {
  const form = new FormData()
  form.append('file', blob, filename)
  const r = await fetch(url('/analyze'), { method: 'POST', body: form })
  if (!r.ok) {
    let detail = `Analisis gagal (HTTP ${r.status})`
    try {
      const j = await r.json()
      if (j.detail) detail = j.detail
    } catch {
    }
    throw new Error(detail)
  }
  return await r.json()
}
