# Plan Fase Animasi

Branch: `feat/animations` (dari `cleanup/real-content`). Satu commit per tahap supaya mudah di-review dan di-rollback.

Sumber yang di-port: repo live `Safwan-Web-Portofolio-V2` (`src/components/effects/`, `src/components/layout/LoadingScreen.tsx`, `src/data/cursors.ts`). Library animasi sama: `framer-motion` di sana, `motion/react` di sini (API-nya identik).

## Prinsip (dari pelajaran V3 Canvas)

- Gerakan pakai `transform` dan `opacity` saja. Tidak ada blur yang dianimasikan.
- Hormati *reduce motion*: tambah `<MotionConfig reducedMotion="user">` sekali di root. Loader dan cursor tidak muncul untuk pengguna dengan setelan ini.
- Efek teks menulis langsung ke DOM (seperti `ScrambleText` lama), tidak re-render React tiap frame.
- Cursor palsu berhenti saat tab tidak aktif.

## Tahap 0: Fondasi

- `MotionConfig reducedMotion="user"` di `src/main.tsx`.
- Salin `public/images/cursors/` (safwan, amber, beserta versi arrow) dari repo lama.

## Tahap 1: Motion saat pertama dibuka (intro)

1. **Loader "Safwan-Portfolio.fig"** (`src/components/effects/LoadingScreen.tsx`)
   - Kartu kecil di atas kanvas bertitik: ikon file, nama file, bar progres yang terisi dengan CSS, dan teks "Opening file…". Durasi tetap 2 detik, sama seperti web lama.
   - Scroll halaman dikunci selama loader tampil. Keluarnya dengan fade dan scale 1.02.
   - Warna memakai token yang sudah ada (`paper`, `line`, `accent`).
2. **Hero baru mulai setelah loader selesai**
   - `App` menyimpan state `introDone`. Hero menerima prop `ready`, dan semua `animate` di Hero baru jalan saat `ready` bernilai true. Tanpa ini, animasi hero sudah selesai di balik loader.
   - Urutan: badge role → heading per kata → kipas kartu mengembang → karakter 3D dan kucing SkyBase mengintip dari samping → bubble @ui-ux/@brand/@3d muncul → nama dan tombol CTA.
   - Navbar fade dari atas bersamaan dengan badge.

## Tahap 2: Heading hero (ditunda)

> Di-skip untuk sekarang: Safwan punya ide lain untuk heading, dikerjakan di akhir. Poin di bawah hanya catatan versi web lama.

- "Crafting Digital Experiences" dipecah per kata. Tiap kata naik dari balik garis (mask reveal, `y: 100% → 0`) dengan stagger.
- **"Digital"** memakai font Doto dan efek scramble huruf acak yang mengunci ke teks asli dalam 1,5 detik. Diporting dari `ScrambleText` lama dan dijalankan sekali setelah reveal.
- Hover per kata: scale 1.05 dengan rotasi kecil bergantian (-2°, 2°, -1°), seperti web lama. Hanya untuk perangkat ber-pointer.
- Teks lengkap tetap ada untuk screen reader (`aria-label` di `h1`).

## Tahap 3: Fake cursor Figma

- Port `FakeCursor` dan `MultiplayerCursors`. Data cursor (gambar, warna, delay, pesan) masuk ke `src/data/content.ts`.
- 2 cursor: Safwan (ungu, langsung muncul) dan Fuhim (amber, delay 3 detik). Keduanya bergerak melengkung ke titik acak di viewport, kadang mengetik bubble chat. Pesannya sama dengan web lama.
- Hanya tampil di desktop (lebar ≥ 768px dan `pointer: fine`), mulai setelah intro selesai, dan berhenti saat tab disembunyikan.
- `pointer-events: none` supaya tidak menghalangi klik. z-index di bawah navbar.

## Tahap 4: Verifikasi

- `npm run build` dan `tsc` lulus.
- Cek di Chrome dan Safari desktop, mobile 375px, serta dengan setelan *reduce motion* aktif.
- Cek performa: tidak ada frame drop saat cursor jalan bersamaan dengan scroll Services.

## Keputusan yang perlu dikonfirmasi

| Hal | Default yang saya pakai |
|---|---|
| Loader tampil kapan | Sekali per sesi browser (`sessionStorage`); refresh di tab yang sama langsung masuk |
| Pesan chat cursor | Sama persis dengan web lama |

## Di luar scope fase ini

Animasi scroll section lain (Services, Projects, About), case study pages, dan System Analysis card.
