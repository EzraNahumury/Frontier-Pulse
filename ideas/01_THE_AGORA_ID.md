# The Agora — Sistem Reputasi & Kepercayaan untuk EVE Frontier

> *"Di alam semesta di mana hukum sudah mati dan otoritas hanyalah mitos,
> satu-satunya mata uang yang berarti adalah namamu."*

---

## Apa Itu EVE Frontier? (Untuk yang Belum Tahu)

Bayangkan sebuah game online di mana kamu adalah salah satu **manusia terakhir yang tersisa**
di alam semesta. Kamu bangun dari tidur panjang (stasis) di tengah luar angkasa yang berbahaya,
bersama ribuan pemain lain dari seluruh dunia.

Di game ini:
- **Tidak ada polisi.** Tidak ada pemerintah. Tidak ada hukum.
- Kamu harus **menambang sumber daya**, membangun markas, dan bertahan hidup.
- Kamu bisa berdagang dengan pemain lain, membentuk aliansi, atau... mengkhianati mereka.
- Pemain bisa membangun **Smart Assembly** — struktur pintar di luar angkasa seperti:
  - **Smart Gate** (gerbang antar sistem bintang — seperti tol antariksa)
  - **Smart Storage Unit** (gudang penyimpanan — bisa jadi pasar/toko)
  - **Smart Turret** (menara pertahanan otomatis)
- Semua ini berjalan di **blockchain Sui** — artinya semua aksi tercatat secara permanen
  dan transparan di internet.

**Masalah utamanya:** Dalam dunia tanpa hukum, bagaimana kamu tahu **siapa yang bisa dipercaya?**

---

## Apa Itu The Agora?

**The Agora** adalah sebuah website/aplikasi yang menjawab pertanyaan paling mendasar
dalam peradaban: **"Bisa percaya nggak sama orang ini?"**

Bayangkan seperti ini:
- Di dunia nyata, kita punya **BI Checking** (skor kredit) untuk tahu apakah seseorang
  bisa dipercaya dalam urusan keuangan.
- Di Tokopedia/Shopee, kita punya **rating bintang** untuk tahu apakah penjual itu bagus.
- Di Go-Jek, kita punya **rating driver** untuk tahu apakah driver itu aman.

**The Agora adalah "rating bintang" untuk pemain EVE Frontier** — tapi jauh lebih canggih.

Alih-alih satu angka sederhana, The Agora menganalisis **semua perilaku pemain** yang
tercatat di blockchain dan menghasilkan profil kepercayaan yang lengkap dan multi-dimensi.

---

## Kenapa Ini Penting?

Coba bayangkan skenario ini di dalam game:

> Kamu punya sumber daya langka senilai jutaan. Ada pemain asing yang menawarkan
> pertukaran yang terlihat menguntungkan. Tapi kamu tidak tahu siapa dia.
> Apakah dia pedagang jujur? Atau perampok yang akan mengambil barangmu dan kabur?
>
> **Tanpa The Agora:** Kamu hanya bisa menebak. 50/50.
>
> **Dengan The Agora:** Kamu buka profilnya. Terlihat bahwa dia sudah melakukan
> 200+ perdagangan sukses, tidak pernah mengkhianati partner dagang, dan memiliki
> skor Reliability (Keandalan) 94/100. Aman.

The Agora mengubah **dunia barbar tanpa kepercayaan** menjadi **dunia di mana
reputasimu adalah segalanya.**

---

## Hubungan dengan Tema Hackathon: "A Toolkit for Civilization"

Tema hackathon ini adalah "Perangkat untuk Peradaban."

Pertanyaannya: **Apa alat PERTAMA yang dibutuhkan sebuah peradaban?**

Bukan peta. Bukan senjata. Bukan jalur perdagangan. **Kepercayaan.**

- Tanpa kepercayaan → tidak ada perdagangan
- Tanpa perdagangan → tidak ada spesialisasi (semua orang harus melakukan segalanya sendiri)
- Tanpa spesialisasi → tidak ada peradaban. Hanya bertahan hidup.

**The Agora adalah fondasi yang membuat segalanya mungkin.**
Ini bukan fitur tambahan — ini adalah **infrastruktur peradaban itu sendiri.**

---

## Bagaimana Cara Kerjanya?

### Sumber Data

