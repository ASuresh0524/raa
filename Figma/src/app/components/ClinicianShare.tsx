/** ClinicianShare v3 — full rewrite for cache invalidation */
import React from "react";
import { Copy, Check, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router";
import { useCredentialing } from "./CredentialingContext";
import { SectionLabel, Dot } from "./ui-components";

/* ---- data ---- */
type DestType = "Facility" | "Payer" | "Staffing agency";
const DEST_OPTIONS: DestType[] = ["Facility", "Payer", "Staffing agency"];

interface SummaryRow { section: string; count: number; verified: number }
const ROWS: SummaryRow[] = [
  { section: "Identity", count: 5, verified: 5 },
  { section: "Licenses", count: 3, verified: 3 },
  { section: "Board certification", count: 2, verified: 1 },
  { section: "DEA / CSR", count: 2, verified: 1 },
  { section: "Education", count: 4, verified: 4 },
  { section: "Malpractice", count: 1, verified: 0 },
];

const TOTAL_VERIFIED = ROWS.reduce((a, r) => a + r.verified, 0);
const TOTAL_ITEMS = ROWS.reduce((a, r) => a + r.count, 0);

/* ---- empty state ---- */
function EmptyState(): React.JSX.Element {
  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-10 text-center">
      <p className="text-[15px] text-foreground mb-1">Nothing to share yet</p>
      <p className="text-[14px] text-muted-foreground">
        You'll be able to share your credential passport once the agent finishes building it.
      </p>
    </div>
  );
}

/* ---- main component ---- */
export function ClinicianShare(): React.JSX.Element {
  const [selected, setSelected] = React.useState<DestType | null>(null);
  const [generated, setGenerated] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const { done } = useCredentialing();

  const handleCopy = React.useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link to="/app/clinician" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Share passport</h1>
      <p className="text-[15px] text-muted-foreground mt-1 mb-10">Generate a verified packet for any destination.</p>

      {!done ? (
        <EmptyState />
      ) : (
        <>
          {/* Destination */}
          <SectionLabel>Destination type</SectionLabel>
          <div className="flex flex-wrap gap-3 mt-4 mb-10">
            {DEST_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => { setSelected(d); setGenerated(false); }}
                className={`px-5 py-2.5 text-[14px] rounded-lg cursor-pointer transition-all ${
                  selected === d
                    ? "bg-foreground text-background"
                    : "bg-surface-elevated border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Summary */}
          <SectionLabel>Included</SectionLabel>
          <div className="mt-4 mb-10 bg-surface-elevated border border-border rounded-xl overflow-hidden">
            {ROWS.map((s, i) => (
              <div key={s.section} className={`flex items-center justify-between px-5 py-4 ${
                i < ROWS.length - 1 ? "border-b border-border" : ""
              }`}>
                <span className="text-[15px] text-foreground">{s.section}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[14px] text-muted-foreground tabular-nums">{s.verified}/{s.count}</span>
                  <Dot status={s.verified === s.count ? "verified" : "warning"} />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-secondary/30">
              <span className="text-[15px] text-foreground">Total</span>
              <span className="text-[15px] text-foreground tabular-nums">{TOTAL_VERIFIED}/{TOTAL_ITEMS}</span>
            </div>
          </div>

          {/* Generate */}
          {selected && !generated && (
            <button
              onClick={() => setGenerated(true)}
              className="w-full text-[15px] bg-foreground text-background py-3 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Generate packet
            </button>
          )}

          {generated && (
            <div className="bg-surface-elevated border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Dot status="verified" />
                <p className="text-[16px] text-foreground">Packet generated</p>
              </div>
              <div className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3">
                <code className="text-[14px] text-muted-foreground truncate">credenza.app/share/sc-2026-abc123</code>
                <div className="flex items-center gap-1">
                  <a
                    href="mailto:?subject=Credential%20Packet&body=Here%20is%20my%20verified%20credential%20packet%3A%20https%3A%2F%2Fcredenza.app%2Fshare%2Fsc-2026-abc123"
                    className="text-foreground ml-3 cursor-pointer p-1.5 hover:bg-background rounded-lg transition-colors"
                  >
                    <Mail size={16} />
                  </a>
                  <button
                    onClick={handleCopy}
                    className="text-foreground cursor-pointer p-1.5 hover:bg-background rounded-lg transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ClinicianShare;