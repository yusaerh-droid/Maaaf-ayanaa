# A Special Gift For Ayana 🤍

Website hadiah digital interaktif — HTML/CSS/JS murni, tanpa framework.

## Struktur folder

```
index.html
css/style.css
js/script.js
assets/music/        ← taruh file musikmu di sini
```

## Menambahkan musik

1. Simpan file musikmu dengan nama **`music.mp3`**.
2. Taruh di folder `assets/music/music.mp3`.
3. Musik akan otomatis mulai (fade-in) begitu tombol "Buka Kadonya" ditekan,
   dan bisa di-mute/play lagi lewat tombol 🎵 di pojok kanan bawah.
4. Ingin ganti nama file? Edit atribut `src` pada tag `<audio id="bg-music">`
   di `index.html`.

## Mengganti warna

Semua warna didefinisikan sebagai CSS variable di bagian atas
`css/style.css`, di dalam `:root { ... }`. Contoh:

```css
--rose-gold: #C9A0A0;
--rose-gold-deep: #AD7C82;
--gold: #CDA96E;
```

Ubah nilai hex-nya saja — seluruh halaman akan otomatis mengikuti.

## Struktur perjalanan (screens)

1. **Gift box** — kotak hadiah dibuka
2. **Envelope & letter** — amplop terbuka, surat dengan typewriter effect
3. **Promises** — checklist janji
4. **The question** — "Masih mau maafin aku?"
5. **5A / 5B** — cabang cerita tergantung jawaban
6. **Closing** — penutup & tanda tangan

## Deploy ke GitHub Pages

1. Push folder ini ke repository GitHub.
2. Buka **Settings → Pages**.
3. Pilih branch `main` dan folder `/root`.
4. Simpan — situs akan aktif di `https://<username>.github.io/<repo>/`.

## Catatan performa

- Semua animasi memakai CSS transform/opacity (GPU-friendly) agar tetap
  ringan di HP Android.
- Kelopak bunga & partikel dibuat dan dihapus secara dinamis lewat JS
  supaya jumlah elemen di DOM tetap terkendali.
- Menghormati preferensi `prefers-reduced-motion` pengguna.
