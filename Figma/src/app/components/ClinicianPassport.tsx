/* ClinicianPassport – force cache bust */
import React from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { useCredentialing } from "./CredentialingContext";
import { SectionLabel, Dot } from "./ui-components";

// ── Flow phases ──
const phases = [
  { key: "request", label: "Request", done: true },
  { key: "gather", label: "Gathering", done: true },
  { key: "verify", label: "Verifying", done: true },
  { key: "passport", label: "Passport ready", done: true },
  { key: "monitor", label: "Monitoring", done: false, active: true },
];

// ── Build timeline — how the passport was assembled ──
const buildTimeline = [
  { label: "Credentialing request received", detail: "Valley Health Group — payer enrollment", time: "Feb 12", status: "verified" as const },
  { label: "Dr. Chen granted consent", detail: "OAuth connection established", time: "Feb 12", status: "verified" as const },
  { label: "Agent started credential retrieval", detail: "Searching 14 primary sources simultaneously", time: "Feb 12", status: "verified" as const },
  { label: "NPI registration pulled", detail: "NPPES — NPI 1234567890 confirmed", time: "Feb 12", status: "verified" as const },
  { label: "3 medical licenses retrieved", detail: "CA, NY, FL — all active and current", time: "Feb 13", status: "verified" as const },
  { label: "Board certifications verified", detail: "ABIM Internal Medicine & Geriatric Medicine", time: "Feb 14", status: "verified" as const },
  { label: "ABIM IM expiring soon", detail: "Expires May 2026 — renewal auto-triggered", time: "Feb 14", status: "warning" as const },
  { label: "DEA certificate extracted", detail: "#FC1234567 — exp Mar 2028 via DEA CSOS", time: "Feb 15", status: "verified" as const },
  { label: "CA CSR not yet found", detail: "Searching state pharmacy board…", time: "Feb 15", status: "pending" as const },
  { label: "Education & training confirmed", detail: "Stanford SoM → UCSF IM → UCSF Geriatrics via AMA Masterfile", time: "Feb 16", status: "verified" as const },
  { label: "Malpractice insurance not found", detail: "Task created — upload required from clinician", time: "Feb 17", status: "error" as const },
  { label: "Identity fields verified", detail: "5/5 identity fields confirmed across sources", time: "Feb 18", status: "verified" as const },
  { label: "Practice address conflict detected", detail: "NPI says 455 Sutter, CA board says 450 Sutter — task created", time: "Feb 18", status: "warning" as const },
  { label: "Passport assembled", detail: "14/17 credentials verified — 2 tasks pending", time: "Feb 20", status: "verified" as const },
  { label: "Continuous monitoring activated", detail: "Daily sanctions, weekly license checks, monthly full re-verify", time: "Feb 20", status: "verified" as const },
];

// ── Credential sections ──
interface Field {
  label: string;
  value: string;
  status: "verified" | "warning" | "error" | "pending";
  verified: string;
  exp?: string;
  source: string;
}

interface Section {
  name: string;
  fields: Field[];
}

