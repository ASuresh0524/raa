import { Link } from "react-router";
import { useState } from "react";
import { Dot, SectionLabel } from "./ui-components";
import { motion } from "motion/react";
import { staggerContainer, staggerItem, fadeInUp, staggerContainerSlow } from "./motion-variants";

const timeline = [
  { label: "License verified", detail: "CA Medical Board — primary source", time: "2m ago", status: "verified" as const },
  { label: "DEA extracted", detail: "#FC1234567 — exp Mar 2028", time: "5m ago", status: "verified" as const },
  { label: "Submitted to Blue Shield", detail: "Confirmation BS-2026-8843", time: "12m ago", status: "verified" as const },
  { label: "Following up with Aetna", detail: "Additional info requested", time: "1h ago", status: "pending" as const },
];

export function HomePage() {
  const [tab, setTab] = useState<"clinician" | "org">("clinician");

  return (
    <div>
      {/* Hero */}
      <section className="max-w-[1080px] mx-auto px-6 pt-32 pb-28 md:pt-44 md:pb-36">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="text-[2rem] md:text-[2.75rem] tracking-[-0.035em] leading-[1.1] text-foreground">
              Credentialing<br />that runs itself
            </h1>
            <p className="text-[16px] text-muted-foreground mt-6 max-w-[400px] leading-[1.7]">
              Agents collect, verify, submit, and maintain everything.
              Anything uncertain surfaces for human review.
            </p>
            <motion.div
              className="flex items-center gap-4 mt-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Link
                to="/login?demo=true"
                className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Request demo
              </Link>
              <Link to="/how-it-works" className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </Link>
            </motion.div>
          </motion.div>

          {/* Live timeline */}
          <motion.div
            className="bg-surface-elevated border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center justify-between mb-6">
              <SectionLabel>Agent activity</SectionLabel>
              <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                Live
              </span>
            </div>
            <div className="space-y-0">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center pt-[7px]">
                    <Dot status={item.status} />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                  </div>
                  <div className="pb-5">
                    <p className="text-[15px] text-foreground">{item.label}</p>
                    <p className="text-[14px] text-muted-foreground mt-0.5">{item.detail}</p>
                    <p className="text-[13px] text-text-secondary mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* Value props */}
      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <motion.div
          className="grid md:grid-cols-3 gap-12 md:gap-16"
          variants={staggerContainerSlow}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-80px" }}
        >
          {[
            { title: "End-to-end automation", desc: "Agents handle retrieval, verification, submission, tracking, and follow-up." },
            { title: "Human review when needed", desc: "Uncertainty and conflicts surface as clear tasks with one-click resolution." },
            { title: "Always-current passport", desc: "Continuous monitoring and renewal autopilot. Credentials never lapse." },
          ].map((item, i) => (
            <motion.div key={i} variants={staggerItem}>
              <p className="text-[16px] text-foreground">{item.title}</p>
              <p className="text-[15px] text-muted-foreground mt-2.5 leading-[1.7]">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div className="h-px bg-border" />

      {/* How it works */}
      <section id="how-it-works" className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em] mt-4 mb-14">Five steps. Fully automated.</h2>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-60px" }}
        >
          {[
            { n: "01", title: "Connect & consent", desc: "Clinician grants access. The agent begins gathering." },
            { n: "02", title: "Retrieve & verify", desc: "Documents collected and verified against primary sources." },
            { n: "03", title: "Assemble & submit", desc: "Forms auto-filled. Submitted to the correct agencies." },
            { n: "04", title: "Track & follow up", desc: "Real-time status. Exceptions routed for review." },
            { n: "05", title: "Monitor & renew", desc: "Continuous checks. Renewals triggered before expiration." },
          ].map((step, i) => (
            <motion.div key={i} variants={staggerItem} className="flex gap-6 md:gap-10 py-5 border-t border-border items-baseline">
              <span className="text-[14px] text-muted-foreground/30 tabular-nums w-6 shrink-0">{step.n}</span>
              <div>
                <p className="text-[16px] text-foreground">{step.title}</p>
                <p className="text-[15px] text-muted-foreground mt-1 leading-[1.6]">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div className="h-px bg-border" />

      {/* Dual audience */}
      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em] mb-10">Built for both sides</h2>
        <div className="flex gap-0 mb-10">
          {(["clinician", "org"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[14px] px-4 py-2.5 border-b-2 transition-colors cursor-pointer ${
                tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "clinician" ? "Clinicians" : "Organizations"}
            </button>
          ))}
        </div>

        {tab === "clinician" ? (
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <p className="text-[15px] text-foreground leading-[1.7]">
                Sign in once. Agents retrieve, verify, and maintain your Credentialing Passport.
                You only step in when something genuinely needs your input.
              </p>
              <div className="mt-8 space-y-3.5">
                {[
                  { s: "42 verified items", status: "verified" as const },
                  { s: "2 tasks waiting", status: "warning" as const },
                  { s: "1 expiring in 60 days", status: "warning" as const },
                  { s: "3 active submissions", status: "pending" as const },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Dot status={item.status} />
                    <span className="text-[15px] text-muted-foreground">{item.s}</span>
                  </div>
                ))}
              </div>
              <Link to="/for-clinicians" className="inline-block mt-8 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
                Learn more &rarr;
              </Link>
            </div>
            <div className="bg-surface-elevated border border-border rounded-xl p-6">
              <SectionLabel>Passport</SectionLabel>
              <div className="mt-5 space-y-0">
                {[
                  { label: "Medical License CA", status: "verified" as const },
                  { label: "DEA Certificate", status: "verified" as const },
                  { label: "Board Certification", status: "warning" as const },
                  { label: "Malpractice Insurance", status: "error" as const },
                  { label: "Education & Training", status: "verified" as const },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
                    <span className="text-[15px] text-foreground">{item.label}</span>
                    <Dot status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <p className="text-[15px] text-foreground leading-[1.7]">
                Add clinicians, request credentialing work, and monitor progress
                across your entire roster. Exceptions surface automatically.
              </p>
              <div className="mt-8 space-y-3.5">
                {[
                  { s: "147 providers", status: "verified" as const },
                  { s: "94% compliant", status: "verified" as const },
                  { s: "5 need attention", status: "warning" as const },
                  { s: "23 active submissions", status: "verified" as const },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Dot status={item.status} />
                    <span className="text-[15px] text-muted-foreground">{item.s}</span>
                  </div>
                ))}
              </div>
              <Link to="/for-organizations" className="inline-block mt-8 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
                Learn more &rarr;
              </Link>
            </div>
            <div className="bg-surface-elevated border border-border rounded-xl p-6">
              <SectionLabel>Pipeline</SectionLabel>
              <div className="mt-5 space-y-0">
                {[
                  { stage: "Intake", count: 4 },
                  { stage: "Verify", count: 8 },
                  { stage: "Submit", count: 6 },
                  { stage: "In review", count: 12 },
                  { stage: "Active", count: 124 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
                    <span className="text-[15px] text-muted-foreground">{item.stage}</span>
                    <span className="text-[15px] text-foreground tabular-nums">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="h-px bg-border" />

      {/* Security */}
      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <SectionLabel>Security</SectionLabel>
          <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em] mt-4 mb-14">Trust by design</h2>
        </motion.div>
        <motion.div
          className="grid md:grid-cols-4 gap-10"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-60px" }}
        >
          {[
            { title: "Encrypted vault", desc: "AES-256 at rest. TLS 1.3 in transit." },
            { title: "Granular permissions", desc: "Field-level access control." },
            { title: "Audit trail", desc: "Every action logged and exportable." },
            { title: "Continuous verification", desc: "Primary source checks run automatically." },
          ].map((item, i) => (
            <motion.div key={i} variants={staggerItem}>
              <p className="text-[16px] text-foreground">{item.title}</p>
              <p className="text-[15px] text-muted-foreground mt-2.5 leading-[1.7]">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div className="h-px bg-border" />

      {/* Final CTA */}
      <section className="max-w-[1080px] mx-auto px-6 py-32 md:py-40 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-[1.5rem] md:text-[1.875rem] tracking-[-0.03em]">Make credentialing effortless</h2>
          <p className="text-[15px] text-muted-foreground mt-4 max-w-md mx-auto leading-[1.7]">
            Eliminate manual credentialing work. Agents handle everything end to end.
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
        </motion.div>
      </section>
    </div>
  );
}