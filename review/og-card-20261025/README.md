# MRXPANEL Open Graph Card — Review Concept 25 Oktober 2026

**Status: KONSEP / PERLU PERSETUJUAN, bukan aset website produksi.** Terkait [SEO Issue #13](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/issues/13). Tujuannya memperbaiki kualitas kartu tautan MRXPANEL saat dibagikan, bukan mengklaim peningkatan Google ranking.

## Pekerjaan yang disiapkan

- [Generator raster](../../scripts/mrxpanel_og_generator.py) yang menggunakan **Pillow + DejaVu Sans** pada runner untuk menghasilkan gambar **PNG 1200 × 630** dengan palet MRXPANEL charcoal `#111318`, emas `#F1CC6C`, teks putih dan abu-abu.
- Copy yang ditulis pada konsep: **MRXPANEL**, **Panel SMM Indonesia untuk Reseller & Bisnis**, **Kelola layanan, saldo, dan pesanan dalam satu dashboard member.**, serta **mrxpanel.com**.
- Elemen dashboard di sisi kanan hanya **ilustrasi** yang tidak menampilkan nominal, jumlah transaksi, testimoni, atau metrik nyata.
- [Penguji](../../scripts/qa_og_card.py): format PNG, resolusi 1200x630, latar charcoal, kecukupan elemen emas/putih, ukuran berkas di bawah 800 KB.
- [GitHub Actions](../../.github/workflows/og-card-review.yml) hanya menghasilkan dan mengunggah **artifact review**, dengan `contents: read`, tanpa token produk, deployment, commit ke `main`, ataupun permintaan ke website MRXPANEL.

## Batasan penting

**Tidak ada file PNG atau `og:image` yang dipasang ke website dalam PR ini.** Sumber generator dan PNG artifact CI hanya untuk penilaian visual. Alamat `/assets/mrxpanel-og-20261025.png` adalah **calon rute masa depan**, bukan URL yang sekarang aktif; **jangan** menambahkan tag yang menunjuk ke rute belum diterbitkan.

Sebelum rilis harus:
1. Owner/brand reviewer menyetujui visual dan teks (termasuk penggunaan simbol `M` yang merupakan monogram ilustratif dan bukan logo resmi yang sudah disahkan).
2. Tim mengekspor PNG final 1200×630, menaruh berkas **raster statis** pada folder `assets/` di branch perubahan baru/review resmi, dan memverifikasi biner PNG cocok dengan versi yang disetujui.
3. Memastikan `https://mrxpanel.com/assets/...png` sungguh memberi **HTTP 200**, `Content-Type: image/png`, tanpa autentikasi, dengan sertifikat valid.
4. Menambahkan `og:image`, `og:image:alt`, `og:image:width`, `og:image:height`, dan `twitter:image` untuk beranda pada **ketujuh halaman** melalui PR lain. Karena PR #9 dan #14 mengubah baris HTML panjang pada tutorial, implementasikan **setelah** kedua PR itu terselesaikan untuk mencegah konflik.
5. Melakukan preview berbagi nyata pada Facebook Sharing Debugger, WhatsApp dan X, dengan memperhatikan caching gambar.
6. Menutup [Issue #13](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/issues/13) hanya setelah tag, PNG dan pratinjau terbukti bekerja di produksi.

## Tidak terkait

Masalah [pengalihan HTTPS Issue #10](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/issues/10) masih terbuka; **HTTP 200 tanpa redirect** telah terverifikasi pada beranda dan artikel. Ketersediaan HTTPS 200 sendiri tidak membuktikan pengalihan HTTP aktif. Jangan menyebut masalah tersebut terselesaikan oleh konsep OG card.

**Tidak ada merge, deployment, penggantian DNS, konfigurasi Pages, login, perubahan database atau akun pengguna.**
