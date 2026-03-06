import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ClinicianType = "MD" | "RN" | null;

interface CredentialingState {
  started: boolean;
  done: boolean;
  visibleCount: number;
  totalSteps: number;
  clinicianType: ClinicianType;
  start: () => void;
  reset: () => void;
  setVisibleCount: (n: number) => void;
  setDone: (d: boolean) => void;
  setClinicianType: (t: ClinicianType) => void;
}

const CredentialingContext = createContext<CredentialingState | null>(null);

export function CredentialingProvider({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [clinicianType, setClinicianTypeState] = useState<ClinicianType>(() => {
    try {
      const stored = localStorage.getItem("clinicianType");
      if (stored === "MD" || stored === "RN") return stored;
    } catch {}
    return null;
  });
  const totalSteps = 27;

  const setClinicianType = useCallback((t: ClinicianType) => {
    setClinicianTypeState(t);
    try {
      if (t) localStorage.setItem("clinicianType", t);
      else localStorage.removeItem("clinicianType");
    } catch {}
  }, []);

  const start = useCallback(() => {
    setStarted(true);
    setVisibleCount(0);
    setDone(false);
  }, []);

  const reset = useCallback(() => {
    setStarted(false);
    setDone(false);
    setVisibleCount(0);
  }, []);

  return (
    <CredentialingContext.Provider value={{ started, done, visibleCount, totalSteps, clinicianType, start, reset, setVisibleCount, setDone, setClinicianType }}>
      {children}
    </CredentialingContext.Provider>
  );
}

export function useCredentialing() {
  const ctx = useContext(CredentialingContext);
  if (!ctx) throw new Error("useCredentialing must be used within CredentialingProvider");
  return ctx;
}