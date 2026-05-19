"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getMe, updateMe } from "@/lib/api";
import type { User } from "@/lib/types";

const UF_OPTIONS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA",
  "MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN",
  "RO","RR","RS","SC","SE","SP","TO",
];

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    crm: "",
    crm_state: "",
    specialty: "",
    clinic_name: "",
    clinic_address: "",
    clinic_phone: "",
    city: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.replace("/"); return; }
    getMe()
      .then((u) => {
        setUser(u);
        setForm({
          name: u.name ?? "",
          crm: u.crm ?? "",
          crm_state: u.crm_state ?? "",
          specialty: u.specialty ?? "",
          clinic_name: u.clinic_name ?? "",
          clinic_address: u.clinic_address ?? "",
          clinic_phone: u.clinic_phone ?? "",
          city: u.city ?? "",
        });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar perfil.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);
    try {
      const updated = await updateMe({
        name: form.name || undefined,
        crm: form.crm || undefined,
        crm_state: form.crm_state || undefined,
        specialty: form.specialty || undefined,
        clinic_name: form.clinic_name || undefined,
        clinic_address: form.clinic_address || undefined,
        clinic_phone: form.clinic_phone || undefined,
        city: form.city || undefined,
      });
      setUser(updated);
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button onClick={() => router.push("/dashboard")} className="text-sm text-indigo-600 hover:underline">
            &larr; Voltar ao painel
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">Meu Perfil</h1>
          <p className="text-gray-500 text-sm mt-1">
            As informacoes abaixo serao usadas automaticamente no cabecalho dos documentos gerados.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {user && (
              <div className="mb-6 pb-4 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Conta</p>
                <p className="text-sm text-gray-700 mt-1">{user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Membro desde {new Date(user.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Identificacao medica */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Identificacao Medica
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      id="name" name="name" type="text" required
                      value={form.name} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Dr(a). Nome Completo"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label htmlFor="crm" className="block text-sm font-medium text-gray-700 mb-1">
                        Numero do CRM
                      </label>
                      <input
                        id="crm" name="crm" type="text"
                        value={form.crm} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="123456"
                      />
                    </div>
                    <div>
                      <label htmlFor="crm_state" className="block text-sm font-medium text-gray-700 mb-1">
                        UF do CRM
                      </label>
                      <select
                        id="crm_state" name="crm_state"
                        value={form.crm_state} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value="">—</option>
                        {UF_OPTIONS.map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                      Especialidade
                    </label>
                    <input
                      id="specialty" name="specialty" type="text"
                      value={form.specialty} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Ex: Cardiologia"
                    />
                  </div>
                </div>
              </div>

              {/* Consultorio */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Dados do Consultorio / Clinica
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="clinic_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Clinica / Consultorio
                    </label>
                    <input
                      id="clinic_name" name="clinic_name" type="text"
                      value={form.clinic_name} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Ex: Clinica Saude & Vida"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade (para linha de data nos documentos)
                    </label>
                    <input
                      id="city" name="city" type="text"
                      value={form.city} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Ex: Uberlandia"
                    />
                  </div>
                  <div>
                    <label htmlFor="clinic_address" className="block text-sm font-medium text-gray-700 mb-1">
                      Endereco Completo
                    </label>
                    <input
                      id="clinic_address" name="clinic_address" type="text"
                      value={form.clinic_address} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Ex: Rua das Flores, 100 — Centro — Uberlandia/MG"
                    />
                  </div>
                  <div>
                    <label htmlFor="clinic_phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      id="clinic_phone" name="clinic_phone" type="tel"
                      value={form.clinic_phone} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Ex: (34) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-700">
                Estas informacoes aparecerao automaticamente no cabecalho (letterhead) de todos os
                documentos gerados. Mantenha-as sempre atualizadas.
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {saving ? "Salvando..." : "Salvar Perfil"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
