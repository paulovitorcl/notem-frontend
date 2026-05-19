import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedDoc AI — Documentos Medicos com IA",
  description:
    "Plataforma da Notem para geracao de documentos medicos com inteligencia artificial. Conforme LGPD e CFM.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 min-h-screen antialiased">{children}</body>
    </html>
  );
}
