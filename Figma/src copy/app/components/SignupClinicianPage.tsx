/* SignupClinicianPage – 4-step clinician onboarding wizard (rewritten) */
import React from "react";
import { Link, useNavigate } from "react-router";
import { ThemeToggle } from "./ui-components";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const MD_SPECIALTIES = [
  "Internal Medicine","Family Medicine","Cardiology","Dermatology","Emergency Medicine",
  "Endocrinology","Gastroenterology","Geriatric Medicine","Hematology","Infectious Disease",
  "Nephrology","Neurology","Obstetrics & Gynecology","Oncology","Ophthalmology",
  "Orthopedic Surgery","Otolaryngology","Pathology","Pediatrics","Physical Medicine",
  "Psychiatry","Pulmonology","Radiology","Rheumatology","Surgery — General","Urology","Other",
];

const RN_SPECIALTIES = [
  "Registered Nurse (RN)","Nurse Practitioner (NP)","Licensed Practical Nurse (LPN)",
  "Clinical Nurse Specialist","Certified Nurse Midwife","Certified Registered Nurse Anesthetist",
  "Pediatric Nurse","Oncology Nurse","Critical Care Nurse","Emergency Nurse",
  "Psychiatric Nurse","Home Health Nurse","Public Health Nurse","Other",
];

const ALL_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois",
  "Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
  "Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota",
  "Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming",
];

const STEP_NAMES = ["Account", "Role", "Profile", "Review"] as const;

const MD_VERIFY_LIST = [
  "Medical licenses (all active states)","Board certifications","DEA registration",
  "NPI registration","Education & training history","Malpractice insurance",
  "Sanctions & exclusions screening",
];
const RN_VERIFY_LIST = [
  "Nursing licenses (all active states)","Compact state privileges",
  "BLS / ACLS / PALS certifications","NPI registration","Education & training history",
  "Continuing education records","Sanctions & exclusions screening",
];

const MD_ROLE_ITEMS = ["Medical licenses","Board certifications","DEA registration","Malpractice insurance","Hospital privileges"];
const RN_ROLE_ITEMS = ["Nursing licenses","Compact state privileges","Certifications (BLS, ACLS)","Continuing education","Specialty credentials"];

