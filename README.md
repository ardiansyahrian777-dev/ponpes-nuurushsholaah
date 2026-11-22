# Website Pesantren

Website statis (HTML, CSS, JavaScript biasa). Tidak perlu build, tidak perlu database.
Semua isi diatur dari satu berkas: `content.js`.

## Isi folder

| Berkas | Fungsi |
|---|---|
| `index.html` | Halaman utama |
| `style.css` | Tampilan |
| `app.js` | Menampilkan isi `content.js` ke halaman |
| `content.js` | **Semua tulisan, tautan, dan foto. Ini yang Anda edit.** |
| `editor.html` | Editor formulir untuk mengubah `content.js` tanpa menulis kode |
| `assets/` | Tempat foto dan logo (sudah berisi `favicon.svg`) |

## Cara mengubah isi

**Cara 1: pakai editor (paling mudah)**
1. Buka `editor.html` di website Anda (alamatnya `https://domain-anda/editor.html`) atau klik dua kali berkasnya di komputer.
2. Ubah isi lewat formulir, klik **Unduh content.js**.
3. Di GitHub, buka `content.js`, pilih **Add file > Upload files** (atau ikon pensil lalu tempel isinya), lalu **Commit**.
4. Cloudflare memperbarui website otomatis dalam beberapa menit.

**Cara 2: edit langsung di GitHub**
Buka `content.js` di GitHub, klik ikon pensil, ubah teks di antara tanda kutip, lalu **Commit changes**.

Aturan penulisan `content.js`: jangan hapus tanda kutip `"`, koma `,`, atau kurung. Bagian yang dikosongkan (`""`) tidak ditampilkan di website.

## Menambah foto
1. Unggah foto ke folder `assets/` di GitHub (disarankan ukuran di bawah 500 KB, format `.jpg` atau `.webp`).
2. Tulis jalurnya di `content.js`, misalnya `"foto": "assets/gedung.jpg"`.

Foto galeri yang belum ada akan tampil sebagai kotak pola dengan keterangannya.

## Mengganti warna
Ubah tiga kode warna di bagian `tema` pada `content.js`.

## Unggah ke GitHub
1. Buat repository baru di GitHub.
2. Ekstrak zip, lalu unggah **isi** folder (bukan folder pembungkusnya) lewat **Add file > Upload files**, kemudian **Commit**.

## Deploy di Cloudflare
1. Cloudflare dashboard > **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
2. Pilih repository tadi.
3. Isian build: **Framework preset: None**, **Build command: kosong**, **Build output directory: `/`** (atau kosong).
4. Klik **Save and Deploy**. Setiap kali Anda commit ke GitHub, website otomatis diperbarui.

Domain sendiri bisa ditambahkan lewat tab **Custom domains** pada proyek tersebut.

## Sebelum dipublikasikan
- Ganti semua teks contoh di `content.js` dengan data pesantren yang sebenarnya.
- Jadwal harian dan syarat pendaftaran masih contoh; sesuaikan.
- `editor.html` tidak menyimpan apa pun ke server, jadi aman. Jika tidak ingin halaman itu terlihat publik, hapus berkas `editor.html` dari repository dan pakai dari komputer saja.
