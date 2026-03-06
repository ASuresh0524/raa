import { Link, useNavigate } from "react-router";
import { Dot, SectionLabel } from "./ui-components";
import { useState } from "react";
import { ProviderDrawer } from "./ProviderDrawer";
import { ResolveModal } from "./ResolveModal";
import { FixResubmitWizard } from "./FixResubmitWizard";
import { toast } from "sonner";
import { motion } from "motion/react";

const attention = [
  { provider: "Dr. James Wilson", issue: "Missing malpractice certificate", sla: "2d" },
  { provider: "Dr. Maria Santos", issue: "Conflicting NPI address", sla: "5d" },
  { provider: "Dr. Robert Kim", issue: "Board certification expired", sla: "Overdue" },
  { provider: "Dr. Lisa Park", issue: "DEA certificate not found", sla: "7d" },
];

const submissions = [
  { dest: "Blue Shield CA", provider: "Dr. Sarah Chen", conf: "BS-2026-8843", time: "12m" },
  { dest: "Aetna", provider: "Dr. Sarah Chen", conf: "AET-90421", time: "3h" },
  { dest: "UCSF Medical Center", provider: "Dr. James Wilson", conf: "UCSF-26-1102", time: "1d" },
];

const deadlines = [
  { provider: "Dr. Sarah Chen", item: "ABIM Board Cert", days: 60 },
  { provider: "Dr. Robert Kim", item: "CA Medical License", days: 45 },
  { provider: "Dr. Lisa Park", item: "Malpractice Insurance", days: 30 },
];

const rejectedSubmissions = [
  {
    id: "REJ-001",
    payer: "Anthem Blue Cross",
    provider: "Dr. Sarah Chen",
    reason: "Malpractice certificate expired — current policy required",
    credential: "Malpractice Insurance",
    rejectedDate: "Feb 28",
    originalConf: "ANT-26-3301",
  },
  {
    id: "REJ-002",
    payer: "Molina Healthcare",
    provider: "Dr. Sarah Chen",
    reason: "DEA registration address does not match NPI practice location",
    credential: "DEA Registration",
    rejectedDate: "Feb 25",
    originalConf: "MOL-26-1190",
  },
  {
    id: "REJ-003",
    payer: "Centene",
    provider: "Dr. Lisa Park",
    reason: "Board certification not found — ABMS returned no matching record",
    credential: "Board Certification",
    rejectedDate: "Feb 20",
    originalConf: "CEN-26-6653",
  },
];

export function OrgDashboard() {
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [drawerContext, setDrawerContext] = useState<string>("");
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<string | null>(null);
  const [fixResubmitWizardOpen, setFixResubmitWizardOpen] = useState(false);
  const [fixResubmitTarget, setFixResubmitTarget] = useState<{
    id: string; payer: string; credential: string; reason: string; rejectedDate: string; originalConf: string;
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
          { label: "Providers", value: "147", href: "/app/org/providers" },
          { label: "Requests", value: "24", href: "/app/org/requests" },
          { label: "Attention", value: "5", href: "/app/org/attention" },
          { label: "Submissions", value: "12", href: "/app/org/submissions" },
          { label: "Deadlines", value: "8", href: "/app/org/monitoring" },
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
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(m.href); }}
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
          <span className="text-[14px] text-muted-foreground tabular-nums hidden sm:block">89 / 18 / 5 / 3</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
          <div className="bg-foreground rounded-l-full" style={{ flex: 89 }} />
          <div className="bg-muted-foreground/30" style={{ flex: 18 }} />
          <div className="bg-yellow" style={{ flex: 5 }} />
          <div className="bg-red rounded-r-full" style={{ flex: 3 }} />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
          <span className="flex items-center gap-2 text-[13px] text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full bg-foreground" /> Compliant</span>
          <span className="flex items-center gap-2 text-[13px] text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" /> In progress</span>
          <span className="flex items-center gap-2 text-[13px] text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full bg-yellow" /> Attention</span>
          <span className="flex items-center gap-2 text-[13px] text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full bg-red" /> Blocked</span>
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
            <Link to="/app/org/attention" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">View all &rarr;</Link>
          </div>
          {attention.map((item, i) => (
            <div key={i} className={`flex items-center justify-between py-3.5 ${
              i < attention.length - 1 ? "border-b border-border" : ""
            }`}>
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => openProvider(item.provider, item.issue)}
                  className="text-[15px] text-foreground truncate hover:underline underline-offset-2 decoration-muted-foreground/40 cursor-pointer transition-colors hover:text-foreground/80 text-left"
                >
                  {item.provider}
                </button>
                <p className="text-[14px] text-muted-foreground truncate">{item.issue}</p>
              </div>
              <span className={`text-[14px] shrink-0 ml-4 tabular-nums ${item.sla === "Overdue" ? "text-red" : "text-text-secondary"}`}>
                {item.sla}
              </span>
            </div>
          ))}
        </div>

        {/* Recent submissions */}
        <div className="bg-surface-elevated border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <SectionLabel>Recent submissions</SectionLabel>
            <Link to="/app/org/submissions" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">View all &rarr;</Link>
          </div>
          {submissions.map((s, i) => (
            <div key={i} className={`flex items-center justify-between py-3.5 ${
              i < submissions.length - 1 ? "border-b border-border" : ""
            }`}>
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
          ))}
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
          <Link to="/app/org/monitoring" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">View all &rarr;</Link>
        </div>
        {deadlines.map((d, i) => (
          <div key={i} className={`flex items-center justify-between py-3.5 ${
            i < deadlines.length - 1 ? "border-b border-border" : ""
          }`}>
            <div>
              <button
                onClick={() => openProvider(d.provider, `${d.item} · ${d.days}d remaining`)}
                className="text-[15px] text-foreground hover:underline underline-offset-2 decoration-muted-foreground/40 cursor-pointer transition-colors hover:text-foreground/80 text-left"
              >
                {d.provider}
              </button>
              <p className="text-[14px] text-muted-foreground">{d.item}</p>
            </div>
            <span className={`text-[14px] tabular-nums ${d.days <= 30 ? "text-yellow" : "text-text-secondary"}`}>
              {d.days}d
            </span>
          </div>
        ))}
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
      </motion.div>

      <ProviderDrawer
        providerName={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        context={drawerContext}
      />
      <ResolveModal
        open={resolveModalOpen}
        onClose={() => { setResolveModalOpen(false); setResolveTarget(null); }}
        itemLabel={resolveTarget || ""}
      />
      <FixResubmitWizard
        open={fixResubmitWizardOpen}
        onClose={() => { setFixResubmitWizardOpen(false); setFixResubmitTarget(null); }}
        item={fixResubmitTarget}
        isOrg
      />
    </div>
  );
}