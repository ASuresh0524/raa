/** ClinicianSubmitVerification — government submission flow */
import React from "react";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { Dot, SectionLabel } from "./ui-components";
import { toast } from "sonner";

/* ── government / regulatory bodies ── */
interface GovBody {
  id: string;
  name: string;
  type: "Federal" | "State" | "Board";
  description: string;
  turnaround: string;
}

const GOV_BODIES: GovBody[] = [
  { id: "cms", name: "CMS / Medicare", type: "Federal", description: "Centers for Medicare & Medicaid Services — Medicare enrollment", turnaround: "45–60 days" },
  { id: "medicaid-ca", name: "Medi-Cal (California)", type: "State", description: "California Medicaid program provider enrollment", turnaround: "30–90 days" },
  { id: "medicaid-ny", name: "NY Medicaid", type: "State", description: "New York Medicaid provider enrollment via eMedNY", turnaround: "30–60 days" },
  { id: "medicaid-fl", name: "Florida Medicaid", type: "State", description: "Florida Agency for Health Care Administration enrollment", turnaround: "30–45 days" },
  { id: "dea", name: "DEA Registration", type: "Federal", description: "Drug Enforcement Administration — controlled substance registration renewal", turnaround: "4–6 weeks" },
  { id: "nppes", name: "NPPES / NPI Update", type: "Federal", description: "National Plan & Provider Enumeration System — NPI data update", turnaround: "1–2 days" },
  { id: "caqh", name: "CAQH ProView", type: "Federal", description: "Council for Affordable Quality Healthcare — universal provider profile", turnaround: "7–10 days" },
  { id: "smb-ca", name: "CA Medical Board", type: "Board", description: "Medical Board of California — license renewal / verification", turnaround: "6–8 weeks" },
  { id: "smb-ny", name: "NY State Education Dept", type: "Board", description: "New York medical license verification via NYSED", turnaround: "4–6 weeks" },
  { id: "smb-fl", name: "FL Dept of Health", type: "Board", description: "Florida Board of Medicine — license verification", turnaround: "3–5 weeks" },
  { id: "oig", name: "OIG Self-Disclosure", type: "Federal", description: "Office of Inspector General — compliance self-disclosure", turnaround: "N/A" },
  { id: "sam", name: "SAM.gov Registration", type: "Federal", description: "System for Award Management — entity registration update", turnaround: "7–10 days" },
];

/* ── credential sections included ── */
interface CredSection {
  name: string;
  items: number;
  verified: number;
}
const CRED_SECTIONS: CredSection[] = [
  { name: "Identity & demographics", items: 5, verified: 5 },
  { name: "State medical licenses", items: 3, verified: 3 },
  { name: "Board certifications", items: 2, verified: 2 },
  { name: "DEA registration", items: 1, verified: 1 },
  { name: "Education & training", items: 4, verified: 4 },
  { name: "Malpractice history", items: 1, verified: 1 },
  { name: "Work history & privileges", items: 2, verified: 2 },
  { name: "Exclusion & sanction checks", items: 2, verified: 2 },
];
const TOTAL_ITEMS = CRED_SECTIONS.reduce((a, s) => a + s.items, 0);
const TOTAL_VERIFIED = CRED_SECTIONS.reduce((a, s) => a + s.verified, 0);
const PCT = Math.round((TOTAL_VERIFIED / TOTAL_ITEMS) * 100);

type Step = "select" | "review" | "submitting" | "done";

