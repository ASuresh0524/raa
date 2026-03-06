import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { X, ArrowLeft, Check, Search, ChevronRight } from "lucide-react";
import { Dot } from "./ui-components";
import { listWorkflows } from "../api";

const stages = ["Intake", "Verify", "Assemble", "Submit", "Review", "Approved"];

function Stage({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${i <= current ? "text-foreground" : "text-muted-foreground/40"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${i < current ? "bg-green" : i === current ? "bg-foreground" : "bg-border"}`} />
            <span className="text-[13px]">{s}</span>
          </div>
          {i < stages.length - 1 && <div className={`w-4 h-px ${i < current ? "bg-green" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

interface Request {
  id: string;
  type: string;
  dest: string;
  provider: string;
  date: string;
  stage: number;
  confirmationId?: string;
  initiatedBy?: string;
}

const initialRequests: Request[] = [
  { id: "REQ-001", type: "Payer enrollment", dest: "Blue Shield CA", provider: "Dr. Sarah Chen", date: "Feb 15", stage: 4, confirmationId: "#BS-2026-8843", initiatedBy: "Valley Health Group" },
  { id: "REQ-002", type: "Facility credentialing", dest: "UCSF Medical Center", provider: "Dr. James Wilson", date: "Feb 20", stage: 2, initiatedBy: "Self-initiated" },
  { id: "REQ-003", type: "Payer enrollment", dest: "Aetna", provider: "Dr. Sarah Chen", date: "Jan 28", stage: 5, confirmationId: "#AET-90421", initiatedBy: "Valley Health Group" },
  { id: "REQ-004", type: "Recredentialing", dest: "Sutter Health", provider: "Dr. Emily Taylor", date: "Feb 25", stage: 1, initiatedBy: "Valley Health Group" },
  { id: "REQ-005", type: "Generate packet", dest: "Stanford Health Care", provider: "Dr. Ahmed Hassan", date: "Mar 1", stage: 3, initiatedBy: "Valley Health Group" },
];

const clinicians = [
  { name: "Dr. Sarah Chen", specialty: "Internal Medicine", npi: "1234567890", readiness: "42/44" },
  { name: "Dr. James Wilson", specialty: "Cardiology", npi: "2345678901", readiness: "38/42" },
  { name: "Dr. Maria Santos", specialty: "Pediatrics", npi: "3456789012", readiness: "40/40" },
  { name: "Dr. Emily Taylor", specialty: "Orthopedics", npi: "4567890123", readiness: "35/41" },
  { name: "Dr. Ahmed Hassan", specialty: "Neurology", npi: "5678901234", readiness: "39/43" },
  { name: "Dr. Robert Kim", specialty: "Dermatology", npi: "6789012345", readiness: "37/39" },
  { name: "Dr. Lisa Park", specialty: "Radiology", npi: "7890123456", readiness: "41/44" },
];

const requestTypes = [
  { name: "Payer enrollment", desc: "Enroll a provider with an insurance payer" },
  { name: "Facility credentialing", desc: "Credential a provider at a hospital or facility" },
  { name: "Recredentialing", desc: "Renew an existing credentialing relationship" },
  { name: "Generate packet", desc: "Create a credential packet for manual submission" },
];

const destinations: Record<string, { name: string; detail: string }[]> = {
  "Payer enrollment": [
    { name: "Blue Shield of California", detail: "Commercial + Medicare Advantage" },
    { name: "Aetna", detail: "Commercial plans" },
    { name: "United Healthcare", detail: "Commercial + Optum" },
    { name: "Cigna", detail: "Open Access Plus" },
    { name: "Anthem Blue Cross", detail: "PPO + HMO plans" },
    { name: "Medicare (CMS)", detail: "Part B enrollment" },
  ],
  "Facility credentialing": [
    { name: "UCSF Medical Center", detail: "San Francisco, CA" },
    { name: "Stanford Health Care", detail: "Palo Alto, CA" },
    { name: "Sutter Health", detail: "Sacramento, CA" },
    { name: "Kaiser Permanente", detail: "Northern California" },
  ],
  "Recredentialing": [
    { name: "Sutter Health", detail: "Last credentialed Nov 2023" },
    { name: "Stanford Health Care", detail: "Last credentialed Sep 2023" },
    { name: "Blue Shield of California", detail: "Last credentialed Jan 2024" },
  ],
  "Generate packet": [
    { name: "Stanford Health Care", detail: "Manual submission required" },
    { name: "VA Palo Alto", detail: "Government facility" },
    { name: "Custom destination", detail: "Specify recipient manually" },
  ],
};

export function OrgRequests() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard selections
  const [selectedClinician, setSelectedClinician] = useState<typeof clinicians[0] | null>(null);
  const [selectedType, setSelectedType] = useState<typeof requestTypes[0] | null>(null);
  const [selectedDest, setSelectedDest] = useState<{ name: string; detail: string } | null>(null);

  // Search filters
  const [clinicianSearch, setClinicianSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");

  const resetWizard = () => {
    setStep(1);
    setSelectedClinician(null);
    setSelectedType(null);
    setSelectedDest(null);
    setClinicianSearch("");
    setDestSearch("");
    setShowSuccess(false);
  };

  const openWizard = () => {
    resetWizard();
    setWizardOpen(true);
  };

  // Auto-open wizard if ?new=1 query param is present
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      openWizard();
      setSearchParams({}, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const workflows = await listWorkflows();
        if (!Array.isArray(workflows) || workflows.length === 0) return;
        const mapped: Request[] = workflows.map((w: any, i: number) => ({
          id: w.workflow_id || `REQ-${String(i + 1).padStart(3, "0")}`,
          type: w.destination_type === "hospital" ? "Facility credentialing" : "Payer enrollment",
          dest: w.destination_id || "—",
          provider: w.clinician_id || "—",
          date: new Date(w.created_at || Date.now()).toLocaleDateString(),
          stage: w.status === "COMPLETED" ? 5 : w.status === "PENDING_REVIEW" ? 4 : 2,
        }));
        setRequests(mapped);
      } catch (e: any) {
        setError(e.message || "Failed to load workflows");
      }
    })();
  }, []);

  const submitRequest = () => {
    if (!selectedClinician || !selectedType || !selectedDest) return;

    const newId = `REQ-${String(requests.length + 1).padStart(3, "0")}`;
    const newReq: Request = {
      id: newId,
      type: selectedType.name,
      dest: selectedDest.name,
      provider: selectedClinician.name,
      date: "Mar 4",
      stage: 0,
    };

    setRequests([newReq, ...requests]);
    setShowSuccess(true);
  };

  const canAdvance = () => {
    if (step === 1) return !!selectedClinician;
    if (step === 2) return !!selectedType;
    if (step === 3) return !!selectedDest;
    return true;
  };

  const filteredClinicians = clinicians.filter(
    (c) => c.name.toLowerCase().includes(clinicianSearch.toLowerCase()) ||
           c.specialty.toLowerCase().includes(clinicianSearch.toLowerCase())
  );

  const availableDests = selectedType ? (destinations[selectedType.name] || []) : [];
  const filteredDests = availableDests.filter(
    (d) => d.name.toLowerCase().includes(destSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/app/org" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-10">
        <div>
          <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Requests</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Active and completed credentialing requests.</p>
        </div>
        <button
          onClick={openWizard}
          className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer w-full sm:w-auto"
        >
          New request
        </button>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="text-[13px] text-red">{error}</div>
        )}
        {requests.map((req) => (
          <div
            key={req.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/app/org/requests/${req.id}`)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/app/org/requests/${req.id}`); }}
            className="group bg-surface-elevated border border-border rounded-xl p-6 hover:border-foreground/30 hover:bg-surface-elevated/80 transition-all cursor-pointer active:scale-[0.995]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-[16px] text-foreground group-hover:text-foreground/90">{req.type}</p>
                  <span className="text-[13px] text-text-secondary tabular-nums">{req.id}</span>
                </div>
                <p className="text-[14px] text-muted-foreground">
                  {req.dest} &middot; initiated by {req.initiatedBy || "—"} &middot; {req.date}
                </p>
                {req.confirmationId && (
                  <p className="text-[13px] text-text-secondary mt-0.5 tabular-nums">{req.confirmationId}</p>
                )}
              </div>
              <ChevronRight size={16} className="text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </div>
            <div className="overflow-x-auto mt-4">
              <Stage current={req.stage} />
            </div>
          </div>
        ))}
      </div>

      {/* Wizard Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-6">
          <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col">
            {/* Header with steps */}
            <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-border shrink-0">
              <div className="flex items-center gap-2 flex-1">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex-1 flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] tabular-nums ${
                      s < step ? "bg-foreground text-background" :
                      s === step ? "border-2 border-foreground text-foreground" :
                      "border border-border text-muted-foreground/40"
                    }`}>
                      {s < step ? <Check size={12} /> : s}
                    </span>
                    {s < 4 && <div className={`flex-1 h-px ${s < step ? "bg-foreground" : "bg-border"}`} />}
                  </div>
                ))}
              </div>
              <button onClick={() => setWizardOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 hover:bg-secondary rounded-lg transition-colors ml-4">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-7 py-5">
              {/* Success state */}
              {showSuccess && (
                <div className="text-center py-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
                      <Check size={22} className="text-background" />
                    </div>
                  </div>
                  <p className="text-[16px] text-foreground mb-1">Request submitted</p>
                  <p className="text-[14px] text-muted-foreground mb-5">
                    {selectedType?.name} for {selectedClinician?.name} to {selectedDest?.name} is now in progress.
                  </p>
                  <div className="bg-surface-elevated border border-border rounded-lg p-4 text-left mb-2">
                    <div className="space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-[14px] text-muted-foreground">Request ID</span>
                        <span className="text-[14px] text-foreground tabular-nums">{requests[0]?.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[14px] text-muted-foreground">Status</span>
                        <span className="flex items-center gap-2 text-[14px] text-foreground">
                          <Dot status="pending" /> Intake
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-text-secondary">The credentialing agent will begin processing automatically.</p>
                </div>
              )}

              {/* Step 1: Select clinician */}
              {!showSuccess && step === 1 && (
                <div>
                  <p className="text-[16px] text-foreground mb-1">Select clinician</p>
                  <p className="text-[14px] text-muted-foreground mb-5">Choose a provider from your roster.</p>
                  <div className="relative mb-3">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={clinicianSearch}
                      onChange={(e) => setClinicianSearch(e.target.value)}
                      placeholder="Search by name or specialty…"
                      className="w-full bg-surface-elevated border border-border rounded-xl pl-10 pr-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                  <div className="space-y-0.5">
                    {filteredClinicians.map((c) => {
                      const selected = selectedClinician?.npi === c.npi;
                      return (
                        <button
                          key={c.npi}
                          onClick={() => setSelectedClinician(c)}
                          className={`w-full text-left px-4 py-3.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                            selected
                              ? "bg-secondary border border-border"
                              : "hover:bg-secondary/50 border border-transparent"
                          }`}
                        >
                          <div>
                            <p className="text-[15px] text-foreground">{c.name}</p>
                            <p className="text-[13px] text-muted-foreground">{c.specialty} &middot; NPI {c.npi}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[13px] text-text-secondary tabular-nums">{c.readiness}</span>
                            {selected && (
                              <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                                <Check size={12} className="text-background" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {filteredClinicians.length === 0 && (
                      <p className="text-[14px] text-muted-foreground text-center py-6">No clinicians match your search.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Request type */}
              {!showSuccess && step === 2 && (
                <div>
                  <p className="text-[16px] text-foreground mb-1">Request type</p>
                  <p className="text-[14px] text-muted-foreground mb-5">What kind of credentialing work is needed?</p>
                  <div className="space-y-2">
                    {requestTypes.map((t) => {
                      const selected = selectedType?.name === t.name;
                      return (
                        <button
                          key={t.name}
                          onClick={() => {
                            setSelectedType(t);
                            // Reset destination if type changed
                            if (selectedType?.name !== t.name) setSelectedDest(null);
                          }}
                          className={`w-full text-left px-4 py-4 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                            selected
                              ? "bg-secondary border border-border"
                              : "hover:bg-secondary/50 border border-transparent"
                          }`}
                        >
                          <div>
                            <p className="text-[15px] text-foreground">{t.name}</p>
                            <p className="text-[13px] text-muted-foreground">{t.desc}</p>
                          </div>
                          {selected && (
                            <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0 ml-3">
                              <Check size={12} className="text-background" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Destination */}
              {!showSuccess && step === 3 && (
                <div>
                  <p className="text-[16px] text-foreground mb-1">Destination</p>
                  <p className="text-[14px] text-muted-foreground mb-5">Where should we submit?</p>
                  <div className="relative mb-3">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={destSearch}
                      onChange={(e) => setDestSearch(e.target.value)}
                      placeholder="Search destinations…"
                      className="w-full bg-surface-elevated border border-border rounded-xl pl-10 pr-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                  <div className="space-y-0.5">
                    {filteredDests.map((d) => {
                      const selected = selectedDest?.name === d.name;
                      return (
                        <button
                          key={d.name}
                          onClick={() => setSelectedDest(d)}
                          className={`w-full text-left px-4 py-3.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                            selected
                              ? "bg-secondary border border-border"
                              : "hover:bg-secondary/50 border border-transparent"
                          }`}
                        >
                          <div>
                            <p className="text-[15px] text-foreground">{d.name}</p>
                            <p className="text-[13px] text-muted-foreground">{d.detail}</p>
                          </div>
                          {selected && (
                            <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0 ml-3">
                              <Check size={12} className="text-background" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {filteredDests.length === 0 && (
                      <p className="text-[14px] text-muted-foreground text-center py-6">No destinations match your search.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Confirm */}
              {!showSuccess && step === 4 && (
                <div>
                  <p className="text-[16px] text-foreground mb-1">Review &amp; confirm</p>
                  <p className="text-[14px] text-muted-foreground mb-5">Requirements auto-filled from passport. Review and submit.</p>
                  <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-5">
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[14px] text-muted-foreground">Provider</span>
                        <div className="text-right">
                          <p className="text-[15px] text-foreground">{selectedClinician?.name}</p>
                          <p className="text-[13px] text-text-secondary">{selectedClinician?.specialty}</p>
                        </div>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between items-baseline">
                        <span className="text-[14px] text-muted-foreground">Request type</span>
                        <span className="text-[15px] text-foreground">{selectedType?.name}</span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between items-baseline">
                        <span className="text-[14px] text-muted-foreground">Destination</span>
                        <div className="text-right">
                          <p className="text-[15px] text-foreground">{selectedDest?.name}</p>
                          <p className="text-[13px] text-text-secondary">{selectedDest?.detail}</p>
                        </div>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between items-baseline">
                        <span className="text-[14px] text-muted-foreground">Passport readiness</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] text-foreground tabular-nums">{selectedClinician?.readiness}</span>
                          <Dot status={selectedClinician?.readiness?.split("/").every((n) => n === selectedClinician?.readiness?.split("/")[1]) ? "verified" : "warning"} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedClinician && selectedClinician.readiness.split("/")[0] !== selectedClinician.readiness.split("/")[1] && (
                    <div className="flex items-start gap-2.5 bg-surface-elevated border border-border rounded-lg p-3.5">
                      <Dot status="warning" />
                      <p className="text-[13px] text-muted-foreground">
                        {parseInt(selectedClinician.readiness.split("/")[1]) - parseInt(selectedClinician.readiness.split("/")[0])} items pending. The agent will automatically request missing documents during the workflow.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between px-7 py-5 border-t border-border shrink-0">
              {showSuccess ? (
                <>
                  <div />
                  <button
                    onClick={() => setWizardOpen(false)}
                    className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => step === 1 ? setWizardOpen(false) : setStep(step - 1)}
                    className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    {step === 1 ? "Cancel" : "Back"}
                  </button>
                  <button
                    onClick={() => {
                      if (step < 4) setStep(step + 1);
                      else submitRequest();
                    }}
                    disabled={!canAdvance()}
                    className={`text-[14px] px-5 py-2.5 rounded-lg transition-opacity cursor-pointer ${
                      canAdvance()
                        ? "bg-foreground text-background hover:opacity-90"
                        : "bg-foreground/30 text-background/50 cursor-not-allowed"
                    }`}
                  >
                    {step < 4 ? "Continue" : "Start workflow"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}