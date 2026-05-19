"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { generateDocument } from "@/lib/api";
import type { DocumentType, MedicationItem, PrescriptionType } from "@/lib/types";

// ── constants ─────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "atestado", label: "Atestado Medico" },
  { value: "encaminhamento", label: "Encaminhamento Medico" },
  { value: "receituario", label: "Receituario Medico" },
  { value: "laudo", label: "Laudo Medico" },
  { value: "relatorio", label: "Relatorio Medico" },
  { value: "notificacao", label: "Notificacao Compulsoria" },
];

const ATESTADO_SUBTYPES = [
  { value: "trabalho", label: "Afastamento do Trabalho" },
  { value: "escola", label: "Afastamento Escolar" },
  { value: "atividade_fisica", label: "Dispensa de Atividade Fisica" },
  { value: "ocupacional", label: "Saude Ocupacional" },
  { value: "obito", label: "Atestado de Obito" },
];

const URGENCY_OPTIONS = [
  { value: "eletivo", label: "Eletivo" },
  { value: "prioritario", label: "Prioritario" },
  { value: "urgencia", label: "Urgencia" },
];

const PRESCRIPTION_TYPES: { value: PrescriptionType; label: string }[] = [
  { value: "branco", label: "Simples / Branco — medicamentos comuns (1 via)" },
  { value: "azul", label: "Azul — psicotropicos (2 vias ANVISA)" },
  { value: "amarelo", label: "Amarelo — entorpecentes (3 vias ANVISA)" },
];

const MED_ROUTES = [
  { value: "oral", label: "Oral" },
  { value: "subcutaneo", label: "Subcutaneo" },
  { value: "intramuscular", label: "Intramuscular" },
  { value: "endovenoso", label: "Endovenoso" },
  { value: "topico", label: "Topico" },
  { value: "outro", label: "Outro" },
];

const NOTIFICATION_TYPES = [
  { value: "compulsoria_imediata", label: "Compulsoria Imediata (24 horas)" },
  { value: "compulsoria_semanal", label: "Compulsoria Semanal (7 dias)" },
  { value: "estadual", label: "Notificacao Estadual" },
];

const EMPTY_MED: MedicationItem = {
  medication_name: "",
  dosage: "",
  route: "oral",
  frequency: "",
  duration: "",
  quantity: "",
};

// ── field components ──────────────────────────────────────────────────────────

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {optional && <span className="text-gray-400 font-normal ml-1">(opcional)</span>}
    </label>
  );
}

function Input({
  id, name, type = "text", value, onChange, placeholder, required, min,
}: {
  id: string; name: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; min?: string;
}) {
  return (
    <input
      id={id} name={name} type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required} min={min}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
    />
  );
}

