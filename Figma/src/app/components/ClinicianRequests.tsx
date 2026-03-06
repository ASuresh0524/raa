import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { useCredentialing } from "./CredentialingContext";
import { SectionLabel } from "./ui-components";

/** Stage pipeline labels */
const STAGE_LABELS = ["Intake", "Verify", "Assemble", "Submit", "Review", "Approved"] as const;

function Stage({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STAGE_LABELS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${i <= current ? "text-foreground" : "text-muted-foreground/40"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${i < current ? "bg-green" : i === current ? "bg-foreground" : "bg-border"}`} />
            <span className="text-[13px]">{s}</span>
          </div>
          {i < STAGE_LABELS.length - 1 && <div className={`w-4 h-px ${i < current ? "bg-green" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

const ACTIVE_REQUESTS = [
  { id: "REQ-001", type: "Payer enrollment", dest: "Blue Shield CA", by: "Valley Health Group", date: "Feb 15", stage: 4, conf: "BS-2026-8843" },
  { id: "REQ-002", type: "Facility credentialing", dest: "UCSF Medical Center", by: "Self-initiated", date: "Feb 20", stage: 2, conf: null },
  { id: "REQ-003", type: "Payer enrollment", dest: "Aetna", by: "Valley Health Group", date: "Jan 28", stage: 5, conf: "AET-90421" },
] as const;

const PAST_REQUESTS = [
  { type: "Recredentialing", dest: "Sutter Health", date: "Nov 2025", conf: "SH-4421" },
  { type: "Facility credentialing", dest: "Stanford Health Care", date: "Sep 2025", conf: "SHC-1102" },
] as const;

export function ClinicianRequests(): React.JSX.Element {
  const { done } = useCredentialing();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/app/clinician" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Requests</h1>
      <p className="text-[15px] text-muted-foreground mt-1 mb-10">Active and completed credentialing requests.</p>

      {!done ? (
        <div className="bg-surface-elevated border border-border rounded-xl p-10 text-center">
          <p className="text-[15px] text-foreground mb-1">No active requests</p>
          <p className="text-[14px] text-muted-foreground">
            Credentialing requests will appear here once the agent begins processing submissions.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-14">
            {ACTIVE_REQUESTS.map((req) => (
              <Link key={req.id} to={`/app/clinician/requests/${req.id}`} className="block bg-surface-elevated border border-border rounded-xl p-6 hover:border-foreground/20 transition-colors">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-[16px] text-foreground">{req.type}</p>
                  <span className="text-[13px] text-text-secondary tabular-nums">{req.id}</span>
                </div>
                <p className="text-[14px] text-muted-foreground">{req.dest} &middot; initiated by {req.by} &middot; {req.date}</p>
                {req.conf && <p className="text-[13px] text-text-secondary mt-1">#{req.conf}</p>}
                <div className="mt-5 overflow-x-auto">
                  <Stage current={req.stage} />
                </div>
              </Link>
            ))}
          </div>

          <SectionLabel>Completed</SectionLabel>
          <div className="mt-4">
            {PAST_REQUESTS.map((req, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <p className="text-[15px] text-foreground">{req.type} &mdash; {req.dest}</p>
                  <p className="text-[13px] text-text-secondary">#{req.conf}</p>
                </div>
                <span className="text-[14px] text-text-secondary">{req.date}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ClinicianRequests;