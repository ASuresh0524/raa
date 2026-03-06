import React from "react";
import { ArrowLeft, Copy } from "lucide-react";
import { Link, useParams } from "react-router";
import { Dot, SectionLabel } from "./ui-components";
import { toast } from "sonner";

const stages = ["Intake", "Verify", "Assemble", "Submit", "Review", "Approved"];

interface SubmissionData {
  id: string;
  dest: string;
  destDetail: string;
  provider: string;
  providerNpi: string;
  specialty: string;
  conf: string;
  date: string;
  status: "verified" | "pending" | "warning";
  stage: number;
  initiatedBy: string;
  documents: { name: string; status: "verified" | "pending" | "warning" }[];
  activity: { label: string; detail: string; time: string; status: "verified" | "pending" | "warning" }[];
}

const SUBMISSION_DB: Record<string, SubmissionData> = {
  "SUB-001": {
    id: "SUB-001", dest: "Blue Shield CA", destDetail: "Blue Shield of California · Payer enrollment", provider: "Dr. Sarah Chen", providerNpi: "1234567890", specialty: "Internal Medicine", conf: "BS-2026-8843", date: "Mar 4, 2026", status: "verified", stage: 5,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "DEA Certificate", status: "verified" },
      { name: "Board Certification – ABIM", status: "verified" },
      { name: "Malpractice Insurance", status: "verified" },
      { name: "NPI Verification", status: "verified" },
    ],
    activity: [
      { label: "Approved by payer", detail: "Blue Shield CA confirmed enrollment", time: "Mar 4", status: "verified" },
      { label: "Under review", detail: "Submitted packet entered review queue", time: "Mar 1", status: "verified" },
      { label: "Packet submitted", detail: "All documents assembled and sent", time: "Feb 28", status: "verified" },
      { label: "Documents verified", detail: "5 of 5 documents verified", time: "Feb 26", status: "verified" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 24", status: "verified" },
    ],
  },
  "SUB-002": {
    id: "SUB-002", dest: "Aetna", destDetail: "Aetna · Payer enrollment", provider: "Dr. Sarah Chen", providerNpi: "1234567890", specialty: "Internal Medicine", conf: "AET-90421", date: "Mar 3, 2026", status: "verified", stage: 5,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "DEA Certificate", status: "verified" },
      { name: "Board Certification – ABIM", status: "verified" },
      { name: "Malpractice Insurance", status: "verified" },
    ],
    activity: [
      { label: "Approved by payer", detail: "Aetna confirmed enrollment", time: "Mar 3", status: "verified" },
      { label: "Packet submitted", detail: "All documents assembled and sent", time: "Feb 27", status: "verified" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 25", status: "verified" },
    ],
  },
  "SUB-003": {
    id: "SUB-003", dest: "UCSF Medical Center", destDetail: "UCSF Medical Center · Hospital privileging", provider: "Dr. James Wilson", providerNpi: "9876543210", specialty: "Cardiology", conf: "UCSF-26-1102", date: "Mar 2, 2026", status: "pending", stage: 4,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "DEA Certificate", status: "verified" },
      { name: "Board Certification – ABCV", status: "verified" },
      { name: "Malpractice Insurance", status: "pending" },
      { name: "Peer References (3)", status: "verified" },
    ],
    activity: [
      { label: "Under review", detail: "UCSF credentialing committee review", time: "Mar 2", status: "pending" },
      { label: "Packet submitted", detail: "Documents sent to UCSF", time: "Feb 28", status: "verified" },
      { label: "Documents verified", detail: "4 of 5 documents verified", time: "Feb 26", status: "pending" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 22", status: "verified" },
    ],
  },
  "SUB-004": {
    id: "SUB-004", dest: "Sutter Health", destDetail: "Sutter Health · Hospital privileging", provider: "Dr. Robert Kim", providerNpi: "5678901234", specialty: "Orthopedic Surgery", conf: "SH-26-4421", date: "Mar 1, 2026", status: "verified", stage: 5,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "Board Certification – ABOS", status: "verified" },
      { name: "Malpractice Insurance", status: "verified" },
    ],
    activity: [
      { label: "Approved", detail: "Privileges granted at Sutter Health", time: "Mar 1", status: "verified" },
      { label: "Packet submitted", detail: "All documents sent", time: "Feb 24", status: "verified" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 20", status: "verified" },
    ],
  },
  "SUB-005": {
    id: "SUB-005", dest: "Stanford Health Care", destDetail: "Stanford Health Care · Hospital privileging", provider: "Dr. Maria Santos", providerNpi: "4567890123", specialty: "Neurology", conf: "SHC-26-2203", date: "Feb 28, 2026", status: "pending", stage: 3,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "DEA Certificate", status: "pending" },
      { name: "Board Certification – AAN", status: "verified" },
      { name: "Malpractice Insurance", status: "verified" },
    ],
    activity: [
      { label: "Assembling packet", detail: "Awaiting DEA certificate verification", time: "Feb 28", status: "pending" },
      { label: "Documents partially verified", detail: "3 of 4 documents verified", time: "Feb 26", status: "pending" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 22", status: "verified" },
    ],
  },
  "SUB-006": {
    id: "SUB-006", dest: "Dignity Health", destDetail: "Dignity Health · Facility credentialing", provider: "Dr. Lisa Park", providerNpi: "3456789012", specialty: "Dermatology", conf: "DH-26-0091", date: "Feb 27, 2026", status: "warning", stage: 2,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "DEA Certificate", status: "warning" },
      { name: "Board Certification – ABD", status: "verified" },
      { name: "Malpractice Insurance", status: "warning" },
    ],
    activity: [
      { label: "Verification issue", detail: "DEA certificate address mismatch", time: "Feb 27", status: "warning" },
      { label: "Document uploaded", detail: "Malpractice certificate needs renewal date", time: "Feb 25", status: "warning" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 20", status: "verified" },
    ],
  },
  "SUB-007": {
    id: "SUB-007", dest: "Kaiser Permanente", destDetail: "Kaiser Permanente · Payer enrollment", provider: "Dr. Sarah Chen", providerNpi: "1234567890", specialty: "Internal Medicine", conf: "KP-26-7710", date: "Feb 25, 2026", status: "verified", stage: 5,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "Board Certification – ABIM", status: "verified" },
      { name: "Malpractice Insurance", status: "verified" },
    ],
    activity: [
      { label: "Approved", detail: "Kaiser Permanente confirmed enrollment", time: "Feb 25", status: "verified" },
      { label: "Packet submitted", detail: "Documents sent", time: "Feb 20", status: "verified" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 16", status: "verified" },
    ],
  },
  "SUB-008": {
    id: "SUB-008", dest: "Cigna", destDetail: "Cigna · Payer enrollment", provider: "Dr. James Wilson", providerNpi: "9876543210", specialty: "Cardiology", conf: "CIG-26-3382", date: "Feb 24, 2026", status: "verified", stage: 5,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "DEA Certificate", status: "verified" },
      { name: "Board Certification – ABCV", status: "verified" },
    ],
    activity: [
      { label: "Approved", detail: "Cigna confirmed enrollment", time: "Feb 24", status: "verified" },
      { label: "Packet submitted", detail: "Documents sent", time: "Feb 18", status: "verified" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 14", status: "verified" },
    ],
  },
  "SUB-009": {
    id: "SUB-009", dest: "United Healthcare", destDetail: "United Healthcare · Payer enrollment", provider: "Dr. Robert Kim", providerNpi: "5678901234", specialty: "Orthopedic Surgery", conf: "UHC-26-5501", date: "Feb 22, 2026", status: "pending", stage: 3,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "Board Certification – ABOS", status: "pending" },
      { name: "Malpractice Insurance", status: "verified" },
    ],
    activity: [
      { label: "Assembling packet", detail: "Awaiting board cert verification", time: "Feb 22", status: "pending" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 18", status: "verified" },
    ],
  },
  "SUB-010": {
    id: "SUB-010", dest: "Anthem", destDetail: "Anthem · Payer enrollment", provider: "Dr. Maria Santos", providerNpi: "4567890123", specialty: "Neurology", conf: "ANT-26-8847", date: "Feb 20, 2026", status: "verified", stage: 5,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "Board Certification – AAN", status: "verified" },
      { name: "Malpractice Insurance", status: "verified" },
    ],
    activity: [
      { label: "Approved", detail: "Anthem confirmed enrollment", time: "Feb 20", status: "verified" },
      { label: "Packet submitted", detail: "Documents sent", time: "Feb 14", status: "verified" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 10", status: "verified" },
    ],
  },
  "SUB-011": {
    id: "SUB-011", dest: "Molina Healthcare", destDetail: "Molina Healthcare · Payer enrollment", provider: "Dr. Lisa Park", providerNpi: "3456789012", specialty: "Dermatology", conf: "MOL-26-1190", date: "Feb 18, 2026", status: "verified", stage: 5,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "Board Certification – ABD", status: "verified" },
    ],
    activity: [
      { label: "Approved", detail: "Molina confirmed enrollment", time: "Feb 18", status: "verified" },
      { label: "Packet submitted", detail: "Documents sent", time: "Feb 12", status: "verified" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 8", status: "verified" },
    ],
  },
  "SUB-012": {
    id: "SUB-012", dest: "Centene", destDetail: "Centene · Payer enrollment", provider: "Dr. Sarah Chen", providerNpi: "1234567890", specialty: "Internal Medicine", conf: "CEN-26-6653", date: "Feb 15, 2026", status: "verified", stage: 5,
    initiatedBy: "Valley Health Group",
    documents: [
      { name: "Medical License – CA", status: "verified" },
      { name: "Board Certification – ABIM", status: "verified" },
      { name: "Malpractice Insurance", status: "verified" },
    ],
    activity: [
      { label: "Approved", detail: "Centene confirmed enrollment", time: "Feb 15", status: "verified" },
      { label: "Packet submitted", detail: "Documents sent", time: "Feb 10", status: "verified" },
      { label: "Request created", detail: "Initiated by Valley Health Group", time: "Feb 5", status: "verified" },
    ],
  },
};

