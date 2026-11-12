# 🚀 Tutorial Deploy MonaQosah ke Vercel + GitHub

Tutorial lengkap step-by-step untuk meng-host website MonaQosah ke Vercel (gratis) via GitHub.

---

## 📋 Prasyarat

1. **Akun GitHub** — daftar di https://github.com (gratis)
2. **Akun Vercel** — daftar di https://vercel.com (gratis, bisa login pakai akun GitHub)
3. **Git terinstall** di komputer — download dari https://git-scm.com
4. **Node.js 18+** atau **Bun** terinstall — download dari https://nodejs.org atau https://bun.sh

---

## Langkah 1: Download Project dari Z.ai

1. Di preview Z.ai, klik tombol **"Download"** atau **"Export Project"** (jika ada)
2. Atau salin semua file project ke folder di komputer Anda, misal `~/monaqosah-website/`
3. Pastikan struktur folder seperti ini:
   ```
   monaqosah-website/
   ├── src/
   ├── public/
   ├── package.json
   ├── next.config.ts
   ├── tsconfig.json
   ├── tailwind.config.ts
   ├── vercel.json
   ├── README.md
   └── .gitignore
   ```

---

## Langkah 2: Install Git & Setup Identitas

Jika belum pernah pakai Git, setup identitas sekali saja:

```bash
git config --global user.name "Nama Anda"
git config --global user.email "email@example.com"
```

---

## Langkah 3: Buat Repository di GitHub

### Opsi A: Pakai `gh` CLI (paling cepat)

1. Install GitHub CLI: https://cli.github.com
2. Login:
   ```bash
   gh auth login
   ```
3. Buat repo:
   ```bash
   cd ~/monaqosah-website
   gh repo create monaqosah-bahtra --public --source=. --remote=origin --push
   ```

### Opsi B: Manual via website GitHub

1. Buka https://github.com/new
2. Repository name: `monaqosah-bahtra`
3. Pilih **Public** (atau Private jika mau)
4. **Jangan** centang "Add a README", "Add .gitignore", atau "Choose a license" (sudah ada di project)
5. Klik **Create repository**
6. Copy URL repo, misal: `https://github.com/USERNAME/monaqosah-bahtra.git`

---

## Langkah 4: Push Code ke GitHub

Di terminal, di folder project:

```bash
cd ~/monaqosah-website

# Initialize git (jika belum)
git init

# Tambahkan semua file
git add .

# Commit pertama
git commit -m "Initial commit: MonaQosah website"

# Set branch utama ke "main"
git branch -M main

# Hubungkan ke repo GitHub (ganti USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/monaqosah-bahtra.git

# Push ke GitHub
git push -u origin main
```

Jika diminta login, gunakan **Personal Access Token** (bukan password):
1. Buka https://github.com/settings/tokens
2. Generate new token (classic) → centang `repo` scope
3. Copy token, paste di terminal saat diminta password

---

## Langkah 5: Deploy ke Vercel

### Opsi A: Via Website Vercel (paling mudah)

1. Buka https://vercel.com dan klik **"Log In"** → login dengan GitHub
2. Klik **"Add New..."** → **"Project"**
3. Di bagian "Import Git Repository", cari `monaqosah-bahtra`
4. Klik **"Import"**
5. Vercel akan auto-detect sebagai Next.js project. Verifikasi settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `bun run build` atau `npm run build` (Vercel auto-detect)
   - **Install Command**: `bun install` atau `npm install` (auto-detect)
   - **Output Directory**: `.next` (auto)
6. Klik **"Deploy"**
7. Tunggu 2-3 menit sampai build selesai (ada progress bar)
8. Selesai! Website live di URL seperti:
   ```
   https://monaqosah-bahtra.vercel.app
   ```
   (URL final tergantung nama repo dan username GitHub)

### Opsi B: Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   # atau
   bun add -g vercel
   ```
2. Login:
   ```bash
   vercel login
   ```
3. Deploy:
   ```bash
   cd ~/monaqosah-website
   vercel
   ```
4. Ikuti prompt (pilih akun, project name, dll)
5. Production deploy:
   ```bash
   vercel --prod
   ```

---

## Langkah 6: Update Website (Setelah Ada Perubahan)

Setiap kali Anda mengubah code dan mau update website:

```bash
cd ~/monaqosah-website

