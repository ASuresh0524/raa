/* SignupOrgPage – multi-step organization onboarding */
import React from "react";
import { Link, useNavigate } from "react-router";
import { ThemeToggle } from "./ui-components";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const ORG_TYPES = [
  "Health system",
  "Hospital",
  "Medical group",
  "Payer / Insurance",
  "Staffing agency",
  "Telehealth company",
  "Ambulatory surgery center",
  "Community health center",
  "Behavioral health",
  "Long-term care / SNF",
  "Other",
];

const ORG_SIZES = [
  "1–25 providers",
  "26–100 providers",
  "101–500 providers",
  "501–2,000 providers",
  "2,000+ providers",
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois",
  "Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
  "Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota",
  "Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming",
];

type Step = 1 | 2 | 3 | 4;

export function SignupOrgPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<Step>(1);

  // Step 1 — account
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Step 2 — organization details
  const [orgName, setOrgName] = React.useState("");
  const [orgType, setOrgType] = React.useState("");
  const [orgSize, setOrgSize] = React.useState("");
  const [orgState, setOrgState] = React.useState("");
  const [orgCity, setOrgCity] = React.useState("");
  const [taxId, setTaxId] = React.useState("");

  // Step 3 — primary contact
  const [contactFirst, setContactFirst] = React.useState("");
  const [contactLast, setContactLast] = React.useState("");
  const [contactTitle, setContactTitle] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");
  const [contactDept, setContactDept] = React.useState("");

  // Step 4 — review
  const [agreed, setAgreed] = React.useState(false);

  const canAdvance = (s: Step) => {
    switch (s) {
      case 1: return email.trim() !== "" && password.trim() !== "" && password === confirmPassword && password.length >= 8;
      case 2: return orgName.trim() !== "" && orgType !== "" && orgSize !== "" && orgState !== "";
      case 3: return contactFirst.trim() !== "" && contactLast.trim() !== "" && contactTitle.trim() !== "";
      case 4: return agreed;
      default: return false;
    }
  };

  const handleNext = () => { if (step < 4) setStep((step + 1) as Step); };
  const handleBack = () => { if (step > 1) setStep((step - 1) as Step); };
  const handleSubmit = () => { navigate("/app/org"); };

  const stepLabels = ["Account", "Organization", "Contact", "Review"];

  const inputCls = "w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all";
  const selectCls = `${inputCls} appearance-none cursor-pointer`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16 relative">
      {/* Top bar */}
      <div className="absolute top-5 left-5">
        {step === 1 ? (
          <Link to="/signup" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            Back
          </Link>
        ) : (
          <button onClick={handleBack} className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ArrowLeft size={16} />
            Back
          </button>
        )}
      </div>
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <Link to="/" className="block text-center text-[18px] text-foreground tracking-[-0.03em] mb-4">
          credenza
        </Link>
        <p className="text-center text-[14px] text-muted-foreground mb-10">Create your organization account</p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {stepLabels.map((label, i) => {
            const s = i + 1;
            const done = step > s;
            const active = step === s;
            return (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] transition-colors ${
                    done ? "bg-foreground text-background" :
                    active ? "border-2 border-foreground text-foreground" :
                    "border border-border text-muted-foreground/50"
                  }`}>
                    {done ? <Check size={12} /> : s}
                  </div>
                  <span className={`text-[13px] hidden sm:block ${active ? "text-foreground" : done ? "text-foreground" : "text-muted-foreground/50"}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`w-6 sm:w-10 h-px mx-1 ${done ? "bg-foreground" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Account ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">Work email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@yourorg.com" className={inputCls} />
            </div>
            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" className={inputCls} />
            </div>
            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">Confirm password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={inputCls} />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[13px] text-red mt-1.5">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[13px] text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button className="w-full border border-border bg-surface-elevated text-[15px] text-foreground py-3 rounded-xl hover:bg-secondary transition-colors cursor-pointer">
              Continue with SSO
            </button>
          </div>
        )}

        {/* ── Step 2: Organization details ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-[17px] text-foreground tracking-[-0.01em] text-center mb-1">Organization details</h2>
            <p className="text-[14px] text-muted-foreground text-center mb-6">Tell us about your organization so we can configure your workspace.</p>

            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">Organization name</label>
              <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Valley Health Group" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[14px] text-muted-foreground block mb-2">Organization type</label>
                <select value={orgType} onChange={(e) => setOrgType(e.target.value)} className={selectCls}>
                  <option value="" disabled>Select type</option>
                  {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[14px] text-muted-foreground block mb-2">Provider roster size</label>
                <select value={orgSize} onChange={(e) => setOrgSize(e.target.value)} className={selectCls}>
                  <option value="" disabled>Select size</option>
                  {ORG_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[14px] text-muted-foreground block mb-2">State</label>
                <select value={orgState} onChange={(e) => setOrgState(e.target.value)} className={selectCls}>
                  <option value="" disabled>Select state</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[14px] text-muted-foreground block mb-2">
                  City <span className="text-muted-foreground/50">(optional)</span>
                </label>
                <input type="text" value={orgCity} onChange={(e) => setOrgCity(e.target.value)} placeholder="San Francisco" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">
                Tax ID / EIN <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value.replace(/[^\d-]/g, "").slice(0, 10))}
                placeholder="XX-XXXXXXX"
                className={inputCls}
              />
            </div>

            {/* What you get callout */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 mt-2">
              <p className="text-[12px] text-muted-foreground uppercase tracking-[0.06em] mb-3">Your workspace includes</p>
              <div className="space-y-2">
                {[
                  "Provider credentialing dashboard",
                  "Automated primary-source verification",
                  "Document upload & management",
                  "Payer enrollment submission tracking",
                  "Continuous monitoring & alerts",
                  "Compliance reporting & exports",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                    <span className="text-[14px] text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Primary contact ── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-[17px] text-foreground tracking-[-0.01em] text-center mb-1">Primary contact</h2>
            <p className="text-[14px] text-muted-foreground text-center mb-6">Who should we contact about credentialing and compliance matters?</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[14px] text-muted-foreground block mb-2">First name</label>
                <input type="text" value={contactFirst} onChange={(e) => setContactFirst(e.target.value)} placeholder="Jane" className={inputCls} />
              </div>
              <div>
                <label className="text-[14px] text-muted-foreground block mb-2">Last name</label>
                <input type="text" value={contactLast} onChange={(e) => setContactLast(e.target.value)} placeholder="Rogers" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">Title / Role</label>
              <input type="text" value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} placeholder="Director of Credentialing" className={inputCls} />
            </div>

            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">
                Department <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <input type="text" value={contactDept} onChange={(e) => setContactDept(e.target.value)} placeholder="Medical Staff Services" className={inputCls} />
            </div>

            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">
                Phone <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="(555) 555-0100" className={inputCls} />
            </div>

            {/* Provider type callout */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 mt-2">
              <p className="text-[12px] text-muted-foreground uppercase tracking-[0.06em] mb-3">Provider types supported</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { badge: "MD", label: "Physicians", desc: "MD / DO credentials" },
                  { badge: "RN", label: "Nurses", desc: "RN / NP / LPN credentials" },
                ].map((pt) => (
                  <div key={pt.badge} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-[12px] tracking-[0.02em] text-muted-foreground shrink-0">
                      {pt.badge}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] text-foreground">{pt.label}</p>
                      <p className="text-[13px] text-muted-foreground">{pt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-muted-foreground mt-3">
                Each provider's credentialing pathway is automatically tailored to their type — physicians and nurses are verified against different primary sources.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 4: Review ── */}
        {step === 4 && (
          <div>
            <h2 className="text-[17px] text-foreground tracking-[-0.01em] text-center mb-2">Review &amp; confirm</h2>
            <p className="text-[14px] text-muted-foreground text-center mb-8">Verify your organization details before creating your workspace.</p>

            {/* Organization summary */}
            <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border mb-4">
              <div className="px-5 py-3">
                <p className="text-[12px] text-muted-foreground uppercase tracking-[0.06em]">Organization</p>
              </div>
              {[
                { label: "Name", value: orgName },
                { label: "Type", value: orgType },
                { label: "Roster size", value: orgSize },
                { label: "Location", value: orgCity ? `${orgCity}, ${orgState}` : orgState },
                ...(taxId ? [{ label: "Tax ID / EIN", value: taxId }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-[13px] text-muted-foreground">{row.label}</span>
                  <span className="text-[14px] text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Contact summary */}
            <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border mb-4">
              <div className="px-5 py-3">
                <p className="text-[12px] text-muted-foreground uppercase tracking-[0.06em]">Primary contact</p>
              </div>
              {[
                { label: "Name", value: `${contactFirst} ${contactLast}` },
                { label: "Title", value: contactTitle },
                { label: "Email", value: email },
                ...(contactDept ? [{ label: "Department", value: contactDept }] : []),
                ...(contactPhone ? [{ label: "Phone", value: contactPhone }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-[13px] text-muted-foreground">{row.label}</span>
                  <span className="text-[14px] text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Provider types */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-4">
              <p className="text-[12px] text-muted-foreground uppercase tracking-[0.06em] mb-3">Provider types you can manage</p>
              <div className="flex items-center gap-3">
                {["MD", "RN"].map((t) => (
                  <div key={t} className="inline-flex items-center gap-2 border border-border rounded-lg px-3 py-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded text-[11px] border border-border text-muted-foreground">
                      {t}
                    </span>
                    <span className="text-[14px] text-foreground">{t === "MD" ? "Physicians" : "Nurses"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-3 mt-6 cursor-pointer group">
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border border-border bg-surface-elevated flex items-center justify-center transition-colors peer-checked:bg-foreground peer-checked:border-foreground group-hover:border-muted-foreground/60">
                  {agreed && <Check size={12} className="text-background" />}
                </div>
              </div>
              <span className="text-[14px] text-muted-foreground leading-relaxed">
                I agree to the <span className="text-foreground">Terms of Service</span>, <span className="text-foreground">Business Associate Agreement</span>, and <span className="text-foreground">Privacy Policy</span>. I confirm I am authorized to create this account on behalf of <span className="text-foreground">{orgName || "my organization"}</span>.
              </span>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          {step > 1 ? (
            <button onClick={handleBack} className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors">
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canAdvance(step)}
              className={`inline-flex items-center gap-2 text-[14px] px-6 py-2.5 rounded-xl transition-all cursor-pointer ${
                canAdvance(step)
                  ? "bg-foreground text-background hover:opacity-90"
                  : "bg-foreground/20 text-background/40 cursor-not-allowed"
              }`}
            >
              Continue
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canAdvance(4)}
              className={`text-[14px] px-6 py-2.5 rounded-xl transition-all cursor-pointer ${
                canAdvance(4)
                  ? "bg-foreground text-background hover:opacity-90"
                  : "bg-foreground/20 text-background/40 cursor-not-allowed"
              }`}
            >
              Create workspace
            </button>
          )}
        </div>

        {/* Login link */}
        <p className="text-[14px] text-muted-foreground text-center mt-10">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}