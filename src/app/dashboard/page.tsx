"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DocumentCard from "@/components/DocumentCard";
import { DOCUMENT_TYPE_LABELS } from "@/components/DocumentCard";
import Navbar from "@/components/Navbar";
import { getDocuments } from "@/lib/api";
import type { DocumentType, MedDocument } from "@/lib/types";

const TYPE_OPTIONS: { value: DocumentType | ""; label: string }[] = [
  { value: "", label: "Todos os tipos" },
  { value: "laudo", label: "Laudo" },
  { value: "atestado", label: "Atestado" },
  { value: "encaminhamento", label: "Encaminhamento" },
  { value: "receituario", label: "Receituario" },
  { value: "relatorio", label: "Relatorio" },
  { value: "notificacao", label: "Notificacao" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "gerado", label: "Gerado" },
  { value: "revisado", label: "Revisado" },
  { value: "finalizado", label: "Finalizado" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<MedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "">("");
  const [statusFilter, setStatusFilter] = useState<"gerado" | "revisado" | "finalizado" | "">("");
  const [sort, setSort] = useState<"newer" | "older">("newer");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/");
      return;
    }
    getDocuments()
      .then(setDocuments)
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar documentos."
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = useMemo(() => {
    let result = [...documents];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((d) => d.patient_name.toLowerCase().includes(q));
    }
    if (typeFilter) {
      result = result.filter((d) => d.document_type === typeFilter);
    }
    if (statusFilter) {
      result = result.filter((d) => d.status === statusFilter);
    }

    result.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sort === "newer" ? -diff : diff;
    });

    return result;
  }, [documents, search, typeFilter, statusFilter, sort]);

  const hasFilters = search || typeFilter || statusFilter;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Meus Documentos
            </h1>
            {!loading && (
              <p className="text-gray-500 text-sm mt-1">
                {hasFilters
                  ? `${filtered.length} de ${documents.length} ${documents.length === 1 ? "documento" : "documentos"}`
                  : `${documents.length} ${documents.length === 1 ? "documento gerado" : "documentos gerados"}`}
              </p>
            )}
          </div>
          <Link
            href="/gerar"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            + Gerar Novo Documento
          </Link>
        </div>

        {/* Filters */}
        {!loading && documents.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as DocumentType | "")}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "gerado" | "revisado" | "finalizado" | "")}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "newer" | "older")}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="newer">Mais recente</option>
              <option value="older">Mais antigo</option>
            </select>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setTypeFilter(""); setStatusFilter(""); }}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors underline whitespace-nowrap"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">&#128196;</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhum documento gerado ainda
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Comece gerando seu primeiro documento medico com IA.
            </p>
            <Link
              href="/gerar"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Gerar Primeiro Documento
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">&#128269;</div>
            <h3 className="text-base font-semibold text-gray-600 mb-1">Nenhum resultado</h3>
            <p className="text-gray-400 text-sm">Tente ajustar os filtros ou a busca.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
