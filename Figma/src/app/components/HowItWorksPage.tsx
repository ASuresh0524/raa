import { Link } from "react-router";
import { Dot, SectionLabel } from "./ui-components";
import { MarketPositioningSection } from "./MarketPositioningSection";

const steps = [
  {
    n: "01",
    title: "Connect & consent",
    desc: "Clinician signs in and grants secure access. The agent begins gathering credentials from primary sources — medical boards, DEA, NPDB, education records — without manual uploads.",
    details: ["OAuth consent flow", "Automatic source discovery", "No document uploads required"],
  },
  {
    n: "02",
    title: "Retrieve & verify",
    desc: "Agents pull documents and verify each one against its primary source in real time. Conflicts or ambiguities surface as clear tasks for human review.",
    details: ["Primary source verification", "Cross-reference validation", "Conflict detection"],
  },
  {
    n: "03",
    title: "Assemble & submit",
    desc: "The Credentialing Passport is assembled automatically. Applications are auto-filled and submitted to payers, hospitals, and agencies on your behalf.",
    details: ["Smart form filling", "Multi-payer submission", "Packet generation"],
  },
  {
    n: "04",
    title: "Track & follow up",
    desc: "Every submission is tracked in real time. The agent follows up with payers, responds to additional information requests, and escalates only when necessary.",
    details: ["Real-time status tracking", "Automated follow-ups", "Exception routing"],
  },
  {
    n: "05",
    title: "Monitor & renew",
    desc: "Continuous background monitoring catches expirations, sanctions, and changes. Renewals are triggered automatically before anything lapses.",
    details: ["Expiration monitoring", "Sanction checks", "Auto-renewal triggers"],
  },
];

const agentCapabilities = [
  { title: "Document retrieval", desc: "Pulls licenses, certifications, insurance policies, and training records from over 200 primary sources." },
  { title: "Verification engine", desc: "Every credential verified against the issuing authority. No self-attestation." },
  { title: "Submission orchestration", desc: "Formats and submits applications to payers and facilities. Handles each organization's unique requirements." },
  { title: "Follow-up automation", desc: "Tracks response timelines. Sends follow-ups. Escalates stalled applications." },
  { title: "Continuous monitoring", desc: "Background checks run on schedule. Board actions, sanctions, and expirations caught immediately." },
  { title: "Human-in-the-loop", desc: "Anything uncertain or ambiguous surfaces as a clear task. One-click resolution. Full audit trail." },
];

const timeline = [
  { label: "Clinician onboarded", detail: "Dr. Sarah Chen — consent granted", time: "0:00", status: "verified" as const },
  { label: "12 credentials retrieved", detail: "License, DEA, board cert, insurance, education…", time: "0:04", status: "verified" as const },
  { label: "Primary source verified", detail: "CA Medical Board, ABIM, NPDB — all confirmed", time: "0:11", status: "verified" as const },
  { label: "Board cert expiring", detail: "ABIM — expires in 58 days — renewal queued", time: "0:11", status: "warning" as const },
  { label: "Blue Shield submitted", detail: "Application BS-2026-8843 filed", time: "0:14", status: "verified" as const },
  { label: "Aetna submitted", detail: "Application AET-2026-2291 filed", time: "0:15", status: "verified" as const },
  { label: "Malpractice gap flagged", detail: "2019 coverage gap — task created for review", time: "0:15", status: "error" as const },
  { label: "Monitoring active", detail: "Continuous checks scheduled", time: "0:16", status: "verified" as const },
];

