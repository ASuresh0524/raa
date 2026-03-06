import { Link } from "react-router";
import { Dot, SectionLabel } from "./ui-components";

export function ForCliniciansPage() {
  return (
    <div>
      <section className="max-w-[1080px] mx-auto px-6 pt-32 pb-28 md:pt-44">
        <SectionLabel>For clinicians</SectionLabel>
        <h1 className="text-[2rem] md:text-[2.75rem] tracking-[-0.035em] leading-[1.1] mt-4">
          Your credentials.<br />Always verified.
        </h1>
        <p className="text-[16px] text-muted-foreground mt-6 max-w-[400px] leading-[1.7]">
          Sign in once. Agents retrieve, verify, and maintain your Credentialing Passport.
          You only resolve what truly needs your input.
        </p>
        <Link
          to="/login"
          className="inline-block mt-10 text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Get started
        </Link>
      </section>

      <div className="h-px bg-border" />

      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {[
            { title: "Agents do the work", desc: "Documents gathered, licenses verified, forms submitted. You watch the timeline." },
            { title: "Tasks, not busy work", desc: "Only notified when the agent genuinely needs you. Clear instructions, one-click actions." },
            { title: "Always current", desc: "Continuous monitoring prevents expirations. Renewals triggered automatically." },
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
        <SectionLabel>Your passport</SectionLabel>
        <p className="text-[15px] text-foreground mt-4 mb-10">Every credential, verified and organized.</p>
        <div className="max-w-lg">
          {[
            { section: "Identity", items: "5/5", status: "verified" as const },
            { section: "Licenses", items: "3/3", status: "verified" as const },
            { section: "Board Certification", items: "2/2", status: "verified" as const },
            { section: "DEA / CSR", items: "1/2", status: "warning" as const },
            { section: "Education & Training", items: "4/4", status: "verified" as const },
            { section: "Malpractice", items: "0/1", status: "error" as const },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Dot status={s.status} />
                <span className="text-[15px] text-foreground">{s.section}</span>
              </div>
              <span className="text-[14px] text-muted-foreground tabular-nums">{s.items}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-border" />

      <section className="max-w-[1080px] mx-auto px-6 py-32 md:py-40 text-center">
        <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em]">Stop chasing paperwork</h2>
        <p className="text-[15px] text-muted-foreground mt-4">Create your Credentialing Passport in minutes.</p>
        <Link
          to="/login"
          className="inline-block mt-10 text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Get started &rarr;
        </Link>
      </section>
    </div>
  );
}