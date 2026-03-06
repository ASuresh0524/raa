import React from "react";
import { SectionLabel } from "./ui-components";
import { useTheme } from "./ThemeProvider";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ProviderDrawer } from "./ProviderDrawer";
import { toast } from "sonner";

const timeData = [
  { month: "Sep", days: 42 },
  { month: "Oct", days: 38 },
  { month: "Nov", days: 32 },
  { month: "Dec", days: 28 },
  { month: "Jan", days: 22 },
  { month: "Feb", days: 14 },
];

const exceptionData = [
  { name: "Missing document", value: 35 },
  { name: "Conflicting data", value: 22 },
  { name: "Expired item", value: 18 },
  { name: "Pending signature", value: 15 },
  { name: "Portal access", value: 10 },
];

const approvals = [
  { dest: "Blue Shield", approved: 12, pending: 3 },
  { dest: "Aetna", approved: 9, pending: 2 },
  { dest: "UCSF", approved: 8, pending: 1 },
  { dest: "Sutter", approved: 7, pending: 4 },
  { dest: "Stanford", approved: 6, pending: 0 },
  { dest: "Kaiser", approved: 5, pending: 2 },
];

const auditEvents = [
  { event: "Submission sent to Blue Shield", actor: "Agent", time: "12m", provider: "Dr. Sarah Chen" },
  { event: "DEA certificate verified", actor: "Agent", time: "5h", provider: "Dr. Sarah Chen" },
  { event: "Task created: Missing malpractice cert", actor: "System", time: "1d", provider: "Dr. James Wilson" },
  { event: "Provider added to roster", actor: "Admin", time: "2d", provider: "Dr. Emily Taylor" },
  { event: "Attestation signed", actor: "Clinician", time: "3d", provider: "Dr. Ahmed Hassan" },
];

/* ── Custom Bar Chart ── */
function CustomBarChart({ data, isDark }: { data: typeof timeData; isDark: boolean }) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const barFill = isDark ? "#fafafa" : "#0a0a0a";
  const barHoverFill = isDark ? "#d4d4d8" : "#3f3f46";
  const tickColor = isDark ? "#a1a1aa" : "#71717a";
  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const tipBg = isDark ? "#18181b" : "#ffffff";
  const tipBorder = isDark ? "#27272a" : "#e4e4e7";
  const tipText = isDark ? "#fafafa" : "#0a0a0a";

  const maxVal = Math.max(...data.map((d) => d.days));
  const yTicks = [0, 15, 30, 45];
  const padL = 32, padR = 8, padT = 16, padB = 28;
  const w = 360, h = 200;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const barW = Math.min(28, chartW / data.length - 8);

  return (
    <div className="relative w-full" style={{ aspectRatio: `${w}/${h}` }}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" onMouseLeave={() => setHovered(null)}>
        {/* Grid lines */}
        {yTicks.map((t) => {
          const y = padT + chartH - (t / 45) * chartH;
          return (
            <g key={`grid-${t}`}>
              <line x1={padL} x2={w - padR} y1={y} y2={y} stroke={gridColor} strokeDasharray="3 3" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fill={tickColor} fontSize="11">{t}</text>
            </g>
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const x = padL + (i + 0.5) * (chartW / data.length) - barW / 2;
          const barH = (d.days / 45) * chartH;
          const y = padT + chartH - barH;
          const r = 4;
          return (
            <g key={d.month} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <rect x={x} y={y} width={barW} height={barH} rx={r} ry={r} fill={hovered === i ? barHoverFill : barFill} className="transition-colors duration-150" />
              <text x={x + barW / 2} y={h - 8} textAnchor="middle" fill={tickColor} fontSize="11">{d.month}</text>
            </g>
          );
        })}
      </svg>
      {/* Tooltip */}
      {hovered !== null && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-[10px] shadow-lg"
          style={{
            backgroundColor: tipBg,
            border: `1px solid ${tipBorder}`,
            color: tipText,
            fontSize: 13,
            left: `${((hovered + 0.5) / data.length) * 100}%`,
            top: 0,
            transform: "translateX(-50%)",
          }}
        >
          <span className="text-muted-foreground">{data[hovered].month}:</span>{" "}
          <span className="tabular-nums">{data[hovered].days}d</span>
        </div>
      )}
    </div>
  );
}

