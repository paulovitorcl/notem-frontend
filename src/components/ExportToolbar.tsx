"use client";

import { useState } from "react";
import type { MedDocument, User } from "@/lib/types";
import { copiesForDoc, formatDocId, formatCrm } from "./DocumentPreview";

interface Props {
  document: MedDocument;
  user: User;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function buildFilename(doc: MedDocument): string {
  const date = new Date(doc.created_at).toISOString().slice(0, 10);
  return `${doc.document_type}-${slugify(doc.patient_name)}-${date}.pdf`;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  laudo: "Laudo Medico",
  atestado: "Atestado Medico",
  encaminhamento: "Encaminhamento Medico",
  receituario: "Receituario Medico",
  relatorio: "Relatorio Medico",
  notificacao: "Notificacao Compulsoria",
};

export default function ExportToolbar({ document: doc, user }: Props) {
  const [exporting, setExporting] = useState(false);
  const copies = copiesForDoc(doc);
  const filename = buildFilename(doc);

  async function handleExportPdf() {
    setExporting(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      // PDF metadata
      pdf.setProperties({
        title: `${DOC_TYPE_LABELS[doc.document_type]} — ${doc.patient_name}`,
        author: user.name,
        creator: "MedDoc AI by Notem",
        subject: formatDocId(doc.id, doc.created_at),
      });

      for (let i = 0; i < copies; i++) {
        const el = document.getElementById(`doc-preview-page-${i}`);
        if (!el) continue;

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgH = (canvas.height * pdfW) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfW, Math.min(imgH, pdfH));
      }

      pdf.save(filename);
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  }

  function handlePrint() {
    // Trigger print via a hidden print-root div populated by the page
    window.print();
  }

  function handleWhatsApp() {
    const crm = formatCrm(user);
    const docType = DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type;
    const docId = formatDocId(doc.id, doc.created_at);
    const date = new Date(doc.created_at).toLocaleDateString("pt-BR");

    const msg = encodeURIComponent(
      `Segue seu ${docType} gerado em ${date}.\n` +
        `Documento n° ${docId}.\n` +
        `Dr(a). ${user.name}${crm ? ` — ${crm}` : ""}.\n\n` +
        `(Anexe o PDF ao enviar esta mensagem)`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Exportar / Imprimir</h3>
        {copies > 1 && (
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
            {copies} vias serao geradas
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm w-full"
        >
          {exporting ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Gerando PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exportar PDF
            </>
          )}
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm w-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Imprimir
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm w-full"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.524 5.847L0 24l6.345-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-4.975-1.349l-.357-.212-3.705.875.942-3.618-.232-.372A9.818 9.818 0 1112 21.818z"/>
          </svg>
          Compartilhar no WhatsApp
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-3 leading-relaxed">
        Para o WhatsApp, exporte o PDF primeiro e anexe manualmente ao abrir o app.
      </p>
    </div>
  );
}
