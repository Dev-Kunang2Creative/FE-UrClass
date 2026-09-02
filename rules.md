# Aturan kerja FE-UrClass

Setiap aturan di sini lahir dari kejadian nyata di repo ini, dan disertai
sebabnya. Kalau sebabnya tidak lagi berlaku, aturannya boleh dibantah — tapi
bantahlah sebabnya, jangan hanya melanggar aturannya.

---

## 1. Build dan type-check

### Berkas test tidak boleh masuk lingkup type-check aplikasi

`tsconfig.json` meng-`exclude` `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts`,
dan `**/*.spec.tsx`. Jangan dihapus.

**Kejadiannya:** build Hostinger gagal total dengan
`TS5097: An import path can only end with a '.ts' extension` di
`src/lib/navigation.test.ts`. `tsconfig` meng-`include` `**/*.ts` dan hanya
mengecualikan `node_modules`, sehingga berkas test ikut di-type-check sebagai
kode aplikasi.

**Yang penting:** impor `./navigation.ts` itu **benar**. Node 22.6+ menjalankan
TypeScript secara native dan justru mewajibkan ekstensi eksplisit pada impor
relatif. **Jangan pernah memperbaiki TS5097 dengan membuang ekstensi `.ts`** —
build akan lolos tapi test-nya rusak. Yang dikecualikan berkasnya, bukan
ekstensinya.

### Setiap berkas test harus bisa dijalankan sebuah perintah

`npm test` menjalankan `node --test "src/**/*.test.ts"`.

**Kejadiannya:** `navigation.test.ts` ada di repo tanpa script yang bisa
menjalankannya. Ia tidak menguji apa pun — hanya menggagalkan build. Berkas test
yang tidak bisa dijalankan bukan test, itu beban.

Peringatan `MODULE_TYPELESS_PACKAGE_JSON` saat `npm test` dibiarkan.
Menghilangkannya berarti menambahkan `"type": "module"` ke `package.json`, yang
mengubah resolusi modul seluruh aplikasi Next demi catatan performa pada dua
berkas test.

### `next build` adalah gerbangnya, bukan `tsc` saja

Urutan verifikasi sebelum commit:

```bash
npx tsc --noEmit     # harus bersih
npm test             # harus lolos
npm run build        # harus "Compiled successfully", seluruh rute utuh
npx eslint           # lihat aturan di bawah
```

`tsc --noEmit` bisa bersih sementara `next build` gagal — build punya langkah
type-check sendiri dengan lingkup berbeda. Pernah terjadi persis begitu.

### `npx eslint` harus 0 error

Pernah ada dua error `react-hooks/set-state-in-effect` yang sudah lama menetap
di `development` (`useSchedule.ts` dan `DialogOnboardingTour.tsx`). **Keduanya
sudah diperbaiki.** Basis sekarang bersih, jadi error apa pun yang muncul
berasal dari perubahanmu sendiri.

Kalau ragu apakah sebuah error sudah ada sebelumnya:
`git stash -u && npx eslint && git stash pop`.

### Hook tidak boleh dipanggil setelah early return

**Kejadiannya:** `SettingsContent.tsx` punya `if (!session) return <spinner>` di
tengah, dan hook baru sempat dipasang di bawahnya. eslint
(`react-hooks/rules-of-hooks`) menangkapnya sebelum sampai runtime.

Panggil hook di atas semua early return, lalu saring lewat opsi `enabled`-nya —
bukan dengan tidak memanggilnya.

### Jangan menyemai state form dari `useEffect`

Aturan yang sama (`react-hooks/set-state-in-effect`) juga kena pola "ambil data,
lalu `setState` di effect untuk mengisi form". Selain ditolak eslint, pola itu
menimpa suntingan pengguna setiap kali query menyegarkan diri.

Yang dipakai di repo ini: pisahkan formnya jadi komponen sendiri dan
**remount lewat `key`**, sehingga state-nya lahir sudah membawa nilai yang benar.
Contohnya di
`src/components/organisms/dashboard/admin/ai/DashboardAdminAiSettingsWrapper.tsx`.

---

## 2. Dependensi

### `npm audit` setelah setiap perubahan dependensi

Target: **0 kerentanan**. Dua kali dalam repo ini dashboard CVE menemukan
puluhan temuan yang tidak pernah dilihat siapa pun.

Sebelum menambal, jalankan `npm why <paket>` dulu. Sebagian besar temuan
transitif ternyata **masih di dalam rentang semver induknya** dan hanya tertahan
lockfile — `npm update <paket>` cukup, tidak perlu `overrides` paksa. Yang sudah
terjadi begitu: `nanoid`, `dompurify`, `hono`, `browserslist`,
`postcss-selector-parser`.

