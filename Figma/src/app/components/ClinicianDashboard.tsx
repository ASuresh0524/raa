import { useEffect, useRef, useState } from "react";
import { Dot, SectionLabel } from "./ui-components";
import { X } from "lucide-react";
import { useCredentialing } from "./CredentialingContext";
import { UploadModal } from "./UploadModal";
import { toast } from "sonner";
import { demoWorkflow, getWorkflow, seedDemoPassport } from "../api";

interface TimelineEntry {
  label: string;
  detail?: string;
  status: "verified" | "warning" | "error" | "pending";
  phase: string;
}

export const allSteps: TimelineEntry[] = [
  // ── Access & consent ──
  { label: "Valley Health Group initiated credentialing", detail: "Payer enrollment for Blue Shield, Aetna, United", status: "verified", phase: "Access & consent" },
  { label: "Access request sent to Dr. Chen", detail: "Email + SMS verification link dispatched", status: "verified", phase: "Access & consent" },
  { label: "Dr. Chen granted consent", detail: "Read-only access to primary sources authorized", status: "verified", phase: "Access & consent" },
  { label: "Connected to 14 primary sources", detail: "NPPES, DEA CSOS, state boards, AMA, ABMS, NPDB, OIG, SAM…", status: "verified", phase: "Access & consent" },

  // ── Discovery & verification ──
  { label: "NPI registration confirmed", detail: "NPPES — NPI 1234567890, taxonomy 207R00000X", status: "verified", phase: "Discovery & verification" },
  { label: "Identity verified across 3 sources", detail: "Name, DOB, SSN-last-4, address, gender — all match", status: "verified", phase: "Discovery & verification" },
  { label: "3 state medical licenses found", detail: "CA #MD-48291, NY #29-04817, FL #ME-98214 — all active", status: "verified", phase: "Discovery & verification" },
  { label: "Board certifications verified", detail: "ABIM Internal Medicine (2019) & Geriatric Medicine (2021)", status: "verified", phase: "Discovery & verification" },
  { label: "DEA registration extracted", detail: "#FC1234567 — Schedule II–V — exp Mar 2028", status: "verified", phase: "Discovery & verification" },
  { label: "Education & training confirmed", detail: "Stanford SoM '12 → UCSF IM Residency '15 → UCSF Geriatrics Fellowship '17", status: "verified", phase: "Discovery & verification" },
  { label: "Malpractice history clear", detail: "NPDB — zero adverse actions, zero claims", status: "verified", phase: "Discovery & verification" },
  { label: "OIG / SAM exclusion check passed", detail: "No exclusions or debarments found", status: "verified", phase: "Discovery & verification" },
  { label: "Work history cross-referenced", detail: "UCSF Medical Center (2017–present) via AMA Masterfile", status: "verified", phase: "Discovery & verification" },

  // ── Missing items ──
  { label: "2 items not found in any source", detail: "Malpractice certificate + hospital privilege letter", status: "warning", phase: "Requesting missing items" },
  { label: "Malpractice certificate requested", detail: "Auto-request sent to NORCAL Mutual via API", status: "pending", phase: "Requesting missing items" },
  { label: "Privilege verification letter requested", detail: "Email request sent to UCSF Medical Staff Office", status: "pending", phase: "Requesting missing items" },
  { label: "Malpractice certificate received", detail: "NORCAL Mutual — policy #NM-2026-4491, $1M/$3M, exp Dec 2026", status: "verified", phase: "Requesting missing items" },
  { label: "Privilege letter received", detail: "UCSF Medical Staff — active privileges since Aug 2017", status: "verified", phase: "Requesting missing items" },
  { label: "All gaps resolved", detail: "17/17 credentials verified — passport complete", status: "verified", phase: "Requesting missing items" },

  // ── Submissions ──
  { label: "Submitted to Blue Shield of California", detail: "CAQH ProView profile updated + application transmitted", status: "verified", phase: "Payer submissions" },
  { label: "Submitted to Aetna", detail: "Credentialing application + supporting documents", status: "verified", phase: "Payer submissions" },
  { label: "Submitted to United Healthcare", detail: "Application transmitted via Optum portal", status: "verified", phase: "Payer submissions" },
  { label: "Blue Shield enrollment confirmed", detail: "#BS-2026-8843 — effective Mar 1", status: "verified", phase: "Payer submissions" },
  { label: "Aetna enrollment confirmed", detail: "Provider ID #AET-90421 — effective Mar 1", status: "verified", phase: "Payer submissions" },
  { label: "United Healthcare enrollment confirmed", detail: "Provider ID #UHC-77203 — effective Mar 15", status: "verified", phase: "Payer submissions" },

  // ── Monitoring ──
  { label: "Continuous monitoring activated", detail: "All 17 credentials tracked — auto-alerts enabled", status: "verified", phase: "Continuous monitoring" },
];

