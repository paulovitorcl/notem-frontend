"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DocumentCard from "@/components/DocumentCard";
import Navbar from "@/components/Navbar";
import { getDocuments } from "@/lib/api";
import type { MedDocument } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<MedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Meus Documentos
            </h1>
            {!loading && (
              <p className="text-gray-500 text-sm mt-1">
                {documents.length}{" "}
                {documents.length === 1 ? "documento gerado" : "documentos gerados"}
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
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
