import { SectionLabel } from "./ui-components";

export function SecurityPage() {
  return (
    <div>
      <section className="max-w-[1080px] mx-auto px-6 pt-32 pb-28 md:pt-44 text-center">
        <SectionLabel>Security</SectionLabel>
        <h1 className="text-[2rem] md:text-[2.75rem] tracking-[-0.035em] leading-[1.1] mt-4">
          Trust by design
        </h1>
        <p className="text-[16px] text-muted-foreground mt-6 max-w-[440px] mx-auto leading-[1.7]">
          Healthcare data demands the highest standard. Every layer is built with
          security, privacy, and compliance at its core.
        </p>
      </section>

      <div className="h-px bg-border" />

      <section className="max-w-[1080px] mx-auto px-6 py-24 md:py-28">
        <div className="max-w-2xl mx-auto">
          {[
            { title: "Encrypted vault", desc: "All documents encrypted with AES-256 at rest and TLS 1.3 in transit. Keys managed via HSM." },
            { title: "Granular permissions", desc: "Role-based access with field-level control. Organizations see only what clinicians authorize." },
            { title: "Complete audit trail", desc: "Every access, modification, and submission logged. Exportable on demand." },
            { title: "Continuous verification", desc: "Primary source checks run on cadence. Sanctions, licenses, and boards monitored automatically." },
            { title: "SOC 2 Type II", desc: "Annual third-party audits verify security controls, availability, and confidentiality." },
            { title: "SSO & MFA", desc: "Enterprise single sign-on via SAML/OIDC. Multi-factor authentication enforced." },
            { title: "Zero standing access", desc: "No persistent access to production data. All access JIT-provisioned and audited." },
            { title: "BAA ready", desc: "HIPAA-compliant infrastructure with signed Business Associate Agreements." },
          ].map((item, i) => (
            <div key={i} className="py-6 border-b border-border">
              <p className="text-[16px] text-foreground">{item.title}</p>
              <p className="text-[15px] text-muted-foreground mt-2 leading-[1.7]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}