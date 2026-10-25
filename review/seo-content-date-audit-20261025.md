# MRXPANEL SEO — pemeriksaan perubahan konten dan tanggal (25 Oktober 2026)

**Jenis dokumen:** bukti review CMO pada Draft [PR #19](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/pull/19), **bukan persetujuan rilis** dan bukan klaim perubahan sudah tayang. Pemeriksaan membandingkan `main` pada `693f42f8fad9057b46c5c177d33194c926e86b5d` dengan tree integrasi PR #19 sebelum dokumen ini: `b2a6ff45bd24f5f5631b7241267b2c588fc4a05d`. Klasifikasi di bawah adalah penilaian awal berdasarkan diff dan riwayat commit, untuk diverifikasi CTO/owner ketika tanggal publikasi sudah nyata.

## Temuan per halaman

| Halaman | Perubahan dalam Draft PR #19 | Sifat perubahan & rekomendasi tanggal saat rilis berizin |
| --- | --- | --- |
| `/` | Menambah identitas pengelola PT Mrxpanel Media Group di footer | Perubahan atribusi/footer, bukan perubahan konten utama. **Pertahankan** `sitemap lastmod=2026-10-24` secara default; tinjau ulang jika reviewer menilai perubahan ini penting bagi isi utama halaman. |
| `/panduan-reseller/` | Menampilkan label diterbitkan/diperbarui dan mengisi Article `datePublished`/`dateModified` | Isi utama tidak berubah. Riwayat `main` memuat tautan kalkulator pada **24 Okt**. **Pertahankan** `dateModified`/tanggal terlihat/`lastmod=2026-10-24` jika penilaian konten sama. |
| `/cara-menggunakan-panel-smm/` | Menyelaraskan OG title/description, menambah tanggal artikel, dan **menambah tautan beserta penjelasan kalkulator di FAQ** | Tautan dengan konteks harga reseller adalah perubahan isi yang relevan bagi pembaca. **Pada tanggal benar-benar tayang**, tinjau dan selaraskan `Article.dateModified`, tanggal terlihat `<time>`, dan `sitemap lastmod` ke tanggal publikasi konten signifikan tersebut. `datePublished=2026-10-19` tetap historis. |
| `/memilih-provider-smm/` | Menyelaraskan `dateModified` 22→24 Okt dan menampilkan tanggal publikasi/pembaruan | `main` mencatat tautan kalkulator dan API pada **24 Okt**; metadata ini memperbaiki ketidaksesuaian yang sudah ada. **Pertahankan** `dateModified`/tanggal terlihat/`lastmod=2026-10-24`, kecuali ada revisi isi lagi. `datePublished=2026-10-22` tetap historis. |
| `/apa-itu-panel-smm/` | **Menambah tautan kontekstual kalkulator dan disclaimer simulasi harga** | Tambahan tautan/penjelasan adalah perubahan isi. **Pada tanggal benar-benar tayang**, tinjau dan selaraskan `Article.dateModified` dan `sitemap lastmod` ke tanggal publikasi sebenarnya. Saat ini belum ada tanggal terlihat pada artikel ini; penambahan tanggal terlihat dapat ditinjau terpisah agar selaras dengan structured data. |
| `/api-panel-smm-reseller/` | Tidak diubah oleh PR #19 | **Pertahankan** `lastmod=2026-10-24`. |
| `/kalkulator-harga-jual-reseller-smm/` | Tidak diubah oleh PR #19 | **Pertahankan** `lastmod=2026-10-24`. |

## Keputusan sebelum rilis

1. **Jangan** menyetel semua `lastmod` menjadi tanggal deployment. Bedakan isi signifikan dari footer atau penambahan label tanggal.
2. Jika konten PR #19 tayang pada **25 Oktober 2026**, dua kandidat pembaruan substantif adalah `/cara-menggunakan-panel-smm/` dan `/apa-itu-panel-smm/`. **Tanggal 25 Okt ini hanya skenario**, bukan tanggal yang diklaim sudah dipublikasikan; jika rilis pada hari berbeda, lakukan review ulang.
3. Pertahankan `datePublished` asli. Untuk ketiga artikel yang telah mempunyai tag `<time>`, samakan tanggal terlihat dan JSON-LD jika ada perubahan tanggal yang disetujui.
4. Jangan memaksakan pengesahan tanggal dengan `--mode=release --date=...`: QA saat ini memang **fail-closed**, untuk mencegah kalender digunakan sebagai bukti persetujuan.
5. Setelah perubahan tanggal yang disetujui pada Draft, wajib jalankan ulang **semua CI** dan pemeriksaan halaman sesungguhnya setelah publish; jangan menganggap QA lama berlaku untuk commit baru.
6. PR #18 gambar OG tetap di luar cakupan / **HOLD** sampai persetujuan visual, aset PNG benar-benar tersedia dan checksum HTML didamaikan. PR #19 tetap **DRAFT**; `main`, GitHub Pages, DNS, database dan pembayaran tidak disentuh oleh audit ini.

## Bukti teknis

- Riwayat `git log origin/main -- <file>` memperlihatkan perubahan substantif tanggal 24 Oktober pada panduan reseller, provider, dan artikel tutorial; `main` berhenti pada SHA `693f42f8`.
- Diff yang direview: perubahan footer hanya satu kalimat; FAQ tutorial menambah tautan + penjelasan harga; artikel konsep menambah tautan + disclaimer; artikel reseller/provider terutama menambah tampilan tanggal/JSON-LD.
- Google Search Central, **Sitemap `lastmod`**: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google Search Central, **tanggal artikel**: https://developers.google.com/search/docs/appearance/publication-dates

**Batas bukti:** kode Draft dan riwayat Git memberi indikasi sifat perubahan; tidak membuktikan publish produksi, indexing Google, atau persetujuan bisnis. Seluruh keputusan tanggal final harus cocok dengan rilis nyata.
