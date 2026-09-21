# Gameducation

Kuis pengetahuan umum Nusantara: solo, ruang kelas lewat Supabase Realtime, akun, set soal kustom, dan permata. Bisa di-host di Vercel.

## Jalankan lokal

```bash
npm install
npm start
```

Buka `http://localhost:3000`.

Lokal: buka `http://localhost:3000` (bukan `file://`). Production: deploy folder `public` ke Vercel.

## Supabase

1. Buka [SQL Editor](https://supabase.com/dashboard/project/nrrizdeubcsrvbrfqplm/sql) project `nrrizdeubcsrvbrfqplm`.
2. Jalankan isi `supabase/schema.sql`.
3. Authentication → Providers → Email: nyalakan email + password.
4. (Opsional) matikan “Confirm email” saat uji coba.

Kunci yang boleh ada di klien hanyalah **publishable/anon key**. Jangan taruh service role atau kata sandi Postgres di frontend, Git, atau Railway public vars.

Salin `.env.example` ke `.env` jika ingin menimpa URL/kunci lewat lingkungan:

- `PORT`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Vercel

Mode kelas memakai Supabase Realtime, jadi tidak perlu server WebSocket.

1. Push folder project ke GitHub.
2. Buka https://vercel.com/new dan import repo.
3. Framework Preset: Other.
4. Output Directory: `public` (sudah diatur di `vercel.json`).
5. Deploy.

Lalu di Supabase → Authentication → URL Configuration:

- Site URL = URL Vercel, contoh `https://gameducation.vercel.app`
- Redirect URLs tambahkan `https://gameducation.vercel.app/**`

Tanpa itu login dari domain Vercel bisa gagal.

## Railway (opsional)

Masih bisa `npm start` untuk tes lokal. Healthcheck: `/health`.

## Fitur

- 150 soal (10 per kombinasi kategori × tingkat)
- Tamu atau masuk email
- Permata, streak, bonus harian, koleksi lencana
- Set soal kustom (lokal; tersimpan ke Supabase jika masuk)
- Ruang guru: jumlah soal, waktu, acak, tunggu semua, gabung terlambat
- Pengaturan berupa modal — tidak mengeluarkan pemain dari kuis

## Keamanan yang perlu kamu lakukan

- Putar kunci jika service role atau password database pernah terkirim di chat.
- Pastikan RLS di schema sudah dijalankan sebelum ada data pengguna.
- Batasi origin di production jika kamu menambah API tulis di server.
