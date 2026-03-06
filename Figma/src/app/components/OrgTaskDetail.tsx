/* OrgTaskDetail – expanded task view */
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router";
import { Dot, SectionLabel } from "./ui-components";
import { toast } from "sonner";
import { ActionModal, AssignModal, UploadModal } from "./UploadModal";

interface InvestigationStep {
  source: string;
  result: string;
  status: "verified" | "pending" | "warning" | "error";
  time: string;
}

interface TaskRecord {
  id: string;
  provider: string;
  providerSlug: string;
  specialty: string;
  npi: string;
  title: string;
  reason: string;
  searched: string[];
  action: string;
  sla: string;
  overdue: boolean;
  modalType: "request-upload" | "request-confirm" | "start-renewal" | "send-reminder";
  priority: "high" | "medium" | "low";
  created: string;
  category: string;
  relatedRequest: string | null;
  investigation: InvestigationStep[];
  impact: string;
  recommendation: string;
}

const DB: Record<string, TaskRecord> = {
  "org-task-1": {
    id: "org-task-1",
    provider: "Dr. James Wilson",
    providerSlug: "james-wilson",
    specialty: "Cardiology",
    npi: "2345678901",
    title: "Missing malpractice insurance certificate",
    reason: "Agent searched email archives, connected portals, and public registries. Not found.",
    searched: ["Email archives", "Connected portals", "Public registries"],
    action: "Request from clinician",
    sla: "2d",
    overdue: false,
    modalType: "request-upload",
    priority: "high",
    created: "Mar 4, 2026",
    category: "Missing document",
    relatedRequest: "REQ-002",
    impact: "Blocks UCSF facility credentialing submission. Cannot assemble credential packet without malpractice coverage proof.",
    recommendation: "Request the document directly from the clinician. If they don't have it, suggest contacting their insurance carrier (typically NORCAL Mutual or The Doctors Company for CA-based physicians).",
    investigation: [
      { source: "Email archives", result: "Searched 2 years of provider correspondence — no insurance documents found", status: "error", time: "Mar 4, 10:32 AM" },
      { source: "Connected portals", result: "Checked CAQH ProView, state board portal — no malpractice certificate on file", status: "error", time: "Mar 4, 10:31 AM" },
      { source: "Public registries", result: "Searched NPDB for malpractice history — no adverse actions, but no certificate available", status: "warning", time: "Mar 4, 10:30 AM" },
      { source: "NORCAL Mutual portal", result: "Unable to verify — requires policyholder login", status: "pending", time: "Mar 4, 10:29 AM" },
      { source: "The Doctors Company", result: "No matching policy found under provider NPI", status: "error", time: "Mar 4, 10:28 AM" },
    ],
  },
  "org-task-2": {
    id: "org-task-2",
    provider: "Dr. Maria Santos",
    providerSlug: "maria-santos",
    specialty: "Family Medicine",
    npi: "3456789012",
    title: "Conflicting NPI practice address",
    reason: "NPI Registry: 123 Oak St. CA Medical Board: 456 Elm St. Cannot determine current.",
    searched: ["NPI Registry", "CA Medical Board", "CMS PECOS"],
    action: "Request confirmation",
    sla: "5d",
    overdue: false,
    modalType: "request-confirm",
    priority: "medium",
    created: "Mar 1, 2026",
    category: "Data conflict",
    relatedRequest: null,
    impact: "Address discrepancy may cause claim rejections. Payers require consistent practice location across all registrations.",
    recommendation: "Request confirmation from the clinician on which address is current, then update the incorrect source. Most commonly the NPI Registry is outdated — NPPES updates can take 24-48 hours.",
    investigation: [
      { source: "NPPES (NPI Registry)", result: "Practice address: 123 Oak St, San Francisco, CA 94102", status: "verified", time: "Mar 1, 2:15 PM" },
      { source: "CA Medical Board", result: "Practice address: 456 Elm St, San Francisco, CA 94103", status: "verified", time: "Mar 1, 2:14 PM" },
      { source: "CMS PECOS", result: "Practice address: 456 Elm St, San Francisco, CA 94103 — matches CA board", status: "verified", time: "Mar 1, 2:13 PM" },
      { source: "CAQH ProView", result: "Practice address: 123 Oak St — matches NPI, last updated Nov 2025", status: "warning", time: "Mar 1, 2:12 PM" },
      { source: "Blue Shield directory", result: "Lists 123 Oak St — may be outdated", status: "warning", time: "Mar 1, 2:11 PM" },
    ],
  },
  "org-task-3": {
    id: "org-task-3",
    provider: "Dr. Robert Kim",
    providerSlug: "robert-kim",
    specialty: "Orthopedic Surgery",
    npi: "4567890123",
    title: "Board certification expired",
    reason: "ABIM Orthopedic Surgery expired Feb 1, 2026. Required for active privileges.",
    searched: ["ABIM Portal", "AMA Masterfile"],
    action: "Start renewal",
    sla: "Overdue",
    overdue: true,
    modalType: "start-renewal",
    priority: "high",
    created: "Feb 15, 2026",
    category: "Expiration",
    relatedRequest: "REQ-004",
    impact: "Expired board certification may trigger automatic suspension of hospital privileges. Some payers also require current certification for network participation.",
    recommendation: "Initiate renewal immediately. ABOS (not ABIM — orthopedic surgery) recertification requires passing the Practice of the Recertifying Exam. Check if MOC requirements are current.",
    investigation: [
      { source: "ABOS Portal", result: "Board certification: Orthopedic Surgery — expired Feb 1, 2026", status: "error", time: "Feb 15, 9:00 AM" },
      { source: "AMA Masterfile", result: "Certification listed but flagged as expired since Feb 2026", status: "error", time: "Feb 15, 8:58 AM" },
      { source: "ABOS MOC tracker", result: "MOC Part II complete, Part III exam not yet scheduled", status: "warning", time: "Feb 15, 8:57 AM" },
      { source: "Sutter Health privileges", result: "Active privileges contingent on current board certification — 90-day grace period ends May 1", status: "warning", time: "Feb 15, 8:55 AM" },
    ],
  },
  "org-task-4": {
    id: "org-task-4",
    provider: "Dr. Lisa Park",
    providerSlug: "lisa-park",
    specialty: "Dermatology",
    npi: "5678901234",
    title: "DEA certificate not found",
    reason: "No DEA registration found in any searched source.",
    searched: ["DEA CSOS", "State pharmacy board", "Email archives"],
    action: "Request upload",
    sla: "7d",
    overdue: false,
    modalType: "request-upload",
    priority: "medium",
    created: "Feb 28, 2026",
    category: "Missing document",
    relatedRequest: null,
    impact: "DEA registration required for prescribing controlled substances. Some credentialing applications require it even if the provider doesn't prescribe controlled substances.",
    recommendation: "Confirm with the clinician whether they hold a DEA registration. Dermatologists may not always have one. If they do, request a copy; if not, document the exemption.",
    investigation: [
      { source: "DEA CSOS", result: "No active registration found for NPI 5678901234", status: "error", time: "Feb 28, 3:45 PM" },
      { source: "CA Pharmacy Board", result: "No controlled substance permit found", status: "error", time: "Feb 28, 3:44 PM" },
      { source: "Email archives", result: "No DEA-related documents in provider correspondence", status: "error", time: "Feb 28, 3:43 PM" },
      { source: "CAQH ProView", result: "DEA field left blank in provider profile", status: "warning", time: "Feb 28, 3:42 PM" },
    ],
  },
  "org-task-5": {
    id: "org-task-5",
    provider: "Dr. Ahmed Hassan",
    providerSlug: "ahmed-hassan",
    specialty: "Neurology",
    npi: "6789012345",
    title: "Pending attestation signature",
    reason: "Form sent Feb 20. No signature after 12 days.",
    searched: ["Email delivery confirmed", "No portal activity"],
    action: "Send reminder",
    sla: "14d",
    overdue: false,
    modalType: "send-reminder",
    priority: "low",
    created: "Feb 20, 2026",
    category: "Awaiting clinician",
    relatedRequest: "REQ-005",
    impact: "Attestation signature required to complete credential packet for Stanford Health Care. Packet generation is blocked until signed.",
    recommendation: "Send a reminder. If no response within 48 hours, consider reaching out by phone. The attestation form is straightforward — most clinicians complete it in under 5 minutes.",
    investigation: [
      { source: "Email delivery", result: "Attestation form sent to ahmed.hassan@valleyhealth.org — delivered successfully", status: "verified", time: "Feb 20, 10:00 AM" },
      { source: "Portal activity", result: "No login or form interaction detected since delivery", status: "warning", time: "Mar 4, 9:00 AM" },
      { source: "Previous reminders", result: "No reminders sent yet", status: "pending", time: "Mar 4, 9:00 AM" },
    ],
  },
};

