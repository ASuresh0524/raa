import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

// ── Status dot — the only color in the system ──
type DotStatus = "verified" | "pending" | "error" | "warning" | "attention" | "expired";

const dotColor: Record<DotStatus, string> = {
  verified: "bg-green",
  pending: "bg-muted-foreground",
  error: "bg-red",
  warning: "bg-yellow",
  attention: "bg-yellow",
  expired: "bg-red",
};

export function Dot({ status, size = "sm" }: { status: DotStatus; size?: "sm" | "md" }) {
  const s = size === "md" ? "w-2.5 h-2.5" : "w-2 h-2";
  return <span className={`inline-block rounded-full shrink-0 ${s} ${dotColor[status]}`} />;
}

export function StatusLabel({
  status,
  children,
}: {
  status: DotStatus;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2.5 text-sm text-muted-foreground">
      <Dot status={status} />
      {children}
    </span>
  );
}

// ── Theme toggle ──
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer ${className}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
    </button>
  );
}

// ── Section label ──
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12px] text-text-secondary uppercase tracking-[0.08em]">
      {children}
    </span>
  );
}

// ── Divider ──
export function Divider() {
  return <div className="h-px bg-border" />;
}