export function OrgReports() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [hoveredSeg, setHoveredSeg] = React.useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = React.useState<string | null>(null);

  const timeRef = React.useRef<HTMLDivElement>(null);
  const exceptionsRef = React.useRef<HTMLDivElement>(null);
  const approvalsRef = React.useRef<HTMLDivElement>(null);
  const auditRef = React.useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const SHADES = isDark
    ? ["#fafafa", "#a1a1aa", "#71717a", "#3f3f46", "#27272a"]
    : ["#0a0a0a", "#52525b", "#a1a1aa", "#d4d4d8", "#e4e4e7"];

  // Custom donut chart math
  const total = exceptionData.reduce((s, d) => s + d.value, 0);
  const donutSegments = (() => {
    const cx = 100, cy = 100, outerR = 72, innerR = 45, gap = 0.02;
    let cumAngle = -Math.PI / 2;
    return exceptionData.map((d, i) => {
      const angle = (d.value / total) * Math.PI * 2 - gap;
      const startAngle = cumAngle + gap / 2;
      const endAngle = startAngle + angle;
      cumAngle += (d.value / total) * Math.PI * 2;
      const x1o = cx + outerR * Math.cos(startAngle);
      const y1o = cy + outerR * Math.sin(startAngle);
      const x2o = cx + outerR * Math.cos(endAngle);
      const y2o = cy + outerR * Math.sin(endAngle);
      const x1i = cx + innerR * Math.cos(endAngle);
      const y1i = cy + innerR * Math.sin(endAngle);
      const x2i = cx + innerR * Math.cos(startAngle);
      const y2i = cy + innerR * Math.sin(startAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const path = `M${x1o},${y1o} A${outerR},${outerR} 0 ${largeArc},1 ${x2o},${y2o} L${x1i},${y1i} A${innerR},${innerR} 0 ${largeArc},0 ${x2i},${y2i} Z`;
      return { path, fill: SHADES[i], name: d.name, value: d.value };
    });
  })();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/app/org" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-10">
        <div>
          <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Reports</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Analytics and audit trail.</p>
        </div>
        <button
          onClick={() => {
            const sections = [
              ["--- Time to credential ---", "Month,Days", ...timeData.map((d) => `${d.month},${d.days}`)],
              ["", "--- Exception causes ---", "Cause,Percent", ...exceptionData.map((d) => `${d.name},${d.value}%`)],
              ["", "--- Approvals by destination ---", "Destination,Approved,Pending", ...approvals.map((a) => `${a.dest},${a.approved},${a.pending}`)],
              ["", "--- Audit trail ---", "Event,Actor,Time,Provider", ...auditEvents.map((e) => `"${e.event}",${e.actor},${e.time},${e.provider}`)],
            ];
            const csv = sections.flat().join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "reports.csv";
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Export downloaded", { description: "reports.csv" });
          }}
          className="text-[14px] border border-border bg-surface-elevated px-5 py-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-full sm:w-auto"
        >
          Export
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Avg. time", value: "14d", action: () => scrollTo(timeRef) },
          { label: "Exceptions", value: "8", action: () => scrollTo(exceptionsRef) },
          { label: "Approvals", value: "23", action: () => scrollTo(approvalsRef) },
          { label: "Audit events", value: "1,247", action: () => scrollTo(auditRef) },
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

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div ref={timeRef} className="bg-surface-elevated border border-border rounded-xl p-6 scroll-mt-24">
          <SectionLabel>Time to credential</SectionLabel>
          <p className="text-[14px] text-muted-foreground mt-1 mb-6">Average days, last 6 months</p>
          <CustomBarChart data={timeData} isDark={isDark} />
        </div>
        <div ref={exceptionsRef} className="bg-surface-elevated border border-border rounded-xl p-6 scroll-mt-24">
          <SectionLabel>Exception causes</SectionLabel>
          <p className="text-[14px] text-muted-foreground mt-1 mb-6">This quarter</p>
          <div className="relative flex items-center justify-center" style={{ height: 200 }}>
            <svg viewBox="0 0 200 200" width="200" height="200" onMouseLeave={() => setHoveredSeg(null)}>
              {donutSegments.map((seg, i) => (
                <path
                  key={seg.name}
                  d={seg.path}
                  fill={seg.fill}
                  opacity={hoveredSeg !== null && hoveredSeg !== i ? 0.4 : 1}
                  className="transition-opacity duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredSeg(i)}
                />
              ))}
            </svg>
            {hoveredSeg !== null && (
              <div
                className="absolute pointer-events-none px-3 py-1.5 rounded-lg shadow-lg bg-surface-elevated border border-border"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <span className="text-[13px] text-foreground">{donutSegments[hoveredSeg].name}</span>
                <span className="text-[13px] text-foreground ml-1.5 tabular-nums">{donutSegments[hoveredSeg].value}%</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center mt-4">
            {exceptionData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SHADES[i] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Approvals table */}
        <div ref={approvalsRef} className="bg-surface-elevated border border-border rounded-xl p-6 scroll-mt-24">
          <SectionLabel>Approvals by destination</SectionLabel>
          <div className="mt-5">
            {approvals.map((a, i) => (
              <div key={a.dest} className={`flex items-center justify-between py-3.5 ${
                i < approvals.length - 1 ? "border-b border-border" : ""
              }`}>
                <span className="text-[15px] text-foreground">{a.dest}</span>
                <div className="flex items-center gap-4">
                  <span className="text-[14px] text-foreground tabular-nums">{a.approved}</span>
                  {a.pending > 0 && <span className="text-[14px] text-muted-foreground tabular-nums">{a.pending} pending</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit */}
        <div ref={auditRef} className="bg-surface-elevated border border-border rounded-xl p-6 scroll-mt-24">
          <SectionLabel>Recent audit events</SectionLabel>
          <div className="mt-5">
            {auditEvents.map((e, i) => (
              <div key={e.event} className={`py-3.5 ${
                i < auditEvents.length - 1 ? "border-b border-border" : ""
              }`}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[15px] text-foreground truncate">{e.event}</p>
                  <span className="text-[13px] text-text-secondary shrink-0 tabular-nums">{e.time}</span>
                </div>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  <button
                    onClick={() => setSelectedProvider(e.provider)}
                    className="text-foreground hover:underline underline-offset-2 cursor-pointer transition-colors"
                  >
                    {e.provider}
                  </button>
                  {" "}&middot; {e.actor}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProviderDrawer
        providerName={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        context="reports"
      />
    </div>
  );
}