function getModalConfig(task: TaskRecord) {
  switch (task.modalType) {
    case "request-upload":
      return {
        title: "Request document upload",
        description: `Send a secure upload request to ${task.provider} for the missing document.`,
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
        description: `Send a confirmation request to ${task.provider} to resolve the address discrepancy.`,
        actionLabel: "Send request",
        details: [
          { label: "Provider", value: task.provider },
          { label: "Issue", value: "Conflicting practice addresses" },
          { label: "Sources", value: task.searched.slice(0, 2).join(" vs ") },
        ],
        confirmMessage: "The clinician will be asked to confirm which address is current.",
        successMessage: "Confirmation requested",
        successDetail: `${task.provider} has been notified to confirm their practice address.`,
      };
    case "start-renewal":
      return {
        title: "Initiate certification renewal",
        description: `Start the renewal process for ${task.provider}'s expired board certification.`,
        actionLabel: "Start renewal",
        details: [
          { label: "Provider", value: task.provider },
          { label: "Certification", value: "Board Certification" },
          { label: "Status", value: task.overdue ? "Overdue" : task.sla },
        ],
        confirmMessage: "The agent will check renewal eligibility and create tasks for any clinician action required.",
        successMessage: "Renewal initiated",
        successDetail: `Agent is checking renewal eligibility for ${task.provider}.`,
      };
    case "send-reminder":
      return {
        title: "Send reminder",
        description: `Send a follow-up reminder to ${task.provider} about the pending item.`,
        actionLabel: "Send reminder",
        details: [
          { label: "Provider", value: task.provider },
          { label: "Pending since", value: task.created },
          { label: "Previous reminders", value: "0 sent" },
        ],
        confirmMessage: "A follow-up email and in-app notification will be sent.",
        successMessage: "Reminder sent",
        successDetail: `${task.provider} has been reminded via email and in-app notification.`,
      };
  }
}

