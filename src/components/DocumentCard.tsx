import Link from "next/link";
import type { MedDocument } from "@/lib/types";
import StatusBadge from "./StatusBadge";

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  laudo: "Laudo Medico",
  atestado: "Atestado Medico",
  encaminhamento: "Encaminhamento Medico",
  receituario: "Receituario Medico",
  relatorio: "Relatorio Medico",
  notificacao: "Notificacao Compulsoria",
};

interface Props {
  document: MedDocument;
}

export default function DocumentCard({ document: doc }: Props) {
  const formattedDate = new Date(doc.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Link href={`/documento/${doc.id}`} className="block h-full">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5 h-full flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full leading-tight">
            {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
          </span>
          <StatusBadge status={doc.status} />
        </div>
        <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate flex-1">
          {doc.patient_name}
        </h3>
        <p className="text-xs text-gray-400 mt-auto">{formattedDate}</p>
      </div>
    </Link>
  );
}
