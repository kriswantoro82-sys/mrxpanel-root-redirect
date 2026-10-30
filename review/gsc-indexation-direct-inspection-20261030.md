# MRXPANEL Google Search Console URL Inspection — 30 Oktober 2026

Status: READ-ONLY evidence; no indexing request, sitemap resubmission, live URL test, production edit, merge, DNS or deployment.

## Sumber dan data aktual

Google Search Console yang sudah login pada browser Office, properti domain mrxpanel.com; pemeriksaan langsung dari daftar URL dalam kategori "Di-crawl - saat ini tidak diindeks". Hasil tersebut lebih spesifik daripada laporan pengindeksan agregat yang terakhir diperbarui pada 23 Oktober 2026.

**URL: https://mrxpanel.com/kalkulator-harga-jual-reseller-smm/**

- Hasil URL Inspection: **URL tidak ada di Google**.
- Kategori: **Di-crawl - saat ini tidak diindeks**.
- Crawl terakhir dalam inspeksi URL: **26 Oktober 2026, 19.22.03** (seperti ditampilkan GSC; zona waktu UI tidak diverifikasi).
- Googlebot smartphone; crawl diizinkan; pengambilan halaman berhasil; indexing diizinkan.
- Kanonis dinyatakan pemilik: https://mrxpanel.com/kalkulator-harga-jual-reseller-smm/.
- Kanonis pilihan Google: "URL yang diperiksa" (seperti ditampilkan GSC).
- GSC menampilkan "Halaman perujuk: Tidak ada yang terdeteksi". **Ini bukan bukti bahwa website tidak mempunyai tautan internal.**

**URL: https://mrxpanel.com/apa-itu-panel-smm/**

- Inspeksi URL langsung: **URL ada di Google / Halaman diindeks**.
- HTTPS valid; satu item Breadcrumb valid.
- Laporan agregat bertanggal 23 Oktober masih memperlihatkan halaman ini dalam contoh "Di-crawl - saat ini tidak diindeks" dengan crawl 24 Oktober, sehingga **laporan agregat tertinggal dibanding inspeksi URL**. Jangan melabeli artikel ini masih nonindeks dari laporan lama.

## Tautan internal live vs Draft

Audit HTTP GET publik (tanpa auth) atas tujuh halaman SEO, semua HTTP 200, canonical HTTPS benar, robots index,follow:
- Website produksi saat diperiksa: tautan ke kalkulator dari homepage, /panduan-reseller/, /memilih-provider-smm/ = **3 halaman sumber**.
- Tidak ditemukan tautan tersebut pada HTML live /cara-menggunakan-panel-smm/, /apa-itu-panel-smm/, /api-panel-smm-reseller/.
- Draft PR #25 menambahkan tautan konteks aman menuju kalkulator di ketiga artikel tersebut, total **6 halaman sumber**, tanpa klaim simulasi sebagai harga aktual.
- QA otomatis Draft `qa/seo-seven-page-link-audit.cjs --self-test` memverifikasi enam halaman sumber, tujuh URL sitemap, seluruh tautan lokal, dan empat skenario kegagalan.

## Keputusan dan batasan

1. Jangan meminta indexing ulang: itu sudah pernah diminta dan tidak ada bukti bahwa pengulangan akan mempercepat.
2. Jangan mengubah tanggal publikasi untuk "memaksa" indexing; perubahan tanggal tetap harus berdasar isi signifikan dan tanggal rilis nyata.
3. Menguatkan internal linking **mungkin** membantu penemuan/konteks, tetapi **tidak menjamin pengindeksan Google**. Fakta "tidak ada halaman perujuk terdeteksi" pada GSC tidak sama dengan "tidak ada tautan".
4. Draft PR #25 tetap menunggu owner/CTO memilih tanggal dan menyetujui deploy produksi secara terpisah.
5. Sesudah rilis berizin, pantau URL Inspection kalkulator serta relevansi tautan internal, bukan hanya nilai agregat GSC yang tertunda.

Dibuat khusus sebagai bukti audit dan catatan QA; tidak ada data sensitif atau tindakan administratif GSC.
