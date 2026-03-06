import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { SectionLabel } from "./ui-components";
import { Link } from "react-router";
import { ActionModal, AssignModal, UploadModal } from "./UploadModal";
import { toast } from "sonner";

interface Task {
  id: string;
  provider: string;
  title: string;
  reason: string;
  searched: string[];
  action: string;
  sla: string;
  overdue: boolean;
  assignee?: string;
  modalType: "request-upload" | "request-confirm" | "start-renewal" | "send-reminder";
}

const initialTasks: Task[] = [
  {
    id: "org-task-1",
    provider: "Dr. James Wilson",
    title: "Missing malpractice insurance certificate",
    reason: "Agent searched email archives, connected portals, and public registries. Not found.",
    searched: ["Email archives", "Connected portals", "Public registries"],
    action: "Request from clinician",
    sla: "2d",
    overdue: false,
    modalType: "request-upload",
  },
  {
    id: "org-task-2",
    provider: "Dr. Maria Santos",
    title: "Conflicting NPI practice address",
    reason: "NPI Registry: 123 Oak St. CA Medical Board: 456 Elm St. Cannot determine current.",
    searched: ["NPI Registry", "CA Medical Board", "CMS PECOS"],
    action: "Request confirmation",
    sla: "5d",
    overdue: false,
    modalType: "request-confirm",
  },
  {
    id: "org-task-3",
    provider: "Dr. Robert Kim",
    title: "Board certification expired",
    reason: "ABIM Orthopedic Surgery expired Feb 1, 2026. Required for active privileges.",
    searched: ["ABIM Portal", "AMA Masterfile"],
    action: "Start renewal",
    sla: "Overdue",
    overdue: true,
    modalType: "start-renewal",
  },
  {
    id: "org-task-4",
    provider: "Dr. Lisa Park",
    title: "DEA certificate not found",
    reason: "No DEA registration found in any searched source.",
    searched: ["DEA CSOS", "State pharmacy board", "Email archives"],
    action: "Request upload",
    sla: "7d",
    overdue: false,
    modalType: "request-upload",
  },
  {
    id: "org-task-5",
    provider: "Dr. Ahmed Hassan",
    title: "Pending attestation signature",
    reason: "Form sent Feb 20. No signature after 12 days.",
    searched: ["Email delivery confirmed", "No portal activity"],
    action: "Send reminder",
    sla: "14d",
    overdue: false,
    modalType: "send-reminder",
  },
];

interface CompletedOrgTask {
  provider: string;
  title: string;
  date: string;
  resolution: string;
}

// Modal config map
function getModalConfig(task: Task) {
  switch (task.modalType) {
    case "request-upload":
      return {
        title: "Request document upload",
        description: `Send a secure upload request to ${task.provider} for the missing document. They'll receive an email and in-app notification with a direct upload link.`,
        actionLabel: "Send request",
        details: [
          { label: "Provider", value: task.provider },
          { label: "Document", value: task.title.replace("Missing ", "").replace("not found", "").trim() },
          { label: "Deadline", value: task.sla === "Overdue" ? "Overdue" : `${task.sla} remaining` },
        ],
        confirmMessage: "The clinician will receive an email with a secure link to upload the document directly.",
        successMessage: "Request sent",
        successDetail: `${task.provider} has been notified via email and in-app notification.`,
      };
    case "request-confirm":
      return {
        title: "Request address confirmation",
        description: `Send a confirmation request to ${task.provider} to resolve the address discrepancy. They'll see both addresses and select the correct one.`,
        actionLabel: "Send request",
        details: [
          { label: "Provider", value: task.provider },
          { label: "Issue", value: "Conflicting practice addresses" },
          { label: "Sources", value: task.searched.slice(0, 2).join(" vs ") },
        ],
        confirmMessage: "The clinician will be asked to confirm which address is current. The incorrect record will be flagged for correction.",
        successMessage: "Confirmation requested",
        successDetail: `${task.provider} has been notified to confirm their practice address.`,
      };
    case "start-renewal":
      return {
        title: "Initiate certification renewal",
        description: `Start the renewal process for ${task.provider}'s expired board certification. The agent will contact ABIM and guide the clinician through any required steps.`,
        actionLabel: "Start renewal",
        details: [
          { label: "Provider", value: task.provider },
          { label: "Certification", value: "ABIM Orthopedic Surgery" },
          { label: "Expired", value: "Feb 1, 2026" },
          { label: "Status", value: "Overdue" },
        ],
        confirmMessage: "The agent will check renewal eligibility with ABIM and create tasks for any clinician action required (exam, MOC points, etc.).",
        successMessage: "Renewal initiated",
        successDetail: `Agent is checking renewal eligibility with ABIM for ${task.provider}.`,
      };
    case "send-reminder":
      return {
        title: "Send reminder",
        description: `Send a follow-up reminder to ${task.provider} about the pending attestation signature. This will be sent via email and in-app notification.`,
        actionLabel: "Send reminder",
        details: [
          { label: "Provider", value: task.provider },
          { label: "Pending since", value: "Feb 20, 2026" },
          { label: "Days waiting", value: "12 days" },
          { label: "Previous reminders", value: "0 sent" },
        ],
        confirmMessage: "A follow-up email and in-app notification will be sent with a direct link to the attestation form.",
        successMessage: "Reminder sent",
        successDetail: `${task.provider} has been reminded via email and in-app notification.`,
      };
  }
}

