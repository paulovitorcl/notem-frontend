export type DocumentType =
  | "laudo"
  | "atestado"
  | "encaminhamento"
  | "receituario"
  | "relatorio"
  | "notificacao";

export type DocumentStatus = "gerado" | "revisado" | "finalizado";
export type PrescriptionType = "branco" | "azul" | "amarelo";

export interface User {
  id: number;
  name: string;
  email: string;
  crm?: string | null;
  crm_state?: string | null;
  specialty?: string | null;
  clinic_name?: string | null;
  clinic_address?: string | null;
  clinic_phone?: string | null;
  city?: string | null;
  lgpd_consent: boolean;
  created_at: string;
}

export interface MedicationItem {
  medication_name: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: string;
}

export interface MedDocument {
  id: number;
  user_id: number;
  document_type: DocumentType;
  patient_name: string;
  patient_birthdate: string;
  clinical_notes: string;
  generated_content: string | null;
  final_content: string | null;
  status: DocumentStatus;
  prescription_type?: string | null;
  cid10_code?: string | null;
  days_of_leave?: number | null;
  requesting_authority?: string | null;
  urgency_level?: string | null;
  extra_data?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  crm?: string;
  crm_state?: string;
  specialty?: string;
  lgpd_consent: boolean;
}

export interface GenerateDocumentRequest {
  document_type: DocumentType;
  patient_name: string;
  patient_birthdate: string;
  clinical_notes: string;
  // atestado
  atestado_subtype?: string;
  days_of_leave?: number;
  cid10_code?: string;
  purpose?: string;
  // encaminhamento
  specialty_requested?: string;
  urgency_level?: string;
  health_plan?: string;
  sisreg_mode?: boolean;
  // receituario
  prescription_type?: PrescriptionType;
  medications?: MedicationItem[];
  // laudo
  requesting_authority?: string;
  quesitos?: string;
  exam_date?: string;
  // notificacao
  disease_type?: string;
  notification_type?: string;
  health_unit?: string;
}

export interface UpdateDocumentRequest {
  final_content?: string;
  status: DocumentStatus;
}

export interface UserUpdateRequest {
  name?: string;
  crm?: string;
  crm_state?: string;
  specialty?: string;
  clinic_name?: string;
  clinic_address?: string;
  clinic_phone?: string;
  city?: string;
}
