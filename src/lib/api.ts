import type {
  GenerateDocumentRequest,
  LoginRequest,
  MedDocument,
  RegisterRequest,
  TokenResponse,
  UpdateDocumentRequest,
  User,
  UserUpdateRequest,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function clearSession(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authenticated) {
    const token = getToken();
    if (!token) {
      clearSession();
      throw new Error("Sessao encerrada. Faca login novamente.");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    throw new Error("Sessao encerrada. Faca login novamente.");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({ detail: "Erro desconhecido." }));

  if (!res.ok) {
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data?.detail) ?? "Ocorreu um erro."
    );
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const result = await request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  localStorage.setItem("token", result.access_token);
  localStorage.setItem("user", JSON.stringify(result.user));
  return result;
}

export async function register(data: RegisterRequest): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Users / Profile
// ---------------------------------------------------------------------------

export async function getMe(): Promise<User> {
  return request<User>("/users/me", {}, true);
}

export async function updateMe(data: UserUpdateRequest): Promise<User> {
  const updated = await request<User>(
    "/users/me",
    { method: "PUT", body: JSON.stringify(data) },
    true
  );
  localStorage.setItem("user", JSON.stringify(updated));
  return updated;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function getDocuments(): Promise<MedDocument[]> {
  return request<MedDocument[]>("/documents/", {}, true);
}

export async function generateDocument(
  data: GenerateDocumentRequest
): Promise<MedDocument> {
  return request<MedDocument>(
    "/documents/generate",
    { method: "POST", body: JSON.stringify(data) },
    true
  );
}

export async function getDocument(id: number): Promise<MedDocument> {
  return request<MedDocument>(`/documents/${id}`, {}, true);
}

export async function updateDocument(
  id: number,
  data: UpdateDocumentRequest
): Promise<MedDocument> {
  return request<MedDocument>(
    `/documents/${id}`,
    { method: "PUT", body: JSON.stringify(data) },
    true
  );
}

export async function deleteDocument(id: number): Promise<void> {
  return request<void>(`/documents/${id}`, { method: "DELETE" }, true);
}