export function OrgTaskDetail() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const taskId = params.id ?? "";
  const task = DB[taskId] ?? null;

  const [actionModalOpen, setActionModalOpen] = React.useState(false);
  const [assignModalOpen, setAssignModalOpen] = React.useState(false);
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [assignee, setAssignee] = React.useState<string | null>(null);
  const [resolved, setResolved] = React.useState(false);

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/app/org/attention" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Tasks
        </Link>
        <div className="bg-surface-elevated border border-border rounded-xl p-12 text-center">
          <p className="text-[15px] text-muted-foreground">Task not found.</p>
        </div>
      </div>
    );
  }

  const modalConfig = getModalConfig(task);

  const handleActionComplete = () => {
    setActionModalOpen(false);
    setResolved(true);
    toast.success(modalConfig.successMessage, { description: modalConfig.successDetail });
  };

  const handleAssignComplete = (name: string) => {
    setAssignModalOpen(false);
    setAssignee(name);
    toast.success("Assigned", { description: `Task assigned to ${name}` });
  };

  const handleUploadComplete = (fileName: string) => {
    setUploadModalOpen(false);
    setResolved(true);
    toast.success("Document uploaded", { description: `${fileName} uploaded for ${task.provider}` });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/app/org/attention" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} />
        Back to Tasks
      </Link>

      {resolved ? (
        <div className="bg-surface-elevated border border-border rounded-xl p-10 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-[14px] text-background">
              &#10003;
            </div>
          </div>
          <p className="text-[15px] text-foreground mb-1">Task resolved</p>
          <p className="text-[14px] text-muted-foreground mb-6">{task.title} for {task.provider}</p>
          <button
            onClick={() => navigate("/app/org/attention")}
            className="text-[14px] text-muted-foreground hover:text-foreground border border-border px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Back to tasks
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[22px] text-foreground tracking-[-0.02em]">{task.title}</h1>
              </div>
              <p className="text-[15px] text-muted-foreground">{task.provider} &middot; {task.specialty}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[14px] tabular-nums px-3 py-1 rounded-lg border ${
                task.overdue
                  ? "text-red border-red/20 bg-red/5"
                  : "text-text-secondary border-border bg-surface-elevated"
              }`}>
                {task.overdue ? "Overdue" : `${task.sla} remaining`}
              </span>
              <span className={`text-[13px] px-2.5 py-1 rounded-lg border ${
                task.priority === "high" ? "text-red border-red/20 bg-red/5" :
                task.priority === "medium" ? "text-yellow border-yellow/20 bg-yellow/5" :
                "text-muted-foreground border-border bg-surface-elevated"
              }`}>
                {task.priority} priority
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-surface-elevated border border-border rounded-xl p-5">
              <p className="text-[13px] text-text-secondary uppercase tracking-wide mb-3">Provider</p>
              <p className="text-[15px] text-foreground">{task.provider}</p>
              <p className="text-[14px] text-muted-foreground mt-1">{task.specialty} &middot; NPI {task.npi}</p>
              <Link to={`/app/org/providers/${task.providerSlug}`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mt-3">
                View profile
              </Link>
            </div>

            <div className="bg-surface-elevated border border-border rounded-xl p-5">
              <p className="text-[13px] text-text-secondary uppercase tracking-wide mb-3">Details</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[14px] text-muted-foreground">Category</span>
                  <span className="text-[14px] text-foreground">{task.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-muted-foreground">Created</span>
                  <span className="text-[14px] text-foreground">{task.created}</span>
                </div>
                {task.relatedRequest && (
                  <div className="flex justify-between">
                    <span className="text-[14px] text-muted-foreground">Related request</span>
                    <Link to={`/app/org/requests/${task.relatedRequest}`} className="text-[14px] text-foreground hover:text-muted-foreground transition-colors">
                      {task.relatedRequest}
                    </Link>
                  </div>
                )}
                {assignee && (
                  <div className="flex justify-between">
                    <span className="text-[14px] text-muted-foreground">Assigned to</span>
                    <span className="text-[14px] text-foreground">{assignee}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Impact & recommendation */}
          <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-8">
            <p className="text-[13px] text-text-secondary uppercase tracking-wide mb-3">Impact</p>
            <p className="text-[14px] text-foreground leading-relaxed">{task.impact}</p>
            <div className="border-t border-border mt-4 pt-4">
              <p className="text-[13px] text-text-secondary uppercase tracking-wide mb-3">Recommendation</p>
              <p className="text-[14px] text-foreground leading-relaxed">{task.recommendation}</p>
            </div>
          </div>

          {/* Agent investigation */}
          <div className="mb-8">
            <SectionLabel>Agent investigation</SectionLabel>
            <p className="text-[14px] text-muted-foreground mt-1 mb-4">{task.reason}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {task.searched.map((s, i) => (
                <span key={i} className="text-[13px] text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
                  {s}
                </span>
              ))}
            </div>

            <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border">
              {task.investigation.map((step, i) => (
                <div key={i} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Dot status={step.status} />
                      <p className="text-[14px] text-foreground">{step.source}</p>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5 ml-[18px]">{step.result}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {(step.status === "error" || step.status === "warning" || step.status === "pending") && (
                      <button
                        onClick={() => toast.success("Resolving", { description: step.source })}
                        className="text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                    <span className="text-[12px] text-text-secondary tabular-nums whitespace-nowrap">{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-surface-elevated border border-border rounded-xl p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setAssignModalOpen(true)}
                className="text-[13px] text-text-secondary hover:text-foreground px-3 py-2 rounded-md cursor-pointer transition-colors"
              >
                {assignee ? `Reassign (${assignee})` : "Assign"}
              </button>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                {task.modalType === "request-upload" && (
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="text-[13px] text-muted-foreground hover:text-foreground border border-border/60 hover:border-border hover:bg-secondary/50 px-3.5 py-2 rounded-md cursor-pointer transition-colors"
                  >
                    Upload directly
                  </button>
                )}
                <button
                  onClick={() => setActionModalOpen(true)}
                  className="text-[13px] bg-foreground text-background px-4 py-2 rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {task.action}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Modal */}
      <ActionModal
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onComplete={handleActionComplete}
        title={modalConfig.title}
        description={modalConfig.description}
        provider={task.provider}
        actionLabel={modalConfig.actionLabel}
        details={modalConfig.details}
        confirmMessage={modalConfig.confirmMessage}
        successMessage={modalConfig.successMessage}
        successDetail={modalConfig.successDetail}
      />

      {/* Assign Modal */}
      <AssignModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onComplete={handleAssignComplete}
        provider={task.provider}
        taskTitle={task.title}
      />

      {/* Upload Modal */}
      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onComplete={handleUploadComplete}
        title={task.title}
        description={`Upload on behalf of ${task.provider}`}
        requirements={[
          "Document must be current and unexpired",
          "Must include provider name and dates",
        ]}
      />
    </div>
  );
}

export default OrgTaskDetail;