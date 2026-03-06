/* SignupPage – choose clinician or organization signup path */
import React from "react";
import { Link, useNavigate } from "react-router";
import { ThemeToggle } from "./ui-components";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <div className="absolute top-5 left-5">
        <Link to="/login" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
          Sign in
        </Link>
      </div>
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-xl">
        <div className="text-center mb-16">
          <Link to="/" className="text-[18px] text-foreground tracking-[-0.03em]">credenza</Link>
          <h1 className="text-[22px] tracking-[-0.02em] mt-6 text-foreground">Get started</h1>
          <p className="text-[15px] text-muted-foreground mt-2">Choose how you'll use Credenza.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              label: "Clinician",
              badge: "MD / RN",
              desc: "Create your Credentialing Passport. We'll verify your licenses, certifications, and credentials — then keep them monitored.",
              path: "/signup/clinician",
              items: ["NPI & identity verification", "License & certification tracking", "Continuous monitoring"],
            },
            {
              label: "Organization",
              badge: "ORG",
              desc: "Set up your credentialing workspace. Manage provider rosters, track verifications, submit payer enrollments, and stay compliant.",
              path: "/signup/organization",
              items: ["Provider roster management", "Automated verification", "Compliance reporting"],
            },
          ].map((role) => (
            <button
              key={role.label}
              onClick={() => navigate(role.path)}
              className="bg-surface-elevated border border-border rounded-xl p-7 text-left hover:border-muted-foreground/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-border text-[12px] tracking-[0.04em] text-muted-foreground group-hover:border-muted-foreground/50 transition-colors">
                  {role.badge}
                </span>
                <p className="text-[16px] text-foreground">{role.label}</p>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                {role.desc}
              </p>

              <div className="mt-5 pt-4 border-t border-border space-y-2">
                {role.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                    <span className="text-[13px] text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <span className="inline-flex items-center gap-2 mt-6 text-[14px] text-muted-foreground group-hover:text-foreground transition-colors">
                Get started
                <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>

        <p className="text-[14px] text-muted-foreground text-center mt-12">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