# Tambah perubahan
git add .

# Commit
git commit -m "Deskripsi perubahan"

# Push ke GitHub
git push origin main
```

Vercel akan **auto-deploy** setiap kali ada push ke branch `main`. Tunggu 1-2 menit, website langsung ter-update.

---

## Langkah 7: Custom Domain (Opsional)

Jika mau pakai domain sendiri (misal `monaqosah.bahtra.id`):

1. Beli domain dari provider (Niagahoster, GoDaddy, Namecheap, dll)
2. Di Vercel dashboard:
   - Buka project → **Settings** → **Domains**
   - Klik **"Add Domain"**
   - Masukkan domain Anda, misal `monaqosah.bahtra.id`
3. Setup DNS di provider domain:
   - Tambah **A Record**:
     - Name: `@` (atau `monaqosah`)
     - Value: `76.76.21.21` (Vercel's IP)
   - Atau **CNAME Record**:
     - Name: `www`
     - Value: `cname.vercel-dns.com`
4. Tunggu 5-30 menit untuk DNS propagate
5. SSL certificate otomatis dari Vercel (Let's Encrypt)
6. Website live di domain custom Anda

---

## 🔧 Troubleshooting

### Error: "Build failed" di Vercel
- Cek log build di Vercel dashboard → tab "Build Logs"
- Biasanya karena dependency issue. Coba:
  ```bash
  rm -rf node_modules package-lock.json bun.lockb
  bun install  # atau npm install
  git add .
  git commit -m "fix: reinstall dependencies"
  git push
  ```

### YouTube music tidak muncul di production
- Browser block autoplay audio sampai user klik
- Solusi: User harus klik mana saja dulu di website, lalu musik akan play
- Atau disable autoplay restriction di Chrome: `chrome://flags/#autoplay-policy` → set "No user gesture is required"

### Logo tidak muncul
- Pastikan file logo ada di folder `public/`
- Cek path di code: `/bahtra-logo-hd.png` atau `/bahtra-logo-vector.svg`
- Setelah push, tunggu deploy selesai

### Domain masih "Deploying"
- DNS propagation butuh waktu 5-30 menit
- Cek status DNS: https://dnschecker.org
- Pastikan A record atau CNAME sudah benar

### Build timeout di Vercel
- Project Next.js dengan three.js bisa berat
- Tambah di `vercel.json`:
  ```json
  {
    "functions": {
      "src/app/**": { "maxDuration": 60 }
    }
  }
  ```

---

## 📁 File Penting untuk Deploy

### `.gitignore` (sudah ada di project)
Mencegah file tidak perlu ter-upload ke GitHub:
```
node_modules/
.next/
.env
*.log
```

### `vercel.json` (sudah ada di project)
Konfigurasi deploy Vercel:
```json
{
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "installCommand": "bun install"
}
```

### Environment Variables (jika perlu)
Jika project butuh API keys atau secrets:
1. Di Vercel dashboard → Settings → Environment Variables
2. Tambah key-value pairs
3. Redeploy

---

## 🆘 Butuh Bantuan?

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Docs**: https://docs.github.com
- **Next.js Deploy Guide**: https://nextjs.org/docs/app/building-your-application/deploying

---

## ✅ Checklist Deploy

- [ ] Akun GitHub dibuat
- [ ] Akun Vercel dibuat (login via GitHub)
- [ ] Git terinstall & configured
- [ ] Project di-download dari Z.ai
- [ ] `git init` + `git add` + `git commit`
- [ ] Repo GitHub dibuat
- [ ] `git push` ke GitHub berhasil
- [ ] Vercel import repo berhasil
- [ ] Build Vercel sukses
- [ ] Website live di `*.vercel.app`
- [ ] (Opsional) Custom domain dikonfigurasi
- [ ] (Opsional) Auto-deploy dari GitHub berfungsi

Selesai! 🎉 Website MonaQosah Anda sekarang live dan bisa diakses dari mana saja.
