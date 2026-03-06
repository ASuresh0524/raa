/* RejectionDetailPage – full rejection detail with fix walkthrough */
import React from "react";
import { ArrowLeft, Copy, AlertCircle, ChevronRight } from "lucide-react";
import { Link, useParams, useLocation } from "react-router";
import { Dot, SectionLabel } from "./ui-components";
import { ResolveModal } from "./ResolveModal";
import { FixResubmitWizard } from "./FixResubmitWizard";
import { toast } from "sonner";

interface RejectionData {
  id: string;
  payer: string;
  payerDetail: string;
  provider: string;
  providerNpi: string;
  credential: string;
  reason: string;
  rejectedDate: string;
  originalConf: string;
  originalSubmitDate: string;
  status: "rejected" | "resubmitted" | "resolved";
  // Full rejection letter content
  letterContent: string;
  // What was wrong
  affectedFields: { field: string; submitted: string; expected: string; }[];
  // Fix steps
  fixSteps: { step: number; title: string; description: string; completed: boolean; }[];
  // Timeline
  timeline: { label: string; detail: string; time: string; status: "verified" | "pending" | "warning" | "error"; }[];
  // Related documents
  documents: { name: string; status: "verified" | "pending" | "error"; note: string; }[];
}

const REJECTIONS_DB: Record<string, RejectionData> = {
  "REJ-001": {
    id: "REJ-001",
    payer: "Anthem Blue Cross",
    payerDetail: "Anthem Blue Cross · Payer enrollment credentialing",
    provider: "Dr. Sarah Chen",
    providerNpi: "1234567890",
    credential: "Malpractice Insurance",
    reason: "Malpractice certificate expired — current policy required",
    rejectedDate: "Feb 28, 2026",
    originalConf: "ANT-26-3301",
    originalSubmitDate: "Feb 15, 2026",
    status: "rejected",
    letterContent: "Your credentialing application has been returned for the following reason: The malpractice insurance certificate submitted (Policy #MLP-2024-8891, NORCAL Mutual) expired on January 31, 2026. Per Anthem credentialing requirements, all submitted insurance documentation must be current and reflect active coverage at the time of application review. Please submit a current certificate of insurance showing continuous coverage with minimum limits of $1M/$3M per occurrence/aggregate. Once the corrected document is received, your application will be re-entered into the review queue with priority processing.",
    affectedFields: [
      { field: "Policy number", submitted: "MLP-2024-8891", expected: "Current policy number" },
      { field: "Expiration date", submitted: "Jan 31, 2026 (expired)", expected: "Future date" },
      { field: "Coverage limits", submitted: "$1M/$3M", expected: "$1M/$3M (meets minimum)" },
      { field: "Carrier", submitted: "NORCAL Mutual", expected: "Any A-rated carrier" },
    ],
    fixSteps: [
      { step: 1, title: "Obtain current malpractice certificate", description: "Contact NORCAL Mutual (or your current carrier) and request a certificate of insurance showing your renewed policy effective dates and coverage limits.", completed: false },
      { step: 2, title: "Verify policy meets requirements", description: "Ensure the certificate shows: minimum $1M/$3M limits, active effective dates, your name and NPI, and the carrier's A.M. Best rating.", completed: false },
      { step: 3, title: "Upload corrected document", description: "Use the 'Fix & resubmit' button below to upload the new certificate. The system will package it with your existing verified credentials.", completed: false },
      { step: 4, title: "Resubmit to Anthem", description: "Confirm the resubmission. Your corrected application will be sent with priority processing, typically reviewed within 5-7 business days.", completed: false },
    ],
    timeline: [
      { label: "Application rejected by Anthem", detail: "Malpractice certificate expired — returned for correction", time: "Feb 28", status: "error" },
      { label: "Under review at Anthem", detail: "Application entered credentialing committee review", time: "Feb 22", status: "verified" },
      { label: "Application submitted to Anthem", detail: "Full credentialing packet transmitted", time: "Feb 15", status: "verified" },
      { label: "Documents assembled", detail: "17 credentials packaged for submission", time: "Feb 14", status: "verified" },
      { label: "Malpractice certificate attached", detail: "NORCAL Mutual policy #MLP-2024-8891 (expired)", time: "Feb 14", status: "warning" },
      { label: "Request initiated", detail: "Valley Health Group — payer enrollment", time: "Feb 10", status: "verified" },
    ],
    documents: [
      { name: "Malpractice Certificate (expired)", status: "error", note: "Policy #MLP-2024-8891 — expired Jan 31, 2026" },
      { name: "CA Medical License", status: "verified", note: "#MD-48291 — exp Dec 2027" },
      { name: "DEA Certificate", status: "verified", note: "#FC1234567 — exp Mar 2028" },
      { name: "Board Certification — ABIM", status: "verified", note: "Internal Medicine — exp May 2026" },
      { name: "NPI Verification", status: "verified", note: "NPI 1234567890 confirmed" },
    ],
  },
  "REJ-002": {
    id: "REJ-002",
    payer: "Molina Healthcare",
    payerDetail: "Molina Healthcare · Payer enrollment credentialing",
    provider: "Dr. Sarah Chen",
    providerNpi: "1234567890",
    credential: "DEA Registration",
    reason: "DEA registration address does not match NPI practice location",
    rejectedDate: "Feb 25, 2026",
    originalConf: "MOL-26-1190",
    originalSubmitDate: "Feb 10, 2026",
    status: "rejected",
    letterContent: "Your credentialing application has been returned due to a data discrepancy: The practice address on file with the DEA (455 Sutter St, Suite 200, San Francisco, CA 94108) does not match the practice location registered with NPPES (450 Sutter St, Suite 200, San Francisco, CA 94108). Molina Healthcare requires address consistency across all primary source verifications. Please correct the discrepancy by updating either the DEA registration or the NPI Registry, then provide documentation confirming the correct address. Your application will be re-reviewed upon receipt of corrected information.",
    affectedFields: [
      { field: "DEA address", submitted: "455 Sutter St, Suite 200, SF, CA 94108", expected: "Must match NPI address" },
      { field: "NPI address", submitted: "450 Sutter St, Suite 200, SF, CA 94108", expected: "Must match DEA address" },
      { field: "DEA number", submitted: "FC1234567", expected: "Valid (no issue)" },
      { field: "Expiration", submitted: "Mar 2028", expected: "Valid (no issue)" },
    ],
    fixSteps: [
      { step: 1, title: "Determine correct practice address", description: "Confirm which address is correct — 450 Sutter St or 455 Sutter St. Check your lease or practice registration.", completed: false },
      { step: 2, title: "Update the incorrect source", description: "If the DEA address is wrong, submit a DEA-224 modification. If the NPI is wrong, update through NPPES. DEA changes take 4-6 weeks; NPPES takes 24-48 hours.", completed: false },
      { step: 3, title: "Obtain confirmation documentation", description: "Get a confirmation letter or screenshot showing the updated address from whichever registry you corrected.", completed: false },
      { step: 4, title: "Upload and resubmit", description: "Upload the address correction documentation and resubmit to Molina. Include a note explaining which registry was updated.", completed: false },
    ],
    timeline: [
      { label: "Application rejected by Molina", detail: "Address discrepancy between DEA and NPI records", time: "Feb 25", status: "error" },
      { label: "Under review at Molina", detail: "Address verification flagged during primary source check", time: "Feb 18", status: "warning" },
      { label: "Application submitted to Molina", detail: "Full credentialing packet transmitted", time: "Feb 10", status: "verified" },
      { label: "Documents assembled", detail: "17 credentials packaged for submission", time: "Feb 9", status: "verified" },
      { label: "Request initiated", detail: "Valley Health Group — payer enrollment", time: "Feb 5", status: "verified" },
    ],
    documents: [
      { name: "DEA Certificate", status: "error", note: "Address mismatch: 455 Sutter St vs 450 Sutter St" },
      { name: "NPI Verification", status: "error", note: "Address mismatch: 450 Sutter St vs 455 Sutter St" },
      { name: "CA Medical License", status: "verified", note: "#MD-48291 — exp Dec 2027" },
      { name: "Board Certification — ABIM", status: "verified", note: "Internal Medicine — exp May 2026" },
      { name: "Malpractice Insurance", status: "verified", note: "NORCAL Mutual — active" },
    ],
  },
  "REJ-003": {
    id: "REJ-003",
    payer: "Centene",
    payerDetail: "Centene Corporation · Payer enrollment credentialing",
    provider: "Dr. Lisa Park",
    providerNpi: "9876543210",
    credential: "Board Certification",
    reason: "Board certification not found — ABMS returned no matching record",
    rejectedDate: "Feb 20, 2026",
    originalConf: "CEN-26-6653",
    originalSubmitDate: "Feb 5, 2026",
    status: "rejected",
    letterContent: "Your credentialing application has been returned because board certification could not be verified through the American Board of Medical Specialties (ABMS). A query to the ABMS Certification Verification Service returned no matching record for the specialty and physician combination provided. This may be due to a name mismatch, recent certification not yet recorded, or the certification being issued by a non-ABMS member board. Please provide a copy of your board certification certificate or a verification letter directly from the certifying board. If you are certified by an AOA specialty board, please indicate this and provide appropriate documentation.",
    affectedFields: [
      { field: "Board name", submitted: "American Board of Internal Medicine", expected: "Verify correct board" },
      { field: "Certification status", submitted: "Not found in ABMS", expected: "Active certification" },
      { field: "Physician name (ABMS)", submitted: "No match found", expected: "Exact name match required" },
      { field: "Specialty", submitted: "Family Medicine", expected: "Must match ABMS record" },
    ],
    fixSteps: [
      { step: 1, title: "Verify your ABMS record", description: "Log in to your ABMS portfolio or contact ABIM directly to confirm your certification is listed correctly. Check for name mismatches or recent updates not yet reflected.", completed: false },
      { step: 2, title: "Request a verification letter", description: "If the ABMS query failed due to a name mismatch or timing, request an official verification letter from ABIM confirming your board certification status.", completed: false },
      { step: 3, title: "Gather supporting documentation", description: "Collect your board certification certificate, ABIM verification letter, or AOA documentation if applicable.", completed: false },
      { step: 4, title: "Upload and resubmit", description: "Upload the verification documentation and resubmit to Centene with a note explaining the discrepancy.", completed: false },
    ],
    timeline: [
      { label: "Application rejected by Centene", detail: "ABMS returned no matching board certification record", time: "Feb 20", status: "error" },
      { label: "ABMS query failed", detail: "No matching record found during primary source verification", time: "Feb 15", status: "error" },
      { label: "Application submitted to Centene", detail: "Full credentialing packet transmitted", time: "Feb 5", status: "verified" },
      { label: "Documents assembled", detail: "15 credentials packaged for submission", time: "Feb 4", status: "verified" },
      { label: "Request initiated", detail: "Valley Health Group — payer enrollment", time: "Feb 1", status: "verified" },
    ],
    documents: [
      { name: "Board Certification", status: "error", note: "ABMS query — no matching record found" },
      { name: "CA Medical License", status: "verified", note: "Active — no issues" },
      { name: "DEA Certificate", status: "verified", note: "Active — exp 2028" },
      { name: "NPI Verification", status: "verified", note: "Confirmed" },
      { name: "Malpractice Insurance", status: "verified", note: "Active — current policy" },
    ],
  },
};