export function HowItWorksPage() {
  return (
    <div>
      {/* Header */}
      <section className="max-w-[1080px] mx-auto px-6 pt-32 pb-28 md:pt-44">
        <SectionLabel>How it works</SectionLabel>
        <h1 className="text-[2rem] md:text-[2.75rem] tracking-[-0.035em] leading-[1.1] mt-4 max-w-lg">
          From onboarding to monitoring in minutes
        </h1>
        <p className="text-[16px] text-muted-foreground mt-6 max-w-[420px] leading-[1.7]">
          Agents handle the entire credentialing lifecycle — retrieval, verification, submission, tracking, and renewal. You step in only when something genuinely needs your judgment.
        </p>
      </section>

      <MarketPositioningSection />

      <div className="h-px bg-border" />

      {/* Live demo timeline */}
      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div>
            <SectionLabel>Example run</SectionLabel>
            <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em] mt-4 mb-4">
              One clinician, fully credentialed
            </h2>
            <p className="text-[14px] text-muted-foreground leading-[1.7] max-w-sm">
              Here's what happens when a new clinician connects. The entire process completes autonomously — exceptions surface as clear tasks.
            </p>
            <div className="mt-10 flex items-center gap-8">
              <div>
                <p className="text-[1.5rem] tracking-[-0.02em] text-foreground">16 min</p>
                <p className="text-[12px] text-muted-foreground mt-1.5">Total elapsed</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-[1.5rem] tracking-[-0.02em] text-foreground">12</p>
                <p className="text-[12px] text-muted-foreground mt-1.5">Credentials verified</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-[1.5rem] tracking-[-0.02em] text-foreground">1</p>
                <p className="text-[12px] text-muted-foreground mt-1.5">Task for review</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <SectionLabel>Agent timeline</SectionLabel>
              <span className="text-[13px] text-text-secondary">elapsed</span>
            </div>
            <div className="space-y-0">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center pt-[7px]">
                    <Dot status={item.status} />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                  </div>
                  <div className="flex-1 pb-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-[15px] text-foreground">{item.label}</p>
                      <span className="text-[13px] text-text-secondary shrink-0 tabular-nums">{item.time}</span>
                    </div>
                    <p className="text-[14px] text-muted-foreground mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* Steps */}
      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <SectionLabel>The process</SectionLabel>
        <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em] mt-4 mb-14">Five steps. Fully automated.</h2>
        <div>
          {steps.map((step, i) => (
            <div key={i} className="border-t border-border py-8 md:py-10">
              <div className="grid md:grid-cols-[3rem_1fr_1fr] gap-6 md:gap-10 items-start">
                <span className="text-[14px] text-muted-foreground/30 tabular-nums">{step.n}</span>
                <div>
                  <p className="text-[16px] text-foreground">{step.title}</p>
                  <p className="text-[15px] text-muted-foreground mt-2.5 leading-[1.7] max-w-sm">{step.desc}</p>
                </div>
                <div className="space-y-2.5 md:pt-0.5">
                  {step.details.map((d, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Dot status="verified" />
                      <span className="text-[13px] text-muted-foreground">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* Agent capabilities */}
      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <SectionLabel>Under the hood</SectionLabel>
        <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em] mt-4 mb-14">What the agent does</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentCapabilities.map((cap, i) => (
            <div key={i} className="bg-surface-elevated border border-border rounded-xl p-6">
              <p className="text-[16px] text-foreground">{cap.title}</p>
              <p className="text-[15px] text-muted-foreground mt-2.5 leading-[1.7]">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* Comparison */}
      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <SectionLabel>Before & after</SectionLabel>
        <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em] mt-4 mb-14">Manual vs. Credenza</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-surface-elevated border border-border rounded-xl p-6">
            <SectionLabel>Traditional</SectionLabel>
            <div className="mt-5 space-y-0">
              {[
                { label: "Time to credential", value: "90–180 days" },
                { label: "Manual data entry", value: "Hours per provider" },
                { label: "Follow-ups", value: "Phone calls & faxes" },
                { label: "Expiration tracking", value: "Spreadsheets" },
                { label: "Error rate", value: "15–25% rejection" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <span className="text-[13px] text-muted-foreground">{row.label}</span>
                  <span className="text-[13px] text-muted-foreground/50">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-elevated border border-border rounded-xl p-6">
            <SectionLabel>With Credenza</SectionLabel>
            <div className="mt-5 space-y-0">
              {[
                { label: "Time to credential", value: "Minutes to submit" },
                { label: "Manual data entry", value: "Zero" },
                { label: "Follow-ups", value: "Automated" },
                { label: "Expiration tracking", value: "Continuous monitoring" },
                { label: "Error rate", value: "<2% rejection" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <span className="text-[15px] text-muted-foreground">{row.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-[15px] text-foreground">{row.value}</span>
                    <Dot status="verified" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* CTA */}
      <section className="max-w-[1080px] mx-auto px-6 py-32 md:py-40 text-center">
        <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em]">See it in action</h2>
        <p className="text-[15px] text-muted-foreground mt-4 max-w-md mx-auto leading-[1.7]">
          Watch the agent credential a provider end to end. No slides, no scripts — just the product.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            to="/login?demo=true"
            className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Request demo
          </Link>
          <Link to="/login" className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}