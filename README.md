# Nusca — NutriScan AI

Aplikasi website untuk **memindai label Informasi Nilai Gizi** pada minuman kemasan,
lalu menampilkan klasifikasi **Nutri-Level (A–D)** berdasarkan kandungan
**GGL — Gula, Garam (natrium), dan Lemak Jenuh** sesuai pedoman Kemenkes.

Pengguna mengambil foto label (lewat kamera atau unggah berkas), memangkasnya,
lalu aplikasi mengirim gambar ke backend model untuk dibaca dan dinilai. Hasilnya
berupa skor Nutri-Level, rincian gizi, grafik asupan harian, dan saran konsumsi.

> Antarmuka ini adalah **frontend** saja. Pembacaan label dan perhitungan angka
> dilakukan oleh backend (FastAPI). Lihat [Konfigurasi backend](#konfigurasi-backend).

---

## Teknologi

| Bagian        | Pilihan                                             |
| ------------- | --------------------------------------------------- |
| Framework     | React 18                                            |
| Build tool    | Vite 6                                              |
| Pemangkasan   | `react-image-crop` (pangkas + putar + zoom manual)  |
| Styling       | CSS biasa (tanpa framework) + token desain di `:root`|
| Font          | Plus Jakarta Sans (Google Fonts)                    |
| Penyajian     | Nginx (lewat Docker)                                |

Tidak ada React Router: perpindahan antar langkah ditangani dengan state di
`App.jsx`.

---

## Prasyarat

- **Node.js 20+** dan npm.
- Koneksi ke backend model. Secara default aplikasi memakai backend yang sudah
  ter-deploy, jadi **tidak perlu menjalankan backend lokal** untuk mencobanya.

---

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

| Skrip             | Fungsi                                          |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Server pengembangan (hot reload) di port 5173.  |
| `npm run build`   | Build produksi ke folder `dist/`.               |
| `npm run preview` | Meninjau hasil build secara lokal.              |

---

## Konfigurasi backend

Semua komunikasi ke backend ada di `src/api/client.js`, dengan dua endpoint:

- `GET /status` → `{ mode, message }`. `mode` bernilai `"model"` (memakai model
  asli) atau `"demo"` (nilai contoh). Status ini ditampilkan di sidebar.
- `POST /analyze` (multipart, field `file`) → JSON hasil analisis. Bentuk respons
  utama yang dipakai frontend:

  ```jsonc
  {
    "mode": "model",
    "fields": { "takaran": "...", "gula": "...", "garam": "...", "lemak_jenuh": "..." },
    "calc": {
      "level_akhir": "C",
      "penentu": "gula",
      "level":   { "gula": "C", "garam": "A", "lemak_jenuh": "B" },
      "per100":  { "gula": 8.0, "garam": 30, "lemak_jenuh": 0.5 },
      "pct_harian_kemasan": { "gula": 40, "natrium": 5, "lemak": 8 },
      "vol_ml": 250,
      "catatan": ["..."]
    },
    "panel_image": "data:image/jpeg;base64,..."
  }
  ```

**URL backend** ditentukan oleh variabel lingkungan `VITE_API_BASE`:

- **Dikosongkan (default):** memakai backend Hugging Face yang sudah ter-deploy sehingga aplikasi langsung jalan.
- **Diisi `/api`:** memakai proxy Vite ke backend lokal di port `8080` (sudah
  diatur di `vite.config.js`) — berguna saat mengembangkan backend secara lokal.
- **Diisi URL penuh:** memakai backend terpisah, mis.
  `VITE_API_BASE=https://nutriscan-api-xxxx.a.run.app`.

Untuk deploy ke Vercel:

- Tambahkan variable environment `VITE_API_BASE` di dashboard project.
- Gunakan URL backend produksi, misalnya:

```text
VITE_API_BASE=https://example.hf.space
```

Pastikan file `.env` tidak dicommit. Gunakan `.env.example` sebagai template
konfigurasi lokal.

---

## Alur aplikasi

```
beranda  →  pangkas  →  memproses  →  hasil  →  (pindai lagi) beranda
```

Sidebar menampilkan progres 3 tahap: **1. Capture · 2. Crop · 3. Analyze**.

| State       | Layar          | Keterangan                                            |
| ----------- | -------------- | ----------------------------------------------------- |
| `beranda`   | Beranda        | Hero, ambil foto kamera / unggah gambar, "Cara Kerja" |
| `pangkas`   | Crop           | Pangkas area label, putar ±90°, zoom, pratinjau hasil |
| `memproses` | Menganalisis   | Kirim gambar ke backend + animasi pemindaian          |
| `hasil`     | Hasil Analisis | Skor Nutri-Level, rincian gizi, grafik, saran         |

Catatan kamera: di **perangkat mobile**, tombol kamera membuka kamera native
(`<input capture="environment">`); di **desktop**, dibuka modal webcam berbasis
`getUserMedia`.

---

## Struktur proyek

```
src/
├── main.jsx                  # Entry React (impor globals.css + components.css)
├── App.jsx                   # State alur + tata letak sidebar/konten
├── api/
│   └── client.js             # getHealth() & analyzeImage() ke backend
├── lib/
│   ├── nutrilevel.js         # Pemetaan hasil → warna, label, ambang, insight, saran
│   └── format.js             # Util format angka (desimal koma, persen, dll.)
├── components/
│   ├── Sidebar.jsx           # Brand + progress tracker (dapat dilipat)
│   ├── screens/
│   │   ├── HomeScreen.jsx        # Beranda
│   │   ├── CameraModal.jsx       # Ambil foto via webcam (desktop)
│   │   ├── CropScreen.jsx        # Pangkas + putar + zoom
│   │   ├── ProcessingScreen.jsx  # Proses analisis + animasi
│   │   └── ResultScreen.jsx      # Kerangka halaman hasil
│   └── result/
│       ├── GradeCard.jsx         # Kartu skor Nutri-Level
│       ├── ComponentsSection.jsx # Kartu Gula / Garam / Lemak Jenuh
│       ├── LabelBreakdown.jsx    # Rincian label + gambar panel terdeteksi
│       ├── IntakeChart.jsx       # Grafik asupan vs batas harian
│       ├── ConsumptionTips.jsx   # Saran konsumsi
│       └── NutriLevelDialog.jsx  # Dialog penjelasan Nutri-Level
├── styles/
│   ├── globals.css           # Token desain, kerangka, sidebar, tombol, print
│   └── components.css         # Gaya tiap bagian + aturan responsif
└── assets/                   # hero.png, logo.png
```

---

## Catatan penting

- **Skala Nutri-Level A–D.** Sesuai pedoman Kemenkes (GGL), klasifikasi memakai
  4 tingkat: **A (Sangat Rendah) – B (Rendah) – C (Sedang) – D (Tinggi)** dengan
  warna resmi. Level akhir mengikuti komponen yang paling tinggi (terburuk).
  Definisi tingkat, warna, dan ambang terpusat di `src/lib/nutrilevel.js`.
- **Garam ditampilkan sebagai mg natrium**, mengikuti cara perhitungan ambang
  Kemenkes.
- **Hasil cetak (Print) mengikuti tampilan desktop**, bukan mobile — semua aturan
  responsif memakai `@media screen`, dan ada blok `@media print` khusus yang
  menyembunyikan elemen navigasi serta memperkecil halaman agar muat satu lembar.
- **Sidebar dapat dilipat.** Di layar kecil ia menjadi drawer; tombol panah
  muncul untuk membukanya kembali. Saat sidebar terbuka, modal kamera dipusatkan
  di area konten (bukan menumpuk di bawah sidebar).

---

## Deploy dengan Docker

`Dockerfile` membangun aplikasi dengan Node lalu menyajikan hasil build statis
lewat Nginx pada port **8080**. URL backend disuntik saat build:

```bash
# Build (sematkan URL backend produksi)
docker build --build-arg VITE_API_BASE="https://nuscaapp.example.com" -t nusca-frontend .

# Jalankan
docker run -p 8080:8080 nusca-frontend
```

Konfigurasi penyajian (fallback SPA + cache aset) ada di `nginx.conf`.
