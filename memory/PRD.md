# PRD — SIPRO Property Development OS (lanjutan dari repo pandeyoga/dadada)

## Problem statement (asli, 2026-06)
Lanjutkan development repo. Temuan pemakai: kartu KPI Pipeline Lead salah (jumlah kartu melebihi total lead),
biaya all-in include/exclude & konfigurasi lain tidak ter-wiring ke fitur, template PDF tidak bisa mengatur posisi
tabel/urutan bagian, nomor surat SPR (3 jenis) harus bisa dikonfigurasi terpisah, banyak tabel master tanpa RBAC,
banyak input bebas yang seharusnya dropdown master (mis. CoA), latar site plan tidak tersimpan/tampil.

## Arsitektur
FastAPI (`/app/backend`, 100+ router) + React (CRA, shadcn) + MongoDB. Konfigurasi terpusat di `settings_store.py`
(Pusat Konfigurasi), penomoran `numbering_registry.py`, tampilan dokumen `doc_layout.py` + `pdf_layout.py`.
Env backend: `MONGO_URL, DB_NAME, JWT_SECRET, SEED_DEMO_USERS, BACKUP_DIR`.

## Temuan audit (2026-06-xx) → status
| # | Temuan | Status |
|---|---|---|
| 1 | KPI lead tumpang tindih (65 > 48); "Diam ≥7 hari" hitung lead baru; "Lewat SLA" query field tak tersimpan (`sla_state`) | ✅ kartu = partisi Total/Aktif/Menang/Daur ulang/Hilang; drilldown SLA pakai `stage_due_at`; idle syarat `created_at < cutoff`; count pakai `count_documents` |
| 2 | 12 kunci konfigurasi tidak pernah dibaca kode | ✅ 10 di-wire: `reservation.max_active_per_lead` + `override_roles` (deals/reserve), `require_booking_fee_before_spr`, `slik.gate`, `lead.required_demography` (gerbang SPR di `docgen.applicable`), `kpr.sla_days` (`kpr_stage_due_at`), `addon.require_spkt_for_excess_land`, `addon.excess_land_price_per_m2`, `doc.require_verification_default`, `ui.table_page_size` (session → useListQuery). 2 dihapus karena fiturnya tidak ada: `partner.portal_enabled`, `addon.excess_land_discount_needs_approval` |
| 3 | Tab "Baris & biaya" hanya berpengaruh di pratinjau; PDF asli mengabaikan; bagian tidak bisa diurutkan | ✅ `documents/{id}/pdf` memakai `money_rows_for` + `layout_amounts(breakdown)`; `render_letter` mengurutkan blok sesuai `sections.order`; penanda `{{tabel_biaya}}` di naskah; RowsForm punya panah urutan bagian. Bagian "biaya" mati secara bawaan (naskah SPR sudah memuat rincian inline) |
| 4 | Satu aturan `docnum` untuk semua SPR | ✅ aturan per jenis `docnum:SPR-CASH`, `docnum:SPR-CASHB`, `docnum:SPR-KPR`, `docnum:SPKT` (menimpa bawaan bila diubah) |
| 5 | Panel konfigurasi tanpa `can()`; master biaya/all-in/KPR digembok `settings` (owner only) | ✅ `EditGate` (fieldset disabled + spanduk) di ConfigCenter & MasterData; allin_router → resource `catalog` |
| 6 | CoA input teks bebas | ✅ `ReferenceSelect group=gl_account` di Komponen Biaya; kode komponen manual all-in → dropdown master |
| 7 | Latar site plan dibuang oleh `/site-plan/{id}` & showroom publik | ✅ payload memuat `background{url}`; `SvgPlanMap` merender `<image>` |

## Backlog / P1
- Halaman KPR: tampilkan `kpr_stage_due_at` (tersangkut) di UI pembiayaan.
- Uji regresi semua panel konfigurasi dengan peran finance/sales_manager (EditGate).
- Naskah SPR bawaan: opsi mengganti rincian inline dengan `{{tabel_biaya}}`.

## Kredensial uji
Lihat `/app/memory/test_credentials.md` (`scripts/seed_demo_users.py` untuk menambah akun demo).