The Agora membaca data dari dua sumber:
1. **World API** — API resmi EVE Frontier yang menyediakan data game (siapa membunuh siapa,
   siapa membangun apa, dll.)
2. **Sui Blockchain** — Semua transaksi on-chain (perdagangan, akses gate, dll.)

### Apa yang Dianalisis?

| Kategori | Yang Dilihat | Contoh |
|----------|-------------|--------|
| **Perilaku Dagang** | Riwayat perdagangan di Smart Storage Unit | "Pemain ini sudah 200x dagang sukses tanpa masalah" |
| **Pola Akses Gate** | Siapa yang diberi akses lewat gate mereka | "Pemain ini membuka gate untuk umum — dermawan" |
| **Perilaku Tempur** | Pola kill/death dan siapa yang diserang | "Pemain ini TIDAK pernah menyerang orang yang baru dagang dengannya" |
| **Kontribusi Infrastruktur** | Apa yang dibangun untuk komunitas | "Pemain ini sudah deploy 12 Smart Assembly publik" |
| **Jaringan Sosial** | Interaksi dengan pemain lain | "Pemain ini menjembatani 3 aliansi berbeda — diplomat" |

### Hasil: Trust Compass (Kompas Kepercayaan)

Setiap pemain mendapat profil visual berbentuk **radar chart** (grafik laba-laba)
dengan 5 dimensi:

```
                    Keandalan (Reliability)
                         ★★★★★
                        /     \
                       /       \
    Perdagangan ★★★★★           ★★★★☆ Diplomasi
    (Commerce)        \       /
                       \     /
                    ★★★★☆   ★☆☆☆☆
              Kepedulian     Volatilitas
            (Stewardship)   (Ketidakstabilan)
```

| Dimensi | Artinya | Pertanyaan yang Dijawab |
|---------|---------|------------------------|
| **Keandalan** | Konsistensi perilaku dari waktu ke waktu | "Dia bisa diandalkan nggak?" |
| **Perdagangan** | Kejujuran dan partisipasi ekonomi | "Dia fair dalam berdagang nggak?" |
| **Diplomasi** | Kerja sama lintas kelompok | "Dia bisa menyatukan orang nggak?" |
| **Kepedulian** | Kontribusi infrastruktur untuk komunitas | "Dia membangun untuk orang lain nggak?" |
| **Volatilitas** | Ketidakstabilan dan risiko (semakin RENDAH semakin baik) | "Dia bisa tiba-tiba berkhianat nggak?" |

### Tipe Pemain yang Terlihat dari Trust Compass

Dari bentuk radar chart, kamu langsung bisa tahu tipe pemain:

- **Pedagang Terpercaya** → Commerce tinggi, Reliability tinggi, Volatility rendah
- **Warlord (Panglima Perang)** → Volatility tinggi, Diplomacy rendah
- **Pembangun Peradaban** → Stewardship tinggi, Diplomacy tinggi
- **Serigala Penyendiri** → Semua moderat, koneksi sosial rendah
- **Wildcard (Tak Terduga)** → Pola tidak menentu, Volatility tinggi — HATI-HATI

---

## Fitur-Fitur Utama

### 1. Pencarian Pemain
Ketik nama pemain mana saja → langsung lihat Trust Compass mereka, riwayat perilaku,
dan event penting (perdagangan terbesar, pengkhianatan, kontribusi infrastruktur).

### 2. Profil Aliansi/Grup
Tidak hanya individu — kamu bisa lihat reputasi **keseluruhan grup/aliansi**.
"Apakah aliansi ini bisa dipercaya, atau cuma satu orang yang reliable dan sisanya chaos?"

### 3. Widget Verifikasi Kepercayaan
Widget yang bisa di-embed di tool/website lain: **"Diverifikasi oleh The Agora"**
Sebelum transaksi, pemain bisa cek Trust Compass lawan bicaranya.

### 4. Alert Perilaku
Notifikasi real-time:
- "Volatility pemain X naik 40% dalam 24 jam terakhir" (waspada!)
- "Skor Commerce aliansi Y menurun — kemungkinan ada masalah internal"

### 5. Leaderboard The Agora
Peringkat berdasarkan dimensi:
- Siapa pedagang paling dipercaya?
- Siapa diplomat terhebat?
- Siapa pembangun paling produktif?

