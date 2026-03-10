import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Dot } from "./ui-components";
import { ResolveModal } from "./ResolveModal";
import { FixResubmitWizard } from "./FixResubmitWizard";
import { motion } from "motion/react";

interface Submission {
  id: string;
  dest: string;
  provider: string;
  conf: string;
  date: string;
  status: "verified" | "pending" | "warning" | "rejected";
  rejectionReason?: string;
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
  { id: "SUB-013", dest: "Anthem Blue Cross", provider: "Dr. Sarah Chen", conf: "ANT-26-3301", date: "Feb 28", status: "rejected", rejectionReason: "Malpractice certificate expired — current policy required" },
  { id: "SUB-014", dest: "Molina Healthcare", provider: "Dr. Sarah Chen", conf: "MOL-26-1190", date: "Feb 25", status: "rejected", rejectionReason: "DEA registration address does not match NPI practice location" },
  { id: "SUB-015", dest: "Centene", provider: "Dr. Lisa Park", conf: "CEN-26-6653", date: "Feb 20", status: "rejected", rejectionReason: "Board certification not found — ABMS returned no matching record" },
];

const statusLabel: Record<Submission["status"], string> = {
  verified: "Accepted",
  pending: "Pending",
  warning: "Needs review",
  rejected: "Rejected",
};

/* Map rejected submission IDs to their rejection detail IDs */
const rejectionIdMap: Record<string, string> = {
  "SUB-013": "REJ-001",
  "SUB-014": "REJ-002",
  "SUB-015": "REJ-003",
};

export function OrgSubmissions(): React.JSX.Element {
  const [filter, setFilter] = React.useState<"all" | Submission["status"]>("all");
  const [resolveOpen, setResolveOpen] = React.useState(false);
  const [resolveLabel, setResolveLabel] = React.useState("");
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [wizardTarget, setWizardTarget] = React.useState<{
    id: string; payer: string; credential: string; reason: string; rejectedDate: string; originalConf: string;
  } | null>(null);

  const filtered = filter === "all" ? SUBMISSIONS : SUBMISSIONS.filter((s) => s.status === filter);

  const counts = {
    all: SUBMISSIONS.length,
    verified: SUBMISSIONS.filter((s) => s.status === "verified").length,
    pending: SUBMISSIONS.filter((s) => s.status === "pending").length,
    warning: SUBMISSIONS.filter((s) => s.status === "warning").length,
    rejected: SUBMISSIONS.filter((s) => s.status === "rejected").length,
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/app/org" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Submissions</h1>
      <p className="text-[15px] text-muted-foreground mt-1 mb-8">Packets sent to payers, facilities, and agencies.</p>

      {/* Summary metric cards — clickable filters */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
      >
        {([
          { key: "verified" as const, label: "Accepted", count: counts.verified },
          { key: "pending" as const, label: "Pending", count: counts.pending },
          { key: "warning" as const, label: "Needs review", count: counts.warning },
          { key: "rejected" as const, label: "Rejected", count: counts.rejected },
        ]).map((m) => (
          <motion.button
            key={m.key}
            variants={{
              initial: { opacity: 0, y: 12 },
              animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
            }}
            onClick={() => setFilter(filter === m.key ? "all" : m.key)}
            className={`bg-surface-elevated border rounded-xl py-5 px-4 text-center cursor-pointer transition-all active:scale-[0.97] ${
              filter === m.key
                ? "border-foreground/30 ring-1 ring-foreground/10"
                : "border-border hover:border-foreground/20"
            }`}
          >
            <p className="text-[26px] text-foreground tabular-nums tracking-[-0.02em]">{m.count}</p>
            <p className="text-[13px] text-muted-foreground mt-1">{m.label}</p>
          </motion.button>
        ))}
      </motion.div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(["all", "verified", "pending", "warning", "rejected"] as const).map((f) => (
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
              to={sub.status === "rejected" && rejectionIdMap[sub.id]
                ? `/app/org/rejections/${rejectionIdMap[sub.id]}`
                : `/app/org/submissions/${sub.id}`}
              key={sub.id}
              className={`flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors cursor-pointer ${
                i < filtered.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-[15px] text-foreground truncate">{sub.dest}</p>
                  <Dot status={sub.status === "rejected" ? "error" : sub.status} />
                </div>
                <p className="text-[14px] text-muted-foreground truncate mt-0.5">
                  {sub.provider} &middot; #{sub.conf}
                </p>
                {sub.status === "rejected" && sub.rejectionReason && (
                  <p className="text-[13px] text-red/80 mt-1 truncate">{sub.rejectionReason}</p>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <span className="text-[13px] text-text-secondary tabular-nums">{sub.id}</span>
                <span className="text-[13px] text-text-secondary tabular-nums">{sub.date}</span>
                {sub.status === "rejected" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        setWizardTarget({
                          id: sub.id,
                          payer: sub.dest,
                          credential: sub.conf,
                          reason: sub.rejectionReason || "",
                          rejectedDate: sub.date,
                          originalConf: sub.conf,
                        });
                        setWizardOpen(true);
                      }}
                      className="text-[12px] bg-foreground text-background px-2.5 py-1 rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      Resubmit
                    </button>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      <ResolveModal
        open={resolveOpen}
        onClose={() => { setResolveOpen(false); setResolveLabel(""); }}
        itemLabel={resolveLabel}
        itemStatus="error"
      />
      <FixResubmitWizard
        open={wizardOpen}
        onClose={() => { setWizardOpen(false); setWizardTarget(null); }}
        item={wizardTarget}
        isOrg
      />
    </div>
  );
}

export default OrgSubmissions;