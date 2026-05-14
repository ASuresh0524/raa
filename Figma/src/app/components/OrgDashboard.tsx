import { Link, useNavigate } from "react-router";
import { Dot, SectionLabel } from "./ui-components";
import { useState, useEffect, useMemo } from "react";
import { ProviderDrawer } from "./ProviderDrawer";
import { ResolveModal } from "./ResolveModal";
import { FixResubmitWizard } from "./FixResubmitWizard";
import { toast } from "sonner";
import { motion } from "motion/react";
import { listPassports, listWorkflows } from "../api";

type AttentionItem = { provider: string; issue: string; sla: string };
type SubmissionRow = { dest: string; provider: string; conf: string; time: string; key: string };
type DeadlineRow = { provider: string; item: string; days: number };
type RejectedRow = {
  id: string;
  payer: string;
  provider: string;
  reason: string;
  credential: string;
  rejectedDate: string;
  originalConf: string;
};

function providerLabel(p: any): string {
  return p?.identity?.legal_name || p?.identity?.full_name || p?.clinician_id || "Unknown";
}

function formatDest(destinationId: string): string {
  if (!destinationId) return "Destination";
  return destinationId
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatRelative(iso: string | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diffMs = Date.now() - t;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function formatShortDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildAttentionFromPassports(passports: any[]): AttentionItem[] {
  const out: AttentionItem[] = [];
  for (const p of passports) {
    const name = providerLabel(p);
    for (const lic of p?.licenses?.state_licenses || []) {
      if (!lic.verified) {
        out.push({
          provider: name,
          issue: `${lic.state} license pending verification`,
          sla: "—",
        });
      }
    }
    for (const b of p?.board_certifications || []) {
      if (!b.verified) {
        out.push({
          provider: name,
          issue: `${b.specialty || "Board"} certification not verified`,
          sla: "—",
        });
      }
    }
    const mal = p?.malpractice;
    if (!mal?.carrier && !mal?.policy_number) {
      out.push({ provider: name, issue: "Malpractice documentation incomplete", sla: "—" });
    }
  }
  return out.slice(0, 8);
}

function buildDeadlinesFromPassports(passports: any[]): DeadlineRow[] {
  const rows: DeadlineRow[] = [];
  for (const p of passports) {
    const name = providerLabel(p);
    for (const lic of p?.licenses?.state_licenses || []) {
      if (!lic.expiration_date) continue;
      const exp = new Date(lic.expiration_date);
      const days = Math.ceil((exp.getTime() - Date.now()) / 86400000);
      if (days > 0 && days <= 365) {
        rows.push({ provider: name, item: `${lic.state} medical license`, days });
      }
    }
    for (const b of p?.board_certifications || []) {
      if (!b.expiration_date) continue;
      const exp = new Date(b.expiration_date);
      const days = Math.ceil((exp.getTime() - Date.now()) / 86400000);
      if (days > 0 && days <= 365) {
        rows.push({ provider: name, item: `${b.specialty || "Board"} certification`, days });
      }
    }
  }
  rows.sort((a, b) => a.days - b.days);
  return rows.slice(0, 8);
}

function buildSubmissionsFromWorkflows(workflows: any[], idToName: Map<string, string>): SubmissionRow[] {
  const sorted = [...workflows].sort((a, b) => {
    const ta = new Date(a.updated_at || 0).getTime();
    const tb = new Date(b.updated_at || 0).getTime();
    return tb - ta;
  });
  return sorted.slice(0, 6).map((w: any) => ({
    key: w.workflow_id || Math.random().toString(36).slice(2),
    dest: formatDest(w.destination_id),
    provider: idToName.get(w.clinician_id) || w.clinician_id || "—",
    conf: String(w.workflow_id || "wf").replace(/^wf-/, "").slice(0, 12).toUpperCase(),
    time: formatRelative(w.updated_at),
  }));
}

function buildRejectedFromWorkflows(workflows: any[], idToName: Map<string, string>): RejectedRow[] {
  const flagged = workflows.filter(
    (w: any) => w.status === "rejected" || (Array.isArray(w.exceptions) && w.exceptions.length > 0),
  );
  return flagged.slice(0, 8).map((w: any, idx: number) => ({
    id: w.workflow_id || `rej-${idx}`,
    payer: formatDest(w.destination_id),
    provider: idToName.get(w.clinician_id) || w.clinician_id || "—",
    reason: (Array.isArray(w.exceptions) && w.exceptions[0]) || "Workflow requires follow-up",
    credential: "Credentialing packet",
    rejectedDate: formatShortDate(w.updated_at),
    originalConf: String(w.workflow_id || "").replace(/^wf-/, "").slice(0, 12) || "—",
  }));
}

function passportRatio(p: any): number {
  const licenses = p?.licenses?.state_licenses || [];
  const boards = p?.board_certifications || [];
  const total = licenses.length + boards.length;
  if (total === 0) return 1;
  const ok = licenses.filter((l: any) => l.verified).length + boards.filter((b: any) => b.verified).length;
  return ok / total;
}

function computeCompliance(passports: any[]): { compliant: number; inProgress: number; attention: number; blocked: number } {
  const c = { compliant: 0, inProgress: 0, attention: 0, blocked: 0 };
  for (const p of passports) {
    const r = passportRatio(p);
    if (r >= 0.95) c.compliant += 1;
    else if (r >= 0.5) c.inProgress += 1;
    else if (r >= 0.2) c.attention += 1;
    else c.blocked += 1;
  }
  return c;
}

export function OrgDashboard() {
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [drawerContext, setDrawerContext] = useState<string>("");
  const [providerCount, setProviderCount] = useState<number | null>(null);
  const [workflowCount, setWorkflowCount] = useState<number | null>(null);
  const [requestCount, setRequestCount] = useState<number | null>(null);
  const [attention, setAttention] = useState<AttentionItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineRow[]>([]);
  const [rejectedSubmissions, setRejectedSubmissions] = useState<RejectedRow[]>([]);
  const [compliance, setCompliance] = useState({ compliant: 0, inProgress: 0, attention: 0, blocked: 0 });

  useEffect(() => {
    let cancel = false;
    Promise.all([listPassports(), listWorkflows()])
      .then(([passports, workflows]) => {
        if (cancel) return;
        const plist = Array.isArray(passports) ? passports : [];
        const wlist = Array.isArray(workflows) ? workflows : [];
        const idToName = new Map<string, string>();
        plist.forEach((p: any) => {
          if (p?.clinician_id) idToName.set(p.clinician_id, providerLabel(p));
        });
        setProviderCount(plist.length);
        setWorkflowCount(wlist.length);
        setRequestCount(wlist.length);
        setAttention(buildAttentionFromPassports(plist));
        setSubmissions(buildSubmissionsFromWorkflows(wlist, idToName));
        setDeadlines(buildDeadlinesFromPassports(plist));
        setRejectedSubmissions(buildRejectedFromWorkflows(wlist, idToName));
        setCompliance(computeCompliance(plist));
      })
      .catch((e: any) => {
        if (!cancel) toast.error("Could not load dashboard", { description: String(e?.message || e) });
      });
    return () => {
      cancel = true;
    };
  }, []);

  const complianceFlex = useMemo(() => {
    const sum =
      compliance.compliant + compliance.inProgress + compliance.attention + compliance.blocked;
    if (sum === 0) return { compliant: 1, inProgress: 0, attention: 0, blocked: 0, label: "No providers yet" };
    return {
      ...compliance,
      label: `${compliance.compliant} / ${compliance.inProgress} / ${compliance.attention} / ${compliance.blocked}`,
    };
  }, [compliance]);

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<string | null>(null);
  const [fixResubmitWizardOpen, setFixResubmitWizardOpen] = useState(false);
  const [fixResubmitTarget, setFixResubmitTarget] = useState<{
    id: string;
    payer: string;
    credential: string;
    reason: string;
    rejectedDate: string;
    originalConf: string;
  } | null>(null);

  const openProvider = (name: string, ctx: string) => {
    setSelectedProvider(name);
    setDrawerContext(ctx);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-baseline justify-between mb-10">
        <div>
          <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Dashboard</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Valley Health Group</p>
        </div>
      </div>

      {/* Metrics */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-12"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
      >
        {[
          {
            label: "Providers",
            value: providerCount != null ? String(providerCount) : "—",
            href: "/app/org/providers",
          },
          {
            label: "Requests",
            value: requestCount != null ? String(requestCount) : "—",
            href: "/app/org/requests",
          },
          {
            label: "Attention",
            value: String(attention.length),
            href: "/app/org/attention",
          },
          {
            label: "Workflows",
            value: workflowCount != null ? String(workflowCount) : "—",
            href: "/app/org/submissions",
          },
          {
            label: "Deadlines",
            value: String(deadlines.length),
            href: "/app/org/monitoring",
          },
        ].map((m) => (
          <motion.div
            key={m.label}
            variants={{
              initial: { opacity: 0, y: 12 },
              animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
            }}
            role="button"
            tabIndex={0}
            onClick={() => navigate(m.href)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate(m.href);
            }}
            className="group bg-surface-elevated border border-border rounded-xl py-5 px-4 text-center cursor-pointer hover:border-foreground/30 transition-all active:scale-[0.97]"
          >
            <p className="text-[26px] tracking-[-0.02em] text-foreground tabular-nums">{m.value}</p>
            <p className="text-[14px] text-muted-foreground mt-1.5 group-hover:text-foreground/70 transition-colors">{m.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Compliance bar */}
      <motion.div
        className="bg-surface-elevated border border-border rounded-xl p-6 mb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex items-baseline justify-between mb-4">
          <SectionLabel>Compliance</SectionLabel>
          <span className="text-[14px] text-muted-foreground tabular-nums hidden sm:block">{complianceFlex.label}</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
          <div className="bg-foreground rounded-l-full" style={{ flex: complianceFlex.compliant }} />
          <div className="bg-muted-foreground/30" style={{ flex: complianceFlex.inProgress }} />
          <div className="bg-yellow" style={{ flex: complianceFlex.attention }} />
          <div className="bg-red rounded-r-full" style={{ flex: complianceFlex.blocked }} />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
          <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-foreground" /> Compliant
          </span>
          <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" /> In progress
          </span>
          <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow" /> Attention
          </span>
          <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-red" /> Blocked
          </span>
        </div>
      </motion.div>

      {/* Two-column layout for attention + submissions */}
      <motion.div
        className="grid md:grid-cols-2 gap-6 mb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Needs attention */}
        <div className="bg-surface-elevated border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <SectionLabel>Needs attention</SectionLabel>
            <Link to="/app/org/attention" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              View all &rarr;
            </Link>
          </div>
          {attention.length === 0 ? (
            <p className="text-[14px] text-muted-foreground py-2">No open issues from passport data.</p>
          ) : (
            attention.map((item, i) => (
              <div
                key={`${item.provider}-${item.issue}-${i}`}
                className={`flex items-center justify-between py-3.5 ${i < attention.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => openProvider(item.provider, item.issue)}
                    className="text-[15px] text-foreground truncate hover:underline underline-offset-2 decoration-muted-foreground/40 cursor-pointer transition-colors hover:text-foreground/80 text-left"
                  >
                    {item.provider}
                  </button>
                  <p className="text-[14px] text-muted-foreground truncate">{item.issue}</p>
                </div>
                <span
                  className={`text-[14px] shrink-0 ml-4 tabular-nums ${
                    item.sla === "Overdue" ? "text-red" : "text-text-secondary"
                  }`}
                >
                  {item.sla}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Recent submissions */}
        <div className="bg-surface-elevated border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <SectionLabel>Recent submissions</SectionLabel>
            <Link to="/app/org/submissions" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              View all &rarr;
            </Link>
          </div>
          {submissions.length === 0 ? (
            <p className="text-[14px] text-muted-foreground py-2">No workflows yet. Run a demo workflow from the API or clinician dashboard.</p>
          ) : (
            submissions.map((s, i) => (
              <div
                key={s.key}
                className={`flex items-center justify-between py-3.5 ${i < submissions.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] text-foreground truncate">{s.dest}</p>
                  <p className="text-[14px] text-muted-foreground truncate">
                    <button
                      onClick={() => openProvider(s.provider, `${s.dest} · #${s.conf}`)}
                      className="hover:underline underline-offset-2 decoration-muted-foreground/40 cursor-pointer transition-colors hover:text-muted-foreground/80"
                    >
                      {s.provider}
                    </button>
                    {" "}&middot; #{s.conf}
                  </p>
                </div>
                <span className="text-[13px] text-text-secondary shrink-0 ml-4 tabular-nums">{s.time}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Deadlines */}
      <motion.div
        className="bg-surface-elevated border border-border rounded-xl p-6 mb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex items-center justify-between mb-5">
          <SectionLabel>Upcoming deadlines</SectionLabel>
          <Link to="/app/org/monitoring" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            View all &rarr;
          </Link>
        </div>
        {deadlines.length === 0 ? (
          <p className="text-[14px] text-muted-foreground py-2">No expirations in the next year on file.</p>
        ) : (
          deadlines.map((d, i) => (
            <div
              key={`${d.provider}-${d.item}-${i}`}
              className={`flex items-center justify-between py-3.5 ${i < deadlines.length - 1 ? "border-b border-border" : ""}`}
            >
              <div>
                <button
                  onClick={() => openProvider(d.provider, `${d.item} · ${d.days}d remaining`)}
                  className="text-[15px] text-foreground hover:underline underline-offset-2 decoration-muted-foreground/40 cursor-pointer transition-colors hover:text-foreground/80 text-left"
                >
                  {d.provider}
                </button>
                <p className="text-[14px] text-muted-foreground">{d.item}</p>
              </div>
              <span className={`text-[14px] tabular-nums ${d.days <= 30 ? "text-yellow" : "text-text-secondary"}`}>{d.days}d</span>
            </div>
          ))
        )}
      </motion.div>

      {/* ─── Rejected Submissions ─── */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Rejected submissions</SectionLabel>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-red bg-red/10 border border-red/20 px-2.5 py-1 rounded-full tabular-nums">
            {rejectedSubmissions.length} to fix
          </span>
        </div>
        {rejectedSubmissions.length === 0 ? (
          <p className="text-[14px] text-muted-foreground">No rejected workflows on file.</p>
        ) : (
          <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border">
            {rejectedSubmissions.map((item) => (
              <div key={item.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <Dot status="error" />
                      <p className="text-[15px] text-foreground">{item.payer}</p>
                    </div>
                    <p className="text-[14px] text-muted-foreground mt-1 ml-[18px]">{item.reason}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 ml-[18px]">
                      <button
                        onClick={() => openProvider(item.provider, `${item.payer} rejection — ${item.credential}`)}
                        className="text-[12px] text-muted-foreground hover:text-foreground hover:underline underline-offset-2 cursor-pointer transition-colors"
                      >
                        {item.provider}
                      </button>
                      <span className="text-[12px] text-text-secondary tabular-nums">{item.id}</span>
                      <span className="text-[12px] text-text-secondary">Rejected {item.rejectedDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setFixResubmitTarget({
                          id: item.id,
                          payer: item.payer,
                          credential: item.credential,
                          reason: item.reason,
                          rejectedDate: item.rejectedDate,
                          originalConf: item.originalConf,
                        });
                        setFixResubmitWizardOpen(true);
                      }}
                      className="text-[13px] bg-foreground text-background px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      Resubmit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <ProviderDrawer
        providerName={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        context={drawerContext}
      />
      <ResolveModal
        open={resolveModalOpen}
        onClose={() => {
          setResolveModalOpen(false);
          setResolveTarget(null);
        }}
        itemLabel={resolveTarget || ""}
      />
      <FixResubmitWizard
        open={fixResubmitWizardOpen}
        onClose={() => {
          setFixResubmitWizardOpen(false);
          setFixResubmitTarget(null);
        }}
        item={fixResubmitTarget}
        isOrg
      />
    </div>
  );
}
