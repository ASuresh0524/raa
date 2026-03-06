/* OrgRequestView – cache-bust v3 */
import React from "react";
import { ArrowLeft, Copy } from "lucide-react";
import { Link, useParams } from "react-router";
import { Dot } from "./ui-components";
import { toast } from "sonner";
import { UploadModal } from "./UploadModal";

const STAGE_LIST = ["Intake", "Verify", "Assemble", "Submit", "Review", "Approved"] as const;

interface ActivityEntry {
  label: string;
  detail: string;
  time: string;
  status: "verified" | "pending" | "warning" | "error";
}

interface DocEntry {
  name: string;
  status: "verified" | "pending" | "warning" | "error";
}

interface ReqRecord {
  id: string;
  type: string;
  dest: string;
  destDetail: string;
  provider: string;
  providerNpi: string;
  specialty: string;
  date: string;
  stage: number;
  confirmationId?: string;
  initiatedBy: string;
  activity: ActivityEntry[];
  documents: DocEntry[];
}

const DB: Record<string, ReqRecord> = {
  "REQ-001": {
    id: "REQ-001", type: "Payer enrollment", dest: "Blue Shield CA",
    destDetail: "Commercial + Medicare Advantage", provider: "Dr. Sarah Chen",
    providerNpi: "1234567890", specialty: "Internal Medicine", date: "Feb 15",
    stage: 4, confirmationId: "#BS-2026-8843", initiatedBy: "Valley Health Group",
    activity: [
      { label: "Enrollment application submitted", detail: "CAQH ProView profile synced and application transmitted to Blue Shield", time: "2h ago", status: "verified" },
      { label: "Payer acknowledged receipt", detail: "Blue Shield confirmed application #BS-2026-8843 received", time: "1h ago", status: "verified" },
      { label: "Under committee review", detail: "Credentialing committee review scheduled for next cycle", time: "45m ago", status: "pending" },
      { label: "All 44 credentials assembled", detail: "Credential passport complete — no gaps", time: "1d ago", status: "verified" },
      { label: "Primary source verification complete", detail: "17 sources verified including NPPES, ABMS, state boards", time: "2d ago", status: "verified" },
      { label: "Provider consent received", detail: "Dr. Chen granted read-only access to primary sources", time: "3d ago", status: "verified" },
      { label: "Request initiated", detail: "Valley Health Group created payer enrollment request", time: "Feb 15", status: "verified" },
    ],
    documents: [
      { name: "CA Medical License #MD-48291", status: "verified" },
      { name: "DEA Registration #FC1234567", status: "verified" },
      { name: "ABIM Internal Medicine Certification", status: "verified" },
      { name: "Malpractice Insurance Certificate", status: "verified" },
      { name: "CAQH ProView Application", status: "verified" },
      { name: "Privilege Verification Letter", status: "verified" },
    ],
  },
  "REQ-002": {
    id: "REQ-002", type: "Facility credentialing", dest: "UCSF Medical Center",
    destDetail: "San Francisco, CA", provider: "Dr. James Wilson",
    providerNpi: "2345678901", specialty: "Cardiology", date: "Feb 20",
    stage: 2, initiatedBy: "Self-initiated",
    activity: [
      { label: "Assembling credential packet", detail: "38 of 42 documents collected — 4 pending verification", time: "30m ago", status: "pending" },
      { label: "Board certification verification pending", detail: "Awaiting response from ABIM for cardiology subspecialty", time: "2h ago", status: "warning" },
      { label: "DEA registration verified", detail: "#FW2345678 — Schedule II–V — active", time: "4h ago", status: "verified" },
      { label: "State license verified", detail: "CA #MD-55192 — active, exp Dec 2027", time: "6h ago", status: "verified" },
      { label: "NPI confirmed", detail: "NPPES — NPI 2345678901, taxonomy 207RC0000X", time: "1d ago", status: "verified" },
      { label: "Provider consent received", detail: "Dr. Wilson granted access to primary sources", time: "2d ago", status: "verified" },
      { label: "Request initiated", detail: "Self-initiated facility credentialing request", time: "Feb 20", status: "verified" },
    ],
    documents: [
      { name: "CA Medical License #MD-55192", status: "verified" },
      { name: "DEA Registration #FW2345678", status: "verified" },
      { name: "ABIM Cardiology Certification", status: "pending" },
      { name: "Malpractice Insurance Certificate", status: "verified" },
      { name: "Fellowship Completion Letter", status: "verified" },
      { name: "Privilege Verification — Previous Hospital", status: "warning" },
    ],
  },
  "REQ-003": {
    id: "REQ-003", type: "Payer enrollment", dest: "Aetna",
    destDetail: "Commercial plans", provider: "Dr. Sarah Chen",
    providerNpi: "1234567890", specialty: "Internal Medicine", date: "Jan 28",
    stage: 5, confirmationId: "#AET-90421", initiatedBy: "Valley Health Group",
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
  "REQ-004": {
    id: "REQ-004", type: "Recredentialing", dest: "Sutter Health",
    destDetail: "Sacramento, CA", provider: "Dr. Emily Taylor",
    providerNpi: "4567890123", specialty: "Orthopedics", date: "Feb 25",
    stage: 1, initiatedBy: "Valley Health Group",
    activity: [
      { label: "Verifying updated credentials", detail: "Checking for changes since last credentialing cycle", time: "1h ago", status: "pending" },
      { label: "Previous credential file loaded", detail: "35 of 41 documents from Nov 2023 cycle imported", time: "3h ago", status: "verified" },
      { label: "Provider consent received", detail: "Dr. Taylor authorized re-verification of primary sources", time: "6h ago", status: "verified" },
      { label: "Recredentialing request initiated", detail: "Valley Health Group initiated renewal for Sutter Health", time: "Feb 25", status: "verified" },
    ],
    documents: [
      { name: "CA Medical License #MD-71803", status: "verified" },
      { name: "DEA Registration #FT4567890", status: "pending" },
      { name: "ABOS Orthopedic Certification", status: "pending" },
      { name: "Malpractice Insurance Certificate", status: "pending" },
      { name: "Updated Privilege Letter", status: "pending" },
    ],
  },
  "REQ-005": {
    id: "REQ-005", type: "Generate packet", dest: "Stanford Health Care",
    destDetail: "Manual submission required", provider: "Dr. Ahmed Hassan",
    providerNpi: "5678901234", specialty: "Neurology", date: "Mar 1",
    stage: 3, initiatedBy: "Valley Health Group",
    activity: [
      { label: "Generating credential packet PDF", detail: "Compiling 39 verified documents into submission-ready format", time: "15m ago", status: "pending" },
      { label: "All credentials assembled", detail: "39 of 43 credentials verified — 4 included as pending", time: "1h ago", status: "verified" },
      { label: "Board certification verified", detail: "ABPN Neurology — certified, exp Aug 2027", time: "4h ago", status: "verified" },
      { label: "Primary source verification complete", detail: "14 sources checked — 2 minor discrepancies auto-resolved", time: "1d ago", status: "verified" },
      { label: "Request initiated", detail: "Valley Health Group requested credential packet generation", time: "Mar 1", status: "verified" },
    ],
    documents: [
      { name: "CA Medical License #MD-66420", status: "verified" },
      { name: "DEA Registration #FA5678901", status: "verified" },
      { name: "ABPN Neurology Certification", status: "verified" },
      { name: "Malpractice Insurance Certificate", status: "verified" },
      { name: "Stanford Privilege Application", status: "pending" },
      { name: "CME Completion Records", status: "verified" },
    ],
  },
};

function Pipeline({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {STAGE_LIST.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded ${i <= current ? "text-foreground" : "text-muted-foreground/40"}`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${i < current ? "bg-green" : i === current ? "bg-foreground" : "bg-border"}`} />
            <span className="text-[13px] whitespace-nowrap">{s}</span>
          </div>
          {i < STAGE_LIST.length - 1 && <div className={`w-5 h-px shrink-0 ${i < current ? "bg-green" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

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

export function OrgRequestView(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const reqId = params.id ?? "";
  const [copiedId, setCopiedId] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);

  const req = DB[reqId] ?? null;

  if (!req) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/app/org/requests" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Requests
        </Link>
        <div className="bg-surface-elevated border border-border rounded-xl p-12 text-center">
          <p className="text-[15px] text-muted-foreground">Request not found.</p>
        </div>
      </div>
    );
  }

  const numVerified = req.documents.filter((d) => d.status === "verified").length;
  const numTotal = req.documents.length;
  const done = req.stage === 5;
  const stageName = STAGE_LIST[req.stage] ?? "Unknown";

  const onCopyId = () => {
    const val = req.confirmationId || req.id;
    copyText(val);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    toast.success("Copied to clipboard", { description: val });
  };

  const onReminder = () => {
    toast.success("Reminder sent", { description: `Follow-up sent to ${req.dest} regarding ${req.id}` });
  };

  const onExport = () => {
    toast.success("Export started", { description: `Credential packet for ${req.id} is being generated` });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/app/org/requests" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Back to Requests
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[22px] text-foreground tracking-[-0.02em]">{req.type}</h1>
            <span className="text-[13px] text-text-secondary tabular-nums bg-surface-elevated border border-border px-2 py-0.5 rounded">{req.id}</span>
          </div>
          <p className="text-[15px] text-muted-foreground">{req.provider} &rarr; {req.dest}</p>
        </div>
        <div className="flex items-center gap-2">
          {!done && (
            <button onClick={onReminder} className="text-[14px] border border-border text-foreground px-4 py-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              Send reminder
            </button>
          )}
          <button onClick={onExport} className="text-[14px] bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
            Export packet
          </button>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] text-muted-foreground">Current stage: <span className="text-foreground">{stageName}</span></p>
          {done && <span className="text-[13px] text-green">Approved</span>}
        </div>
        <Pipeline current={req.stage} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-surface-elevated border border-border rounded-xl p-5">
          <p className="text-[13px] text-text-secondary uppercase tracking-wide mb-3">Provider</p>
          <p className="text-[15px] text-foreground">{req.provider}</p>
          <p className="text-[14px] text-muted-foreground mt-1">{req.specialty} &middot; NPI {req.providerNpi}</p>
          <Link to="/app/org/providers/sarah-chen" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mt-3">
            View profile
          </Link>
        </div>

        <div className="bg-surface-elevated border border-border rounded-xl p-5">
          <p className="text-[13px] text-text-secondary uppercase tracking-wide mb-3">Destination</p>
          <p className="text-[15px] text-foreground">{req.dest}</p>
          <p className="text-[14px] text-muted-foreground mt-1">{req.destDetail}</p>
          {req.confirmationId && (
            <button onClick={onCopyId} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mt-3 cursor-pointer">
              {copiedId ? "Copied!" : req.confirmationId}
              <Copy size={12} />
            </button>
          )}
        </div>

        <div className="bg-surface-elevated border border-border rounded-xl p-5">
          <p className="text-[13px] text-text-secondary uppercase tracking-wide mb-3">Documents</p>
          <p className="text-[15px] text-foreground tabular-nums">{numVerified} / {numTotal}</p>
          <div className="flex items-center gap-2 mt-1">
            <Dot status={numVerified === numTotal ? "verified" : "warning"} />
            <span className="text-[14px] text-muted-foreground">{numVerified === numTotal ? "All verified" : `${numTotal - numVerified} pending`}</span>
          </div>
        </div>

        <div className="bg-surface-elevated border border-border rounded-xl p-5">
          <p className="text-[13px] text-text-secondary uppercase tracking-wide mb-3">Details</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[14px] text-muted-foreground">Initiated</span>
              <span className="text-[14px] text-foreground">{req.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[14px] text-muted-foreground">By</span>
              <span className="text-[14px] text-foreground">{req.initiatedBy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] text-text-secondary uppercase tracking-wide">Credential documents</p>
          <button onClick={() => setUploadOpen(true)} className="text-[13px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            + Add document
          </button>
        </div>
        <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border">
          {req.documents.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[14px] text-foreground">{doc.name}</span>
              <div className="flex items-center gap-3">
                {(doc.status === "warning" || doc.status === "pending" || doc.status === "error") && (
                  <button
                    onClick={() => toast.success("Resolving", { description: doc.name })}
                    className="shrink-0 text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Resolve
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <Dot status={doc.status} />
                  <span className="text-[13px] text-muted-foreground capitalize">{doc.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div>
        <p className="text-[13px] text-text-secondary uppercase tracking-wide mb-3">Activity</p>
        <div className="bg-surface-elevated border border-border rounded-xl p-6">
          {req.activity.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center pt-1.5">
                <Dot status={item.status} />
                {idx < req.activity.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
              </div>
              <div className={`flex-1 min-w-0 ${idx < req.activity.length - 1 ? "pb-5" : "pb-1"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[15px] text-foreground">{item.label}</p>
                    <p className="text-[14px] text-muted-foreground mt-1">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {(item.status === "error" || item.status === "warning" || item.status === "pending") && (
                      <button
                        onClick={() => toast.success("Resolving", { description: item.label })}
                        className="text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                    <span className="text-[12px] text-text-secondary tabular-nums whitespace-nowrap">{item.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onComplete={(fn: string) => {
          setUploadOpen(false);
          toast.success("Document added", { description: `${fn} added to ${req.id}` });
        }}
        title="Add credential document"
        description={`Upload a document for ${req.provider}'s ${req.type.toLowerCase()} request to ${req.dest}.`}
        requirements={["Document must be current and unexpired", "Must include provider name and relevant dates"]}
      />
    </div>
  );
}

/* default export required for route lazy loading */
export default OrgRequestView;