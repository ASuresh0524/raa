import { ChevronDown } from "lucide-react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { ThemeToggle } from "./ui-components";
import { CredentialingProvider } from "./CredentialingContext";

const nav = [
  { label: "Dashboard", path: "/app/clinician" },
  { label: "Tasks", path: "/app/clinician/tasks" },
  { label: "Passport", path: "/app/clinician/passport" },
  { label: "Requests", path: "/app/clinician/requests" },
  { label: "Share", path: "/app/clinician/share" },
];

export function ClinicianLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/app/clinician" && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="shrink-0 bg-background/80 backdrop-blur-xl sticky top-0 z-30 border-b border-border">
        <div className="flex items-center justify-between h-14 px-5 md:px-8 max-w-[1120px] mx-auto w-full">
          {/* Left: wordmark + nav */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-[15px] text-foreground tracking-[-0.04em] shrink-0"
            >
              credenza
            </Link>

            <nav className="hidden md:flex items-center">
              {nav.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-[13px] tracking-[-0.01em] px-3 py-1.5 rounded-md transition-colors ${
                      active
                        ? "text-foreground bg-foreground/[0.07]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: theme + account */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-2.5 py-1.5 rounded-md hover:bg-foreground/[0.05]"
              >
                <span className="w-6 h-6 rounded-full bg-foreground/[0.08] border border-foreground/[0.06] flex items-center justify-center text-[11px] text-foreground">
                  SC
                </span>
                <span className="hidden sm:inline">Dr. Chen</span>
                <ChevronDown size={12} className="opacity-40" />
              </button>
              {open && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface-elevated border border-border rounded-xl z-50 py-1.5 shadow-xl">
                    <div className="px-4 py-2.5 border-b border-border mb-1">
                      <p className="text-[13px] text-foreground">
                        Dr. Sarah Chen
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        Internal Medicine
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate("/role-select");
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
                    >
                      Switch workspace
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate("/login");
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <CredentialingProvider>
          <Outlet />
        </CredentialingProvider>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around h-14 px-2 max-w-lg mx-auto">
          {nav.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-md transition-colors min-w-0 ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="text-[11px] truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}