const sections: Section[] = [
  {
    name: "Identity",
    fields: [
      { label: "Full name", value: "Sarah A. Chen, MD", status: "verified", verified: "Mar 1", source: "NPI Registry" },
      { label: "NPI", value: "1234567890", status: "verified", verified: "Mar 1", source: "NPPES" },
      { label: "Date of birth", value: "Jan 15, 1985", status: "verified", verified: "Feb 20", source: "Identity doc" },
      { label: "SSN (last 4)", value: "••••7890", status: "verified", verified: "Feb 20", source: "Identity doc" },
      { label: "Practice address", value: "450 Sutter St, SF, CA", status: "warning", verified: "Feb 28", source: "Self-reported" },
    ],
  },
  {
    name: "Licenses",
    fields: [
      { label: "CA Medical License", value: "#MD-48291", status: "verified", verified: "Mar 1", exp: "Dec 2027", source: "CA Medical Board" },
      { label: "NY Medical License", value: "#NY-29183", status: "verified", verified: "Feb 28", exp: "Jun 2027", source: "NY OPMC" },
      { label: "FL Medical License", value: "#FL-ME-10284", status: "verified", verified: "Feb 28", exp: "Jan 2028", source: "FL DOH" },
    ],
  },
  {
    name: "Board certification",
    fields: [
      { label: "Internal Medicine", value: "ABIM", status: "warning", verified: "Feb 25", exp: "May 2026", source: "ABIM Portal" },
      { label: "Geriatric Medicine", value: "ABIM", status: "verified", verified: "Feb 25", exp: "Dec 2029", source: "ABIM Portal" },
    ],
  },
  {
    name: "DEA / CSR",
    fields: [
      { label: "DEA Certificate", value: "#FC1234567", status: "verified", verified: "Mar 1", exp: "Mar 2028", source: "DEA CSOS" },
      { label: "CA CSR", value: "Pending", status: "pending", verified: "—", source: "Searching" },
    ],
  },
  {
    name: "Education & training",
    fields: [
      { label: "Medical school", value: "Stanford SoM, 2011", status: "verified", verified: "Feb 20", source: "AMA Masterfile" },
      { label: "Residency", value: "UCSF IM, 2014", status: "verified", verified: "Feb 20", source: "AMA Masterfile" },
      { label: "Fellowship", value: "UCSF Geriatrics, 2016", status: "verified", verified: "Feb 20", source: "AMA Masterfile" },
      { label: "Internship", value: "UCSF, 2012", status: "verified", verified: "Feb 20", source: "AMA Masterfile" },
    ],
  },
  {
    name: "Malpractice",
    fields: [
      { label: "Insurance certificate", value: "Missing", status: "error", verified: "—", source: "Not found" },
    ],
  },
];

type View = "journey" | "credentials";

