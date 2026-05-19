"use client";

import type { MedDocument, User } from "@/lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────

export function formatDocId(docId: number, createdAt: string): string {
  const year = new Date(createdAt).getFullYear();
  return `DOC-${year}-${String(docId).padStart(5, "0")}`;
}

export function formatCrm(user: User): string {
  if (user.crm && user.crm_state) return `CRM/${user.crm_state} ${user.crm}`;
  if (user.crm) return `CRM ${user.crm}`;
  return "";
}

export function formatFullDate(isoOrDate?: string): string {
  const d = isoOrDate ? new Date(isoOrDate) : new Date();
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function copiesForDoc(doc: MedDocument): number {
  if (doc.prescription_type === "azul") return 2;
  if (doc.prescription_type === "amarelo") return 3;
  return 1;
}

const DOC_TITLES: Record<string, string> = {
  laudo: "LAUDO MEDICO",
  atestado: "ATESTADO MEDICO",
  encaminhamento: "ENCAMINHAMENTO MEDICO",
  receituario: "RECEITUARIO MEDICO",
  relatorio: "RELATORIO MEDICO",
  notificacao: "NOTIFICACAO COMPULSORIA",
};

// ── A4 page styles (inline so html2canvas captures them) ─────────────────────

const PAGE_STYLE: React.CSSProperties = {
  width: "794px",
  minHeight: "1123px",
  backgroundColor: "#ffffff",
  boxSizing: "border-box",
  padding: "76px 57px 76px 57px", // ~20mm top/bottom, ~15mm sides at 96dpi
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: "11pt",
  lineHeight: "1.6",
  color: "#111827",
  position: "relative",
};

// ── sub-components ────────────────────────────────────────────────────────────

function Letterhead({ user }: { user: User }) {
  const crm = formatCrm(user);
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "17pt", fontWeight: "bold", color: "#1e3a5f", lineHeight: 1.2 }}>
        {user.name}
      </div>
      {user.specialty && (
        <div style={{ fontSize: "11pt", color: "#374151", marginTop: "2px" }}>
          {user.specialty}
        </div>
      )}
      {crm && (
        <div style={{ fontSize: "10pt", color: "#6b7280", marginTop: "2px" }}>{crm}</div>
      )}
      {user.clinic_name && (
        <div style={{ fontSize: "10pt", color: "#6b7280", marginTop: "6px", fontStyle: "italic" }}>
          {user.clinic_name}
        </div>
      )}
      {user.clinic_address && (
        <div style={{ fontSize: "9pt", color: "#9ca3af" }}>{user.clinic_address}</div>
      )}
      {user.clinic_phone && (
        <div style={{ fontSize: "9pt", color: "#9ca3af" }}>Tel: {user.clinic_phone}</div>
      )}
      <hr style={{ borderColor: "#1e3a5f", borderWidth: "2px 0 0", marginTop: "10px" }} />
    </div>
  );
}

function SignatureBlock({ user }: { user: User }) {
  const crm = formatCrm(user);
  return (
    <div style={{ marginTop: "64px" }}>
      <div style={{ width: "260px", borderTop: "1px solid #374151", marginBottom: "6px" }} />
      <div style={{ fontWeight: "bold", fontSize: "11pt" }}>{user.name}</div>
      {crm && <div style={{ fontSize: "10pt", color: "#374151" }}>{crm}</div>}
      {user.specialty && (
        <div style={{ fontSize: "10pt", color: "#374151" }}>{user.specialty}</div>
      )}
    </div>
  );
}

// ── single A4 copy ────────────────────────────────────────────────────────────

interface PageProps {
  doc: MedDocument;
  user: User;
  content: string;
  copyIndex: number;
  totalCopies: number;
  pageId: string;
}

