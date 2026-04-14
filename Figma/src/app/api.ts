const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function buildUrl(path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return API_BASE ? `${API_BASE}${path}` : path;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }
  return (await res.json()) as T;
}

export function seedDemoPassport() {
  return request("/api/demo/seed", { method: "POST" });
}

export function listPassports() {
  return request("/api/passports");
}

export function getPassport(clinicianId: string) {
  return request(`/api/passport/${clinicianId}`);
}

export function demoWorkflow() {
  return request("/api/demo/workflow", { method: "POST" });
}

export type MarketPositioningSource = { label: string; url: string };

export type MarketPositioning = {
  title: string;
  subtitle: string;
  thesis: string[];
  hospital_capabilities: string[];
  trust_note: string;
  positioning_tagline: string;
  why_it_lands: string;
  ugly_parts: string[];
  bottom_line: string;
  maps_to_product: string[];
  sources: MarketPositioningSource[];
};

export function getMarketPositioning() {
  return request<MarketPositioning>("/api/demo/market-positioning");
}

export function runWorkflow(workflowId: string) {
  return request(`/api/workflow/${workflowId}/run`, { method: "POST" });
}

export function getWorkflow(workflowId: string) {
  return request(`/api/workflow/${workflowId}`);
}

export function listWorkflows() {
  return request("/api/workflows");
}

export function populateStateForm(clinicianId: string, state: string, workflowId?: string) {
  return request("/api/forms/populate", {
    method: "POST",
    body: JSON.stringify({ clinician_id: clinicianId, state, workflow_id: workflowId }),
  });
}

export function emailStatus() {
  return request<{ smtp_configured: boolean; mode: string; hint: string }>("/api/email/status");
}

export function sendPassportEmail(payload: {
  to: string;
  clinician_id: string;
  workflow_id?: string;
  template?:
    | "passport_summary"
    | "workflow_complete"
    | "credentialing_nudge"
    | "employer_missing_documents";
  note?: string;
}) {
  return request<{ status: string; message: string; mode: string }>("/api/email/send-passport", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getQualityReport(clinicianId: string) {
  return request<any>(`/api/passport/${clinicianId}/quality`);
}

export function ping() {
  return request<{ status: string; service: string; version: string }>("/api/ping");
}
