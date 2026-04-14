import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { ThemeToggle } from "./ui-components";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { seedDemoPassport } from "../api";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/role-select");
  };

  const handleDemoMode = async () => {
    setDemoLoading(true);
    try {
      await seedDemoPassport();
    } catch {
      /* API may not be running, still navigate */
    }
    setDemoLoading(false);
    navigate("/role-select");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <div className="absolute top-5 left-5">
        <Link to="/" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>
      <motion.div
        className="w-full max-w-[360px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Link to="/" className="block text-center text-[18px] text-foreground tracking-[-0.03em] mb-12">
          credenza
        </Link>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[14px] text-muted-foreground block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
            />
          </div>
          <div>
            <label className="text-[14px] text-muted-foreground block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-foreground text-background text-[15px] py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer mt-1"
          >
            Sign in
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[13px] text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button className="w-full border border-border bg-surface-elevated text-[15px] text-foreground py-3 rounded-xl hover:bg-secondary transition-colors cursor-pointer">
          Continue with SSO
        </button>

        <button
          onClick={handleDemoMode}
          disabled={demoLoading}
          className="w-full mt-3 border border-green/30 bg-green/5 text-[15px] text-green py-3 rounded-xl hover:bg-green/10 transition-colors cursor-pointer disabled:opacity-50"
        >
          {demoLoading ? "Seeding demo data\u2026" : "Launch demo mode"}
        </button>

        <p className="text-[15px] text-muted-foreground text-center mt-10">
          No account?{" "}
          <button onClick={() => navigate("/signup")} className="text-foreground hover:underline cursor-pointer">
            Get started
          </button>
        </p>
      </motion.div>
    </div>
  );
}