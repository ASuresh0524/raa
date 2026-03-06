import { Link, useNavigate } from "react-router";
import { Dot, SectionLabel } from "./ui-components";
import { useState } from "react";
import { ProviderDrawer } from "./ProviderDrawer";

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

export function OrgDashboard() {
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [drawerContext, setDrawerContext] = useState<string>("");

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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-12">
        {[
          { label: "Providers", value: "147", href: "/app/org/providers" },
          { label: "Requests", value: "24", href: "/app/org/requests" },
          { label: "Attention", value: "5", href: "/app/org/attention" },
          { label: "Submissions", value: "12", href: "/app/org/submissions" },
          { label: "Deadlines", value: "8", href: "/app/org/monitoring" },
        ].map((m) => (
          <div
            key={m.label}
            role="button"
            tabIndex={0}
            onClick={() => navigate(m.href)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(m.href); }}
            className="group bg-surface-elevated border border-border rounded-xl py-5 px-4 text-center cursor-pointer hover:border-foreground/30 transition-all active:scale-[0.97]"
          >
            <p className="text-[26px] tracking-[-0.02em] text-foreground tabular-nums">{m.value}</p>
            <p className="text-[14px] text-muted-foreground mt-1.5 group-hover:text-foreground/70 transition-colors">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Compliance bar */}
      <div className="bg-surface-elevated border border-border rounded-xl p-6 mb-12">
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
      </div>

      {/* Two-column layout for attention + submissions */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
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
            <Link to="/app/org/requests" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">View all &rarr;</Link>
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
      </div>

      {/* Deadlines */}
      <div className="bg-surface-elevated border border-border rounded-xl p-6">
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
      </div>

      <ProviderDrawer
        providerName={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        context={drawerContext}
      />
    </div>
  );
}