export function ClinicianPassport() {
  const [expanded, setExpanded] = React.useState<string | null>("Identity");
  const [view, setView] = React.useState<View>("journey");
  const [activeMetric, setActiveMetric] = React.useState<string | null>(null);
  const { done } = useCredentialing();

  const total = sections.reduce((a, s) => a + s.fields.length, 0);
  const verified = sections.reduce((a, s) => a + s.fields.filter((f) => f.status === "verified").length, 0);
  const pct = Math.round((verified / total) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back */}
      <Link to="/app/clinician" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Credentialing Passport</h1>
      <p className="text-[15px] text-muted-foreground mt-1 mb-10">Dr. Sarah Chen &middot; Internal Medicine</p>

      {!done ? (
        <div className="bg-surface-elevated border border-border rounded-xl p-10 text-center">
          <p className="text-[15px] text-foreground mb-1">No credentials yet</p>
          <p className="text-[14px] text-muted-foreground">
            Your credentialing passport will be assembled once the agent finishes gathering and verifying your credentials.
          </p>
        </div>
      ) : (
        <>
      {/* Header stats */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-6 -mt-4">
        <div />
        <div className="flex items-center gap-4">
          <span className="text-[15px] text-foreground tabular-nums">{pct}%</span>
          <span className="text-[14px] text-muted-foreground tabular-nums">{verified}/{total} verified</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-foreground rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Phase flow indicator */}
      <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-8 overflow-x-auto">
        <div className="flex items-center gap-0 min-w-max">
          {phases.map((phase, i) => (
            <div key={phase.key} className="flex items-center">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  phase.active ? "bg-green animate-pulse" :
                  phase.done ? "bg-green" : "bg-border"
                }`} />
                <span className={`text-[14px] whitespace-nowrap ${
                  phase.active ? "text-foreground" :
                  phase.done ? "text-foreground" : "text-muted-foreground/40"
                }`}>
                  {phase.label}
                </span>
              </div>
              {i < phases.length - 1 && (
                <div className={`w-8 lg:w-14 h-px mx-3 ${
                  phase.done ? "bg-green" : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 mb-8 border-b border-border">
        {[
          { key: "journey" as const, label: "Build timeline" },
          { key: "credentials" as const, label: "Credentials" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`text-[14px] px-4 py-3 border-b-2 transition-colors cursor-pointer ${
              view === tab.key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Journey / build timeline ── */}
      {view === "journey" && (
        <div>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
            {[
              { label: "Sources searched", value: "14", key: "sources" },
              { label: "Credentials found", value: "17", key: "found" },
              { label: "Auto-verified", value: "14", key: "verified" },
              { label: "Tasks created", value: "2", key: "tasks" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMetric(activeMetric === m.key ? null : m.key)}
                className={`bg-surface-elevated border rounded-xl py-4 px-4 text-center cursor-pointer transition-all ${
                  activeMetric === m.key
                    ? "border-foreground/30 ring-1 ring-foreground/10"
                    : "border-border hover:border-foreground/20"
                }`}
              >
                <p className="text-[22px] tracking-[-0.02em] text-foreground tabular-nums">{m.value}</p>
                <p className="text-[14px] text-muted-foreground mt-1">{m.label}</p>
              </button>
            ))}
          </div>

          {/* Expanded metric detail */}
          {activeMetric && (() => {
            const metricData: Record<string, { label: string; detail: string; status: "verified" | "pending" | "warning" | "error" }[]> = {
              sources: [
                { label: "NPPES (NPI Registry)", detail: "NPI verified — 1234567890", status: "verified" },
                { label: "CA Medical Board", detail: "License #MD-48291 retrieved", status: "verified" },
                { label: "NY OPMC", detail: "License #NY-29183 retrieved", status: "verified" },
                { label: "FL DOH", detail: "License #FL-ME-10284 retrieved", status: "verified" },
                { label: "ABIM Portal", detail: "2 board certifications verified", status: "verified" },
                { label: "DEA CSOS", detail: "Registration #FC1234567 confirmed", status: "verified" },
                { label: "AMA Masterfile", detail: "Education & training history pulled", status: "verified" },
                { label: "NPDB", detail: "Malpractice history — zero adverse actions", status: "verified" },
                { label: "OIG / SAM", detail: "No exclusions or debarments", status: "verified" },
                { label: "CA Pharmacy Board", detail: "CSR search in progress", status: "pending" },
                { label: "NORCAL Mutual", detail: "Malpractice certificate not found", status: "error" },
              ],
              found: [
                { label: "NPI Registration", detail: "NPPES — confirmed", status: "verified" },
                { label: "CA Medical License", detail: "#MD-48291 — exp Dec 2027", status: "verified" },
                { label: "NY Medical License", detail: "#NY-29183 — exp Jun 2027", status: "verified" },
                { label: "FL Medical License", detail: "#FL-ME-10284 — exp Jan 2028", status: "verified" },
                { label: "ABIM Internal Medicine", detail: "Expires May 2026", status: "warning" },
                { label: "ABIM Geriatric Medicine", detail: "Expires Dec 2029", status: "verified" },
                { label: "DEA Certificate", detail: "#FC1234567 — exp Mar 2028", status: "verified" },
                { label: "Medical School", detail: "Stanford SoM, 2011", status: "verified" },
                { label: "Residency", detail: "UCSF IM, 2014", status: "verified" },
                { label: "Fellowship", detail: "UCSF Geriatrics, 2016", status: "verified" },
                { label: "Identity (5 fields)", detail: "All confirmed across sources", status: "verified" },
                { label: "Malpractice Insurance", detail: "Not found — upload required", status: "error" },
              ],
              verified: buildTimeline.filter(s => s.status === "verified").slice(-6).map(s => ({ label: s.label, detail: s.detail, status: s.status })),
              tasks: [
                { label: "Upload malpractice certificate", detail: "Not found in any source — manual upload required", status: "error" },
                { label: "Confirm practice address", detail: "Conflicting records between NPI and CA board", status: "warning" },
              ],
            };
            const items = metricData[activeMetric] ?? [];
            return items.length > 0 ? (
              <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border mb-8 mt-2">
                {items.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Dot status={item.status} />
                        <p className="text-[14px] text-foreground">{item.label}</p>
                      </div>
                      <p className="text-[13px] text-muted-foreground mt-0.5 ml-[18px]">{item.detail}</p>
                    </div>
                    {(item.status === "error" || item.status === "warning" || item.status === "pending") && (
                      <Link
                        to="/app/clinician/tasks"
                        className="shrink-0 ml-[18px] sm:ml-0 text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Resolve
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : null;
          })()}

          {!activeMetric && <div className="mb-10" />}

          {/* Timeline */}
          <div className="flex items-center justify-between mb-5">
            <SectionLabel>How this passport was built</SectionLabel>
            <span className="text-[13px] text-muted-foreground">
              Last checked Mar 4
            </span>
          </div>
          <div className="bg-surface-elevated border border-border rounded-xl p-6">
            {buildTimeline.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center pt-1.5">
                  <Dot status={item.status} />
                  {i < buildTimeline.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                </div>
                <div className={`flex-1 min-w-0 ${i < buildTimeline.length - 1 ? "pb-5" : "pb-1"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[15px] text-foreground">{item.label}</p>
                      <p className="text-[14px] text-muted-foreground mt-0.5">{item.detail}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {(item.status === "error" || item.status === "warning" || item.status === "pending") && (
                        <Link to="/app/clinician/tasks" className="text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors">
                          Resolve
                        </Link>
                      )}
                      <span className="text-[13px] text-text-secondary tabular-nums">{item.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pending items callout */}
          <div className="mt-6 bg-surface-elevated border border-border rounded-xl p-5">
            <SectionLabel>Still pending</SectionLabel>
            <div className="mt-4 space-y-3">
              {[
                { label: "Malpractice insurance certificate", detail: "Upload required — not found in any source", status: "error" as const },
                { label: "CA Controlled Substance Registration", detail: "Agent searching state pharmacy board", status: "pending" as const },
                { label: "Practice address confirmation", detail: "Conflicting records — needs clinician input", status: "warning" as const },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="pt-1">
                    <Dot status={item.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-foreground">{item.label}</p>
                    <p className="text-[14px] text-muted-foreground">{item.detail}</p>
                  </div>
                  {(item.status === "error" || item.status === "warning" || item.status === "pending") && (
                    <Link to="/app/clinician/tasks" className="shrink-0 text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors">
                      Resolve
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Credentials view ── */}
      {view === "credentials" && (
        <div className="bg-surface-elevated border border-border rounded-xl overflow-hidden">
          {sections.map((section, si) => {
            const isOpen = expanded === section.name;
            const sVerified = section.fields.filter((f) => f.status === "verified").length;
            const hasIssue = section.fields.some((f) => f.status !== "verified");

            return (
              <div key={section.name}>
                <button
                  onClick={() => setExpanded(isOpen ? null : section.name)}
                  className={`w-full flex items-center justify-between px-5 py-4.5 cursor-pointer group transition-colors hover:bg-secondary/40 ${
                    si > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight
                      size={16}
                      className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                    />
                    {hasIssue ? <Dot status="warning" /> : <Dot status="verified" />}
                    <span className="text-[15px] text-foreground">{section.name}</span>
                  </div>
                  <span className="text-[14px] text-muted-foreground tabular-nums">{sVerified}/{section.fields.length}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-border bg-background">
                    {section.fields.map((field, i) => (
                      <div key={i} className={`flex items-center justify-between py-4 px-5 pl-14 ${
                        i < section.fields.length - 1 ? "border-b border-border/50" : ""
                      }`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Dot status={field.status} />
                          <div className="min-w-0">
                            <p className="text-[15px] text-foreground">{field.label}</p>
                            <p className="text-[14px] text-muted-foreground">{field.value}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 text-[13px] text-text-secondary">
                          {(field.status === "error" || field.status === "warning" || field.status === "pending") && (
                            <Link to="/app/clinician/tasks" className="text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors">
                              Resolve
                            </Link>
                          )}
                          {field.exp && <span className="hidden sm:block">exp {field.exp}</span>}
                          <span className="hidden sm:block">{field.source}</span>
                          <span className="tabular-nums">{field.verified}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
}