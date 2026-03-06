/* ClinicianRequestDetail – detail view for a clinician request */
import React from "react";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { Link, useParams } from "react-router";
import { Dot, SectionLabel } from "./ui-components";
import { toast } from "sonner";
import { ResolveModal } from "./ResolveModal";

const STAGE_LABELS = ["Intake", "Verify", "Assemble", "Submit", "Review", "Approved"] as const;

interface ActivityEntry {
  label: string;
  detail: string;
  time: string;
  status: "verified" | "pending" | "warning" | "error";
}

interface DocEntry {
  name: string;
  status: "verified" | "pending" | "warning";
}

interface RequestRecord {
  id: string;
  type: string;
  dest: string;
  destDetail: string;
  by: string;
  date: string;
  stage: number;
  conf: string | null;
  activity: ActivityEntry[];
  documents: DocEntry[];
}

const DB: Record<string, RequestRecord> = {
  "REQ-001": {
    id: "REQ-001",
    type: "Payer enrollment",
    dest: "Blue Shield CA",
    destDetail: "Commercial + Medicare Advantage",
    by: "Valley Health Group",
    date: "Feb 15, 2026",
    stage: 4,
    conf: "BS-2026-8843",
    activity: [
      { label: "Application under payer review", detail: "Blue Shield CA credentialing committee reviewing packet", time: "1d ago", status: "pending" },
      { label: "Application submitted to Blue Shield", detail: "Credentialing application + 42 supporting documents transmitted via API", time: "3d ago", status: "verified" },
      { label: "Credential packet assembled", detail: "All required documents compiled and validated", time: "4d ago", status: "verified" },
      { label: "Primary source verification complete", detail: "14 sources verified — no discrepancies", time: "1w ago", status: "verified" },
      { label: "Agent started credential retrieval", detail: "Searching 14 primary sources simultaneously", time: "Feb 15", status: "verified" },
      { label: "Request initiated", detail: "Valley Health Group created payer enrollment request", time: "Feb 15", status: "verified" },
    ],
    documents: [
      { name: "CA Medical License #MD-48291", status: "verified" },
      { name: "DEA Registration #FC1234567", status: "verified" },
      { name: "ABIM Internal Medicine Certification", status: "verified" },
      { name: "Malpractice Insurance Certificate", status: "verified" },
      { name: "NPI Verification", status: "verified" },
      { name: "CAQH Profile Export", status: "verified" },
    ],
  },
  "REQ-002": {
    id: "REQ-002",
    type: "Facility credentialing",
    dest: "UCSF Medical Center",
    destDetail: "San Francisco, CA",
    by: "Self-initiated",
    date: "Feb 20, 2026",
    stage: 2,
    conf: null,
    activity: [
      { label: "Board certification expiring soon", detail: "ABIM IM expires May 2026 — renewal recommended before submission", time: "2h ago", status: "warning" },
      { label: "Verifying credentials against UCSF requirements", detail: "12 of 18 required items verified", time: "6h ago", status: "pending" },
      { label: "UCSF privilege requirements loaded", detail: "18 required credential items identified", time: "1d ago", status: "verified" },
      { label: "Agent started credential retrieval", detail: "Pulling from 14 primary sources", time: "Feb 20", status: "verified" },
      { label: "Request initiated", detail: "Self-initiated facility credentialing request", time: "Feb 20", status: "verified" },
    ],
    documents: [
      { name: "CA Medical License #MD-48291", status: "verified" },
      { name: "DEA Registration #FC1234567", status: "verified" },
      { name: "ABIM Internal Medicine Certification", status: "warning" },
      { name: "Malpractice Insurance Certificate", status: "pending" },
      { name: "Hospital Privilege Letter", status: "pending" },
      { name: "Fellowship Completion Letter", status: "verified" },
    ],
  },
  "REQ-003": {
    id: "REQ-003",
    type: "Payer enrollment",
    dest: "Aetna",
    destDetail: "Commercial plans",
    by: "Valley Health Group",
    date: "Jan 28, 2026",
    stage: 5,
    conf: "AET-90421",
    activity: [
      { label: "Enrollment approved", detail: "Provider ID #AET-90421 — effective Mar 1, 2026", time: "2d ago", status: "verified" },
      { label: "Committee review passed", detail: "Aetna credentialing committee approved application", time: "5d ago", status: "verified" },
      { label: "Application submitted to Aetna", detail: "Credentialing application + supporting documents transmitted", time: "1w ago", status: "verified" },
      { label: "Credential packet assembled", detail: "All 44 documents compiled and validated", time: "1w ago", status: "verified" },
      { label: "Primary source verification complete", detail: "All sources verified — no discrepancies", time: "2w ago", status: "verified" },
      { label: "Request initiated", detail: "Valley Health Group created payer enrollment request", time: "Jan 28", status: "verified" },
    ],
    documents: [
      { name: "CA Medical License #MD-48291", status: "verified" },
      { name: "DEA Registration #FC1234567", status: "verified" },
      { name: "ABIM Internal Medicine Certification", status: "verified" },
      { name: "Malpractice Insurance Certificate", status: "verified" },
      { name: "Aetna Enrollment Application", status: "verified" },
      { name: "CAQH Profile Export", status: "verified" },
    ],
  },
};