export function ClinicianSubmitVerification(): React.JSX.Element {
  const [step, setStep] = React.useState<Step>("select");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [filter, setFilter] = React.useState<"All" | "Federal" | "State" | "Board">("All");
  const [submissionProgress, setSubmissionProgress] = React.useState(0);
  const [completedBodies, setCompletedBodies] = React.useState<Set<string>>(new Set());

  const filteredBodies = filter === "All" ? GOV_BODIES : GOV_BODIES.filter((b) => b.type === filter);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    setStep("submitting");
    setSubmissionProgress(0);
    setCompletedBodies(new Set());

    const bodies = GOV_BODIES.filter((b) => selected.has(b.id));
    let idx = 0;

    const interval = setInterval(() => {
      if (idx >= bodies.length) {
        clearInterval(interval);
        setSubmissionProgress(100);
        setTimeout(() => setStep("done"), 600);
        return;
      }
      setCompletedBodies((prev) => {
        const next = new Set(prev);
        next.add(bodies[idx].id);
        return next;
      });
      idx++;
      setSubmissionProgress(Math.round((idx / bodies.length) * 100));
    }, 900);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link
        to="/app/clinician"
        className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <div className="mb-10">
        <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Submit for verification</h1>
        <p className="text-[15px] text-muted-foreground mt-1">
          Send your verified credential passport to government and regulatory bodies.
        </p>
      </div>

      {/* ── Verification readiness ── */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-8">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-[15px] text-foreground">Credential readiness</p>
          <span className="text-[14px] text-muted-foreground tabular-nums">{PCT}% verified</span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-foreground rounded-full transition-all duration-500"
            style={{ width: `${PCT}%` }}
          />
        </div>
        <p className="text-[13px] text-text-secondary">
          {TOTAL_VERIFIED} of {TOTAL_ITEMS} credential items verified across {CRED_SECTIONS.length} categories
        </p>
      </div>

      {/* ════════════════════ STEP: SELECT ════════════════════ */}
      {step === "select" && (
        <div>
          <SectionLabel>Select destinations</SectionLabel>
          <p className="text-[14px] text-muted-foreground mt-1 mb-5">
            Choose the government and regulatory bodies to submit your credentials to.
          </p>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-5">
            {(["All", "Federal", "State", "Board"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-[13px] rounded-lg cursor-pointer transition-all ${
                  filter === f
                    ? "bg-foreground text-background"
                    : "bg-surface-elevated border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Body list */}
          <div className="space-y-2 mb-8">
            {filteredBodies.map((body) => {
              const isSelected = selected.has(body.id);
              return (
                <button
                  key={body.id}
                  onClick={() => toggle(body.id)}
                  className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-foreground/[0.05] border-foreground/20"
                      : "bg-surface-elevated border-border hover:border-foreground/10"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-foreground border-foreground"
                        : "border-border"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-background" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <p className="text-[14px] text-foreground">{body.name}</p>
                      <span className="text-[11px] tracking-[0.04em] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                        {body.type}
                      </span>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{body.description}</p>
                  </div>
                  <span className="text-[12px] text-text-secondary shrink-0 hidden sm:block">
                    {body.turnaround}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Continue */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground tabular-nums">
              {selected.size} selected
            </span>
            <button
              onClick={() => setStep("review")}
              disabled={selected.size === 0}
              className={`inline-flex items-center gap-2 text-[14px] px-6 py-2.5 rounded-lg transition-opacity cursor-pointer ${
                selected.size > 0
                  ? "bg-foreground text-background hover:opacity-90"
                  : "bg-foreground/30 text-background/50 cursor-not-allowed"
              }`}
            >
              Review submission
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════ STEP: REVIEW ════════════════════ */}
      {step === "review" && (
        <div>
          <SectionLabel>Review &amp; confirm</SectionLabel>
          <p className="text-[14px] text-muted-foreground mt-1 mb-6">
            The following credential data will be transmitted to {selected.size} destination{selected.size !== 1 ? "s" : ""}.
          </p>

          {/* What's being sent */}
          <div className="bg-surface-elevated border border-border rounded-xl overflow-hidden mb-6">
            {CRED_SECTIONS.map((s, i) => (
              <div
                key={s.name}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i < CRED_SECTIONS.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-[14px] text-foreground">{s.name}</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] text-muted-foreground tabular-nums">
                    {s.verified}/{s.items}
                  </span>
                  <Dot status={s.verified === s.items ? "verified" : "warning"} />
                </div>
              </div>
            ))}
          </div>

          {/* Destinations */}
          <p className="text-[13px] text-text-secondary tracking-wide uppercase mb-3">Destinations</p>
          <div className="bg-surface-elevated border border-border rounded-xl overflow-hidden mb-8">
            {GOV_BODIES.filter((b) => selected.has(b.id)).map((body, i, arr) => (
              <div
                key={body.id}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i < arr.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-[14px] text-foreground">{body.name}</p>
                  <p className="text-[13px] text-muted-foreground">{body.turnaround}</p>
                </div>
                <span className="text-[11px] tracking-[0.04em] text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
                  {body.type}
                </span>
              </div>
            ))}
          </div>

          {/* Legal notice */}
          <div className="bg-surface-elevated border border-border rounded-xl p-4 mb-8">
            <p className="text-[13px] text-foreground">Submission notice</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              By submitting, you authorize transmission of your verified credential data to the selected government and regulatory bodies.
              All data is encrypted in transit and at rest. You will receive confirmation for each submission.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep("select")}
              className="text-[14px] text-muted-foreground hover:text-foreground border border-border px-5 py-2.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 text-[14px] bg-foreground text-background py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Submit to {selected.size} destination{selected.size !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════ STEP: SUBMITTING ════════════════════ */}
      {step === "submitting" && (
        <div>
          <SectionLabel>Submitting credentials</SectionLabel>
          <p className="text-[14px] text-muted-foreground mt-1 mb-6">
            Transmitting verified data to government systems…
          </p>

          {/* Progress */}
          <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[15px] text-foreground">Transmission progress</p>
              <span className="text-[14px] text-muted-foreground tabular-nums">{submissionProgress}%</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground rounded-full transition-all duration-700"
                style={{ width: `${submissionProgress}%` }}
              />
            </div>
          </div>

          {/* Destination statuses */}
          <div className="bg-surface-elevated border border-border rounded-xl overflow-hidden">
            {GOV_BODIES.filter((b) => selected.has(b.id)).map((body, i, arr) => {
              const isDone = completedBodies.has(body.id);
              return (
                <div
                  key={body.id}
                  className={`flex items-center gap-3.5 px-5 py-4 ${
                    i < arr.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <Dot status={isDone ? "verified" : "pending"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-foreground">{body.name}</p>
                  </div>
                  <span className="text-[13px] text-muted-foreground">
                    {isDone ? "Sent" : "Waiting…"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════ STEP: DONE ════════════════════ */}
      {step === "done" && (
        <div>
          <div className="bg-surface-elevated border border-border rounded-xl p-8 text-center mb-8">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <Dot status="verified" size="md" />
              <p className="text-[18px] text-foreground tracking-[-0.01em]">Submissions complete</p>
            </div>
            <p className="text-[15px] text-muted-foreground max-w-md mx-auto">
              Your verified credentials have been transmitted to {selected.size} government and regulatory {selected.size !== 1 ? "bodies" : "body"}.
              You'll receive status updates as each is processed.
            </p>
          </div>

          {/* Confirmation list */}
          <p className="text-[13px] text-text-secondary tracking-wide uppercase mb-3">Confirmation</p>
          <div className="bg-surface-elevated border border-border rounded-xl overflow-hidden mb-8">
            {GOV_BODIES.filter((b) => selected.has(b.id)).map((body, i, arr) => {
              const confId = `GOV-${Date.now().toString(36).slice(-4).toUpperCase()}-${body.id.toUpperCase()}`;
              return (
                <div
                  key={body.id}
                  className={`flex items-center justify-between px-5 py-4 ${
                    i < arr.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Dot status="verified" />
                    <div className="min-w-0">
                      <p className="text-[14px] text-foreground">{body.name}</p>
                      <p className="text-[13px] text-muted-foreground">Est. {body.turnaround}</p>
                    </div>
                  </div>
                  <span className="text-[12px] text-text-secondary font-mono shrink-0">{confId}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/clinician"
              className="flex-1 text-center text-[14px] bg-foreground text-background py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Back to dashboard
            </Link>
            <button
              onClick={() => {
                setStep("select");
                setSelected(new Set());
                setCompletedBodies(new Set());
                toast.success("Ready for new submission");
              }}
              className="text-[14px] text-muted-foreground hover:text-foreground border border-border px-5 py-2.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
            >
              Submit more
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClinicianSubmitVerification;