export function OrgNeedsAttention() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [completedTasks, setCompletedTasks] = useState<CompletedOrgTask[]>([]);

  // Action modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Assign modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTask, setAssignTask] = useState<Task | null>(null);

  // Upload modal (org uploads directly)
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTask, setUploadTask] = useState<Task | null>(null);

  const handleAction = (task: Task) => {
    setActiveTask(task);
    setActionModalOpen(true);
  };

  const handleActionComplete = () => {
    if (!activeTask) return;
    setActionModalOpen(false);
    // Move to resolved
    setTasks((prev) => prev.filter((t) => t.id !== activeTask.id));
    setCompletedTasks((prev) => [
      {
        provider: activeTask.provider,
        title: activeTask.title,
        date: "Mar 4",
        resolution: activeTask.action === "Send reminder" ? "Reminder sent" :
                    activeTask.action === "Start renewal" ? "Renewal initiated" :
                    "Request sent to clinician",
      },
      ...prev,
    ]);
    setActiveTask(null);
  };

  const handleAssign = (task: Task) => {
    setAssignTask(task);
    setAssignModalOpen(true);
  };

  const handleAssignComplete = (assignee: string) => {
    if (!assignTask) return;
    setAssignModalOpen(false);
    setTasks((prev) =>
      prev.map((t) => t.id === assignTask.id ? { ...t, assignee } : t)
    );
    setAssignTask(null);
  };

  const handleUploadDirectly = (task: Task) => {
    setUploadTask(task);
    setUploadModalOpen(true);
  };

  const handleUploadComplete = (fileName: string) => {
    if (!uploadTask) return;
    setUploadModalOpen(false);
    setTasks((prev) => prev.filter((t) => t.id !== uploadTask.id));
    setCompletedTasks((prev) => [
      {
        provider: uploadTask.provider,
        title: uploadTask.title,
        date: "Mar 6",
        resolution: `Uploaded by org: ${fileName}`,
      },
      ...prev,
    ]);
    toast.success("Document uploaded", {
      description: `${fileName} uploaded for ${uploadTask.provider}`,
    });
    setUploadTask(null);
  };

  const modalConfig = activeTask ? getModalConfig(activeTask) : null;

  const actionIcon: Record<Task["modalType"], null> = {
    "request-upload": null,
    "request-confirm": null,
    "start-renewal": null,
    "send-reminder": null,
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/app/org" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Needs attention</h1>
      <p className="text-[15px] text-muted-foreground mt-1 mb-10">
        {tasks.length} task{tasks.length !== 1 ? "s" : ""} requiring human intervention.
      </p>

      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Link key={task.id} to={`/app/org/attention/${task.id}`} className="block bg-surface-elevated border border-border rounded-xl p-6 hover:border-foreground/20 transition-colors">
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-[14px] text-muted-foreground">{task.provider}</p>
                <span className={`text-[14px] tabular-nums ${task.overdue ? "text-red" : "text-text-secondary"}`}>
                  {task.sla}
                </span>
              </div>
              <p className="text-[16px] text-foreground mb-2">{task.title}</p>
              <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">{task.reason}</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {task.searched.map((s, j) => (
                  <span key={j} className="text-[13px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
                    {s}
                  </span>
                ))}
              </div>

              {/* Assignee display */}
              {task.assignee && (
                <div className="flex items-center gap-2 mb-4 text-[13px] text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] text-foreground">
                    {task.assignee.split(" ").map(n => n[0]).join("")}
                  </div>
                  Assigned to {task.assignee}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-5 border-t border-border">
                <button
                  onClick={(e) => { e.preventDefault(); handleAssign(task); }}
                  className="text-[13px] text-text-secondary hover:text-foreground px-3 py-2 rounded-md cursor-pointer transition-colors"
                >
                  {task.assignee ? "Reassign" : "Assign"}
                </button>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  {task.modalType === "request-upload" && (
                    <button
                      onClick={(e) => { e.preventDefault(); handleUploadDirectly(task); }}
                      className="text-[13px] text-muted-foreground hover:text-foreground border border-border/60 hover:border-border hover:bg-secondary/50 px-3.5 py-2 rounded-md cursor-pointer transition-colors"
                    >
                      Upload directly
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); handleAction(task); }}
                    className="text-[13px] bg-foreground text-background px-4 py-2 rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {task.action}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-surface-elevated border border-border rounded-xl p-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-[14px] text-background">
              ✓
            </div>
          </div>
          <p className="text-[15px] text-foreground mb-1">All clear</p>
          <p className="text-[14px] text-muted-foreground">No tasks need attention right now.</p>
        </div>
      )}

      {/* Resolved section */}
      {completedTasks.length > 0 && (
        <div className="mt-14">
          <SectionLabel>Resolved today</SectionLabel>
          <div className="mt-4">
            {completedTasks.map((task, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-border">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <p className="text-[15px] text-foreground">{task.provider}</p>
                    {task.resolution.startsWith("Uploaded by org") && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-foreground/8 text-muted-foreground border border-border">
                        Uploaded by org
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-muted-foreground">{task.title} &middot; {task.resolution.startsWith("Uploaded by org") ? task.resolution.replace("Uploaded by org: ", "") : task.resolution}</p>
                </div>
                <span className="text-[14px] text-text-secondary shrink-0 ml-4">{task.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {modalConfig && (
        <ActionModal
          open={actionModalOpen}
          onClose={() => { setActionModalOpen(false); setActiveTask(null); }}
          onComplete={handleActionComplete}
          title={modalConfig.title}
          description={modalConfig.description}
          provider={activeTask?.provider || ""}
          actionLabel={modalConfig.actionLabel}
          details={modalConfig.details}
          confirmMessage={modalConfig.confirmMessage}
          successMessage={modalConfig.successMessage}
          successDetail={modalConfig.successDetail}
        />
      )}

      {/* Assign Modal */}
      {assignTask && (
        <AssignModal
          open={assignModalOpen}
          onClose={() => { setAssignModalOpen(false); setAssignTask(null); }}
          onComplete={handleAssignComplete}
          provider={assignTask.provider}
          taskTitle={assignTask.title}
        />
      )}

      {/* Upload Modal */}
      {uploadTask && (
        <UploadModal
          open={uploadModalOpen}
          onClose={() => { setUploadModalOpen(false); setUploadTask(null); }}
          onComplete={handleUploadComplete}
          title={uploadTask.title}
          description={`Upload on behalf of ${uploadTask.provider}`}
          requirements={[
            "Document must be current and unexpired",
            "Must include provider name and dates",
          ]}
        />
      )}
    </div>
  );
}