function Pipeline({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {STAGE_LABELS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded ${i <= current ? "text-foreground" : "text-muted-foreground/40"}`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${i < current ? "bg-green" : i === current ? "bg-foreground" : "bg-border"}`} />
            <span className="text-[13px] whitespace-nowrap">{s}</span>
          </div>
          {i < STAGE_LABELS.length - 1 && <div className={`w-5 h-px shrink-0 ${i < current ? "bg-green" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

const statusLabel: Record<string, string> = {
  0: "Intake",
  1: "Verifying",
  2: "Verifying",
  3: "Assembling",
  4: "Under review",
  5: "Approved",
};

function copyText(text: string) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  } catch (_e) { /* noop */ }
}

export function ClinicianRequestDetail(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const reqId = params.id ?? "";
  const [copied, setCopied] = React.useState(false);
  const [resolveOpen, setResolveOpen] = React.useState(false);
  const [resolveLabel, setResolveLabel] = React.useState("");
  const [resolveStatus, setResolveStatus] = React.useState<"verified" | "pending" | "warning" | "error">("warning");

  const openResolve = (label: string, status: "verified" | "pending" | "warning" | "error") => {
    setResolveLabel(label);
    setResolveStatus(status);
    setResolveOpen(true);
  };

  const req = DB[reqId] ?? null;

  if (!req) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/app/clinician/requests" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} />
          Requests
        </Link>
        <div className="bg-surface-elevated border border-border rounded-xl p-12 text-center">
          <p className="text-[15px] text-muted-foreground">Request not found.</p>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    copyText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const verifiedDocs = req.documents.filter((d) => d.status === "verified").length;
  const totalDocs = req.documents.length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/app/clinician/requests" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Requests
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
        <h1 className="text-[22px] text-foreground tracking-[-0.02em]">{req.type}</h1>
        <span className="text-[14px] text-text-secondary tabular-nums">{req.id}</span>
      </div>
      <p className="text-[15px] text-muted-foreground mb-8">
        {req.dest} &middot; initiated by {req.by} &middot; {req.date}
      </p>

      {/* Stage pipeline */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-8 overflow-x-auto">
        <Pipeline current={req.stage} />
      </div>

      {/* Details grid */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface-elevated border border-border rounded-xl p-5">
          <SectionLabel>Request info</SectionLabel>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-[13px] text-muted-foreground">Destination</p>
              <p className="text-[15px] text-foreground">{req.dest}</p>
              <p className="text-[13px] text-text-secondary">{req.destDetail}</p>
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">Initiated by</p>
              <p className="text-[15px] text-foreground">{req.by}</p>
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">Date</p>
              <p className="text-[15px] text-foreground">{req.date}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated border border-border rounded-xl p-5">
          <SectionLabel>Status</SectionLabel>
          <div className="mt-4 space-y-3">
            {req.conf && (
              <div>
                <p className="text-[13px] text-muted-foreground">Confirmation</p>
                <div className="flex items-center gap-2">
                  <p className="text-[15px] text-foreground tabular-nums">#{req.conf}</p>
                  <button
                    onClick={() => handleCopy(req.conf!)}
                    className="p-1 rounded hover:bg-secondary cursor-pointer transition-colors"
                  >
                    {copied ? <Check size={12} className="text-green" /> : <Copy size={12} className="text-muted-foreground" />}
                  </button>
                </div>
              </div>
            )}
            <div>
              <p className="text-[13px] text-muted-foreground">Current stage</p>
              <div className="flex items-center gap-2">
                <Dot status={req.stage >= 5 ? "verified" : "pending"} />
                <p className="text-[15px] text-foreground">{statusLabel[req.stage] ?? "Unknown"}</p>
              </div>
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">Documents</p>
              <p className="text-[15px] text-foreground tabular-nums">{verifiedDocs}/{totalDocs} verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-8">
        <SectionLabel>Documents</SectionLabel>
        <div className="mt-4">
          {req.documents.map((doc, i) => (
            <div
              key={doc.name}
              className={`flex items-center justify-between py-3 ${
                i < req.documents.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Dot status={doc.status} />
                <p className="text-[14px] text-foreground">{doc.name}</p>
              </div>
              {(doc.status === "error" || doc.status === "warning" || doc.status === "pending") && (
                <button
                  onClick={() => openResolve(doc.name, doc.status)}
                  className="shrink-0 text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity timeline */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5">
        <SectionLabel>Activity</SectionLabel>
        <div className="mt-4">
          {req.activity.map((item, i) => (
            <div key={i} className="flex gap-4 pb-5 last:pb-0">
              <div className="flex flex-col items-center">
                <Dot status={item.status} />
                {i < req.activity.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-2" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[14px] text-foreground">{item.label}</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {(item.status === "error" || item.status === "warning" || item.status === "pending") && (
                      <button
                        onClick={() => openResolve(item.label, item.status)}
                        className="text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                    <span className="text-[13px] text-text-secondary tabular-nums">{item.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resolve modal */}
      <ResolveModal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        itemLabel={resolveLabel}
        itemStatus={resolveStatus}
      />
    </div>
  );
}

export default ClinicianRequestDetail;