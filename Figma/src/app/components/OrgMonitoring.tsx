import { Dot, SectionLabel } from "./ui-components";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { ProviderDrawer } from "./ProviderDrawer";

const expiring = [
  { provider: "Dr. Sarah Chen", item: "ABIM Board Cert", exp: "May 15, 2026", days: 72, status: "Renewal initiated" },
  { provider: "Dr. Robert Kim", item: "CA Medical License", exp: "Apr 20, 2026", days: 47, status: "Agent monitoring" },
  { provider: "Dr. Lisa Park", item: "Malpractice Insurance", exp: "Apr 5, 2026", days: 32, status: "Awaiting document" },
  { provider: "Dr. Michael Brown", item: "NY Medical License", exp: "Apr 15, 2026", days: 42, status: "Renewal initiated" },
  { provider: "Dr. Michael Brown", item: "DEA Certificate", exp: "Jun 1, 2026", days: 89, status: "Agent monitoring" },
];

const sanctions = [
  { provider: "Dr. Sarah Chen", checked: "Mar 4", result: "Clear" },
  { provider: "Dr. James Wilson", checked: "Mar 4", result: "Clear" },
  { provider: "Dr. Maria Santos", checked: "Mar 4", result: "Clear" },
  { provider: "Dr. Robert Kim", checked: "Mar 4", result: "Clear" },
  { provider: "Dr. Lisa Park", checked: "Mar 3", result: "Clear" },
];

const recred = [
  { provider: "Dr. Emily Taylor", facility: "East Clinic", due: "Jun 2026" },
  { provider: "Dr. Ahmed Hassan", facility: "Main Campus", due: "Aug 2026" },
  { provider: "Dr. Sarah Chen", facility: "Main Campus", due: "Oct 2026" },
];

export function OrgMonitoring() {
  const [verifying, setVerifying] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [drawerContext, setDrawerContext] = useState("");

  const expiringRef = useRef<HTMLDivElement>(null);
  const sanctionsRef = useRef<HTMLDivElement>(null);
  const recredRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openProvider = (name: string, ctx: string) => {
    setSelectedProvider(name);
    setDrawerContext(ctx);
  };

  const handleReVerify = () => {
    if (verifying) return;
    setVerifying(true);
    toast("Re-verification started", { description: "Running sanctions & license checks for all providers…" });
    setTimeout(() => {
      setVerifying(false);
      toast.success("Re-verification complete", { description: "All 147 providers cleared." });
    }, 2500);
  };

  const handleExport = () => {
    const headers = ["Provider", "Item", "Expiration", "Days", "Status"];
    const rows = expiring.map((e) => [e.provider, e.item, e.exp, e.days, e.status]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compliance-monitoring.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded", { description: "compliance-monitoring.csv" });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/app/org" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-10">
        <div>
          <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Compliance monitoring</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Continuous verification and expiration management.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReVerify}
            disabled={verifying}
            className="text-[14px] border border-border bg-surface-elevated px-5 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? "Verifying…" : "Re-verify all"}
          </button>
          <button
            onClick={handleExport}
            className="text-[14px] border border-border bg-surface-elevated px-5 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Export
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Compliance", value: "94%", action: () => scrollTo(expiringRef) },
          { label: "Expiring (90d)", value: "5", action: () => scrollTo(expiringRef) },
          { label: "Sanctions clear", value: "147/147", action: () => scrollTo(sanctionsRef) },
          { label: "Recredentialing", value: "3", action: () => scrollTo(recredRef) },
        ].map((m) => (
          <div
            key={m.label}
            role="button"
            tabIndex={0}
            onClick={m.action}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") m.action(); }}
            className="group bg-surface-elevated border border-border rounded-xl py-5 px-4 text-center cursor-pointer hover:border-foreground/30 transition-all active:scale-[0.97]"
          >
            <p className="text-[22px] tracking-[-0.02em] text-foreground tabular-nums">{m.value}</p>
            <p className="text-[14px] text-muted-foreground mt-1.5 group-hover:text-foreground/70 transition-colors">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Expiring */}
      <div ref={expiringRef} className="bg-surface-elevated border border-border rounded-xl p-6 mb-8 scroll-mt-24">
        <SectionLabel>Expiring soon</SectionLabel>
        <div className="mt-5">
          {expiring.map((item, i) => (
            <div key={i} className={`flex items-center justify-between py-4 ${
              i < expiring.length - 1 ? "border-b border-border" : ""
            }`}>
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => openProvider(item.provider, `${item.item} · ${item.status}`)}
                  className="text-[15px] text-foreground hover:underline underline-offset-2 decoration-muted-foreground/40 cursor-pointer transition-colors hover:text-foreground/80 text-left"
                >
                  {item.provider}
                </button>
                <p className="text-[14px] text-muted-foreground">{item.item} &middot; {item.status}</p>
              </div>
              <div className="flex items-center gap-5 shrink-0 ml-4">
                <span className="text-[13px] text-text-secondary hidden sm:block">{item.exp}</span>
                <button
                  onClick={() => toast.success("Resolving", { description: `${item.item} · ${item.provider}` })}
                  className="text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  Resolve
                </button>
                <span className={`text-[14px] tabular-nums ${item.days <= 30 ? "text-yellow" : "text-text-secondary"}`}>
                  {item.days}d
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sanctions */}
        <div ref={sanctionsRef} className="bg-surface-elevated border border-border rounded-xl p-6 scroll-mt-24">
          <SectionLabel>Sanctions</SectionLabel>
          <div className="mt-5">
            {sanctions.map((s, i) => (
              <div key={i} className={`flex items-center justify-between py-3.5 ${
                i < sanctions.length - 1 ? "border-b border-border" : ""
              }`}>
                <button
                  onClick={() => openProvider(s.provider, `Sanctions check · ${s.result}`)}
                  className="text-[15px] text-foreground hover:underline underline-offset-2 decoration-muted-foreground/40 cursor-pointer transition-colors hover:text-foreground/80 text-left"
                >
                  {s.provider}
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-text-secondary">{s.checked}</span>
                  <div className="flex items-center gap-2">
                    <Dot status="verified" />
                    <span className="text-[14px] text-muted-foreground">Clear</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recredentialing */}
        <div ref={recredRef} className="bg-surface-elevated border border-border rounded-xl p-6 scroll-mt-24">
          <SectionLabel>Upcoming recredentialing</SectionLabel>
          <div className="mt-5">
            {recred.map((r, i) => (
              <div key={i} className={`flex items-center justify-between py-3.5 ${
                i < recred.length - 1 ? "border-b border-border" : ""
              }`}>
                <div>
                  <button
                    onClick={() => openProvider(r.provider, `Recredentialing · ${r.facility}`)}
                    className="text-[15px] text-foreground hover:underline underline-offset-2 decoration-muted-foreground/40 cursor-pointer transition-colors hover:text-foreground/80 text-left"
                  >
                    {r.provider}
                  </button>
                  <p className="text-[14px] text-muted-foreground">{r.facility}</p>
                </div>
                <span className="text-[14px] text-text-secondary">{r.due}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ProviderDrawer
        providerName={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        context={drawerContext}
      />
    </div>
  );
}