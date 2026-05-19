"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import DocumentPreview from "@/components/DocumentPreview";
import ExportToolbar from "@/components/ExportToolbar";
import { DOCUMENT_TYPE_LABELS } from "@/components/DocumentCard";
import { deleteDocument, getDocument, getMe, updateDocument } from "@/lib/api";
import type { MedDocument, DocumentStatus, User } from "@/lib/types";

function formatDate(s: string) {
  return new Date(s).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function DocumentoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const docId = Number(id);

  const [doc, setDoc] = useState<MedDocument | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [activeTab, setActiveTab] = useState<"editar" | "visualizar">("editar");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [printing, setPrinting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.replace("/"); return; }
    if (isNaN(docId)) { router.replace("/dashboard"); return; }

    Promise.all([getDocument(docId), getMe()])
      .then(([d, u]) => {
        setDoc(d);
        setUser(u);
        const initial =
          d.status === "finalizado"
            ? (d.final_content ?? d.generated_content ?? "")
            : (d.generated_content ?? "");
        setContent(initial);
        setPreviewContent(initial);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar documento.");
      })
      .finally(() => setLoading(false));
  }, [docId, router]);

  // Debounced preview update
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPreviewContent(content), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [content]);

  // Print mode: render only preview, then trigger print
  useEffect(() => {
    if (!printing) return;
    const timer = setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [printing]);

  async function handleSave(status: DocumentStatus) {
    if (!doc) return;
    status === "finalizado" ? setFinalizing(true) : setSaving(true);
    setError(""); setSuccessMsg("");
    try {
      const updated = await updateDocument(docId, { final_content: content, status });
      setDoc(updated);
      setSuccessMsg(status === "finalizado" ? "Documento finalizado!" : "Revisao salva!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false); setFinalizing(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Excluir este documento? Esta acao e irreversivel.")) return;
    setDeleting(true);
    try {
      await deleteDocument(docId);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao excluir.");
      setDeleting(false);
    }
  }

  // ── Print mode: only show document preview ──────────────────────────────────
  if (printing && doc && user) {
    return (
      <div id="print-root">
        <DocumentPreview document={doc} user={user} content={previewContent} />
      </div>
    );
  }

  const isFinalized = doc?.status === "finalizado";
  const isBusy = saving || finalizing || deleting;
  const canExport = doc?.status === "revisado" || doc?.status === "finalizado";

  // ── Loading / error ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      </div>
    );
  }

  if (!doc || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            {error || "Documento nao encontrado."}
          </div>
        </main>
      </div>
    );
  }

  // ── Main layout ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Back + header */}
        <div className="mb-4 no-print">
          <button onClick={() => router.push("/dashboard")}
            className="text-sm text-indigo-600 hover:underline">
            &larr; Voltar ao painel
          </button>
          <div className="flex items-start justify-between mt-3 flex-wrap gap-2">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Paciente: <span className="font-medium text-gray-700">{doc.patient_name}</span>
                <span className="text-gray-400 ml-3 text-xs">
                  Gerado em {formatDate(doc.created_at)}
                </span>
              </p>
            </div>
            <StatusBadge status={doc.status} />
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm no-print">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm no-print">
            {successMsg}
          </div>
        )}

        {/* Mobile tabs */}
        <div className="flex lg:hidden mb-4 border border-gray-200 rounded-lg overflow-hidden no-print">
          {(["editar", "visualizar"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}>
              {tab === "editar" ? "Editar" : "Visualizar"}
            </button>
          ))}
        </div>

        {/* Split view */}
        <div className="flex gap-6 items-start">
          {/* ── Left panel: editor ── */}
          <div className={`flex-1 min-w-0 no-print ${activeTab === "visualizar" ? "hidden lg:flex lg:flex-col" : "flex flex-col"}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isFinalized ? "Conteudo Final (somente leitura)" : "Conteudo Gerado — edite antes de finalizar"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                readOnly={isFinalized}
                rows={28}
                className={`w-full border rounded-lg px-3 py-2 text-sm font-mono leading-relaxed resize-vertical focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                  isFinalized ? "bg-gray-50 border-gray-200 text-gray-600 cursor-default" : "border-gray-300"
                }`}
              />

              {/* Action buttons */}
              {!isFinalized && (
                <div className="flex gap-3 flex-wrap mt-4">
                  <button onClick={() => handleSave("revisado")} disabled={isBusy}
                    className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                    {saving ? "Salvando..." : "Salvar Revisao"}
                  </button>
                  <button onClick={() => handleSave("finalizado")} disabled={isBusy}
                    className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                    {finalizing ? "Finalizando..." : "Finalizar Documento"}
                  </button>
                  <button onClick={handleDelete} disabled={isBusy}
                    className="bg-red-100 hover:bg-red-200 disabled:bg-red-50 text-red-700 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm">
                    {deleting ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              )}

              {isFinalized && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  Documento finalizado. Nao pode mais ser editado.
                </div>
              )}
            </div>

            {/* Export toolbar (below editor, only when revisado/finalizado) */}
            {canExport && (
              <div className="mt-4">
                <ExportToolbar document={doc} user={user} />
              </div>
            )}
          </div>

          {/* ── Right panel: preview ── */}
          <div className={`no-print ${activeTab === "editar" ? "hidden lg:flex lg:flex-col" : "flex flex-col"} w-full lg:w-auto`}>
            <div className="sticky top-20">
              <p className="text-xs text-gray-400 mb-2 text-center">
                Previa A4 — atualiza em tempo real
              </p>
              <div
                className="overflow-auto rounded-xl border border-gray-200 shadow-sm bg-gray-100"
                style={{ maxHeight: "80vh", maxWidth: "860px" }}
              >
                <div style={{ transform: "scale(0.72)", transformOrigin: "top left",
                  width: "138.9%" /* 100/0.72 */ }}>
                  <DocumentPreview document={doc} user={user} content={previewContent} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance notice */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 no-print">
          <strong>Conformidade CFM / LGPD:</strong> Este documento foi gerado com auxilio de IA e
          deve ser revisado e assinado pelo medico responsavel antes de qualquer uso clinico ou
          legal. Os dados do paciente sao protegidos conforme a LGPD (Lei 13.709/2018).
        </div>
      </main>
    </div>
  );
}
