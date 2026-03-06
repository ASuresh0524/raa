import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { useCredentialing } from "./CredentialingContext";
import { UploadModal, ConfirmAddressModal } from "./UploadModal";
import { SectionLabel, Dot } from "./ui-components";

interface OpenTask {
  id: string;
  title: string;
  reason: string;
  sla: string;
  action: string;
  type: "upload" | "confirm";
}

interface CompletedTask {
  title: string;
  date: string;
}

const initialOpenTasks: OpenTask[] = [
  {
    id: "task-upload-malpractice",
    title: "Upload malpractice insurance certificate",
    reason: "Agent searched email archives, connected portals, and public registries. Not found. Required for Blue Shield enrollment.",
    sla: "Due in 2 days",
    action: "Upload",
    type: "upload",
  },
  {
    id: "task-confirm-address",
    title: "Confirm practice address",
    reason: "CA Medical Board shows 450 Sutter St. NPI registry shows 455 Sutter St. Confirm which is current.",
    sla: "Due in 5 days",
    action: "Confirm",
    type: "confirm",
  },
];

const initialCompleted: CompletedTask[] = [
  { title: "E-sign attestation for Valley Health", date: "Feb 28" },
  { title: "Connect ABIM portal", date: "Feb 25" },
  { title: "Confirm NPI number", date: "Feb 20" },
];

export function ClinicianTasks() {
  const { done } = useCredentialing();
  const [openTasks, setOpenTasks] = useState<OpenTask[]>(initialOpenTasks);
  const [completed, setCompleted] = useState<CompletedTask[]>(initialCompleted);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const handleAction = (task: OpenTask) => {
    setActiveTaskId(task.id);
    if (task.type === "upload") {
      setUploadOpen(true);
    } else if (task.type === "confirm") {
      setConfirmOpen(true);
    }
  };

  const completeTask = (taskId: string, detail?: string) => {
    const task = openTasks.find((t) => t.id === taskId);
    if (!task) return;
    setOpenTasks((prev) => prev.filter((t) => t.id !== taskId));
    setCompleted((prev) => [
      {
        title: detail ? `${task.title} — ${detail}` : task.title,
        date: "Mar 4",
      },
      ...prev,
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/app/clinician" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Tasks</h1>
      <p className="text-[15px] text-muted-foreground mt-1 mb-10">
        Only items that need your input.
      </p>

      {!done ? (
        <div className="bg-surface-elevated border border-border rounded-xl p-10 text-center">
          <p className="text-[15px] text-foreground mb-1">No active tasks</p>
          <p className="text-[14px] text-muted-foreground">
            Tasks will appear here once the credentialing agent identifies items that need your input.
          </p>
        </div>
      ) : (
        <>
          {openTasks.length > 0 ? (
            <div className="space-y-4 mb-14">
              {openTasks.map((task) => (
                <div key={task.id} className="bg-surface-elevated border border-border rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] text-foreground">{task.title}</p>
                      <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">{task.reason}</p>
                      <p className="text-[14px] text-yellow mt-3">{task.sla}</p>
                    </div>
                    <button
                      onClick={() => handleAction(task)}
                      className="shrink-0 text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer w-full sm:w-auto"
                    >
                      {task.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-elevated border border-border rounded-xl p-8 text-center mb-14">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-[14px] text-background">
                  ✓
                </div>
              </div>
              <p className="text-[15px] text-foreground mb-1">All tasks complete</p>
              <p className="text-[14px] text-muted-foreground">No pending items. You're all caught up.</p>
            </div>
          )}

          <SectionLabel>Completed</SectionLabel>
          <div className="mt-4">
            {completed.map((task, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Dot status="verified" />
                  <span className="text-[15px] text-muted-foreground">{task.title}</span>
                </div>
                <span className="text-[14px] text-text-secondary">{task.date}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upload Modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onComplete={(fileName) => {
          setUploadOpen(false);
          if (activeTaskId) completeTask(activeTaskId, fileName);
        }}
        title="Upload malpractice insurance"
        description="Certificate of insurance required for enrollment"
        requirements={[
          "Current policy — not expired",
          "Coverage minimums: $1M per occurrence / $3M aggregate",
          "Named insured must match NPI registration",
          "Must show policy number and effective dates",
        ]}
      />

      {/* Confirm Address Modal */}
      <ConfirmAddressModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onComplete={(address) => {
          setConfirmOpen(false);
          if (activeTaskId) completeTask(activeTaskId, address);
        }}
      />
    </div>
  );
}