import { Link } from "react-router";
import { SectionLabel } from "./ui-components";

export function ForOrganizationsPage() {
  return (
    <div>
      <section className="max-w-[1080px] mx-auto px-6 pt-32 pb-28 md:pt-44">
        <SectionLabel>For organizations</SectionLabel>
        <h1 className="text-[2rem] md:text-[2.75rem] tracking-[-0.035em] leading-[1.1] mt-4">
          Credential your roster.<br />Automatically.
        </h1>
        <p className="text-[16px] text-muted-foreground mt-6 max-w-[420px] leading-[1.7]">
          Add clinicians, request credentialing work, and monitor progress across your
          entire organization. Exceptions surface for human review.
        </p>
        <Link
          to="/login?demo=true"
          className="inline-block mt-10 text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Request demo
        </Link>
      </section>

      <div className="h-px bg-border" />

      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <div className="grid md:grid-cols-4 gap-12">
          {[
            { label: "Avg. time to credential", value: "14 days" },
            { label: "Provider compliance", value: "94%" },
            { label: "Exceptions this month", value: "8" },
            { label: "Active submissions", value: "23" },
          ].map((m, i) => (
            <div key={i}>
              <p className="text-[1.5rem] tracking-[-0.02em] text-foreground">{m.value}</p>
              <p className="text-[14px] text-muted-foreground mt-1.5">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {[
            { title: "Roster management", desc: "Add individually or import via CSV. Live passport status for every provider." },
            { title: "Automated workflows", desc: "Facility credentialing, payer enrollment, recredentialing. Agents handle end to end." },
            { title: "Compliance monitoring", desc: "Expiration alerts, sanctions rechecks, and renewal autopilot across your roster." },
          ].map((c, i) => (
            <div key={i}>
              <p className="text-[16px] text-foreground">{c.title}</p>
              <p className="text-[15px] text-muted-foreground mt-2.5 leading-[1.7]">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <SectionLabel>Pipeline</SectionLabel>
        <p className="text-[15px] text-foreground mt-4 mb-10">Track every provider through every stage.</p>
        <div className="max-w-lg">
          {[
            { stage: "Intake", count: 4 },
            { stage: "Verify", count: 8 },
            { stage: "Assemble", count: 5 },
            { stage: "Submit", count: 6 },
            { stage: "In review", count: 12 },
            { stage: "Approved", count: 89 },
            { stage: "Active", count: 124 },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 border-b border-border">
              <span className="text-[15px] text-muted-foreground">{s.stage}</span>
              <span className="text-[15px] text-foreground tabular-nums">{s.count}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="max-w-[1080px] mx-auto px-6 py-32 md:py-40 text-center">
        <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em]">Scale without scaling headcount</h2>
        <p className="text-[15px] text-muted-foreground mt-4">See how Credenza automates your operations.</p>
        <Link
          to="/login?demo=true"
          className="inline-block mt-10 text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Request demo &rarr;
        </Link>
      </section>
    </div>
  );
}