const STEP_DELAY = 600;

const permissionSources = [
  { name: "NPPES (NPI Registry)", access: "NPI number, taxonomy, practice address" },
  { name: "State medical boards", access: "License numbers, status, expiration, disciplinary actions", detail: "CA, NY, FL" },
  { name: "ABMS / ABIM", access: "Board certification status, specialties, expiration" },
  { name: "DEA CSOS", access: "DEA registration number, schedules, expiration" },
  { name: "AMA Physician Masterfile", access: "Education, residency, fellowship, work history" },
  { name: "NPDB", access: "Malpractice claims, adverse actions, settlements" },
  { name: "OIG Exclusion List", access: "Federal exclusion/sanction status" },
  { name: "SAM.gov", access: "Federal debarment and suspension status" },
  { name: "NCTQ", access: "Quality and performance indicators" },
  { name: "CAQH ProView", access: "Existing credentialing profile data" },
  { name: "State pharmacy boards", access: "Controlled substance registration" },
  { name: "Hospital systems", access: "Privilege verification letters" },
  { name: "Insurance carriers", access: "Malpractice policy and coverage details" },
  { name: "Identity verification", access: "Name, DOB, SSN-last-4, address cross-reference" },
];

export function ClinicianDashboard() {
  const { started, done, visibleCount, start, setVisibleCount, setDone } = useCredentialing();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!started || done || visibleCount >= allSteps.length) return;

    const timer = setTimeout(() => {
      setVisibleCount(visibleCount + 1);
    }, STEP_DELAY);

    return () => clearTimeout(timer);
  }, [started, done, visibleCount, setVisibleCount]);

  // Mark done when all steps visible
  useEffect(() => {
    if (visibleCount >= allSteps.length && started && !done) {
      setDone(true);
    }
  }, [visibleCount, started, done, setDone]);

  useEffect(() => {
    if (visibleCount > 0 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [visibleCount]);

  const visible = allSteps.slice(0, visibleCount);
  const found = visible.filter((s) => s.status === "verified").length;
  const pending = visible.filter((s) => s.status === "pending").length;
  const warnings = visible.filter((s) => s.status === "warning").length;

  // Group visible items by phase
  const phases: { name: string; items: TimelineEntry[] }[] = [];
  for (const item of visible) {
    const last = phases[phases.length - 1];
    if (last && last.name === item.phase) {
      last.items.push(item);
    } else {
      phases.push({ name: item.phase, items: [item] });
    }
  }

  // ── Pre-consent state ──
  if (!started) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Dr. Sarah Chen</h1>
          <p className="text-[15px] text-muted-foreground mt-1">NPI 1234567890 &middot; Internal Medicine</p>
        </div>

        <div className="bg-surface-elevated border border-border rounded-xl p-8 text-center max-w-lg mx-auto">
          <h2 className="text-[18px] text-foreground tracking-[-0.01em] mb-2">Credentialing request</h2>
          <p className="text-[15px] text-muted-foreground mb-2">
            Valley Health Group has requested to verify your credentials for payer enrollment with Blue Shield, Aetna, and United Healthcare.
          </p>
          <p className="text-[14px] text-text-secondary mb-8">
            This grants read-only access to primary sources like NPPES, state medical boards, ABMS, DEA, and NPDB. No data is modified.
          </p>

          <div className="flex flex-col gap-3 items-center">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-text-secondary mb-4">
              <span>Read-only</span>
              <span>14 sources</span>
              <span>Encrypted</span>
            </div>
            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  setError(null);
                  await seedDemoPassport();
                  const wf = await demoWorkflow();
                  setWorkflowId(wf.workflow_id || "");
                  const status = await getWorkflow(wf.workflow_id);
                  setWorkflowStatus(status);
                  start();
                } catch (e: any) {
                  setError(e.message || "Failed to start demo workflow");
                } finally {
                  setLoading(false);
                }
              }}
              className="bg-foreground text-background text-[15px] px-8 py-3 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              {loading ? "Starting…" : "Grant access & begin"}
            </button>
            <button
              onClick={() => setShowPermissions(true)}
              className="text-[14px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-1"
            >
              Review permissions first
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 text-[14px] text-red">
            {error}
          </div>
        )}

        {/* Permissions review modal */}
        {showPermissions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-background border border-border rounded-xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
                <div>
                  <h3 className="text-[16px] text-foreground">Permission details</h3>
                  <p className="text-[13px] text-muted-foreground mt-0.5">14 sources · read-only access</p>
                </div>
                <button onClick={() => setShowPermissions(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 hover:bg-secondary rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Source list */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-1">
                  {permissionSources.map((source, i) => (
                    <div key={i} className={`flex items-start justify-between py-3.5 ${i < permissionSources.length - 1 ? "border-b border-border/50" : ""}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-foreground">{source.name}</p>
                        <p className="text-[13px] text-muted-foreground mt-0.5">{source.access}</p>
                      </div>
                      <span className="text-[12px] text-text-secondary bg-secondary/60 px-2 py-0.5 rounded shrink-0 mt-0.5">Read</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy note + actions */}
              <div className="px-6 pb-6 pt-4 border-t border-border shrink-0">
                <div className="bg-surface-elevated border border-border rounded-lg p-3.5 mb-5">
                  <p className="text-[13px] text-foreground">Your data is encrypted end-to-end</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">Access is read-only. No records are created or modified at any source. You can revoke access at any time.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPermissions(false)}
                    className="flex-1 text-[14px] text-muted-foreground hover:text-foreground border border-border py-2.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                  >
                    Go back
                  </button>
                  <button
                    onClick={() => { setShowPermissions(false); start(); }}
                    className="flex-1 text-[14px] bg-foreground text-background py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Grant access &amp; begin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Running / complete state ──
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Dr. Sarah Chen</h1>
          <p className="text-[15px] text-muted-foreground mt-1">NPI 1234567890 &middot; Internal Medicine</p>
        </div>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 text-[14px] bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          Send for verification
        </button>
      </div>

      <div className="bg-surface-elevated border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>Live workflow (backend)</SectionLabel>
          <button
            onClick={async () => {
              if (!workflowId) return;
              try {
                setLoading(true);
                setError(null);
                const status = await getWorkflow(workflowId);
                setWorkflowStatus(status);
              } catch (e: any) {
                setError(e.message || "Failed to refresh workflow");
              } finally {
                setLoading(false);
              }
            }}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Refresh
          </button>
        </div>
        <div className="text-[13px] text-muted-foreground">
          Workflow ID: {workflowId || "—"}
        </div>
        {workflowStatus && (
          <div className="mt-2 text-[14px] text-foreground">
            Status: {workflowStatus.workflow?.status} · Progress: {Math.round(workflowStatus.progress_percentage || 0)}%
          </div>
        )}
        {error && (
          <div className="mt-2 text-[13px] text-red">
            {error}
          </div>
        )}
      </div>

      {/* Live metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
        {[
          { label: "Verified", value: found, status: "verified" as const, key: "verified" },
          { label: "Pending", value: pending, status: "pending" as const, key: "pending" },
          { label: "Warnings", value: warnings, status: "warning" as const, key: "warning" },
          { label: "Sources", value: visibleCount >= 3 ? "14" : "—", status: "verified" as const, key: "sources" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(activeMetric === m.key ? null : m.key)}
            className={`bg-surface-elevated border rounded-xl py-5 px-4 text-center cursor-pointer transition-all ${
              activeMetric === m.key
                ? "border-foreground/30 ring-1 ring-foreground/10"
                : "border-border hover:border-foreground/20"
            }`}
          >
            <p className="text-[26px] tracking-[-0.02em] text-foreground tabular-nums">{m.value}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Dot status={m.status} />
              <span className="text-[14px] text-muted-foreground">{m.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Expanded metric detail */}
      {activeMetric && (() => {
        const filteredItems = activeMetric === "sources"
          ? permissionSources.slice(0, 6).map(s => ({ label: s.name, detail: s.access, status: "verified" as const }))
          : activeMetric === "verified"
            ? visible.filter(s => s.status === "verified").slice(-5).map(s => ({ label: s.label, detail: s.detail || "", status: "verified" as const }))
            : activeMetric === "pending"
              ? visible.filter(s => s.status === "pending").map(s => ({ label: s.label, detail: s.detail || "", status: "pending" as const }))
              : visible.filter(s => s.status === "warning").map(s => ({ label: s.label, detail: s.detail || "", status: "warning" as const }));

        const showActions = activeMetric === "pending" || activeMetric === "warning";

        return filteredItems.length > 0 ? (
          <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border mb-10 mt-2">
            {filteredItems.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Dot status={item.status} />
                    <p className="text-[14px] text-foreground">{item.label}</p>
                  </div>
                  {item.detail && (
                    <p className="text-[13px] text-muted-foreground mt-0.5 ml-[18px]">{item.detail}</p>
                  )}
                </div>
                {showActions && (
                  <div className="flex items-center gap-2 ml-[18px] sm:ml-0 shrink-0">
                    <button
                      onClick={() => toast.success("Re-check started", { description: `Rechecking: ${item.label}` })}
                      className="text-[13px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-3 py-1.5 rounded-md hover:bg-secondary/50"
                    >
                      Check again
                    </button>
                    <button
                      onClick={() => { setUploadTarget(item.label); setUploadModalOpen(true); }}
                      className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground border border-border/60 hover:border-border hover:bg-secondary/50 px-3 py-1.5 rounded-md cursor-pointer transition-colors"
                    >
                      Upload
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-elevated border border-border rounded-xl px-5 py-6 text-center mb-10 mt-2">
            <p className="text-[14px] text-muted-foreground">No items yet</p>
          </div>
        );
      })()}

      {!activeMetric && <div className="mb-10" />}

      {/* Progress */}
      <div className="bg-surface-elevated border border-border rounded-xl p-6 mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[15px] text-foreground">
            {done ? "Credentialing complete" : "Credentialing in progress"}
          </p>
          <span className="text-[14px] text-muted-foreground tabular-nums">
            {visibleCount} of {allSteps.length} steps
          </span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground rounded-full transition-all duration-500"
            style={{ width: `${(visibleCount / allSteps.length) * 100}%` }}
          />
        </div>
        <p className="text-[13px] text-text-secondary mt-3">
          {done
            ? "All credentials verified, payers enrolled, monitoring active."
            : "Agent is working — finding, verifying, and assembling credentials…"}
        </p>
      </div>

      {/* Submit document */}
      <button
        onClick={() => setUploadModalOpen(true)}
        className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer mb-12"
      >
        Submit document
      </button>

      {/* Agent activity */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <SectionLabel>Agent activity</SectionLabel>
          {!done ? (
            <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              Live
            </span>
          ) : (
            <span className="text-[13px] text-muted-foreground">Complete</span>
          )}
        </div>

        <div className="space-y-8">
          {phases.map((phase, pi) => (
            <div key={pi}>
              <p className="text-[13px] text-text-secondary tracking-wide uppercase mb-3">{phase.name}</p>
              <div className="bg-surface-elevated border border-border rounded-xl p-6">
                {phase.items.map((item, i) => (
                  <div key={i} className="flex gap-4 animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex flex-col items-center pt-1.5">
                      <Dot status={item.status} />
                      {i < phase.items.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                    </div>
                    <div className={`flex-1 min-w-0 ${i < phase.items.length - 1 ? "pb-5" : "pb-1"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[15px] text-foreground">{item.label}</p>
                          {item.detail && <p className="text-[14px] text-muted-foreground mt-1">{item.detail}</p>}
                        </div>
                        {(item.status === "error" || item.status === "warning" || item.status === "pending") && (
                          <button
                            onClick={() => toast.success("Resolving", { description: item.label })}
                            className="shrink-0 text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Upload modal */}
      {uploadModalOpen && (
        <UploadModal
          open={uploadModalOpen}
          onClose={() => { setUploadModalOpen(false); setUploadTarget(null); }}
          onComplete={(fileName) => {
            toast.success("Document submitted", {
              description: `${fileName} submitted for verification`,
            });
            setUploadModalOpen(false);
            setUploadTarget(null);
          }}
          title={uploadTarget || "Submit document"}
          description={uploadTarget ? `Upload document for: ${uploadTarget}` : "Upload a credential document for verification"}
          requirements={[
            "Document must be current and unexpired",
            "Accepted formats: PDF, JPG, PNG up to 10 MB",
          ]}
        />
      )}
    </div>
  );
}