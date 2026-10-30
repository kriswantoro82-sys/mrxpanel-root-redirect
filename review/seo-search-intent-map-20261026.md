# Peta maksud pencarian organik MRXPANEL — 26 Oktober 2026

**Status:** bahan review CMO untuk Draft PR #19 saja. Bukan perintah merge, bukti peringkat, izin produksi, maupun jadwal publikasi.

## Dasar data (Google Search Console, properti `sc-domain:mrxpanel.com`)

- Rentang **25 Juli–24 Oktober 2026** pada preset **3 bulan**: 185 klik, 395 tayangan, CTR 46,8%, posisi rata-rata 11,4.
- Kueri merek `mrxpanel`: 142 klik dan 159 tayangan. Proporsinya sekitar 77% dari total klik yang dilaporkan. Ini **tidak** sama dengan persentase seluruh klik bermerek, karena variasi ejaan/atribusi bisa berbeda.
- Kueri `smm panel`: **0 klik / 20 tayangan**. Sampel kecil, sehingga jangan menarik kesimpulan peringkat atau permintaan pasar yang luas.
- Rentang **18–24 Oktober** (7 hari): **1 klik / 26 tayangan**, CTR 3,8%, posisi rata-rata 15,1. Pemilihan preset 28 hari sempat menghasilkan angka identik dengan grafik yang tetap menunjukkan 18–24 Oktober: perlu rekonsiliasi rentang sebelum mengklaim tren 28-hari.
- Inspeksi URL individual 26 Oktober: 6 dari 7 halaman sitemap terindeks. Halaman kalkulator masih `Di-crawl - saat ini tidak diindeks`; satu permintaan indeks telah **diterima Google** pada 26 Oktober, bukan jaminan pengindeksan.

Rekaman dasar dan status indeks: [Issue #16](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/issues/16#issuecomment-6398672450).

## Satu maksud utama per URL (hindari kanibalisasi)

| Fokus pencarian / maksud pengunjung | URL target utama | Peran halaman dan tindak lanjut |
| --- | --- | --- |
| `panel SMM Indonesia`, `SMM panel`: mencari platform | `/` | Beranda memperkenalkan MRXPANEL, kategori, cara kerja, dan CTA akun. FAQ baru `Apa itu panel SMM (SMM panel)?` menjawab pemula dan mengarah ke artikel penjelasan. **Jangan** menjejali title/meta dengan variasi berulang. |
| `apa itu panel SMM`: ingin definisi | `/apa-itu-panel-smm/` | Penjelasan istilah, saldo, status, risiko, dan perbedaan peran member/reseller/provider. CTA ke panduan pemula, bukan janji hasil layanan. |
| `cara menggunakan panel SMM`: ingin tutorial | `/cara-menggunakan-panel-smm/` | Urutan daftar, cek katalog, saldo, pesan, periksa status; tautan harga reseller sebagai bantuan kontekstual. |
| `panel SMM reseller`: berniat usaha reseller | `/panduan-reseller/` | Proses bisnis, kebutuhan pelanggan, cara menentukan harga, batasan dan kewajiban reseller. CTA ke kalkulator. |
| `provider SMM`: membandingkan opsi | `/memilih-provider-smm/` | Checklist menilai kualitas, syarat, transparansi, dukungan, API, serta risiko. Hindari klaim paling murah/terbaik tanpa sumber. |
| `API panel SMM`: integrasi teknis | `/api-panel-smm-reseller/` | Jelaskan integrasi, kerahasiaan API Key, metode permintaan, dan mencegah pesanan ganda. **Jangan** ubah endpoint produksi untuk kepentingan SEO. |
| `kalkulator harga jual reseller SMM`: ingin menghitung margin | `/kalkulator-harga-jual-reseller-smm/` | Alat bantu simulasi biaya/fee/margin; transparansi bahwa harga dan laba tidak dijamin. Pantau hasil inspeksi URL, **jangan mengulang permintaan indeks**. |

Rute di atas semuanya memakai canonical `https://mrxpanel.com/` + path yang sesuai. Kata kunci dalam tabel adalah **pemetaan maksud pencarian**, bukan hasil pengukuran volume pencarian selain dua kueri yang secara eksplisit disebut dari GSC.

## Tindakan dan gerbang publikasi

1. **Tindakan Draft yang sudah terimplementasi:** FAQ beranda untuk maksud pencarian umum beserta tautan artikel; tes regresi terpisah memastikan summary, jawaban, tautan, serta batasan hasil layanan tidak hilang. Semua lima GitHub Actions untuk commit `ed14b85cc66e3c9aa4505039aef0dc845c529df9` sukses.
2. **Sebelum merge**: owner/CTO menilai isi secara nyata, menentukan apakah ada perubahan substansial per URL, dan menetapkan `dateModified`/tanggal terlihat/`sitemap.xml lastmod` berdasarkan **tanggal publikasi aktual**, bukan tanggal penulisan Draft. FAQ beranda baru adalah perubahan isi yang harus ditinjau. Tidak perlu memperbarui `lastmod` halaman kalkulator/API bila isinya tidak berubah.
3. **Rilis terpisah**: Draft PR #19 harus tetap *Draft/HOLD* sampai ada approval; PR #18 (gambar OG) tidak boleh terseret karena aset dan persetujuan visual belum siap. Pastikan tak ada konflik dengan PR asal #9/#14 bila memilih jalur integrasi.
4. **SSL terpisah**: [Issue #10](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/issues/10) masih menunggu verifikasi domain GitHub dan penerbitan TLS `www`. Jangan mereset DNS atau sertifikat sebagai bagian dari PR SEO.
5. **Setelah rilis yang disetujui**: QA dan smoke test di URL live, pemeriksaan canonical/sitemap/HTTPS, inspeksi indeks kalkulator, dan bandingkan GSC per kueri serta per halaman pada rentang tanggal yang sama. Gunakan klik/tayangan/CTR aktual; **jangan janjikan posisi ranking atau konversi**.

**Batas eksekusi:** dokumen perencanaan, tanpa pembayaran, database, API mutasi, DNS, publish, penggabungan PR, maupun perubahan pada `main`.
