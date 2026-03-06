import { useState } from "react";
import { Link } from "react-router";
import { Dot } from "./ui-components";
import { Search, X, ArrowLeft } from "lucide-react";

const providers = [
  { id: "1", name: "Dr. Sarah Chen", type: "MD" as const, specialty: "Internal Medicine", facility: "Main Campus", pct: 93, blockers: 0, exp: 1, stage: "Active", status: "verified" as const },
  { id: "2", name: "Dr. James Wilson", type: "MD" as const, specialty: "Cardiology", facility: "Main Campus", pct: 78, blockers: 1, exp: 0, stage: "In review", status: "pending" as const },
  { id: "3", name: "Dr. Maria Santos", type: "MD" as const, specialty: "Pediatrics", facility: "East Clinic", pct: 85, blockers: 0, exp: 1, stage: "Active", status: "verified" as const },
  { id: "4", name: "Dr. Robert Kim", type: "MD" as const, specialty: "Orthopedics", facility: "Main Campus", pct: 60, blockers: 2, exp: 1, stage: "Blocked", status: "error" as const },
  { id: "5", name: "Lisa Park", type: "RN" as const, specialty: "Nurse Practitioner", facility: "West Clinic", pct: 72, blockers: 1, exp: 0, stage: "Verify", status: "pending" as const },
  { id: "6", name: "Dr. Ahmed Hassan", type: "MD" as const, specialty: "Neurology", facility: "Main Campus", pct: 95, blockers: 0, exp: 0, stage: "Active", status: "verified" as const },
  { id: "7", name: "Emily Taylor", type: "RN" as const, specialty: "Registered Nurse", facility: "East Clinic", pct: 100, blockers: 0, exp: 0, stage: "Active", status: "verified" as const },
  { id: "8", name: "Karen Mitchell", type: "RN" as const, specialty: "Licensed Practical Nurse", facility: "West Clinic", pct: 88, blockers: 0, exp: 2, stage: "Active", status: "warning" as const },
];

export function OrgProviders() {
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = providers.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.specialty.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link to="/app/org" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Providers</h1>
          <p className="text-[15px] text-muted-foreground mt-1">{providers.length} in roster</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer w-full sm:w-auto"
        >
          Add clinician
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search providers..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-surface-elevated border border-border rounded-xl pl-10 pr-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-surface-elevated border border-border rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[12px] text-text-secondary uppercase tracking-[0.06em] py-4 px-5">Provider</th>
              <th className="text-left text-[12px] text-text-secondary uppercase tracking-[0.06em] py-4 px-5 hidden md:table-cell">Facility</th>
              <th className="text-right text-[12px] text-text-secondary uppercase tracking-[0.06em] py-4 px-5">Passport</th>
              <th className="text-right text-[12px] text-text-secondary uppercase tracking-[0.06em] py-4 px-5 hidden lg:table-cell">Blockers</th>
              <th className="text-right text-[12px] text-text-secondary uppercase tracking-[0.06em] py-4 px-5 hidden lg:table-cell">Expiring</th>
              <th className="text-left text-[12px] text-text-secondary uppercase tracking-[0.06em] py-4 px-5">Stage</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="py-4 px-5">
                  <Link to={`/app/org/providers/${p.id}`} className="group">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] text-foreground group-hover:underline underline-offset-2 decoration-muted-foreground/30">{p.name}</p>
                      <span className={`inline-flex items-center text-[10px] tracking-[0.06em] px-1.5 py-px rounded border shrink-0 ${
                        p.type === "MD"
                          ? "text-muted-foreground border-border"
                          : "text-muted-foreground border-border bg-foreground/[0.04]"
                      }`}>{p.type}</span>
                    </div>
                    <p className="text-[14px] text-muted-foreground">{p.specialty}</p>
                  </Link>
                </td>
                <td className="py-4 px-5 hidden md:table-cell">
                  <span className="text-[14px] text-muted-foreground">{p.facility}</span>
                </td>
                <td className="py-4 px-5 text-right">
                  <span className="text-[15px] text-foreground tabular-nums">{p.pct}%</span>
                </td>
                <td className="py-4 px-5 text-right hidden lg:table-cell">
                  <span className={`text-[14px] tabular-nums ${p.blockers > 0 ? "text-red" : "text-muted-foreground/30"}`}>{p.blockers}</span>
                </td>
                <td className="py-4 px-5 text-right hidden lg:table-cell">
                  <span className={`text-[14px] tabular-nums ${p.exp > 0 ? "text-yellow" : "text-muted-foreground/30"}`}>{p.exp}</span>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2.5">
                    <Dot status={p.status} />
                    <span className="text-[14px] text-muted-foreground">{p.stage}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-6">
          <div className="bg-background border border-border rounded-xl w-full max-w-md p-7 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[18px] text-foreground">Add clinician</p>
                <p className="text-[14px] text-muted-foreground mt-1">Invite by email or import a roster.</p>
              </div>
              <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 hover:bg-secondary rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <input
              type="email"
              placeholder="clinician@example.com"
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all mb-4"
            />
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[13px] text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <button className="w-full border border-dashed border-border rounded-xl py-5 text-[14px] text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-colors cursor-pointer">
              Import CSV
            </button>
            <div className="flex justify-end gap-3 mt-7">
              <button onClick={() => setAddOpen(false)} className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={() => setAddOpen(false)} className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer">Send invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}