Ini menciptakan **insentif positif** — pemain termotivasi untuk berperilaku baik
karena reputasi mereka terlihat publik.

### 6. Tren Historis
Lihat bagaimana reputasi pemain berubah dari waktu ke waktu.
Pemain yang dulunya bermasalah tapi sekarang sudah stabil? Itu cerita redemption.

---

## Arsitektur Teknis (Cara Membangunnya)

```
┌─────────────────────────────────────────────┐
│              TAMPILAN DEPAN (FRONTEND)       │
│  React + D3.js (visualisasi Trust Compass)  │
│  Next.js / Vite (framework web)             │
│  TailwindCSS (styling)                      │
└─────────────┬───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│           SERVER BELAKANG (BACKEND API)      │
│  Node.js / Python FastAPI                   │
│  - Mesin perhitungan reputasi               │
│  - Analisis pola perilaku                   │
│  - Sistem alert                             │
└─────────────┬───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│              LAPISAN DATA                    │
│  - EVE Frontier World API (data game)       │
│  - Sui RPC (data blockchain)                │
│  - PostgreSQL (data reputasi yang diproses) │
│  - Redis (cache + alert real-time)          │
└─────────────────────────────────────────────┘
```

### Alur Sederhana:
1. **Ambil data** dari World API dan blockchain Sui (apa yang dilakukan setiap pemain)
2. **Proses & hitung** skor reputasi berdasarkan algoritma multi-dimensi
3. **Simpan** hasil di database
4. **Tampilkan** di website sebagai Trust Compass yang interaktif dan indah

---

## Kekuatan di Kategori Penilaian

| Kategori | Kekuatan | Penjelasan |
|----------|----------|------------|
| **Most Utility** (Paling Berguna) | ★★★★★ | Setiap pemain butuh ini. Kepercayaan adalah masalah #1 di dunia tanpa hukum. |
| **Best Technical** (Teknis Terbaik) | ★★★★☆ | Scoring multi-dimensi, analisis graf sosial, pemrosesan real-time. |
| **Most Creative** (Paling Kreatif) | ★★★★☆ | Tidak ada yang akan membangun sistem reputasi. Trust Compass itu unik. |
| **Weirdest Idea** (Ide Paling Aneh) | ★★☆☆☆ | Impressive, tapi bukan "aneh." |
| **Live Integration** (Integrasi Live) | ★★★★☆ | Menarik data langsung dari server Stillness yang aktif. |

---

## Kenapa Ide Ini Sangat Kuat?

1. **Nyambung banget dengan tema.** Ketika juri mendengar "toolkit for civilization" lalu
   melihat alat yang secara literal membangun lapisan kepercayaan yang dibutuhkan peradaban
   — langsung klik.

2. **Tidak ada yang akan memikirkan ini.** Kebanyakan tim akan membangun peta, dashboard,
   atau analytics. Sistem reputasi itu kategori alat yang fundamentally berbeda.

3. **Menciptakan gameplay baru.** Pemain akan mengubah perilaku mereka KARENA The Agora.
   Itu bukan sekadar alat — itu mekanik game baru yang lahir dari sistem eksternal.

4. **Bisa dibangun dalam 5 hari.** Intinya adalah: panggil API → hitung skor → tampilkan
   visual yang indah. Tidak butuh machine learning atau infrastruktur rumit.

5. **Pitch-nya menulis sendiri:** "Peradaban dimulai dari kepercayaan."

---

## Rencana Pembangunan 5 Hari

| Hari | Fokus | Target |
|------|-------|--------|
| 1 | Integrasi World API + desain model data | Pipeline data mentah berfungsi |
| 2 | Mesin perhitungan reputasi | Algoritma scoring menghasilkan hasil |
| 3 | Frontend — Trust Compass + pencarian pemain | UI inti berfungsi |
| 4 | Profil aliansi, leaderboard, alert | Fitur lengkap |
| 5 | Polish, deploy ke data Stillness live, rekam video demo | Siap submit |

---

## Pitch Satu Kalimat

> *"Di alam semesta tanpa hukum, The Agora adalah memori peradaban tentang siapa dirimu
> dan apa yang telah kamu lakukan — lapisan kepercayaan yang membuat segalanya mungkin."*
