import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, RefreshCw, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusPill from "@/components/patterns/StatusPill";
import { LoadingCards, ErrorState } from "@/components/patterns/StateViews";
import { formatDateTimeWIB } from "@/utils/formatters";
import { useReference } from "@/context/ReferenceContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/apiClient";
import { P97 } from "@/constants/testIds";

const TONE = { APPROVED: "approved", REJECTED: "failed", PENDING: "pending", NOT_SUBMITTED: "simulation", PAUSED: "failed", DISABLED: "failed" };

/** Template WA ↔ Meta (Fase 97A): status persetujuan, ajukan, sinkron, pratinjau payload Meta. */
export default function WaTemplateMetaPanel() {
  const { labelOf } = useReference();
  const { can } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [preview, setPreview] = useState(null);
  const canManage = can("wa_templates", "manage");

  const load = useCallback(() => {
    setError("");
    api.get("/wa-templates").then((r) => setRows(r.data.data || []))
      .catch((e) => setError(e?.response?.data?.detail || "Gagal memuat template."));
  }, []);
  useEffect(() => { load(); }, [load]);

  const sync = async () => {
    setBusy("sync");
    try { const r = await api.post("/wa-templates/sync"); toast.success(`Sinkron Meta: ${r.data.data.matched} template diperbarui, ${r.data.data.approved} APPROVED.`); load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Sinkron gagal."); }
    finally { setBusy(""); }
  };
  const submit = async (t) => {
    setBusy(t.id);
    try { await api.post(`/wa-templates/${t.id}/submit`); toast.success("Template diajukan ke Meta (PENDING)."); load(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Pengajuan gagal."); }
    finally { setBusy(""); }
  };
  const openPreview = async (t) => {
    try { const r = await api.get(`/wa-templates/${t.id}/meta-preview`); setPreview({ t, payload: r.data.data }); }
    catch (e) { toast.error(e?.response?.data?.detail || "Gagal memuat pratinjau."); }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows) return <LoadingCards count={2} />;
  return (
    <div className="space-y-3" data-testid={P97.tmplMetaPanel}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Status resmi dari Meta per template. Di luar sesi 24 jam hanya template <b>APPROVED</b> yang bisa dikirim; template REJECTED otomatis tidak bisa dipilih.
          Variabel <code>{"{{nama}}"}</code> dipetakan ke parameter berurutan Meta <code>{"{{1}}"}</code>.
        </p>
        {canManage ? (
          <Button data-testid={P97.tmplSyncBtn} size="sm" variant="outline" onClick={sync} disabled={busy === "sync"}>
            <RefreshCw className="mr-1.5 h-4 w-4" /> {busy === "sync" ? "Menyinkron…" : "Tarik status dari Meta"}
          </Button>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader><TableRow><TableHead>Template</TableHead><TableHead>Kategori</TableHead><TableHead>Status Meta</TableHead><TableHead>Dipakai gateway</TableHead><TableHead>Sinkron</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id} data-testid={P97.tmplMetaRow}>
                <TableCell><p className="font-medium">{t.name}</p><p className="font-mono text-[11px] text-muted-foreground">{t.meta_name || t.code} · {t.language}</p></TableCell>
                <TableCell className="text-xs">{labelOf("wa_template_category", t.category)}
                  {t.header_type && t.header_type !== "none" ? <span data-testid={P97.tmplHeaderBadge} className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px]">header: {labelOf("wa_template_header", t.header_type)}</span> : null}
                </TableCell>
                <TableCell data-testid={P97.tmplMetaStatus}>
                  <StatusPill status={TONE[t.meta_status] || "pending"} label={labelOf("wa_meta_template_status", t.meta_status || "NOT_SUBMITTED")} />
                  {t.meta_reason ? <p className="mt-0.5 text-[11px] text-rose-600">{t.meta_reason}</p> : null}
                </TableCell>
                <TableCell><StatusPill status={t.status} group="wa_template_status" /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{t.meta_synced_at ? formatDateTimeWIB(t.meta_synced_at) : "—"}</TableCell>
                <TableCell className="text-right">
                  <Button data-testid={P97.tmplPreviewBtn} size="sm" variant="ghost" onClick={() => openPreview(t)} title="Pratinjau payload Meta"><Eye className="h-4 w-4" /></Button>
                  {canManage && t.meta_status !== "APPROVED" ? (
                    <Button data-testid={P97.tmplSubmitBtn} size="sm" variant="outline" onClick={() => submit(t)} disabled={busy === t.id}>
                      <Upload className="mr-1 h-3.5 w-3.5" /> Ajukan ke Meta
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {!rows.length ? <TableRow><TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">Belum ada template. Buat di Automasi & Channel › Template WA.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Payload Meta — {preview?.t?.name}</DialogTitle><DialogDescription>Bentuk yang dikirim ke <code>/message_templates</code>.</DialogDescription></DialogHeader>
          <pre className="max-h-[50vh] overflow-auto rounded-lg bg-secondary p-3 text-xs">{JSON.stringify(preview?.payload, null, 2)}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
