"""Label & pengelompokan resource RBAC untuk layar Hak Akses.

Kode resource (`gl`, `coa`, `ar`…) adalah pengenal mesin; admin mencari "Bagan Akun", bukan
`coa`. Setiap resource di DEFAULT_PERMISSIONS WAJIB punya label di sini (dijaga tes
`verify_resource_meta`), supaya tidak ada tabel data yang tampil tanpa nama manusiawi.
"""

RESOURCE_META = {
    # ---- CRM & penjualan
    "leads": ("Pipeline Lead", "CRM"),
    "appointments": ("Agenda & Survey", "CRM"),
    "surveys": ("Survei Lokasi", "CRM"),
    "activities": ("Aktivitas & Catatan", "CRM"),
    "inbox": ("Percakapan WhatsApp (Inbox)", "CRM"),
    "customers": ("Customer & Kontrak", "CRM"),
    "deals": ("Reservasi & Deal", "Penjualan"),
    "reservations": ("Reservasi (legacy)", "Penjualan"),
    "quotations": ("Penawaran Harga", "Penjualan"),
    "pricing": ("Harga, Promo & Override", "Penjualan"),
    "contracts": ("Kontrak (PPJB/AJB)", "Penjualan"),
    "payment_scheme": ("Skema Pembayaran", "Penjualan"),
    "cancellation": ("Pembatalan & Refund", "Penjualan"),
    "late_fee": ("Denda Keterlambatan", "Penjualan"),
    "financing": ("KPR & Pembiayaan", "Penjualan"),
    "commissions": ("Komisi Sales", "Penjualan"),
    "marketing_fee": ("Fee Mitra / Marketing", "Penjualan"),
    "partners": ("Mitra & Referral", "Penjualan"),
    "showroom": ("Showroom Publik", "Marketing"),
    "ads": ("Kampanye & Biaya Iklan", "Marketing"),
    "analytics": ("Analitik & BI", "Marketing"),
    "targets": ("Target Penjualan", "Marketing"),
    "automation_rules": ("Otomasi & Pengingat", "Marketing"),
    "wa_templates": ("Template WhatsApp", "Marketing"),
    "channels": ("Channel Omnichannel", "Marketing"),
    "broadcasts": ("Broadcast WhatsApp", "Marketing"),
    "reminders": ("Pengingat Tagihan", "Marketing"),
    # ---- proyek & pembangunan
    "projects": ("Master Proyek", "Proyek"),
    "units": ("Unit / Kavling", "Proyek"),
    "construction": ("Progres Pembangunan", "Proyek"),
    "materials": ("Material & Stok", "Proyek"),
    "boq": ("BoQ & RAB", "Proyek"),
    "budget": ("Anggaran Proyek", "Proyek"),
    "subcon": ("Subkontraktor & SPK", "Proyek"),
    "subcon_finance": ("Keuangan Subkon (UM/Retensi)", "Proyek"),
    "progress_claims": ("Klaim Progres Subkon", "Proyek"),
    "change_orders": ("Perubahan Pekerjaan (CO)", "Proyek"),
    "procurement": ("Pengadaan & PO", "Proyek"),
    "vendors": ("Vendor & Daftar Harga", "Proyek"),
    "labor": ("Tenaga Kerja & Upah Harian", "Proyek"),
    "permits": ("Perizinan", "Proyek"),
    "handover": ("Serah Terima (BAST)", "Proyek"),
    "warranty": ("Garansi Unit", "Proyek"),
    "complaints": ("Komplain Pembeli", "Proyek"),
    "aging": ("Umur Tahap & SLA", "Proyek"),
    # ---- keuangan & akuntansi
    "finance": ("Keuangan (AR/AP/Arus Kas)", "Keuangan"),
    "bank": ("Rekonsiliasi Bank", "Keuangan"),
    "petty_cash": ("Kas Kecil", "Keuangan"),
    "fixed_assets": ("Aset Tetap", "Keuangan"),
    "loans": ("Pinjaman Korporasi", "Keuangan"),
    "tax": ("Perpajakan & e-Faktur", "Keuangan"),
    "gl": ("Buku Besar & Jurnal (GL)", "Akuntansi"),
    "coa": ("Bagan Akun (CoA)", "Akuntansi"),
    # ---- dokumen & umum
    "documents": ("Dokumen & Berkas Syarat", "Dokumen"),
    "doc_requirements": ("Master Dokumen Syarat", "Dokumen"),
    "files": ("Unggah Berkas / Foto", "Dokumen"),
    "work_tasks": ("Tugas & Papan Divisi", "Kerja"),
    "notifications": ("Notifikasi", "Kerja"),
    # ---- konfigurasi & admin
    "settings": ("Pusat Konfigurasi", "Konfigurasi"),
    "catalog": ("Katalog (Tipe Unit, Add-on, Biaya)", "Konfigurasi"),
    "legal": ("Legal & Privasi", "Konfigurasi"),
    "users": ("Pengguna", "Admin"),
    "permissions": ("Hak Akses (RBAC)", "Admin"),
    "organizations": ("Organisasi (Tenant)", "Admin"),
    "audit_logs": ("Jejak Audit", "Admin"),
}

GROUP_ORDER = ["CRM", "Penjualan", "Marketing", "Proyek", "Keuangan", "Akuntansi", "Dokumen",
               "Kerja", "Konfigurasi", "Admin"]


def resource_meta(resources) -> dict:
    """{code: {label, group}} untuk semua resource; yang belum berlabel tampil apa adanya."""
    out = {}
    for r in resources:
        label, group = RESOURCE_META.get(r, (r, "Lainnya"))
        out[r] = {"label": label, "group": group}
    return out
