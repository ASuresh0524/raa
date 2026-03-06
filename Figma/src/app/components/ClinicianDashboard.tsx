import { useEffect, useRef, useState } from "react";
import { Dot, SectionLabel } from "./ui-components";
import { X, Search, Check, ChevronDown } from "lucide-react";
import { useCredentialing } from "./CredentialingContext";
import { UploadModal } from "./UploadModal";
import { ResolveModal } from "./ResolveModal";
import { FixResubmitWizard } from "./FixResubmitWizard";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router";

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

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming", "District of Columbia",
];

export function ClinicianDashboard() {
  const { started, done, visibleCount, start, setVisibleCount, setDone, clinicianType } = useCredentialing();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showStateSelector, setShowStateSelector] = useState(false);
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set(["California", "New York", "Florida"]));
  const [stateSearch, setStateSearch] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<string | null>(null);
  const [fixResubmitWizardOpen, setFixResubmitWizardOpen] = useState(false);
  const [fixResubmitWizardTarget, setFixResubmitWizardTarget] = useState<{
    id: string; payer: string; credential: string; reason: string; rejectedDate: string; originalConf: string;
  } | null>(null);

  // Inline state adder for post-consent view
  const [showAddState, setShowAddState] = useState(false);
  const [addStateSearch, setAddStateSearch] = useState("");
  const addStateRef = useRef<HTMLDivElement>(null);
  const addSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addStateRef.current && !addStateRef.current.contains(e.target as Node)) {
        setShowAddState(false);
        setAddStateSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (showAddState && addSearchRef.current) {
      addSearchRef.current.focus();
    }
  }, [showAddState]);

  const addState = (state: string) => {
    setSelectedStates((prev) => {
      const next = new Set(prev);
      next.add(state);
      return next;
    });
    setShowAddState(false);
    setAddStateSearch("");
    toast.success("State added", { description: `${state} added to credentialing` });
  };

  const removeState = (state: string) => {
    setSelectedStates((prev) => {
      const next = new Set(prev);
      next.delete(state);
      return next;
    });
    toast("State removed", { description: `${state} removed from credentialing` });
  };

  const availableStatesForAdd = US_STATES.filter(
    (s) => !selectedStates.has(s) && s.toLowerCase().includes(addStateSearch.toLowerCase())
  );

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
          <h2 className="text-[18px] text-foreground tracking-[-0.01em] mb-8">Get credentialed now</h2>

          <div className="flex flex-col gap-3 items-center">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-text-secondary mb-4">
              <span>Read-only</span>
              <span>14 sources</span>
              <span>Encrypted</span>
            </div>
            <button
              onClick={() => setShowStateSelector(true)}
              className="bg-foreground text-background text-[15px] px-8 py-3 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Grant access &amp; begin
            </button>
            <button
              onClick={() => setShowPermissions(true)}
              className="text-[14px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-1"
            >
              Review permissions first
            </button>
          </div>
        </div>

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
                    onClick={() => { setShowPermissions(false); setShowStateSelector(true); }}
                    className="flex-1 text-[14px] bg-foreground text-background py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Grant access &amp; begin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State selector modal */}
        {showStateSelector && (() => {
          const filteredStates = US_STATES.filter((s) =>
            s.toLowerCase().includes(stateSearch.toLowerCase())
          );
          const allFilteredSelected = filteredStates.length > 0 && filteredStates.every((s) => selectedStates.has(s));

          const toggleState = (state: string) => {
            setSelectedStates((prev) => {
              const next = new Set(prev);
              if (next.has(state)) next.delete(state);
              else next.add(state);
              return next;
            });
          };

          const toggleAll = () => {
            if (allFilteredSelected) {
              setSelectedStates((prev) => {
                const next = new Set(prev);
                filteredStates.forEach((s) => next.delete(s));
                return next;
              });
            } else {
              setSelectedStates((prev) => {
                const next = new Set(prev);
                filteredStates.forEach((s) => next.add(s));
                return next;
              });
            }
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4">
              <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
                  <div>
                    <h3 className="text-[16px] text-foreground">Select states</h3>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Which states do you hold or are seeking licensure in?
                    </p>
                  </div>
                  <button
                    onClick={() => setShowStateSelector(false)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Search + Select all */}
                <div className="px-6 pt-4 pb-3 shrink-0 space-y-3">
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      placeholder="Search states…"
                      className="w-full bg-surface-elevated border border-border rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={toggleAll}
                      className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        allFilteredSelected
                          ? "bg-foreground border-foreground"
                          : "border-border hover:border-muted-foreground"
                      }`}>
                        {allFilteredSelected && <Check size={10} className="text-background" />}
                      </span>
                      Select all{stateSearch ? " matching" : ""}
                    </button>
                    <span className="text-[12px] text-text-secondary tabular-nums">
                      {selectedStates.size} selected
                    </span>
                  </div>
                </div>

                {/* State list */}
                <div className="flex-1 overflow-y-auto px-6 pb-2">
                  <div className="space-y-0.5">
                    {filteredStates.map((state) => {
                      const isSelected = selectedStates.has(state);
                      return (
                        <button
                          key={state}
                          onClick={() => toggleState(state)}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-foreground/[0.06]"
                              : "hover:bg-secondary/50"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-foreground border-foreground"
                              : "border-border"
                          }`}>
                            {isSelected && <Check size={10} className="text-background" />}
                          </span>
                          <span className="text-[14px] text-foreground">{state}</span>
                        </button>
                      );
                    })}
                    {filteredStates.length === 0 && (
                      <p className="text-[14px] text-muted-foreground text-center py-8">No states match "{stateSearch}"</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center px-6 py-5 border-t border-border shrink-0">
                  <button
                    onClick={() => setShowStateSelector(false)}
                    className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setShowStateSelector(false);
                      setStateSearch("");
                      start();
                    }}
                    disabled={selectedStates.size === 0}
                    className={`text-[14px] px-5 py-2.5 rounded-lg transition-opacity cursor-pointer ${
                      selectedStates.size > 0
                        ? "bg-foreground text-background hover:opacity-90"
                        : "bg-foreground/30 text-background/50 cursor-not-allowed"
                    }`}
                  >
                    Continue with {selectedStates.size} state{selectedStates.size !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // ── Running / complete state ──
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Dr. Sarah Chen</h1>
            {clinicianType && (
              <span className="inline-flex items-center text-[11px] tracking-[0.04em] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                {clinicianType}
              </span>
            )}
          </div>
          <p className="text-[15px] text-muted-foreground mt-1">NPI 1234567890 &middot; Internal Medicine</p>
        </div>
        <button
          onClick={() => navigate("/app/clinician/submit-verification")}
          className="inline-flex items-center gap-2 text-[14px] bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          Send for verification
        </button>
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
                      onClick={() => { setResolveTarget(item.label); setResolveModalOpen(true); }}
                      className="text-[13px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-3 py-1.5 rounded-md hover:bg-secondary/50"
                    >
                      Resolve
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

      {/* ─── Rejected Submissions ─── */}
      {done && (() => {
        const rejectedItems = [
          {
            id: "REJ-001",
            payer: "Anthem Blue Cross",
            reason: "Malpractice certificate expired — current policy required",
            credential: "Malpractice Insurance",
            rejectedDate: "Feb 28, 2026",
            originalConf: "ANT-26-3301",
          },
          {
            id: "REJ-002",
            payer: "Molina Healthcare",
            reason: "DEA registration address does not match NPI practice location",
            credential: "DEA Registration",
            rejectedDate: "Feb 25, 2026",
            originalConf: "MOL-26-1190",
          },
        ];

        return rejectedItems.length > 0 ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Rejected submissions</SectionLabel>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-red bg-red/10 border border-red/20 px-2.5 py-1 rounded-full tabular-nums">
                {rejectedItems.length} to fix
              </span>
            </div>
            <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border">
              {rejectedItems.map((item) => (
                <div key={item.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <Dot status="error" />
                        <p className="text-[15px] text-foreground">{item.payer}</p>
                      </div>
                      <p className="text-[14px] text-muted-foreground mt-1 ml-[18px]">{item.reason}</p>
                      <div className="flex items-center gap-3 mt-2 ml-[18px]">
                        <Link to={`/app/clinician/rejections/${item.id}`} className="text-[12px] text-muted-foreground hover:text-foreground hover:underline underline-offset-2 cursor-pointer transition-colors tabular-nums">{item.id}</Link>
                        <span className="text-[12px] text-text-secondary">Rejected {item.rejectedDate}</span>
                        <span className="text-[12px] text-text-secondary">Original #{item.originalConf}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setFixResubmitWizardTarget(item); setFixResubmitWizardOpen(true); }}
                        className="text-[13px] bg-foreground text-background px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        Fix &amp; resubmit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      {/* ─── Credentialing States ─── */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Credentialing states</SectionLabel>
          <div className="relative" ref={addStateRef}>
            <button
              type="button"
              onClick={() => setShowAddState((p) => !p)}
              className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              + Add state
              <ChevronDown size={12} className={"transition-transform " + (showAddState ? "rotate-180" : "")} />
            </button>
            {showAddState && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-surface-elevated border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-3 pt-3 pb-2">
                  <input
                    ref={addSearchRef}
                    type="text"
                    value={addStateSearch}
                    onChange={(e) => setAddStateSearch(e.target.value)}
                    placeholder="Search states…"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/30"
                  />
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {availableStatesForAdd.length === 0 && (
                    <p className="px-4 py-3 text-[13px] text-muted-foreground">
                      {selectedStates.size === US_STATES.length ? "All states added" : "No states match"}
                    </p>
                  )}
                  {availableStatesForAdd.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addState(s)}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-foreground hover:bg-secondary/60 cursor-pointer transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedStates.size > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedStates).sort().map((state) => (
              <div
                key={state}
                className="inline-flex items-center gap-2 bg-surface-elevated border border-border rounded-lg px-3.5 py-2 group"
              >
                <Dot status="verified" />
                <span className="text-[14px] text-foreground">{state}</span>
                <button
                  type="button"
                  onClick={() => removeState(state)}
                  className="text-muted-foreground/40 hover:text-red cursor-pointer transition-colors ml-1"
                  title={"Remove " + state}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-elevated border border-border rounded-xl px-5 py-6 text-center">
            <p className="text-[14px] text-muted-foreground">No states selected.</p>
            <p className="text-[13px] text-muted-foreground/60 mt-1">Click "+ Add state" to begin.</p>
          </div>
        )}
        <p className="text-[13px] text-muted-foreground/60 mt-3">
          {selectedStates.size} state{selectedStates.size !== 1 ? "s" : ""} in credentialing pipeline
        </p>
      </div>

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
                            onClick={() => { setResolveTarget(item.label); setResolveModalOpen(true); }}
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

      {/* Resolve modal */}
      <ResolveModal
        open={resolveModalOpen}
        onClose={() => { setResolveModalOpen(false); setResolveTarget(null); }}
        itemLabel={resolveTarget || ""}
      />

      {/* Fix Resubmit Wizard */}
      <FixResubmitWizard
        open={fixResubmitWizardOpen}
        onClose={() => { setFixResubmitWizardOpen(false); setFixResubmitWizardTarget(null); }}
        item={fixResubmitWizardTarget}
      />
    </div>
  );
}