export function SignupClinicianPage() {
  const nav = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<number>(1);

  /* Step 1 fields */
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [pw2, setPw2] = React.useState("");

  /* Step 2 field */
  const [role, setRole] = React.useState<"MD" | "RN" | "">("");

  /* Step 3 fields */
  const [fName, setFName] = React.useState("");
  const [lName, setLName] = React.useState("");
  const [npi, setNpi] = React.useState("");
  const [spec, setSpec] = React.useState("");
  const [pState, setPState] = React.useState("");
  const [phone, setPhone] = React.useState("");

  /* Step 4 */
  const [agreed, setAgreed] = React.useState(false);

  const specialties = role === "RN" ? RN_SPECIALTIES : MD_SPECIALTIES;

  const isStepValid = React.useCallback(
    (s: number): boolean => {
      if (s === 1) return email.trim() !== "" && pw.length >= 8 && pw === pw2;
      if (s === 2) return role === "MD" || role === "RN";
      if (s === 3) return fName.trim() !== "" && lName.trim() !== "" && npi.length >= 10 && spec !== "" && pState !== "";
      if (s === 4) return agreed;
      return false;
    },
    [email, pw, pw2, role, fName, lName, npi, spec, pState, agreed],
  );

  const goNext = React.useCallback(() => {
    if (currentStep < 4 && isStepValid(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, isStepValid]);

  const goBack = React.useCallback(() => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  }, [currentStep]);

  const handleSubmit = React.useCallback(() => {
    if (!isStepValid(4)) return;
    if (role) {
      try { localStorage.setItem("clinicianType", role); } catch (_e) { /* noop */ }
    }
    nav("/app/clinician");
  }, [isStepValid, role, nav]);

  const inputCls =
    "w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all";
  const selCls = inputCls + " appearance-none cursor-pointer";

  const valid = isStepValid(currentStep);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16 relative">
      {/* top bar */}
      <div className="absolute top-5 left-5">
        {currentStep === 1 ? (
          <Link to="/signup" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
        ) : (
          <button type="button" onClick={goBack} className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ArrowLeft size={16} /> Back
          </button>
        )}
      </div>
      <div className="absolute top-5 right-5"><ThemeToggle /></div>

      <div className="w-full max-w-[440px]">
        <Link to="/" className="block text-center text-[18px] text-foreground tracking-[-0.03em] mb-4">credenza</Link>
        <p className="text-center text-[14px] text-muted-foreground mb-10">Create your clinician account</p>

        {/* step indicator */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {STEP_NAMES.map((label, idx) => {
            const num = idx + 1;
            const done = currentStep > num;
            const active = currentStep === num;
            return (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={
                      "w-7 h-7 rounded-full flex items-center justify-center text-[12px] transition-colors " +
                      (done
                        ? "bg-foreground text-background"
                        : active
                        ? "border-2 border-foreground text-foreground"
                        : "border border-border text-muted-foreground/50")
                    }
                  >
                    {done ? <Check size={12} /> : num}
                  </div>
                  <span className={"text-[13px] hidden sm:block " + (active || done ? "text-foreground" : "text-muted-foreground/50")}>
                    {label}
                  </span>
                </div>
                {idx < STEP_NAMES.length - 1 && (
                  <div className={"w-6 sm:w-10 h-px mx-1 " + (done ? "bg-foreground" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>

        {/* ───── STEP 1: Account ───── */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
            </div>
            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">Password</label>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Minimum 8 characters" className={inputCls} />
            </div>
            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">Confirm password</label>
              <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Re-enter password" className={inputCls} />
              {pw2 !== "" && pw !== pw2 && (
                <p className="text-[13px] text-red mt-1.5">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[13px] text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button type="button" className="w-full border border-border bg-surface-elevated text-[15px] text-foreground py-3 rounded-xl hover:bg-secondary transition-colors cursor-pointer">
              Continue with SSO
            </button>
          </div>
        )}

        {/* ───── STEP 2: Role type (MD / RN) ───── */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-[17px] text-foreground tracking-[-0.01em] text-center mb-2">What kind of provider are you?</h2>
            <p className="text-[14px] text-muted-foreground text-center mb-8">This determines the credentials we'll verify and monitor.</p>

            <div className="grid grid-cols-2 gap-4">
              {([
                { type: "MD" as const, badge: "MD", title: "Physician", subtitle: "MD / DO", items: MD_ROLE_ITEMS },
                { type: "RN" as const, badge: "RN", title: "Nurse", subtitle: "RN / NP / LPN", items: RN_ROLE_ITEMS },
              ]).map((opt) => {
                const sel = role === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setRole(opt.type)}
                    className={
                      "border rounded-xl p-5 text-left cursor-pointer transition-all " +
                      (sel
                        ? "border-foreground/40 ring-1 ring-foreground/10 bg-foreground/[0.04]"
                        : "border-border hover:border-muted-foreground/40 bg-surface-elevated")
                    }
                  >
                    <span
                      className={
                        "inline-flex items-center justify-center w-10 h-10 rounded-lg border text-[14px] tracking-[0.02em] mb-4 " +
                        (sel ? "border-foreground/30 text-foreground bg-foreground/[0.06]" : "border-border text-muted-foreground")
                      }
                    >
                      {opt.badge}
                    </span>
                    <p className="text-[15px] text-foreground">{opt.title}</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{opt.subtitle}</p>

                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      {opt.items.map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <span className={"inline-block w-1 h-1 rounded-full mt-2 shrink-0 " + (sel ? "bg-foreground" : "bg-muted-foreground/40")} />
                          <span className="text-[13px] text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ───── STEP 3: Profile ───── */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h2 className="text-[17px] text-foreground tracking-[-0.01em] text-center mb-1">Your professional details</h2>
            <p className="text-[14px] text-muted-foreground text-center mb-6">We'll use this to find and verify your credentials.</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[14px] text-muted-foreground block mb-2">First name</label>
                <input type="text" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Sarah" className={inputCls} />
              </div>
              <div>
                <label className="text-[14px] text-muted-foreground block mb-2">Last name</label>
                <input type="text" value={lName} onChange={(e) => setLName(e.target.value)} placeholder="Chen" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">NPI number</label>
              <div className="relative">
                <input
                  type="text"
                  value={npi}
                  onChange={(e) => setNpi(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit NPI"
                  maxLength={10}
                  className={inputCls}
                />
                {role && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center text-[11px] tracking-[0.04em] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                    {role}
                  </span>
                )}
              </div>
              {npi !== "" && npi.length < 10 && (
                <p className="text-[13px] text-muted-foreground mt-1.5">{10 - npi.length} more digits needed</p>
              )}
            </div>

            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">Specialty</label>
              <select value={spec} onChange={(e) => setSpec(e.target.value)} className={selCls}>
                <option value="" disabled>Select specialty</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">Primary practice state</label>
              <select value={pState} onChange={(e) => setPState(e.target.value)} className={selCls}>
                <option value="" disabled>Select state</option>
                {ALL_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[14px] text-muted-foreground block mb-2">
                Phone <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-0100" className={inputCls} />
            </div>
          </div>
        )}

        {/* ───── STEP 4: Review ───── */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-[17px] text-foreground tracking-[-0.01em] text-center mb-2">Review &amp; confirm</h2>
            <p className="text-[14px] text-muted-foreground text-center mb-8">Make sure everything looks correct before creating your account.</p>

            <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border">
              {[
                { label: "Email", val: email },
                { label: "Role", val: role === "MD" ? "Physician (MD)" : "Nurse (RN)" },
                { label: "Name", val: fName + " " + lName },
                { label: "NPI", val: npi },
                { label: "Specialty", val: spec },
                { label: "Primary state", val: pState },
                ...(phone ? [{ label: "Phone", val: phone }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-[13px] text-muted-foreground">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-foreground">{row.val}</span>
                    {row.label === "Role" && (
                      <span className="inline-flex items-center text-[10px] tracking-[0.06em] text-muted-foreground border border-border rounded px-1.5 py-px">
                        {role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* credential preview */}
            <div className="bg-surface-elevated border border-border rounded-xl p-5 mt-4">
              <p className="text-[12px] text-muted-foreground uppercase tracking-[0.06em] mb-3">Credentials we'll verify</p>
              <div className="space-y-2">
                {(role === "MD" ? MD_VERIFY_LIST : RN_VERIFY_LIST).map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                    <span className="text-[14px] text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* agreement */}
            <label className="flex items-start gap-3 mt-6 cursor-pointer group">
              <div className="mt-0.5 relative">
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
                I agree to the <span className="text-foreground">Terms of Service</span> and <span className="text-foreground">Privacy Policy</span>, and consent to Credenza verifying my professional credentials through primary sources.
              </span>
            </label>
          </div>
        )}

        {/* ─── Bottom navigation ─── */}
        <div className="flex items-center justify-between mt-10">
          {currentStep > 1 ? (
            <button type="button" onClick={goBack} className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors">
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!valid}
              className={
                "inline-flex items-center gap-2 text-[14px] px-6 py-2.5 rounded-xl transition-all " +
                (valid
                  ? "bg-foreground text-background hover:opacity-90 cursor-pointer"
                  : "bg-foreground/20 text-background/40 cursor-not-allowed")
              }
            >
              Continue
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!valid}
              className={
                "text-[14px] px-6 py-2.5 rounded-xl transition-all " +
                (valid
                  ? "bg-foreground text-background hover:opacity-90 cursor-pointer"
                  : "bg-foreground/20 text-background/40 cursor-not-allowed")
              }
            >
              Create account
            </button>
          )}
        </div>

        <p className="text-[14px] text-muted-foreground text-center mt-10">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}