export function RejectionDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const isOrg = location.pathname.includes("/org/");

  const [resolveOpen, setResolveOpen] = React.useState(false);
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());

  const data = id ? REJECTIONS_DB[id] : null;

  const backPath = isOrg ? "/app/org/submissions" : "/app/clinician";
  const backLabel = isOrg ? "Submissions" : "Dashboard";

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to={backPath} className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} />
          {backLabel}
        </Link>
        <div className="bg-surface-elevated border border-border rounded-xl p-10 text-center">
          <p className="text-[15px] text-foreground mb-1">Rejection not found</p>
          <p className="text-[14px] text-muted-foreground">The rejection ID "{id}" was not found.</p>
        </div>
      </div>
    );
  }

  const copyId = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = data.id;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("Copied", { description: data.id });
    } catch {
      toast.error("Copy failed");
    }
  };

  const toggleStep = (step: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  };

  const wizardItem = {
    id: data.id,
    payer: data.payer,
    credential: data.credential,
    reason: data.reason,
    rejectedDate: data.rejectedDate,
    originalConf: data.originalConf,
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back */}
      <Link to={backPath} className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        {backLabel}
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Rejected submission</h1>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-red bg-red/10 border border-red/20 px-2.5 py-0.5 rounded-full">
              Rejected
            </span>
          </div>
          <p className="text-[15px] text-muted-foreground">{data.payerDetail}</p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={copyId} className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-foreground transition-colors cursor-pointer">
              <Copy size={12} />
              {data.id}
            </button>
            <span className="text-[13px] text-text-secondary">Rejected {data.rejectedDate}</span>
          </div>
        </div>
        <button
          onClick={() => setWizardOpen(true)}
          className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity shrink-0"
        >
          Fix &amp; resubmit
        </button>
      </div>

      {/* ── Rejection Letter ── */}
      <div className="mb-8">
        <SectionLabel>Rejection letter</SectionLabel>
        <div className="mt-4 bg-red/5 border border-red/20 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={18} className="text-red shrink-0 mt-0.5" />
            <div>
              <p className="text-[15px] text-foreground">From {data.payer}</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">{data.rejectedDate}</p>
            </div>
          </div>
          <p className="text-[14px] text-foreground/90 leading-relaxed">{data.letterContent}</p>
        </div>
      </div>

      {/* ── Affected Fields ── */}
      <div className="mb-8">
        <SectionLabel>What was wrong</SectionLabel>
        <div className="mt-4 bg-surface-elevated border border-border rounded-xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-3 gap-4 px-5 py-3 border-b border-border text-[12px] text-text-secondary uppercase tracking-wide">
            <span>Field</span>
            <span>Submitted</span>
            <span>Expected</span>
          </div>
          {data.affectedFields.map((f, i) => (
            <div key={i} className={`grid sm:grid-cols-3 gap-1 sm:gap-4 px-5 py-3.5 ${
              i < data.affectedFields.length - 1 ? "border-b border-border" : ""
            }`}>
              <span className="text-[14px] text-foreground">{f.field}</span>
              <span className="text-[14px] text-red/80">{f.submitted}</span>
              <span className="text-[14px] text-muted-foreground">{f.expected}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fix Steps ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>How to fix this</SectionLabel>
          <span className="text-[13px] text-muted-foreground tabular-nums">
            {completedSteps.size}/{data.fixSteps.length} steps
          </span>
        </div>
        <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border">
          {data.fixSteps.map((fs) => {
            const done = completedSteps.has(fs.step);
            return (
              <div key={fs.step} className="px-5 py-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleStep(fs.step)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all ${
                      done ? "bg-green border-green text-background" : "border-border hover:border-foreground/40"
                    }`}
                  >
                    {done && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] transition-colors ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      Step {fs.step}: {fs.title}
                    </p>
                    <p className="text-[14px] text-muted-foreground mt-1">{fs.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick action after completing steps */}
        {completedSteps.size >= 2 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            >
              Ready to fix &amp; resubmit
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Two-column: Documents + Provider */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Documents */}
        <div>
          <SectionLabel>Submitted documents</SectionLabel>
          <div className="mt-4 bg-surface-elevated border border-border rounded-xl divide-y divide-border">
            {data.documents.map((doc, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div className="pt-0.5">
                  <Dot status={doc.status} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[14px] ${doc.status === "error" ? "text-red/90" : "text-foreground"}`}>{doc.name}</p>
                  <p className="text-[13px] text-muted-foreground">{doc.note}</p>
                </div>
                {doc.status === "error" && (
                  <button
                    onClick={() => { setResolveOpen(true); }}
                    className="shrink-0 text-[12px] text-muted-foreground hover:text-foreground border border-border px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Provider info */}
        <div>
          <SectionLabel>Provider</SectionLabel>
          <div className="mt-4 bg-surface-elevated border border-border rounded-xl divide-y divide-border">
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[14px] text-muted-foreground">Name</span>
              <span className="text-[14px] text-foreground">{data.provider}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[14px] text-muted-foreground">NPI</span>
              <span className="text-[14px] text-foreground tabular-nums">{data.providerNpi}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[14px] text-muted-foreground">Credential</span>
              <span className="text-[14px] text-foreground">{data.credential}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[14px] text-muted-foreground">Original submission</span>
              <span className="text-[14px] text-foreground tabular-nums">#{data.originalConf}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[14px] text-muted-foreground">Submitted</span>
              <span className="text-[14px] text-foreground">{data.originalSubmitDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="mb-8">
        <SectionLabel>Submission timeline</SectionLabel>
        <div className="mt-4 bg-surface-elevated border border-border rounded-xl p-6">
          {data.timeline.map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center pt-1.5">
                <Dot status={item.status} />
                {i < data.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
              </div>
              <div className={`flex-1 min-w-0 ${i < data.timeline.length - 1 ? "pb-5" : "pb-1"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[15px] text-foreground">{item.label}</p>
                    <p className="text-[14px] text-muted-foreground mt-0.5">{item.detail}</p>
                  </div>
                  <span className="text-[13px] text-text-secondary tabular-nums shrink-0">{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-surface-elevated border border-border rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-[15px] text-foreground">Ready to correct this submission?</p>
          <p className="text-[14px] text-muted-foreground mt-0.5">Upload the corrected document and resubmit to {data.payer}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setResolveOpen(true)}
            className="text-[14px] text-muted-foreground hover:text-foreground border border-border px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
          >
            Resolve
          </button>
          <button
            onClick={() => setWizardOpen(true)}
            className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          >
            Fix &amp; resubmit
          </button>
        </div>
      </div>

      {/* Modals */}
      <ResolveModal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        itemLabel={`${data.payer} — ${data.credential}`}
        itemStatus="error"
      />
      <FixResubmitWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        item={wizardItem}
        isOrg={isOrg}
      />
    </div>
  );
}