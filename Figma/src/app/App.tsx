/* App – cache-bust v4 */
import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "sonner";

const toastStyle = {
  background: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  color: "var(--color-foreground)",
} as const;

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-center"
        toastOptions={{ style: toastStyle }}
      />
    </ThemeProvider>
  );
}
