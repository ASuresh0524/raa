/** ResolveModal — shared resolve-action popup used across the platform */
import React from "react";
import { X } from "lucide-react";
import { Dot } from "./ui-components";
import { toast } from "sonner";
import { motion } from "motion/react";

type ResolveAction = "upload" | "note" | "escalate" | "mark-resolved";

interface ResolveModalProps {
  open: boolean;
  onClose: () => void;
  itemLabel: string;
  itemDetail?: string;
  itemStatus?: "verified" | "pending" | "warning" | "error";
}

const ACTIONS: { key: ResolveAction; label: string; description: string }[] = [
  { key: "upload", label: "Upload document", description: "Attach a supporting document to resolve this item" },
  { key: "note", label: "Add note", description: "Provide context or explanation for the reviewer" },
  { key: "escalate", label: "Escalate", description: "Flag for manual review by your credentialing team" },
  { key: "mark-resolved", label: "Mark as resolved", description: "Confirm this item has been addressed" },
];

export function ResolveModal({ open, onClose, itemLabel, itemDetail, itemStatus = "warning" }: ResolveModalProps) {
  const [selectedAction, setSelectedAction] = React.useState<ResolveAction | null>(null);
  const [noteText, setNoteText] = React.useState("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const reset = React.useCallback(() => {
    setSelectedAction(null);
    setNoteText("");
    setFileName(null);
    setSubmitting(false);
  }, []);

  const handleClose = React.useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFileName(f.name);
  }, []);

  const handleSubmit = React.useCallback(() => {
    if (!selectedAction) return;
    setSubmitting(true);

    setTimeout(() => {
      const messages: Record<ResolveAction, { title: string; desc: string }> = {
        upload: { title: "Document uploaded", desc: `${fileName || "File"} attached to: ${itemLabel}` },
        note: { title: "Note added", desc: `Note added to: ${itemLabel}` },
        escalate: { title: "Escalated", desc: `${itemLabel} flagged for manual review` },
        "mark-resolved": { title: "Resolved", desc: `${itemLabel} marked as resolved` },
      };
      const msg = messages[selectedAction];
      toast.success(msg.title, { description: msg.desc });
      handleClose();
    }, 600);
  }, [selectedAction, fileName, itemLabel, handleClose]);

  if (!open) return null;

  const canSubmit =
    selectedAction === "mark-resolved" ||
    selectedAction === "escalate" ||
    (selectedAction === "upload" && fileName) ||
    (selectedAction === "note" && noteText.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        className="bg-background border border-border rounded-xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] text-foreground">Resolve item</h3>
            <div className="flex items-center gap-2 mt-2">
              <Dot status={itemStatus} />
              <p className="text-[14px] text-foreground truncate">{itemLabel}</p>
            </div>
            {itemDetail && (
              <p className="text-[13px] text-muted-foreground mt-1 ml-[18px]">{itemDetail}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 hover:bg-secondary rounded-lg transition-colors shrink-0 ml-3"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Action selection */}
          <p className="text-[13px] text-text-secondary tracking-wide uppercase mb-3">Choose an action</p>
          <div className="space-y-2 mb-6">
            {ACTIONS.map((action) => {
              const isActive = selectedAction === action.key;
              return (
                <button
                  key={action.key}
                  onClick={() => setSelectedAction(action.key)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? "bg-foreground/[0.05] border-foreground/20"
                      : "bg-surface-elevated border-border hover:border-foreground/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? "border-foreground" : "border-border"
                      }`}
                    >
                      {isActive && <span className="w-2 h-2 rounded-full bg-foreground" />}
                    </span>
                    <div>
                      <p className="text-[14px] text-foreground">{action.label}</p>
                      <p className="text-[13px] text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Conditional inputs */}
          {selectedAction === "upload" && (
            <div className="mb-2">
              <p className="text-[13px] text-text-secondary tracking-wide uppercase mb-3">Attach file</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-border rounded-xl py-6 text-center cursor-pointer hover:border-foreground/20 transition-colors"
              >
                {fileName ? (
                  <div>
                    <p className="text-[14px] text-foreground">{fileName}</p>
                    <p className="text-[12px] text-muted-foreground mt-1">Click to replace</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[14px] text-muted-foreground">Click to select a file</p>
                    <p className="text-[12px] text-text-secondary mt-1">PDF, JPG, PNG, DOC up to 10 MB</p>
                  </div>
                )}
              </button>
            </div>
          )}

          {selectedAction === "note" && (
            <div className="mb-2">
              <p className="text-[13px] text-text-secondary tracking-wide uppercase mb-3">Your note</p>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Describe how this item was resolved or provide additional context…"
                rows={4}
                className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none transition-all"
              />
            </div>
          )}

          {selectedAction === "escalate" && (
            <div className="bg-surface-elevated border border-border rounded-xl p-4 mb-2">
              <p className="text-[13px] text-foreground">This item will be flagged for manual review</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Your credentialing team will be notified and can take further action. Average response time is 1–2 business days.
              </p>
            </div>
          )}

          {selectedAction === "mark-resolved" && (
            <div className="bg-surface-elevated border border-border rounded-xl p-4 mb-2">
              <p className="text-[13px] text-foreground">Confirm resolution</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                This will mark the item as resolved. If further action is needed later, the system will re-flag it automatically.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-5 border-t border-border shrink-0">
          <button
            onClick={handleClose}
            className="text-[14px] text-muted-foreground hover:text-foreground border border-border px-5 py-2.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`flex-1 text-[14px] py-2.5 rounded-lg transition-opacity cursor-pointer ${
              canSubmit && !submitting
                ? "bg-foreground text-background hover:opacity-90"
                : "bg-foreground/30 text-background/50 cursor-not-allowed"
            }`}
          >
            {submitting ? "Submitting…" : selectedAction ? ACTIONS.find((a) => a.key === selectedAction)!.label : "Select an action"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}