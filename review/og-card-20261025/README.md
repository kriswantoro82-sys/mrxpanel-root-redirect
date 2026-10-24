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


## 25 Oktober — Simulasi metadata tujuh halaman: PASS

GitHub Actions [run #40124000676](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/actions/runs/40124000676) **SUCCESS (attempt 1)** di commit `c7020e81c17804053de798da58805002b69b87ff`. Selain membuat PNG, workflow menggunakan **commit tepat `11ef2f5309019eda0954f550e23521dcd08dc887` dari Draft PR #14** sebagai baseline artikel dan menghasilkan paket HTML **hanya dalam folder terpisah** `tmp-review/og-integration/` di runner.

Bukti yang disimpan:
- Artifact `mrxpanel-og-card-concept-1200x630` (ID `12572581245`): PNG konsep untuk review visual.
- Artifact `mrxpanel-og-seven-page-integration-review` (ID `12572117775`): **tujuh salinan HTML** yang disisipkan OG image + Twitter image, dan file PNG, **belum menjadi file produksi**.

Script [prepare_og_meta_review.py](../../scripts/prepare_og_meta_review.py) membaca dan menguji ketujuh `og:url` lalu menolak jika ada `og:image` yang sudah eksis, output berada di dalam source, atau output telah ada. Script [qa_og_meta_review.py](../../scripts/qa_og_meta_review.py) memastikan seluruh metadata gambar muncul satu kali, URL absolut HTTPS sesuai, raster **1200×630**, dan **menghapus hanya tag yang baru** akan menghasilkan file sumber yang **identik per karakter**. Juga diuji bahwa penulisan ke sumber dan overwrite output ditolak.

**Semua 7/7 PASS** dan QA sebelumnya atas format/palet PNG PASS. Ini membuktikan integrasi dapat disiapkan tanpa menghapus canonical, metadata sosial terdahulu, atau JSON-LD/tanggal artikel, **tetapi tidak membuktikan kompatibilitas platform share publik setelah deployment**.

**Penting:** konsep visual belum memperoleh persetujuan brand/owner, artifact hanya disimpan terbatas (masa retensi 14 hari sejak 25 Oktober), dan URL `https://mrxpanel.com/assets/mrxpanel-og-1200x630.png` yang muncul dalam **HTML simulasi** belum ada di website produksi. **Jangan menggabungkan atau menyebarkan file HTML simulasi ke publik sebelum persetujuan gambar, penerbitan PNG di static assets, dan verifikasi HTTP 200 `image/png`.**

**Konflik/urutan:** sumber simulasi adalah PR #14 pada SHA tertentu, bukan branch yang kelak otomatis mengikuti semua merge. Setelah PR #9→#14 diterbitkan resmi, ulang pemeriksaan terhadap `main` terkini untuk memastikan tag dan asset benar sebelum PR implementasi diajukan. Masalah HTTPS redirect #10 dan alur signup #12 tetap terpisah dan terbuka.