### `xlsx` dipasang dari CDN SheetJS, bukan npm

```json
"xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz"
```

**Jangan mengembalikannya ke `npm i xlsx`.** SheetJS memindahkan distribusinya ke
CDN sendiri sejak 0.19, sehingga `xlsx@0.18.5` adalah versi terakhir di registry
dan **selamanya** membawa prototype pollution (GHSA-4r6h-8v6p-xvw6) serta ReDoS
(GHSA-5pgg-2g8v-p4x9) tanpa perbaikan. Memasang dari CDN resminya adalah
remediasi yang dianjurkan SheetJS sendiri.

Konsekuensi yang perlu diingat: `npm install` jadi bergantung pada
`cdn.sheetjs.com`, bukan registry npm. Kalau CI punya allowlist host, domain itu
harus ada di dalamnya.

### `shadcn` adalah devDependency

Ia CLI plus stylesheet build-time (`globals.css` meng-`@import
"shadcn/tailwind.css"`), bukan dependensi runtime. Di `dependencies` ia menyeret
`@modelcontextprotocol/sdk`, `hono`, dan rantai babel/postcss ke pohon dependensi
**produksi** — dan dari situlah datang empat CVE terakhir. Build tetap jalan
karena build dijalankan dengan devDependencies terpasang.

### Next.js: naikkan ke stabil terbaru, jangan minimum tambalan

Saat 27 dari 39 CVE ada di `next`, menaikkannya ke 16.3.3 (stabil terbaru)
sekaligus menyelesaikan dua paket transitif tanpa `overrides`: 16.3.3 menarik
`sharp@^0.35.3` dan mem-pin `postcss@8.5.23`, dua-duanya versi yang sudah
ditambal. Versi minimum tambalan (16.2.11) akan meninggalkan keduanya.

---

## 3. Content-Security-Policy

`next.config.ts` memasang CSP ketat. **Setiap host pihak ketiga yang dipanggil
dari browser harus ditambahkan ke `connect-src`.**

**Kejadiannya:** pencarian sekolah lewat mirror Dapodik tidak pernah menemukan
apa pun. CORS-nya sudah dicek dan baik; yang memblokir CSP aplikasi sendiri, dan
**permintaannya diblokir tanpa pesan apa pun di antarmuka** — kolomnya sekadar
tidak pernah menemukan hasil, persis seperti kalau datanya memang kosong.

Kalau sebuah picker "tidak menemukan apa-apa", periksa `connect-src` **sebelum**
mencurigai datanya.

---

## 4. Field data referensi

### Semuanya autocomplete, dan semuanya wajib menerima ketikan manual

Pakai `src/components/atoms/combobox/ReferenceCombobox.tsx`. Jangan membuat
combobox yang mengunci pilihan.

Berlaku untuk asal sekolah, provinsi, kabupaten/kota, kampus, program studi,
instansi, dan formasi.

**Sebabnya:** tidak satu pun dataset itu lengkap. Tabel PTN hanya memuat kampus
negeri, mirror Dapodik layanan pihak ketiga gratis yang bisa mati, daftar wilayah
yang dipanggang masih 34 provinsi sehingga empat provinsi pemekaran Papua belum
ada, dan daftar formasi CPNS bisa kosong sama sekali. Kalau pilihan dipaksa harus
dari daftar, sebagian pengguna tidak bisa menyelesaikan profilnya sama sekali.

### Jangan mewajibkan kolom yang datanya mungkin belum terbit

Kolom formasi CPNS **tidak diwajibkan** selama `GET /api/formasi/status`
menjawab `is_open: false`, dan kolomnya diganti pemberitahuan alih-alih picker
kosong. Aturan yang sama diberlakukan di `ProfileController` sisi server.

Kartu "N data belum diisi" di pengaturan akun juga memeriksa status itu. Tagihan
yang tidak mungkin dipenuhi hanya membuat kartu itu diabaikan seluruhnya,
termasuk untuk kolom yang benar-benar kurang.

---

## 4b. Kredensial pihak ketiga

**Kunci API tidak boleh pernah sampai ke browser.** Kunci yang pernah dikirim ke
klien harus dianggap bocor — ia ada di riwayat tab jaringan, di cache, dan di
setiap ekstensi yang bisa membaca respons.

Asisten AI mengikuti aturan itu: frontend hanya mengenal `POST /api/chat`.
Provider, endpoint, kunci, dan persona seluruhnya tinggal di backend, sehingga
mengganti provider tidak menyentuh frontend sama sekali.

