import React, { useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Dot } from "./ui-components";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (fileName: string) => void;
  title: string;
  description: string;
  acceptLabel?: string;
  acceptTypes?: string;
  requirements?: string[];
}

export function UploadModal({
  open,
  onClose,
  onComplete,
  title,
  description,
  acceptLabel = "PDF, JPG, or PNG up to 10 MB",
  acceptTypes = ".pdf,.jpg,.jpeg,.png",
  requirements,
}: UploadModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploaded, setUploaded] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = React.useCallback((f: File) => {
    setFile(f);
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = () => {
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
      setTimeout(() => {
        onComplete(file.name);
        setFile(null);
        setUploaded(false);
      }, 1200);
    }, 1500);
  };

  const reset = () => {
    setFile(null);
    setUploading(false);
    setUploaded(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h3 className="text-[16px] text-foreground">{title}</h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Upload success */}
          {uploaded && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
                  ✓
                </div>
              </div>
              <p className="text-[15px] text-foreground mb-1">Upload complete</p>
              <p className="text-[14px] text-muted-foreground">{file?.name}</p>
              <p className="text-[13px] text-text-secondary mt-2">Verifying document…</p>
            </div>
          )}

          {/* Uploading state */}
          {uploading && !uploaded && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-border border-t-foreground animate-spin" />
              </div>
              <p className="text-[15px] text-foreground mb-1">Uploading…</p>
              <p className="text-[14px] text-muted-foreground">{file?.name}</p>
            </div>
          )}

          {/* File picker */}
          {!uploading && !uploaded && (
            <>
              {/* Requirements */}
              {requirements && requirements.length > 0 && (
                <div className="mb-5">
                  <p className="text-[13px] text-text-secondary mb-2">Requirements</p>
                  <div className="space-y-1.5">
                    {requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Dot status="pending" />
                        <span className="text-[13px] text-muted-foreground">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-foreground bg-secondary/40"
                    : file
                    ? "border-border bg-secondary/20"
                    : "border-border hover:border-muted-foreground hover:bg-secondary/20"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={acceptTypes}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />

                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-[14px] text-foreground">
                      ✓
                    </div>
                    <div>
                      <p className="text-[14px] text-foreground">{file.name}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB &middot;{" "}
                        <button
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="text-muted-foreground hover:text-foreground underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-[14px] text-muted-foreground">
                      ↑
                    </div>
                    <div>
                      <p className="text-[14px] text-foreground">Drop file here or click to browse</p>
                      <p className="text-[13px] text-muted-foreground mt-1">{acceptLabel}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!uploading && !uploaded && (
          <div className="flex justify-between px-6 pb-6 pt-2">
            <button
              onClick={handleClose}
              className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file}
              className={`text-[14px] px-5 py-2.5 rounded-lg transition-opacity cursor-pointer ${
                file
                  ? "bg-foreground text-background hover:opacity-90"
                  : "bg-foreground/30 text-background/50 cursor-not-allowed"
              }`}
            >
              Upload &amp; verify
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Confirm Address Modal ──

interface ConfirmAddressModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (address: string) => void;
}

export function ConfirmAddressModal({ open, onClose, onComplete }: ConfirmAddressModalProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [confirming, setConfirming] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  const addresses = [
    { source: "CA Medical Board", address: "450 Sutter St, Suite 840, San Francisco, CA 94108" },
    { source: "NPI Registry", address: "455 Sutter St, Suite 200, San Francisco, CA 94108" },
  ];

  const handleConfirm = () => {
    if (!selected) return;
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      setConfirmed(true);
      setTimeout(() => {
        onComplete(selected);
        setSelected(null);
        setConfirmed(false);
      }, 1200);
    }, 1000);
  };

  const handleClose = () => {
    setSelected(null);
    setConfirming(false);
    setConfirmed(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h3 className="text-[16px] text-foreground">Confirm practice address</h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">Two sources show different addresses</p>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {confirmed ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
                  ✓
                </div>
              </div>
              <p className="text-[15px] text-foreground mb-1">Address confirmed</p>
              <p className="text-[14px] text-muted-foreground">{selected}</p>
              <p className="text-[13px] text-text-secondary mt-2">Updating all records…</p>
            </div>
          ) : confirming ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-border border-t-foreground animate-spin" />
              </div>
              <p className="text-[15px] text-foreground">Confirming…</p>
            </div>
          ) : (
            <>
              <div className="bg-surface-elevated border border-border rounded-lg p-3.5 mb-5">
                <p className="text-[13px] text-muted-foreground">
                  Select your current practice address. The other record will be flagged for correction.
                </p>
              </div>

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <button
                    key={addr.source}
                    onClick={() => setSelected(addr.address)}
                    className={`w-full text-left px-4 py-4 rounded-xl cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                      selected === addr.address
                        ? "bg-secondary border-2 border-foreground"
                        : "bg-surface-elevated border border-border hover:bg-secondary/50"
                    }`}
                  >
                    <div>
                      <p className="text-[13px] text-text-secondary mb-1">{addr.source}</p>
                      <p className="text-[15px] text-foreground">{addr.address}</p>
                    </div>
                    {selected === addr.address && (
                      <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-1">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {!confirming && !confirmed && (
          <div className="flex justify-between px-6 pb-6 pt-2">
            <button
              onClick={handleClose}
              className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className={`text-[14px] px-5 py-2.5 rounded-lg transition-opacity cursor-pointer ${
                selected
                  ? "bg-foreground text-background hover:opacity-90"
                  : "bg-foreground/30 text-background/50 cursor-not-allowed"
              }`}
            >
              Confirm address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Generic Action Modal (for org-side send/request/reminder actions) ──

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  title: string;
  description: string;
  provider: string;
  actionLabel: string;
  details?: { label: string; value: string }[];
  confirmMessage?: string;
  successMessage?: string;
  successDetail?: string;
}

export function ActionModal({
  open,
  onClose,
  onComplete,
  title,
  description,
  provider,
  actionLabel,
  details,
  confirmMessage,
  successMessage = "Action completed",
  successDetail,
}: ActionModalProps) {
  const [processing, setProcessing] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);

  const handleAction = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
      setTimeout(() => {
        onComplete();
        setCompleted(false);
      }, 1200);
    }, 1200);
  };

  const handleClose = () => {
    setProcessing(false);
    setCompleted(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h3 className="text-[16px] text-foreground">{title}</h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">{provider}</p>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {completed ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
                  ✓
                </div>
              </div>
              <p className="text-[15px] text-foreground mb-1">{successMessage}</p>
              {successDetail && <p className="text-[14px] text-muted-foreground">{successDetail}</p>}
            </div>
          ) : processing ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-border border-t-foreground animate-spin" />
              </div>
              <p className="text-[15px] text-foreground">Processing…</p>
            </div>
          ) : (
            <>
              <p className="text-[14px] text-muted-foreground mb-5">{description}</p>
              
              {details && details.length > 0 && (
                <div className="bg-surface-elevated border border-border rounded-xl p-4 mb-5 space-y-3">
                  {details.map((d, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-[14px] text-muted-foreground">{d.label}</span>
                      <span className="text-[14px] text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {confirmMessage && (
                <div className="bg-surface-elevated border border-border rounded-lg p-3.5">
                  <p className="text-[13px] text-muted-foreground">{confirmMessage}</p>
                </div>
              )}
            </>
          )}
        </div>

        {!processing && !completed && (
          <div className="flex justify-between px-6 pb-6 pt-2">
            <button
              onClick={handleClose}
              className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Assign Modal ──

interface AssignModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (assignee: string) => void;
  provider: string;
  taskTitle: string;
}

const teamMembers = [
  { name: "Rachel Martinez", role: "Credentialing Coordinator" },
  { name: "David Park", role: "Credentialing Specialist" },
  { name: "Jennifer Wu", role: "Compliance Manager" },
  { name: "Michael Torres", role: "Operations Lead" },
];

export function AssignModal({ open, onClose, onComplete, provider, taskTitle }: AssignModalProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [assigning, setAssigning] = React.useState(false);
  const [assigned, setAssigned] = React.useState(false);

  const handleAssign = () => {
    if (!selected) return;
    setAssigning(true);
    setTimeout(() => {
      setAssigning(false);
      setAssigned(true);
      setTimeout(() => {
        onComplete(selected);
        setSelected(null);
        setAssigned(false);
      }, 1200);
    }, 800);
  };

  const handleClose = () => {
    setSelected(null);
    setAssigning(false);
    setAssigned(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h3 className="text-[16px] text-foreground">Assign task</h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">{taskTitle}</p>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {assigned ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
                  ✓
                </div>
              </div>
              <p className="text-[15px] text-foreground mb-1">Task assigned</p>
              <p className="text-[14px] text-muted-foreground">{selected} will be notified</p>
            </div>
          ) : assigning ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full border-2 border-border border-t-foreground animate-spin" />
              </div>
              <p className="text-[15px] text-foreground">Assigning…</p>
            </div>
          ) : (
            <>
              <p className="text-[14px] text-muted-foreground mb-4">{provider} &middot; Select a team member to handle this task.</p>
              <div className="space-y-1">
                {teamMembers.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setSelected(m.name)}
                    className={`w-full text-left px-4 py-3.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                      selected === m.name
                        ? "bg-secondary border border-border"
                        : "hover:bg-secondary/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[12px] text-foreground">
                        {m.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-[14px] text-foreground">{m.name}</p>
                        <p className="text-[12px] text-muted-foreground">{m.role}</p>
                      </div>
                    </div>
                    {selected === m.name && (
                      <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {!assigning && !assigned && (
          <div className="flex justify-between px-6 pb-6 pt-2">
            <button
              onClick={handleClose}
              className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer px-4 py-2.5 rounded-lg hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selected}
              className={`text-[14px] px-5 py-2.5 rounded-lg transition-opacity cursor-pointer ${
                selected
                  ? "bg-foreground text-background hover:opacity-90"
                  : "bg-foreground/30 text-background/50 cursor-not-allowed"
              }`}
            >
              Assign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
