import { useState } from "react";
import { Link } from "react-router";
import { SectionLabel } from "./ui-components";
import { ArrowLeft } from "lucide-react";

const tabs = ["Organization", "Team", "Policies", "Security"];

export function OrgSettings() {
  const [active, setActive] = useState("Organization");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/app/org" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <h1 className="text-[22px] text-foreground tracking-[-0.02em] mb-8">Settings</h1>

      <div className="flex gap-1 mb-10 border-b border-border overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`text-[14px] px-4 py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              active === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {active === "Organization" && (
        <div className="space-y-8">
          <div className="bg-surface-elevated border border-border rounded-xl p-6 space-y-5">
            {[
              { label: "Organization name", value: "Valley Health Group" },
              { label: "Type", value: "Multi-Specialty Group" },
              { label: "Primary admin", value: "admin@valleyhealth.org" },
              { label: "Tax ID", value: "94-XXXXXXX" },
            ].map((f, i) => (
              <div key={i}>
                <label className="text-[14px] text-muted-foreground block mb-2">{f.label}</label>
                <input
                  defaultValue={f.value}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="bg-surface-elevated border border-border rounded-xl p-6">
            <SectionLabel>Facilities</SectionLabel>
            <div className="mt-4">
              {["Main Campus — San Francisco, CA", "East Clinic — Oakland, CA", "West Clinic — Palo Alto, CA"].map((f, i) => (
                <div key={i} className={`flex items-center justify-between py-4 ${
                  i < 2 ? "border-b border-border" : ""
                }`}>
                  <span className="text-[15px] text-foreground">{f}</span>
                  <button className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Edit</button>
                </div>
              ))}
            </div>
            <button className="text-[14px] text-muted-foreground hover:text-foreground mt-4 cursor-pointer transition-colors">+ Add facility</button>
          </div>

          <button className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
            Save changes
          </button>
        </div>
      )}

      {active === "Team" && (
        <div className="bg-surface-elevated border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <SectionLabel>Members</SectionLabel>
            <button className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">+ Invite</button>
          </div>
          {[
            { name: "John Admin", email: "john@valleyhealth.org", role: "Admin" },
            { name: "Sarah Staff", email: "sarah@valleyhealth.org", role: "Credentialing Staff" },
            { name: "Mike Viewer", email: "mike@valleyhealth.org", role: "Viewer" },
          ].map((m, i) => (
            <div key={i} className={`flex items-center justify-between py-4 ${
              i < 2 ? "border-b border-border" : ""
            }`}>
              <div>
                <p className="text-[15px] text-foreground">{m.name}</p>
                <p className="text-[13px] text-muted-foreground">{m.email}</p>
              </div>
              <span className="text-[14px] text-muted-foreground">{m.role}</span>
            </div>
          ))}
        </div>
      )}

      {active === "Policies" && (
        <div className="space-y-8">
          <div className="bg-surface-elevated border border-border rounded-xl p-6">
            <SectionLabel>Alert thresholds</SectionLabel>
            <div className="mt-4 space-y-4">
              {[
                { label: "First alert", value: "90 days" },
                { label: "Second alert", value: "60 days" },
                { label: "Urgent alert", value: "30 days" },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[15px] text-foreground">{a.label}</span>
                  <input defaultValue={a.value} className="w-24 text-right bg-background border border-border rounded-xl px-3 py-2 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-elevated border border-border rounded-xl p-6">
            <SectionLabel>Verification cadence</SectionLabel>
            <div className="mt-4 space-y-4">
              {[
                { label: "Sanctions recheck", value: "Daily" },
                { label: "License verification", value: "Weekly" },
                { label: "Full re-verification", value: "Monthly" },
              ].map((v, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[15px] text-foreground">{v.label}</span>
                  <span className="text-[14px] text-muted-foreground">{v.value}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
            Save policies
          </button>
        </div>
      )}

      {active === "Security" && (
        <div className="bg-surface-elevated border border-border rounded-xl p-6">
          {[
            { label: "Require MFA", desc: "All members must use multi-factor auth", on: true },
            { label: "SSO enforcement", desc: "Require single sign-on", on: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-5 border-b border-border">
              <div>
                <p className="text-[15px] text-foreground">{s.label}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
              <div className={`w-10 h-[22px] rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${s.on ? "bg-green" : "bg-secondary"}`}>
                <div className={`w-[18px] h-[18px] rounded-full transition-transform bg-white shadow-sm ${s.on ? "translate-x-[18px]" : ""}`} />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between py-5">
            <div>
              <p className="text-[15px] text-foreground">Session timeout</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">Auto log out after inactivity</p>
            </div>
            <span className="text-[14px] text-muted-foreground">30 min</span>
          </div>
        </div>
      )}
    </div>
  );
}