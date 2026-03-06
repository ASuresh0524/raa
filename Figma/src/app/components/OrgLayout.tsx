import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { ThemeToggle } from "./ui-components";
import { ChevronDown } from "lucide-react";

const nav = [
  { label: "Home", path: "/app/org" },
  { label: "Providers", path: "/app/org/providers" },
  { label: "Requests", path: "/app/org/requests" },
  { label: "Submissions", path: "/app/org/submissions" },
  { label: "Attention", path: "/app/org/attention", badge: "5" },
  { label: "Monitoring", path: "/app/org/monitoring" },
  { label: "Reports", path: "/app/org/reports" },
  { label: "Settings", path: "/app/org/settings" },
];

const mobileNav = nav.slice(0, 5);
const mobileMoreNav = nav.slice(5);

export function OrgLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/app/org" && location.pathname.startsWith(path));

  const isMoreActive = mobileMoreNav.some((item) => isActive(item.path));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="shrink-0 bg-background/80 backdrop-blur-xl sticky top-0 z-30 border-b border-border">
        <div className="flex items-center justify-between h-14 px-5 lg:px-8 max-w-[1280px] mx-auto w-full">
          {/* Left: wordmark + nav */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-[15px] text-foreground tracking-[-0.04em] shrink-0"
            >
              credenza
            </Link>

            <nav className="hidden lg:flex items-center">
              {nav.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative text-[13px] tracking-[-0.01em] px-3 py-1.5 rounded-md transition-colors ${
                      active
                        ? "text-foreground bg-foreground/[0.07]"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {item.label}
                      {item.badge && (
                        <span className="text-[11px] tabular-nums bg-yellow/15 text-yellow px-1.5 py-px rounded-[4px]">
                          {item.badge}
                        </span>
                      )}
                    </span>
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
                  VH
                </span>
                <span className="hidden sm:inline">Valley Health</span>
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
                        Valley Health Group
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        Multi-Specialty
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

      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around h-14 px-1 max-w-lg mx-auto">
          {mobileNav.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-md transition-colors min-w-0 relative ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="text-[11px] truncate">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-0.5 right-0 w-4 h-4 text-[9px] bg-yellow text-background rounded-full flex items-center justify-center tabular-nums">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-md transition-colors min-w-0 cursor-pointer ${
                isMoreActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-[3px]">
                <span className="w-[3px] h-[3px] rounded-full bg-current" />
                <span className="w-[3px] h-[3px] rounded-full bg-current" />
                <span className="w-[3px] h-[3px] rounded-full bg-current" />
              </div>
              <span className="text-[11px]">More</span>
            </button>
            {moreOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMoreOpen(false)}
                />
                <div className="absolute bottom-full right-0 mb-2 w-40 bg-surface-elevated border border-border rounded-xl z-50 py-1.5 shadow-xl">
                  {mobileMoreNav.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center px-4 py-2.5 text-[13px] transition-colors ${
                          active
                            ? "text-foreground bg-secondary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}