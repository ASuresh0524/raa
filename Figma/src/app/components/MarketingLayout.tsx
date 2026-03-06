import { Outlet, Link, useLocation } from "react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ui-components";

const links = [
  { label: "How it works", path: "/how-it-works" },
  { label: "Clinicians", path: "/for-clinicians" },
  { label: "Organizations", path: "/for-organizations" },
  { label: "Security", path: "/security" },
];

export function MarketingLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-[1080px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-foreground tracking-[-0.04em] text-[15px]">
            credenza
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`text-[14px] transition-colors ${
                  location.pathname === l.path
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-[14px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              to="/login?demo=true"
              className="text-[14px] bg-foreground text-background px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Request demo
            </Link>
          </div>
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 py-5 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setMobileOpen(false)}
                className="text-[15px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border flex gap-4">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-[15px] text-muted-foreground">
                Log in
              </Link>
              <Link to="/login?demo=true" onClick={() => setMobileOpen(false)} className="text-[15px] text-foreground">
                Request demo
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-[1080px] mx-auto px-6 py-14 flex flex-col md:flex-row justify-between gap-10">
          <div>
            <span className="text-[15px] text-foreground tracking-[-0.04em]">credenza</span>
            <p className="text-[14px] text-muted-foreground mt-3 max-w-[240px] leading-relaxed">
              AI credentialing that runs itself.
            </p>
          </div>
          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-[12px] text-text-secondary uppercase tracking-[0.08em] mb-1">Product</span>
              <Link to="/how-it-works" className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">How it works</Link>
              <Link to="/for-clinicians" className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">Clinicians</Link>
              <Link to="/for-organizations" className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">Organizations</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12px] text-text-secondary uppercase tracking-[0.08em] mb-1">Company</span>
              <Link to="/security" className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">Security</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="max-w-[1080px] mx-auto px-6 py-6">
            <span className="text-[13px] text-muted-foreground">&copy; 2026 Credenza</span>
          </div>
        </div>
      </footer>
    </div>
  );
}