function DocumentPage({ doc, user, content, copyIndex, totalCopies, pageId }: PageProps) {
  const docTitle = DOC_TITLES[doc.document_type] ?? doc.document_type.toUpperCase();
  const docId = formatDocId(doc.id, doc.created_at);
  const crm = formatCrm(user);
  const cityPrefix = user.city ? `${user.city}, ` : "";
  const dateLine = `${cityPrefix}${formatFullDate(doc.created_at)}`;

  const isAzul = doc.prescription_type === "azul";
  const isAmarelo = doc.prescription_type === "amarelo";
  const isNotificacao = doc.document_type === "notificacao";

  return (
    <div
      id={pageId}
      className="print-page"
      style={{
        ...PAGE_STYLE,
        borderLeft: isAzul ? "10px solid #3b82f6" : undefined,
      }}
    >
      {/* Amarelo: topo amarelo */}
      {isAmarelo && (
        <div
          style={{
            backgroundColor: "#fbbf24",
            margin: "-76px -57px 16px",
            padding: "8px 16px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "10pt",
          }}
        >
          RECEITUARIO DE CONTROLE ESPECIAL — ANVISA RDC 471/2021
        </div>
      )}

      {/* Notificacao: faixa de aviso */}
      {isNotificacao && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            border: "2px solid #dc2626",
            padding: "8px 12px",
            marginBottom: "14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontWeight: "bold", color: "#dc2626", fontSize: "11pt" }}>
            NOTIFICACAO COMPULSORIA — DOCUMENTO DE CARATER LEGAL
          </div>
          <div style={{ fontSize: "9pt", color: "#7f1d1d", marginTop: "4px" }}>
            A omissao desta notificacao e infraçao etica e pode configurar delito
            (art. 269 do Codigo Penal Brasileiro)
          </div>
        </div>
      )}

      {/* Marca d'agua de copia */}
      {totalCopies > 1 && copyIndex > 0 && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-45deg)",
            fontSize: "72pt",
            fontWeight: "bold",
            color: "rgba(0,0,0,0.04)",
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          {copyIndex + 1}a VIA
        </div>
      )}

      {/* Letterhead */}
      <Letterhead user={user} />

      {/* Titulo do documento */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <div style={{ fontSize: "13pt", fontWeight: "bold", letterSpacing: "1px" }}>
          {docTitle}
        </div>
        <div style={{ fontSize: "9pt", color: "#9ca3af", marginTop: "3px" }}>N° {docId}</div>
        {totalCopies > 1 && (
          <div style={{ fontSize: "9pt", color: "#6b7280", marginTop: "2px" }}>
            {copyIndex + 1}a via de {totalCopies}
          </div>
        )}
      </div>

      {/* Linha de data / cidade */}
      <div style={{ textAlign: "right", fontSize: "10pt", marginBottom: "14px", color: "#374151" }}>
        {dateLine}
      </div>

      {/* Dados do paciente */}
      <div style={{ marginBottom: "14px", fontSize: "10.5pt" }}>
        <strong>Paciente:</strong> {doc.patient_name}
        {doc.patient_birthdate && (
          <span style={{ marginLeft: "16px" }}>
            <strong>Nascimento:</strong>{" "}
            {new Date(doc.patient_birthdate + "T12:00:00").toLocaleDateString("pt-BR")}
          </span>
        )}
        {doc.cid10_code && (
          <span style={{ marginLeft: "16px" }}>
            <strong>CID-10:</strong> {doc.cid10_code}
          </span>
        )}
      </div>

      {/* Corpo do documento */}
      <div style={{ whiteSpace: "pre-wrap", fontSize: "11pt", lineHeight: "1.7" }}>
        {content}
      </div>

      {/* Assinatura */}
      <SignatureBlock user={user} />
    </div>
  );
}

// ── public component ──────────────────────────────────────────────────────────

interface Props {
  document: MedDocument;
  user: User;
  content: string;
}

export default function DocumentPreview({ document: doc, user, content }: Props) {
  const copies = copiesForDoc(doc);

  return (
    <div className="space-y-6">
      {Array.from({ length: copies }).map((_, i) => (
        <DocumentPage
          key={i}
          doc={doc}
          user={user}
          content={content}
          copyIndex={i}
          totalCopies={copies}
          pageId={`doc-preview-page-${i}`}
        />
      ))}
    </div>
  );
}
