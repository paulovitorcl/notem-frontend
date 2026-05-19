"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/api";

export default function CadastroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    crm: "",
    specialty: "",
  });
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lgpdConsent) {
      setError(
        "Voce deve aceitar a Politica de Privacidade (LGPD) para criar uma conta."
      );
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        crm: formData.crm || undefined,
        specialty: formData.specialty || undefined,
        lgpd_consent: true,
      });
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">MedDoc AI</h1>
          <p className="text-gray-400 text-sm mt-1">by Notem</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Criar conta
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome completo *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                placeholder="Dr(a). Joao Silva"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-mail *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                placeholder="Minimo 6 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="crm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                CRM{" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="crm"
                name="crm"
                type="text"
                value={formData.crm}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                placeholder="Ex: CRM/SP 123456"
              />
            </div>

            <div>
              <label
                htmlFor="specialty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Especialidade{" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                id="specialty"
                name="specialty"
                type="text"
                value={formData.specialty}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                placeholder="Ex: Cardiologia"
              />
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                id="lgpd"
                type="checkbox"
                checked={lgpdConsent}
                onChange={(e) => setLgpdConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="lgpd"
                className="text-sm text-gray-600 leading-snug cursor-pointer"
              >
                Li e aceito a Politica de Privacidade. Estou ciente de que meus
                dados serao tratados conforme a{" "}
                <span className="font-semibold text-indigo-700">
                  LGPD (Lei 13.709/2018)
                </span>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !lgpdConsent}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors mt-1"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Ja tem conta?{" "}
            <Link href="/" className="text-indigo-600 hover:underline font-medium">
              Faca login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