Kalau menambah integrasi pihak ketiga berkunci, ikuti pola yang sama —
**proksikan lewat backend**, jangan panggil dari browser dengan kunci yang
disematkan. `NEXT_PUBLIC_*` tidak pernah boleh memuat rahasia; awalan itu
berarti nilainya di-inline ke bundel.

Halaman admin pun hanya menerima bentuk tersamar (`sk-or-…4f2a`). Karena itu
kolom kunci di form selalu mulai kosong, dan **kosong berarti "jangan ubah"** —
bukan "hapus".

---

## 5. Halaman yang dipakai bersama admin dan siswa

Cek `session.user.role === "admin"` dan sembunyikan bagian khusus siswa. Jangan
hanya mengandalkan pemisahan route.

**Sebabnya, dari pengguna sendiri:** admin tidak akan pernah mengikuti tryout.
Jadi tidak ada sertifikat, laporan nilai, peringkat, atau target kampus yang
perlu memakai data dirinya. Pengaturan akun admin hanya menampilkan **nama dan
email**.

Ini pernah disebut "bocor" dua kali. Perlakukan hal yang sama untuk elemen
berorientasi siswa lain yang muncul di tampilan admin.

---

## 6. Deploy

### Naikkan versi action, lalu periksa `using:`-nya

`actions/checkout@v5` dan `actions/setup-python@v6` — dua-duanya `using: node24`.

**Jangan menaikkan angka lalu berharap.** Verifikasinya satu perintah:

```bash
curl -s https://raw.githubusercontent.com/actions/checkout/v5/action.yml | grep using:
```

v4 dan v5 lama menyatakan `node20`, yang sudah diumumkan usang sementara runner
GitHub sendiri sudah menjalankan node24.

### Pemeriksaan keamanan di verifikasi deploy harus mencoba ulang

`blocked()` di kedua workflow mencoba ulang lima kali dengan jeda enam detik,
sama seperti `probe()`.

**Kejadiannya:** verifikasi melaporkan `/.env.production -> 520` dan
menggagalkan run. Berkasnya **tidak** terekspos — diperiksa langsung, jawabannya
403 dengan halaman galat Cloudflare dan nol pola rahasia. 520 itu transien:
`probe()` mencoba ulang sehingga selamat melewati restart Passenger, sementara
`blocked()` memeriksa sekali saja dan justru **pemeriksaan keamanan** yang
tertangkap.

Kode selain 401/403/404 tetap dihitung gagal, termasuk 5xx. Galat origin bukan
bukti berkas env tidak bisa dibaca, dan untuk berkas itu "mungkin aman" bukan
jawaban. **Yang boleh diperbaiki keandalannya, bukan ambangnya.** Kalau mengubah
`blocked()`, uji dengan kontrol negatif — pastikan ia masih gagal pada URL yang
memang 200.

### Kedua workflow diubah bersamaan

`deploy.yml` (produksi) dan `deploy-dev.yml` memakai skrip verifikasi yang
sebangun. Mengubah satu saja menghasilkan dua jalur deploy yang menyimpang, dan
yang jarang dipakai akan basi tanpa ada yang tahu.

---

## 7. Next.js 16

`AGENTS.md` di repo ini ditulis dan dipasang ulang oleh `next dev` sendiri, di
antara penanda `BEGIN:nextjs-agent-rules` dan `END:nextjs-agent-rules`. Isi di
luar penanda itu aman; jangan menulis di dalamnya.

Pesannya berlaku: versi ini punya perubahan yang memutus kompatibilitas. Baca
panduan di `node_modules/next/dist/docs/` sebelum memakai API Next yang tidak
kamu pastikan bentuknya di versi ini.

---

## 8. Performa

Yang sudah dipasang dan jangan dibatalkan tanpa mengukur ulang:

- `GlobalProvider.tsx` membuat `QueryClient` **per mount** lewat `useState`,
  dengan `staleTime: 60_000`, `gcTime: 5 menit`, `refetchOnWindowFocus: false`,
  `retry: 1`.
- `SessionProvider refetchInterval={15 * 60}` dengan
  `refetchOnWindowFocus={false}`. Sebelumnya polling 30 detik me-render ulang
  sekitar 70 konsumen `useSession()`.
- `src/lib/auth.ts` membungkus pemanggilan `/auth/me` dengan React `cache()`
  supaya satu request tidak memanggilnya dua-tiga kali.

Kalau menduga FE lemot, **ukur dulu**. Cara yang berhasil di sini: hitung
panggilan `/auth/me` per navigasi di log server Laravel. `experimental.optimizePackageImports`
sudah dicoba dan diukur — hasil build identik (5564 KB, 93 chunk), jadi
dikembalikan daripada meninggalkan tombol mati.