function Select({
  id, name, value, onChange, children,
}: {
  id: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      id={id} name={name} value={value} onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
    >
      {children}
    </select>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function GerarPage() {
  const router = useRouter();

  const [docType, setDocType] = useState<DocumentType>("atestado");
  const [common, setCommon] = useState({
    patient_name: "",
    patient_birthdate: "",
    clinical_notes: "",
  });
  // Atestado
  const [atestadoSubtype, setAtestadoSubtype] = useState("trabalho");
  const [daysOfLeave, setDaysOfLeave] = useState("");
  const [cid10, setCid10] = useState("");
  const [purpose, setPurpose] = useState("");
  // Encaminhamento
  const [specialtyReq, setSpecialtyReq] = useState("");
  const [urgency, setUrgency] = useState("eletivo");
  const [healthPlan, setHealthPlan] = useState("");
  const [sisreg, setSisreg] = useState(false);
  // Receituario
  const [rxType, setRxType] = useState<PrescriptionType>("branco");
  const [medications, setMedications] = useState<MedicationItem[]>([{ ...EMPTY_MED }]);
  // Laudo
  const [reqAuthority, setReqAuthority] = useState("");
  const [quesitos, setQuesitos] = useState("");
  const [examDate, setExamDate] = useState("");
  // Notificacao
  const [diseaseType, setDiseaseType] = useState("");
  const [notifType, setNotifType] = useState("compulsoria_imediata");
  const [healthUnit, setHealthUnit] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/");
  }, [router]);

  function handleCommon(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setCommon((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  // Medications helpers
  function updateMed(index: number, field: keyof MedicationItem, value: string) {
    setMedications((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }
  function addMed() {
    setMedications((prev) => [...prev, { ...EMPTY_MED }]);
  }
  function removeMed(index: number) {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: Parameters<typeof generateDocument>[0] = {
        document_type: docType,
        patient_name: common.patient_name,
        patient_birthdate: common.patient_birthdate,
        clinical_notes: common.clinical_notes,
      };

      if (docType === "atestado") {
        payload.atestado_subtype = atestadoSubtype;
        if (daysOfLeave) payload.days_of_leave = Number(daysOfLeave);
        if (cid10) payload.cid10_code = cid10;
        if (purpose) payload.purpose = purpose;
      }
      if (docType === "encaminhamento") {
        payload.specialty_requested = specialtyReq;
        payload.urgency_level = urgency;
        if (healthPlan) payload.health_plan = healthPlan;
        payload.sisreg_mode = sisreg;
      }
      if (docType === "receituario") {
        payload.prescription_type = rxType;
        payload.medications = medications.filter((m) => m.medication_name.trim());
      }
      if (docType === "laudo") {
        if (reqAuthority) payload.requesting_authority = reqAuthority;
        if (quesitos) payload.quesitos = quesitos;
        if (examDate) payload.exam_date = examDate;
      }
      if (docType === "notificacao") {
        payload.disease_type = diseaseType;
        payload.notification_type = notifType;
        if (healthUnit) payload.health_unit = healthUnit;
      }

      const doc = await generateDocument(payload);
      router.push(`/documento/${doc.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao gerar documento.");
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-800 mt-3">Gerar Novo Documento</h1>
          <p className="text-gray-500 text-sm mt-1">
            Preencha os dados e as anotacoes clinicas para gerar o documento com IA.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tipo de documento */}
            <div>
              <FieldLabel>Tipo de Documento *</FieldLabel>
              <Select id="docType" name="docType" value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>

            {/* Dados comuns */}
            <div>
              <FieldLabel>Nome do Paciente *</FieldLabel>
              <Input id="patient_name" name="patient_name" value={common.patient_name}
                onChange={handleCommon} required placeholder="Nome completo do paciente" />
            </div>
            <div>
              <FieldLabel>Data de Nascimento do Paciente *</FieldLabel>
              <Input id="patient_birthdate" name="patient_birthdate" type="date"
                value={common.patient_birthdate} onChange={handleCommon} required />
            </div>

            {/* ── Atestado ── */}
            {docType === "atestado" && (
              <div className="space-y-4 border border-amber-100 bg-amber-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  Dados do Atestado
                </p>
                <div>
                  <FieldLabel>Finalidade do Atestado *</FieldLabel>
                  <Select id="atestadoSubtype" name="atestadoSubtype" value={atestadoSubtype}
                    onChange={(e) => setAtestadoSubtype(e.target.value)}
                  >
                    {ATESTADO_SUBTYPES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel optional>Dias de Afastamento</FieldLabel>
                    <Input id="daysOfLeave" name="daysOfLeave" type="number" min="1"
                      value={daysOfLeave} onChange={(e) => setDaysOfLeave(e.target.value)}
                      placeholder="Ex: 3" />
                  </div>
                  <div>
                    <FieldLabel optional>Codigo CID-10</FieldLabel>
                    <Input id="cid10" name="cid10" value={cid10}
                      onChange={(e) => setCid10(e.target.value)} placeholder="Ex: J11" />
                  </div>
                </div>
                <div>
                  <FieldLabel optional>Finalidade Especifica</FieldLabel>
                  <Input id="purpose" name="purpose" value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Ex: Apresentar ao RH da empresa" />
                </div>
              </div>
            )}

            {/* ── Encaminhamento ── */}
            {docType === "encaminhamento" && (
              <div className="space-y-4 border border-blue-100 bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Dados do Encaminhamento
                </p>
                <div>
                  <FieldLabel>Especialidade Solicitada *</FieldLabel>
                  <Input id="specialtyReq" name="specialtyReq" value={specialtyReq}
                    onChange={(e) => setSpecialtyReq(e.target.value)} required
                    placeholder="Ex: Cardiologia" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Urgencia *</FieldLabel>
                    <Select id="urgency" name="urgency" value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                    >
                      {URGENCY_OPTIONS.map((u) => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <FieldLabel optional>Convenio / Plano</FieldLabel>
                    <Input id="healthPlan" name="healthPlan" value={healthPlan}
                      onChange={(e) => setHealthPlan(e.target.value)} placeholder="Ex: Unimed" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id="sisreg" type="checkbox" checked={sisreg}
                    onChange={(e) => setSisreg(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                  <label htmlFor="sisreg" className="text-sm text-gray-700">
                    Padrao SUS/SISREG
                  </label>
                </div>
              </div>
            )}

            {/* ── Receituario ── */}
            {docType === "receituario" && (
              <div className="space-y-4 border border-purple-100 bg-purple-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                  Dados do Receituario
                </p>
                <div>
                  <FieldLabel>Tipo de Receituario *</FieldLabel>
                  <Select id="rxType" name="rxType" value={rxType}
                    onChange={(e) => setRxType(e.target.value as PrescriptionType)}
                  >
                    {PRESCRIPTION_TYPES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </Select>
                </div>
                {(rxType === "azul" || rxType === "amarelo") && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
                    <strong>Receituario especial.</strong> Verifique o bloco numerado da ANVISA.
                    O PDF sera gerado com {rxType === "azul" ? "2 vias" : "3 vias"}.
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Medicamentos</p>
                  {medications.map((med, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-500">
                          Medicamento {idx + 1}
                        </span>
                        {medications.length > 1 && (
                          <button type="button" onClick={() => removeMed(idx)}
                            className="text-xs text-red-500 hover:text-red-700">
                            Remover
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          placeholder="Nome generico (ex: amoxicilina)"
                          value={med.medication_name}
                          onChange={(e) => updateMed(idx, "medication_name", e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="Dosagem (ex: 500mg)"
                            value={med.dosage}
                            onChange={(e) => updateMed(idx, "dosage", e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                          <select value={med.route}
                            onChange={(e) => updateMed(idx, "route", e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                            {MED_ROUTES.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                          <input placeholder="Frequencia (ex: 8/8h)"
                            value={med.frequency}
                            onChange={(e) => updateMed(idx, "frequency", e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                          <input placeholder="Duracao (ex: 7 dias)"
                            value={med.duration}
                            onChange={(e) => updateMed(idx, "duration", e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                          <input placeholder="Quantidade (ex: 21 caps)"
                            value={med.quantity}
                            onChange={(e) => updateMed(idx, "quantity", e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm col-span-2 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addMed}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    + Adicionar medicamento
                  </button>
                </div>
              </div>
            )}

            {/* ── Laudo ── */}
            {docType === "laudo" && (
              <div className="space-y-4 border border-gray-200 bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Dados do Laudo Pericial
                </p>
                <div>
                  <FieldLabel optional>Autoridade Requisitante</FieldLabel>
                  <Input id="reqAuthority" name="reqAuthority" value={reqAuthority}
                    onChange={(e) => setReqAuthority(e.target.value)}
                    placeholder="Ex: Justica do Trabalho — 2a Vara" />
                </div>
                <div>
                  <FieldLabel optional>Data do Exame Pericial</FieldLabel>
                  <Input id="examDate" name="examDate" type="date" value={examDate}
                    onChange={(e) => setExamDate(e.target.value)} />
                </div>
                <div>
                  <FieldLabel optional>Quesitos a Responder</FieldLabel>
                  <textarea
                    value={quesitos}
                    onChange={(e) => setQuesitos(e.target.value)}
                    rows={5}
                    placeholder={"1. O periciando apresenta incapacidade laborativa?\n2. A doenca e de origem ocupacional?"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-vertical"
                  />
                  <p className="text-xs text-gray-400 mt-1">Um quesito por linha.</p>
                </div>
              </div>
            )}

            {/* ── Notificacao ── */}
            {docType === "notificacao" && (
              <div className="space-y-4 border border-red-100 bg-red-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                  Dados da Notificacao
                </p>
                <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-xs text-red-800">
                  <strong>Obrigacao legal:</strong> A omissao desta notificacao e infraçao etica e pode
                  configurar delito (art. 269 do Codigo Penal). Notifique ao SINAN.
                </div>
                <div>
                  <FieldLabel>Doenca / Agravo de Notificacao *</FieldLabel>
                  <Input id="diseaseType" name="diseaseType" value={diseaseType} required
                    onChange={(e) => setDiseaseType(e.target.value)}
                    placeholder="Ex: Dengue, Tuberculose, Meningite" />
                </div>
                <div>
                  <FieldLabel>Tipo de Notificacao *</FieldLabel>
                  <Select id="notifType" name="notifType" value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                  >
                    {NOTIFICATION_TYPES.map((n) => (
                      <option key={n.value} value={n.value}>{n.label}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <FieldLabel optional>Unidade de Saude Notificante</FieldLabel>
                  <Input id="healthUnit" name="healthUnit" value={healthUnit}
                    onChange={(e) => setHealthUnit(e.target.value)}
                    placeholder="Ex: UBS Centro — Uberlandia/MG" />
                </div>
              </div>
            )}

            {/* Anotacoes clinicas — always last before submit */}
            <div>
              <FieldLabel>Anotacoes Clinicas *</FieldLabel>
              <textarea
                id="clinical_notes"
                name="clinical_notes"
                required
                value={common.clinical_notes}
                onChange={handleCommon}
                rows={9}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-vertical transition"
                placeholder="Descreva sintomas, diagnostico, exames, condutas e demais informacoes relevantes..."
              />
              <p className="text-xs text-gray-400 mt-1">
                A IA usara exclusivamente as informacoes descritas acima.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Aviso CFM:</strong> O documento gerado e um rascunho. Deve ser revisado e
                assinado pelo medico responsavel antes de qualquer uso clinico ou legal.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Gerando...
                </span>
              ) : (
                "Gerar Documento"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
