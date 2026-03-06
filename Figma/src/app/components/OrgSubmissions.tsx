import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Dot, SectionLabel } from "./ui-components";

interface Submission {
  id: string;
  dest: string;
  provider: string;
  conf: string;
  date: string;
  status: "verified" | "pending" | "warning";
}

const SUBMISSIONS: Submission[] = [
  { id: "SUB-001", dest: "Blue Shield CA", provider: "Dr. Sarah Chen", conf: "BS-2026-8843", date: "Mar 4", status: "verified" },
  { id: "SUB-002", dest: "Aetna", provider: "Dr. Sarah Chen", conf: "AET-90421", date: "Mar 3", status: "verified" },
  { id: "SUB-003", dest: "UCSF Medical Center", provider: "Dr. James Wilson", conf: "UCSF-26-1102", date: "Mar 2", status: "pending" },
  { id: "SUB-004", dest: "Sutter Health", provider: "Dr. Robert Kim", conf: "SH-26-4421", date: "Mar 1", status: "verified" },
  { id: "SUB-005", dest: "Stanford Health Care", provider: "Dr. Maria Santos", conf: "SHC-26-2203", date: "Feb 28", status: "pending" },
  { id: "SUB-006", dest: "Dignity Health", provider: "Dr. Lisa Park", conf: "DH-26-0091", date: "Feb 27", status: "warning" },
  { id: "SUB-007", dest: "Kaiser Permanente", provider: "Dr. Sarah Chen", conf: "KP-26-7710", date: "Feb 25", status: "verified" },
  { id: "SUB-008", dest: "Cigna", provider: "Dr. James Wilson", conf: "CIG-26-3382", date: "Feb 24", status: "verified" },
  { id: "SUB-009", dest: "United Healthcare", provider: "Dr. Robert Kim", conf: "UHC-26-5501", date: "Feb 22", status: "pending" },
  { id: "SUB-010", dest: "Anthem", provider: "Dr. Maria Santos", conf: "ANT-26-8847", date: "Feb 20", status: "verified" },
  { id: "SUB-011", dest: "Molina Healthcare", provider: "Dr. Lisa Park", conf: "MOL-26-1190", date: "Feb 18", status: "verified" },
  { id: "SUB-012", dest: "Centene", provider: "Dr. Sarah Chen", conf: "CEN-26-6653", date: "Feb 15", status: "verified" },
];

const statusLabel: Record<Submission["status"], string> = {
  verified: "Accepted",
  pending: "Pending",
  warning: "Needs review",
};

export function OrgSubmissions(): React.JSX.Element {
  const [filter, setFilter] = React.useState<"all" | Submission["status"]>("all");

  const filtered = filter === "all" ? SUBMISSIONS : SUBMISSIONS.filter((s) => s.status === filter);

  const counts = {
    all: SUBMISSIONS.length,
    verified: SUBMISSIONS.filter((s) => s.status === "verified").length,
    pending: SUBMISSIONS.filter((s) => s.status === "pending").length,
    warning: SUBMISSIONS.filter((s) => s.status === "warning").length,
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/app/org" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Submissions</h1>
      <p className="text-[15px] text-muted-foreground mt-1 mb-8">Packets sent to payers, facilities, and agencies.</p>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(["all", "verified", "pending", "warning"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[13px] rounded-lg cursor-pointer transition-all ${
              filter === f
                ? "bg-foreground text-background"
                : "bg-surface-elevated border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : statusLabel[f]}
            <span className="ml-1.5 tabular-nums opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Submissions list */}
      <div className="bg-surface-elevated border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[14px] text-muted-foreground">No submissions match this filter.</p>
          </div>
        ) : (
          filtered.map((sub, i) => (
            <Link
              to={`/app/org/submissions/${sub.id}`}
              key={sub.id}
              className={`flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors cursor-pointer ${
                i < filtered.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-[15px] text-foreground truncate">{sub.dest}</p>
                  <Dot status={sub.status} />
                </div>
                <p className="text-[14px] text-muted-foreground truncate mt-0.5">
                  {sub.provider} &middot; #{sub.conf}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <span className="text-[13px] text-text-secondary tabular-nums">{sub.id}</span>
                <span className="text-[13px] text-text-secondary tabular-nums">{sub.date}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-surface-elevated border border-border rounded-xl py-4 px-4 text-center">
          <p className="text-[22px] text-foreground tabular-nums tracking-[-0.02em]">{counts.verified}</p>
          <p className="text-[13px] text-muted-foreground mt-1">Accepted</p>
        </div>
        <div className="bg-surface-elevated border border-border rounded-xl py-4 px-4 text-center">
          <p className="text-[22px] text-foreground tabular-nums tracking-[-0.02em]">{counts.pending}</p>
          <p className="text-[13px] text-muted-foreground mt-1">Pending</p>
        </div>
        <div className="bg-surface-elevated border border-border rounded-xl py-4 px-4 text-center">
          <p className="text-[22px] text-foreground tabular-nums tracking-[-0.02em]">{counts.warning}</p>
          <p className="text-[13px] text-muted-foreground mt-1">Needs review</p>
        </div>
      </div>
    </div>
  );
}

export default OrgSubmissions;