import { useNavigate } from "react-router";
import { ThemeToggle } from "./ui-components";
import { ArrowRight } from "lucide-react";

export function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-xl">
        <div className="text-center mb-16">
          <span className="text-[18px] text-foreground tracking-[-0.03em]">credenza</span>
          <h1 className="text-[22px] tracking-[-0.02em] mt-6 text-foreground">Choose your workspace</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              label: "Clinician",
              desc: "Manage your Credentialing Passport, grant access, resolve tasks, and stay verified.",
              path: "/app/clinician",
            },
            {
              label: "Organization",
              desc: "Add clinicians, request work, monitor progress, resolve exceptions, manage compliance.",
              path: "/app/org",
            },
          ].map((role) => (
            <button
              key={role.label}
              onClick={() => navigate(role.path)}
              className="bg-surface-elevated border border-border rounded-xl p-7 text-left hover:border-muted-foreground/40 transition-all cursor-pointer group"
            >
              <p className="text-[16px] text-foreground">{role.label}</p>
              <p className="text-[14px] text-muted-foreground mt-3 leading-relaxed">
                {role.desc}
              </p>
              <span className="inline-flex items-center gap-2 mt-6 text-[14px] text-muted-foreground group-hover:text-foreground transition-colors">
                Continue
                <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