## Sesi 2026-09-06 — Audit Sintesis Tahap 1–2 + Tahapan Pembangunan & Survey
Sumber: `AUDIT_SINTESIS.md` (32 temuan). Semua temuan di bawah **diverifikasi dulu di runtime** sebelum diperbaiki.

| ID | Temuan (terbukti) | Perbaikan |
|---|---|---|
| WA-02 | Termin lunas tetap jadi kandidat pengingat (`item.paid` tidak ada; item menyimpan `paid_amount`) | `wa_reminder_engine.candidates` baca `paid_amount` + skip `status=paid` |
| DOC-01 | Invoice PDF kolom Dibayar per termin selalu Rp 0 | `ar_router.invoice_pdf` baca `paid_amount` |
| WA-13 | Pengajuan template Meta tanpa `example` → INVALID_FORMAT | `meta_components` sertakan `example.body_text`/`header_text`; `submit` menolak variabel tanpa contoh; field `examples` di template + UI |
| WA-04 | Body ↔ variables tidak divalidasi | `validate_variables` di create/update template (400) & submit |
| WA-01 | 5 jenis pengingat memakai 1 template `payment_reminder` | 5 template `reminder_*` di-seed untuk semua org (`ensure_reminder_templates`), default setting per jenis diganti |
| WA-03 | Riwayat body ≠ yang dikirim (reason ditempel) | `_render` hanya isi template |
| WA-12 | Template `rejected` tampil "Menunggu" di Lead WA | `TemplatesPanel` pakai status asli + alasan Meta |
| Fitur | Fase proyek (`construction_phases`) tidak bisa dibuat dari UI, tanpa template | `phase_templates.py` + `/construction/phase-templates` CRUD + `/project/{id}/phases/apply` (idempoten); tab **Tahapan Pembangunan**; detail proyek: Terapkan template / Tambah fase |
| Fitur | Survey hanya checklist datar tanpa tahapan | `survey_stages.py` + `/survey-stages`; tab **Tahapan Survey** (tahap → poin, toggle wajib); survey baru menyalin tahapan; form survey = wizard per tahap; finalisasi ditolak bila poin wajib `na` |
| Anti-kambuh | Pola A/B/C | `memory/FIELD_MAP.md`, `scripts/verify_field_names.py`, `scripts/verify_audit_fixes.py` (masuk `run_all_gates.sh`), `backend/tests/test_audit_tahap12_tahapan.py` (6 lulus) |

Keputusan default yang dipakai (belum dikonfirmasi pemilik): K-1 satukan template WA → sesi lanjut; K-3 KWITANSI cukup; K-4 progres resmi = fase berbobot; K-5 ganti label DSO.

### Gate yang masih MERAH (pra-eksisting di commit 7da1bd5, bukan regresi sesi ini)
`ux_audit` (UI-01, 4 testid statis), `audit_forms_deep` (E5 `legal/DeletionRequestsTable.js`), `verify_ia_v2`/`verify_build_hub`/`verify_budget_target` (pintu sidebar `/legal` tidak ada di ledger docs/v2/40), `verify_33` (data TRM/G51/6283), `verify_p66`/`verify_contract_legal_docgen` (PDF layout), `verify_p67` (K1 page-title), `verify_p75-78`, `verify_cancellation_refund` (akun finance_manager `finlead` tidak di-seed), `verify_panel_resilience`.

### Backlog berikutnya (Tahap 3–7 audit)
- Tahap 3: satukan layar template WA di Pusat Konfigurasi (WA-14, WA-05..09, WA-07).
- Tahap 4: `ACTION_META` label aksi RBAC (RBAC-02/03); peran dinamis bila K-2 = ya.
- Tahap 5: DOC-02 layout INVOICE sendiri, CFG-03/04 SelectItem→SSOT, UI-01/02.
- Tahap 6: CFG-01 satu `period_of` + WIB, FIN-01/02/03, PRJ-01/02 (pembagi = semua unit), BI-01/02.
- Bersihkan gate merah pra-eksisting di atas.
