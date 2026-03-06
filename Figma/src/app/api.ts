const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(await res.text());
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

export function runWorkflow(workflowId: string) {
  return request(`/api/workflow/${workflowId}/run`, { method: "POST" });
}

export function getWorkflow(workflowId: string) {
  return request(`/api/workflow/${workflowId}`);
}

export function listWorkflows() {
  return request("/api/workflows");
}