function StagePipeline({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${i <= current ? "text-foreground" : "text-muted-foreground/40"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${i < current ? "bg-green" : i === current ? "bg-foreground" : "bg-border"}`} />
            <span className="text-[13px]">{s}</span>
          </div>
          {i < stages.length - 1 && (
            <div className={`w-4 h-px ${i < current ? "bg-green/40" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const statusLabel: Record<string, string> = {
  verified: "Accepted",
  pending: "In Progress",
  warning: "Needs Review",
};

export function OrgSubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = React.useState(false);

  const data = id ? SUBMISSION_DB[id] : undefined;

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/app/org/submissions" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} />
          Submissions
        </Link>
        <p className="text-[15px] text-muted-foreground">Submission not found.</p>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (_) {}
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/app/org/submissions" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Submissions
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[22px] text-foreground tracking-[-0.02em]">{data.dest}</h1>
            <Dot status={data.status} />
          </div>
          <p className="text-[15px] text-muted-foreground">{data.destDetail}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-muted-foreground tabular-nums">{data.id}</span>
          <button
            onClick={() => handleCopy(data.id)}
            className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
          >
            <Copy size={14} className="text-muted-foreground" />
          </button>
          <div className="w-px h-5 bg-border" />
          <Link
            to="/app/org/requests?new=1"
            className="px-4 py-2 text-[14px] bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
          >
            New request
          </Link>
          <Link
            to="/app/org/submissions"
            className="px-4 py-2 text-[14px] bg-surface-elevated border border-border text-foreground rounded-lg hover:border-foreground/30 transition-colors"
          >
            Submit document
          </Link>
        </div>
      </div>

      {/* Stage pipeline */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-8 overflow-x-auto">
        <StagePipeline current={data.stage} />
      </div>

      {/* Details grid */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface-elevated border border-border rounded-xl p-5">
          <SectionLabel>Provider</SectionLabel>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-[13px] text-muted-foreground">Name</p>
              <p className="text-[15px] text-foreground">{data.provider}</p>
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">NPI</p>
              <p className="text-[15px] text-foreground tabular-nums">{data.providerNpi}</p>
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">Specialty</p>
              <p className="text-[15px] text-foreground">{data.specialty}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-elevated border border-border rounded-xl p-5">
          <SectionLabel>Submission info</SectionLabel>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-[13px] text-muted-foreground">Confirmation</p>
              <div className="flex items-center gap-2">
                <p className="text-[15px] text-foreground tabular-nums">#{data.conf}</p>
                <button
                  onClick={() => handleCopy(data.conf)}
                  className="p-1 rounded hover:bg-secondary cursor-pointer transition-colors"
                >
                  <Copy size={12} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">Date</p>
              <p className="text-[15px] text-foreground">{data.date}</p>
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">Initiated by</p>
              <p className="text-[15px] text-foreground">{data.initiatedBy}</p>
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                <Dot status={data.status} />
                <p className="text-[15px] text-foreground">{statusLabel[data.status]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-8">
        <SectionLabel>Documents</SectionLabel>
        <div className="mt-4">
          {data.documents.map((doc, i) => (
            <div
              key={doc.name}
              className={`flex items-center justify-between py-3 ${
                i < data.documents.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <Dot status={doc.status} />
                <p className="text-[14px] text-foreground">{doc.name}</p>
              </div>
              {(doc.status === "error" || doc.status === "warning" || doc.status === "pending") && (
                <button
                  onClick={() => toast.success("Resolving", { description: doc.name })}
                  className="shrink-0 text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
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
          {data.activity.map((item, i) => (
            <div key={i} className="flex gap-4 pb-5 last:pb-0">
              <div className="flex flex-col items-center">
                <Dot status={item.status} />
                {i < data.activity.length - 1 && (
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
                        onClick={() => toast.success("Resolving", { description: item.label })}
                        className="text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
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
    </div>
  );
}

export default OrgSubmissionDetail;