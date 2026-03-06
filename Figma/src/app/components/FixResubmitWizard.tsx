/* FixResubmitWizard – multi-step correction wizard modal */
import React from "react";
import { X, Upload, ChevronRight, ChevronLeft, Check, AlertCircle, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface RejectionItem {
  id: string;
  payer: string;
  credential: string;
  reason: string;
  rejectedDate: string;
  originalConf: string;
}

interface FixResubmitWizardProps {
  open: boolean;
  onClose: () => void;
  item: RejectionItem | null;
  isOrg?: boolean;
}

type Step = "review" | "fix" | "confirm" | "done";
const STEPS: { key: Step; label: string }[] = [
  { key: "review", label: "Review issue" },
  { key: "fix", label: "Fix credential" },
  { key: "confirm", label: "Confirm & resubmit" },
  { key: "done", label: "Submitted" },
];

export function FixResubmitWizard({ open, onClose, item, isOrg }: FixResubmitWizardProps) {
  const [step, setStep] = React.useState<Step>("review");
  const [dragOver, setDragOver] = React.useState(false);
  const [uploadedFile, setUploadedFile] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [newConf, setNewConf] = React.useState("");
  const [fixMode, setFixMode] = React.useState<"upload" | "request">("upload");
  const [requestMessage, setRequestMessage] = React.useState("");
  const [requestSent, setRequestSent] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setStep("review");
      setUploadedFile(null);
      setNote("");
      setSubmitting(false);
      setNewConf("");
      setFixMode("upload");
      setRequestMessage("");
      setRequestSent(false);
    }
  }, [open]);

  // Suggested fix based on the rejection reason — must be before early return
  const suggestedFix = React.useMemo(() => {
    if (!item) return { action: "Upload corrected documentation", docType: "Supporting document" };
    const r = item.reason.toLowerCase();
    if (r.includes("expired")) return { action: "Upload a current, unexpired document", docType: "Updated certificate or policy" };
    if (r.includes("address") || r.includes("match")) return { action: "Upload corrected documentation with matching address", docType: "Updated registration or verification letter" };
    if (r.includes("not found")) return { action: "Upload the missing credential document", docType: "Original certificate or verification letter" };
    return { action: "Upload corrected documentation", docType: "Supporting document" };
  }, [item]);

  if (!open || !item) return null;

  const currentIdx = STEPS.findIndex((s) => s.key === step);

  const handleFileSelect = (name: string) => {
    setUploadedFile(name);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    const conf = `${item.payer.replace(/\s+/g, "").slice(0, 3).toUpperCase()}-R-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    setTimeout(() => {
      setNewConf(conf);
      setSubmitting(false);
      setStep("done");
    }, 2000);
  };

  const handleClose = () => {
    if (step === "done") {
      if (fixMode === "request") {
        toast.success("Request sent to clinician", {
          description: `Dr. Sarah Chen will be asked to upload corrected ${item.credential.toLowerCase()}`,
        });
      } else {
        toast.success("Resubmission complete", {
          description: `${item.payer} — corrected ${item.credential} resubmitted as #${newConf}`,
        });
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="relative bg-surface-elevated border border-border rounded-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-[17px] text-foreground tracking-[-0.01em]">Fix &amp; resubmit</h2>
            <p className="text-[14px] text-muted-foreground mt-0.5">{item.payer} &middot; {item.credential}</p>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] tabular-nums shrink-0 transition-all ${
                    i < currentIdx ? "bg-green text-background" :
                    i === currentIdx ? "bg-foreground text-background" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {i < currentIdx ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-[13px] whitespace-nowrap hidden sm:block ${
                    i === currentIdx ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 lg:w-10 h-px mx-2 ${i < currentIdx ? "bg-green" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
          {/* ── Step 1: Review Issue ── */}
          {step === "review" && (
            <div>
              <div className="bg-red/5 border border-red/20 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-red shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[15px] text-foreground">Rejection reason</p>
                    <p className="text-[14px] text-muted-foreground mt-1">{item.reason}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-[14px] text-muted-foreground">Payer</span>
                  <span className="text-[14px] text-foreground">{item.payer}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-[14px] text-muted-foreground">Affected credential</span>
                  <span className="text-[14px] text-foreground">{item.credential}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-[14px] text-muted-foreground">Original confirmation</span>
                  <span className="text-[14px] text-foreground tabular-nums">#{item.originalConf}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-[14px] text-muted-foreground">Rejected</span>
                  <span className="text-[14px] text-foreground">{item.rejectedDate}</span>
                </div>
              </div>

              <div className="mt-6 bg-surface-elevated border border-border rounded-xl p-4">
                <p className="text-[13px] text-muted-foreground mb-1">Suggested fix</p>
                <p className="text-[14px] text-foreground">{suggestedFix.action}</p>
              </div>
            </div>
          )}

          {/* ── Step 2: Fix Credential ── */}
          {step === "fix" && (
            <div>
              {/* Mode toggle for org users */}
              {isOrg && (
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setFixMode("upload")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-[14px] cursor-pointer transition-all ${
                      fixMode === "upload"
                        ? "border-foreground bg-foreground/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    <Upload size={16} />
                    Upload document
                  </button>
                  <button
                    onClick={() => setFixMode("request")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-[14px] cursor-pointer transition-all ${
                      fixMode === "request"
                        ? "border-foreground bg-foreground/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    <Send size={16} />
                    Request from clinician
                  </button>
                </div>
              )}

              {fixMode === "upload" ? (
                <div>
                  <p className="text-[15px] text-foreground mb-1">Upload corrected document</p>
                  <p className="text-[14px] text-muted-foreground mb-5">{suggestedFix.docType}</p>

                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault(); setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileSelect(file.name);
                    }}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragOver ? "border-foreground bg-secondary/50" :
                      uploadedFile ? "border-green/40 bg-green/5" :
                      "border-border hover:border-foreground/30"
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f.name); }}
                    />
                    {uploadedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center">
                          <FileText size={20} className="text-green" />
                        </div>
                        <p className="text-[14px] text-foreground">{uploadedFile}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                          className="text-[13px] text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Replace file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <Upload size={20} className="text-muted-foreground" />
                        </div>
                        <p className="text-[14px] text-foreground">Drop file here or click to browse</p>
                        <p className="text-[13px] text-muted-foreground">PDF, JPG, PNG up to 10 MB</p>
                      </div>
                    )}
                  </div>

                  {/* Optional note */}
                  <div className="mt-6">
                    <label className="text-[14px] text-muted-foreground block mb-2">Note to reviewer (optional)</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="e.g. Updated malpractice policy effective March 1, 2026"
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-foreground/30 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[15px] text-foreground mb-1">Request corrected document from clinician</p>
                  <p className="text-[14px] text-muted-foreground mb-5">
                    The clinician will receive a notification to upload the corrected {item.credential.toLowerCase()}.
                  </p>

                  {requestSent ? (
                    <div className="border border-green/30 bg-green/5 rounded-xl p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-3">
                        <Check size={20} className="text-green" />
                      </div>
                      <p className="text-[14px] text-foreground">Request sent to clinician</p>
                      <p className="text-[13px] text-muted-foreground mt-1">They&apos;ll be notified to upload the corrected document</p>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border mb-5">
                        <div className="flex items-center justify-between px-5 py-3.5">
                          <span className="text-[14px] text-muted-foreground">Clinician</span>
                          <span className="text-[14px] text-foreground">Dr. Sarah Chen</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3.5">
                          <span className="text-[14px] text-muted-foreground">Document needed</span>
                          <span className="text-[14px] text-foreground">{item.credential}</span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-3.5">
                          <span className="text-[14px] text-muted-foreground">Reason</span>
                          <span className="text-[14px] text-foreground max-w-[220px] text-right">{item.reason}</span>
                        </div>
                      </div>

                      <label className="text-[14px] text-muted-foreground block mb-2">Message to clinician (optional)</label>
                      <textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        rows={3}
                        placeholder={`e.g. Please upload a current ${item.credential.toLowerCase()} — the one on file was rejected by ${item.payer}.`}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-foreground/30 transition-colors"
                      />

                      <button
                        onClick={() => {
                          setRequestSent(true);
                          toast.success("Request sent", { description: "Dr. Sarah Chen has been notified to upload the corrected document." });
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 text-[14px] bg-foreground text-background px-5 py-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <Send size={15} />
                        Send request to clinician
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Confirm & Resubmit ── */}
          {step === "confirm" && (
            <div>
              {submitting ? (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[15px] text-foreground">
                    {fixMode === "request" ? `Requesting document from clinician...` : `Resubmitting to ${item.payer}...`}
                  </p>
                  <p className="text-[14px] text-muted-foreground mt-1">
                    {fixMode === "request" ? "Sending notification and updating request status" : "Packaging corrected credentials and transmitting"}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[15px] text-foreground mb-5">
                    {fixMode === "request" ? "Review your request before sending" : "Review your correction before resubmitting"}
                  </p>

                  <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border">
                    <div className="flex items-center justify-between px-5 py-3.5">
                      <span className="text-[14px] text-muted-foreground">Payer</span>
                      <span className="text-[14px] text-foreground">{item.payer}</span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3.5">
                      <span className="text-[14px] text-muted-foreground">Credential</span>
                      <span className="text-[14px] text-foreground">{item.credential}</span>
                    </div>
                    {fixMode === "upload" ? (
                      <div className="flex items-center justify-between px-5 py-3.5">
                        <span className="text-[14px] text-muted-foreground">Corrected document</span>
                        <span className="text-[14px] text-foreground">{uploadedFile || "No file uploaded"}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-5 py-3.5">
                        <span className="text-[14px] text-muted-foreground">Action</span>
                        <span className="text-[14px] text-foreground">Request from clinician</span>
                      </div>
                    )}
                    {fixMode === "upload" && note && (
                      <div className="px-5 py-3.5">
                        <span className="text-[14px] text-muted-foreground block mb-1">Note</span>
                        <span className="text-[14px] text-foreground">{note}</span>
                      </div>
                    )}
                    {fixMode === "request" && requestMessage && (
                      <div className="px-5 py-3.5">
                        <span className="text-[14px] text-muted-foreground block mb-1">Message to clinician</span>
                        <span className="text-[14px] text-foreground">{requestMessage}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-5 py-3.5">
                      <span className="text-[14px] text-muted-foreground">Original submission</span>
                      <span className="text-[14px] text-foreground tabular-nums">#{item.originalConf}</span>
                    </div>
                  </div>

                  <div className="mt-5 bg-yellow/5 border border-yellow/20 rounded-xl p-4">
                    <p className="text-[13px] text-muted-foreground">
                      {fixMode === "request"
                        ? `This will send a request to Dr. Sarah Chen to upload a corrected ${item.credential.toLowerCase()}. You'll be notified once the document is received.`
                        : `This will create a new submission to ${item.payer} with the corrected ${item.credential.toLowerCase()}. The original rejected submission #${item.originalConf} will be marked as superseded.`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Done ── */}
          {step === "done" && (
            <div className="py-8 text-center">
              <motion.div
                className="w-14 h-14 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
              >
                <Check size={28} className="text-green" />
              </motion.div>
              {fixMode === "request" ? (
                <div>
                  <p className="text-[17px] text-foreground tracking-[-0.01em]">Request sent to clinician</p>
                  <p className="text-[14px] text-muted-foreground mt-2 mb-6">
                    Dr. Sarah Chen has been notified to upload a corrected {item.credential.toLowerCase()}
                  </p>

                  <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border text-left max-w-xs mx-auto">
                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-[13px] text-muted-foreground">Request ID</span>
                      <span className="text-[13px] text-foreground tabular-nums">#{newConf}</span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-[13px] text-muted-foreground">Status</span>
                      <span className="text-[13px] text-foreground">Awaiting clinician</span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-[13px] text-muted-foreground">Related to</span>
                      <span className="text-[13px] text-foreground tabular-nums">#{item.originalConf}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[17px] text-foreground tracking-[-0.01em]">Resubmission sent</p>
                  <p className="text-[14px] text-muted-foreground mt-2 mb-6">
                    Corrected {item.credential.toLowerCase()} has been transmitted to {item.payer}
                  </p>

                  <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border text-left max-w-xs mx-auto">
                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-[13px] text-muted-foreground">New confirmation</span>
                      <span className="text-[13px] text-foreground tabular-nums">#{newConf}</span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-[13px] text-muted-foreground">Status</span>
                      <span className="text-[13px] text-foreground">Pending review</span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-[13px] text-muted-foreground">Replaces</span>
                      <span className="text-[13px] text-foreground tabular-nums">#{item.originalConf}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          {step === "done" ? (
            <div className="flex-1 flex justify-end">
              <button
                onClick={handleClose}
                className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => {
                  if (step === "review") { handleClose(); }
                  else { setStep(STEPS[currentIdx - 1].key); }
                }}
                className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
                {step === "review" ? "Cancel" : "Back"}
              </button>

              {step === "confirm" ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-1.5 text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {fixMode === "request" ? "Send request" : `Resubmit to ${item.payer}`}
                </button>
              ) : (
                <button
                  onClick={() => setStep(STEPS[currentIdx + 1].key)}
                  disabled={step === "fix" && fixMode === "upload" && !uploadedFile}
                  className="flex items-center gap-1.5 text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}