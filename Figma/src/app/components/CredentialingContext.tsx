import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CredentialingState {
  started: boolean;
  done: boolean;
  visibleCount: number;
  totalSteps: number;
  start: () => void;
  reset: () => void;
  setVisibleCount: (n: number) => void;
  setDone: (d: boolean) => void;
}

const CredentialingContext = createContext<CredentialingState | null>(null);

export function CredentialingProvider({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const totalSteps = 27;

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
    <CredentialingContext.Provider value={{ started, done, visibleCount, totalSteps, start, reset, setVisibleCount, setDone }}>
      {children}
    </CredentialingContext.Provider>
  );
}

export function useCredentialing() {
  const ctx = useContext(CredentialingContext);
  if (!ctx) throw new Error("useCredentialing must be used within CredentialingProvider");
  return ctx;
}
