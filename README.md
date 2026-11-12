# MonaQosah · Pondok Pesantren Bahtra

Website layar proyektor untuk sidang ujian keilmuan santri (MonaQosah) dengan animasi loading screen sinematik, fitur MC Screen, dan dukungan upload file Word (.docx).

## Fitur

- **Loading Screen Sinematik** — Animasi pembuka dengan logo Bahtra HD, kaligrafi مناقشة, partikel mengambang, dan iringan musik orkestra Arab (maqam Rast).
- **Layar Proyektor** — Drag & drop file Word (.docx) ke layar, isi file langsung tampil dengan styling putih-hijau (seperti kertas Word) dan teks hitam.
- **MC Screen** — Layar khusus untuk MC berbicara (setelah peserta selesai diuji). Menampilkan logo Bahtra dengan animasi mengambang + musik orkestra Arab. Tombol "MC Screen" di header.
- **Logo HD** — Logo Bahtra diupscale ke 1120×1120px dengan sharpening untuk kualitas tajam di proyektor.
- **Tema Putih-Hijau** — Background putih kertas, header hijau dengan teks putih, heading hijau, body teks hitam.
- **Audio Toggle** — Bisa on/off musik Arab kapan saja via tombol di header.
- **Persistence** — File Word yang diupload tetap tersimpan di localStorage walau halaman di-refresh.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript 5**
- **Tailwind CSS 4** + shadcn/ui
- **Framer Motion** — Animasi UI
- **mammoth.js** — Parse .docx → HTML
- **Web Audio API** — Musik orkestra Arab procedural (maqam Rast scale: oud + nay + darbuka + drone)
- **Zustand** — State management

## Cara Pakai

1. Buka website → tunggu loading screen selesai (~15 detik, dengan musik Arab)
2. Drag file `.docx` dari komputer ke area drop zone
3. Isi file Word otomatis tampil di layar proyektor (teks hitam di kertas putih)
4. Saat MC berbicara (setelah peserta diuji), klik tombol **"MC Screen"** di header
5. MC Screen muncul dengan logo Bahtra mengambang + musik Arab
6. Klik "Tutup" untuk kembali ke layar proyektor

## Deploy ke Vercel + GitHub

### Langkah 1: Push ke GitHub

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit: MonaQosah website"

# Buat repo baru di GitHub (via web atau gh CLI)
gh repo create monaqosah-bahtra --public

# Push ke GitHub
git remote add origin https://github.com/USERNAME/monaqosah-bahtra.git
git branch -M main
git push -u origin main
```

### Langkah 2: Deploy ke Vercel

1. Buka https://vercel.com dan login dengan akun GitHub
2. Klik **"Add New Project"**
3. Import repository `monaqosah-bahtra` dari GitHub
4. Vercel akan auto-detect sebagai Next.js project. Settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `bun run build` (atau `npm run build`)
   - **Install Command**: `bun install` (atau `npm install`)
   - **Output Directory**: `.next` (auto-detected)
5. Klik **"Deploy"**
6. Tunggu ~2-3 menit sampai build selesai
7. Website live di `https://monaqosah-bahtra.vercel.app` (URL final tergantung nama repo)

### Langkah 3: Custom Domain (Opsional)

1. Di Vercel dashboard → Settings → Domains
2. Tambah domain custom (misal `monaqosah.bahtra.id`)
3. Setup DNS sesuai instruksi Vercel
4. SSL certificate otomatis dari Vercel

## File Word Format

File `.docx` yang diupload akan diparse dan ditampilkan persis seperti di Word. Format yang didukung:
- Heading (h1, h2, h3, h4)
- Paragraph dengan bold/italic
- Tabel dengan header
- List (bullet & numbered)
- Arabic text (auto RTL dengan font Arabic)
- Blockquote

## Struktur Project

```
src/
├── app/
│   ├── layout.tsx          # Root layout + metadata + fonts
│   ├── page.tsx            # Main page (loading → projector + MC screen)
│   └── globals.css         # Tema putih-hijau + .docx-content styling
├── components/
│   └── monaqosah/
│       ├── loading-screen.tsx    # Loading screen sinematik
│       ├── site-header.tsx       # Header hijau + tombol MC Screen + audio
│       ├── projector-display.tsx # Drop zone + Word content renderer
│       ├── mc-screen.tsx         # MC Screen overlay dengan logo mengambang
│       └── (book-3d.tsx, chest-3d.tsx - tidak dipakai, bisa dihapus)
├── lib/
│   ├── arabic-music.ts     # Procedural Arabic orchestra (maqam Rast)
│   ├── docx-parser.ts      # mammoth.js wrapper
│   └── sounds.ts           # Sound effects lama (tidak dipakai)
├── store/
│   └── monaqosah.ts        # Zustand store
public/
├── bahtra-logo-hd.png      # Logo Bahtra HD 1120×1120
├── bahtra-logo-hd.webp     # Logo Bahtra HD WebP
├── bahtra-logo.webp        # Logo asli (backup)
└── monaqosah-logo.svg      # Logo lama (tidak dipakai)
```

## Lisensi

© Pondok Pesantren Bahtra. Untuk penggunaan internal pesantren.
