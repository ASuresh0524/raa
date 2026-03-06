import { X } from "lucide-react";
import { Dot } from "./ui-components";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UploadModal } from "./UploadModal";

export interface ProviderCredential {
  name: string;
  status: "verified" | "pending" | "attention" | "expired";
  expiration?: string;
  note?: string;
}

export interface ProviderProfile {
  name: string;
  npi: string;
  specialty: string;
  facility: string;
  email: string;
  phone: string;
  overallStatus: "compliant" | "attention" | "blocked";
  credentials: ProviderCredential[];
  actionItems: string[];
}

// Rich provider data
const providerProfiles: Record<string, ProviderProfile> = {
  "Dr. James Wilson": {
    name: "Dr. James Wilson",
    npi: "1234567890",
    specialty: "Internal Medicine",
    facility: "East Clinic",
    email: "j.wilson@valleyhealth.org",
    phone: "(415) 555-0142",
    overallStatus: "attention",
    credentials: [
      { name: "CA Medical License", status: "verified", expiration: "Dec 2027" },
      { name: "DEA Certificate", status: "verified", expiration: "Mar 2028" },
      { name: "ABIM Board Certification", status: "verified", expiration: "Jan 2028" },
      { name: "Malpractice Insurance", status: "attention", note: "Certificate not on file" },
      { name: "NPI Verification", status: "verified" },
      { name: "UCSF Privileges", status: "pending", note: "Submitted 1d ago" },
    ],
    actionItems: [
      "Upload current malpractice insurance certificate",
      "Confirm malpractice coverage dates",
    ],
  },
  "Dr. Maria Santos": {
    name: "Dr. Maria Santos",
    npi: "2345678901",
    specialty: "Family Medicine",
    facility: "Main Campus",
    email: "m.santos@valleyhealth.org",
    phone: "(415) 555-0198",
    overallStatus: "attention",
    credentials: [
      { name: "CA Medical License", status: "verified", expiration: "Sep 2027" },
      { name: "DEA Certificate", status: "verified", expiration: "Nov 2027" },
      { name: "Board Certification", status: "verified", expiration: "Jun 2028" },
      { name: "Malpractice Insurance", status: "verified", expiration: "Feb 2027" },
      { name: "NPI Verification", status: "attention", note: "Address mismatch detected" },
    ],
    actionItems: [
      "Resolve conflicting NPI address — practice vs. NPPES registry",
      "Submit updated CMS-855 if address has changed",
    ],
  },
  "Dr. Robert Kim": {
    name: "Dr. Robert Kim",
    npi: "3456789012",
    specialty: "Cardiology",
    facility: "Main Campus",
    email: "r.kim@valleyhealth.org",
    phone: "(415) 555-0176",
    overallStatus: "blocked",
    credentials: [
      { name: "CA Medical License", status: "pending", expiration: "Apr 20, 2026", note: "Renewal initiated — 45d remaining" },
      { name: "DEA Certificate", status: "verified", expiration: "Aug 2027" },
      { name: "Board Certification", status: "expired", note: "Expired Feb 2026 — renewal overdue" },
      { name: "Malpractice Insurance", status: "verified", expiration: "Jan 2027" },
      { name: "NPI Verification", status: "verified" },
    ],
    actionItems: [
      "Renew ABCC board certification immediately — currently expired",
      "Follow up on CA medical license renewal status",
    ],
  },
  "Dr. Lisa Park": {
    name: "Dr. Lisa Park",
    npi: "4567890123",
    specialty: "Pediatrics",
    facility: "West Clinic",
    email: "l.park@valleyhealth.org",
    phone: "(415) 555-0211",
    overallStatus: "attention",
    credentials: [
      { name: "CA Medical License", status: "verified", expiration: "Oct 2027" },
      { name: "DEA Certificate", status: "attention", note: "Certificate not found in primary source" },
      { name: "Board Certification", status: "verified", expiration: "May 2028" },
      { name: "Malpractice Insurance", status: "pending", expiration: "Apr 5, 2026", note: "Expiring in 30d — awaiting renewal doc" },
      { name: "NPI Verification", status: "verified" },
    ],
    actionItems: [
      "Provide DEA certificate or updated registration number",
      "Upload renewed malpractice insurance before Apr 5 deadline",
    ],
  },
  "Dr. Sarah Chen": {
    name: "Dr. Sarah Chen",
    npi: "5678901234",
    specialty: "Oncology",
    facility: "Main Campus",
    email: "s.chen@valleyhealth.org",
    phone: "(415) 555-0163",
    overallStatus: "compliant",
    credentials: [
      { name: "CA Medical License", status: "verified", expiration: "Nov 2027" },
      { name: "DEA Certificate", status: "verified", expiration: "Jun 2028" },
      { name: "ABIM Board Certification", status: "pending", expiration: "May 15, 2026", note: "Renewal initiated — 60d remaining" },
      { name: "Malpractice Insurance", status: "verified", expiration: "Sep 2027" },
      { name: "NPI Verification", status: "verified" },
      { name: "Blue Shield CA Enrollment", status: "verified", note: "Submitted 12m ago" },
      { name: "Aetna Enrollment", status: "pending", note: "Submitted 3h ago — processing" },
    ],
    actionItems: [
      "Monitor ABIM board cert renewal — 60 days remaining",
    ],
  },
  "Dr. Emily Taylor": {
    name: "Dr. Emily Taylor",
    npi: "6789012345",
    specialty: "Dermatology",
    facility: "East Clinic",
    email: "e.taylor@valleyhealth.org",
    phone: "(415) 555-0229",
    overallStatus: "compliant",
    credentials: [
      { name: "CA Medical License", status: "verified", expiration: "Mar 2028" },
      { name: "DEA Certificate", status: "verified", expiration: "Jul 2027" },
      { name: "Board Certification", status: "verified", expiration: "Dec 2028" },
      { name: "Malpractice Insurance", status: "verified", expiration: "Jun 2027" },
      { name: "NPI Verification", status: "verified" },
    ],
    actionItems: [],
  },
  "Dr. Ahmed Hassan": {
    name: "Dr. Ahmed Hassan",
    npi: "7890123456",
    specialty: "Psychiatry",
    facility: "Main Campus",
    email: "a.hassan@valleyhealth.org",
    phone: "(415) 555-0187",
    overallStatus: "compliant",
    credentials: [
      { name: "CA Medical License", status: "verified", expiration: "Aug 2027" },
      { name: "DEA Certificate", status: "verified", expiration: "May 2028" },
      { name: "Board Certification", status: "verified", expiration: "Nov 2027" },
      { name: "Malpractice Insurance", status: "verified", expiration: "Apr 2027" },
      { name: "NPI Verification", status: "verified" },
    ],
    actionItems: [],
  },
  "Dr. Michael Brown": {
    name: "Dr. Michael Brown",
    npi: "8901234567",
    specialty: "Orthopedic Surgery",
    facility: "North Campus",
    email: "m.brown@valleyhealth.org",
    phone: "(415) 555-0245",
    overallStatus: "attention",
    credentials: [
      { name: "NY Medical License", status: "pending", expiration: "Apr 15, 2026", note: "Renewal initiated — 42d remaining" },
      { name: "DEA Certificate", status: "pending", expiration: "Jun 1, 2026", note: "Agent monitoring — 89d remaining" },
      { name: "Board Certification", status: "verified", expiration: "Sep 2028" },
      { name: "Malpractice Insurance", status: "verified", expiration: "Dec 2027" },
      { name: "NPI Verification", status: "verified" },
    ],
    actionItems: [
      "Follow up on NY medical license renewal — 42 days remaining",
      "Monitor DEA certificate renewal progress",
    ],
  },
};

const statusLabel: Record<string, string> = {
  verified: "Verified",
  pending: "Pending",
  attention: "Attention",
  expired: "Expired",
};

const statusColor: Record<string, "verified" | "pending" | "attention" | "expired"> = {
  verified: "verified",
  pending: "pending",
  attention: "attention",
  expired: "expired",
};

const overallLabel: Record<string, string> = {
  compliant: "Compliant",
  attention: "Needs attention",
  blocked: "Blocked",
};

export function getProviderProfile(name: string): ProviderProfile | null {
  return providerProfiles[name] ?? null;
}

interface ProviderDrawerProps {
  providerName: string | null;
  onClose: () => void;
  context?: string; // extra context about why user clicked
}

export function ProviderDrawer({ providerName, onClose, context }: ProviderDrawerProps) {
  const profile = providerName ? getProviderProfile(providerName) : null;
  const isOpen = !!providerName;
  const [requestSent, setRequestSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ name: string; description: string } | null>(null);
  const [uploadedCreds, setUploadedCreds] = useState<Set<string>>(new Set());

  // Reset state when provider changes
  useEffect(() => {
    setRequestSent(false);
    setSending(false);
    setUploadModalOpen(false);
    setUploadTarget(null);
    setUploadedCreds(new Set());
  }, [providerName]);

  const handleRequestDocuments = () => {
    if (!profile) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setRequestSent(true);
      const issueCount = profile.actionItems.length;
      toast.success("Request sent", {
        description: `${issueCount} item${issueCount !== 1 ? "s" : ""} requested from ${profile.name}`,
      });
    }, 1200);
  };

  const handleUploadForCred = (credName: string) => {
    setUploadTarget({
      name: credName,
      description: `Upload on behalf of ${profile?.name}`,
    });
    setUploadModalOpen(true);
  };

  const handleUploadGeneral = () => {
    setUploadTarget({
      name: "Document",
      description: `Upload any document on behalf of ${profile?.name}`,
    });
    setUploadModalOpen(true);
  };

  const handleUploadComplete = (fileName: string) => {
    setUploadModalOpen(false);
    if (uploadTarget) {
      setUploadedCreds((prev) => new Set(prev).add(uploadTarget.name));
      toast.success("Document uploaded", {
        description: `${fileName} uploaded for ${profile?.name} — ${uploadTarget.name}`,
      });
    }
    setUploadTarget(null);
  };

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-background border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10 px-6 py-4 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] text-foreground tracking-[-0.01em] truncate">
              {profile ? profile.name : providerName}
            </h2>
            {context && (
              <p className="text-[13px] text-muted-foreground mt-0.5 truncate">{context}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {!profile ? (
          <div className="px-6 py-16 text-center">
            <p className="text-[15px] text-muted-foreground">Provider profile not found.</p>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-8">
            {/* Status badge + basic info */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className={`inline-flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-full border ${
                  profile.overallStatus === "compliant"
                    ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                    : profile.overallStatus === "attention"
                    ? "border-yellow/20 text-yellow bg-yellow/5"
                    : "border-red/20 text-red bg-red/5"
                }`}>
                  <Dot status={profile.overallStatus === "compliant" ? "verified" : profile.overallStatus === "attention" ? "attention" : "expired"} />
                  {overallLabel[profile.overallStatus]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: "NPI", value: profile.npi },
                  { label: "Specialty", value: profile.specialty },
                  { label: "Facility", value: profile.facility },
                  { label: "Email", value: profile.email },
                  { label: "Phone", value: profile.phone },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[12px] text-muted-foreground uppercase tracking-[0.06em] mb-1">{f.label}</p>
                    <p className="text-[14px] text-foreground truncate">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action items */}
            {profile.actionItems.length > 0 && (
              <div>
                <p className="text-[12px] text-muted-foreground uppercase tracking-[0.06em] mb-4">
                  Action required ({profile.actionItems.length})
                </p>
                <div className="space-y-2.5">
                  {profile.actionItems.map((item, i) => (
                    <div key={i} className="flex gap-3 bg-surface-elevated border border-border rounded-lg px-4 py-3">
                      <span className="w-5 h-5 rounded-full border border-yellow/30 bg-yellow/5 text-yellow text-[11px] flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                        {i + 1}
                      </span>
                      <p className="text-[14px] text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleRequestDocuments}
                    disabled={sending || requestSent}
                    className={`inline-flex items-center justify-center gap-2.5 w-full text-[14px] px-5 py-3 rounded-lg border transition-all cursor-pointer disabled:cursor-not-allowed ${
                      requestSent
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                        : sending
                        ? "border-border bg-surface-elevated text-muted-foreground opacity-70"
                        : "border-foreground/20 bg-foreground/5 text-foreground hover:bg-foreground/10"
                    }`}
                  >
                    {sending ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.928l3-2.647z" />
                      </svg>
                    ) : null}
                    {sending ? "Sending request…" : requestSent ? "Request sent ✓" : `Request ${profile.actionItems.length} item${profile.actionItems.length !== 1 ? "s" : ""}`}
                  </button>
                  <button
                    onClick={handleUploadGeneral}
                    className="inline-flex items-center justify-center w-full text-[14px] px-5 py-3 rounded-lg border border-border bg-surface-elevated text-foreground hover:bg-secondary transition-colors cursor-pointer mt-2.5"
                  >
                    Upload on behalf
                  </button>
                </div>
              </div>
            )}

            {/* Upload on behalf — always available */}
            {profile.actionItems.length === 0 && (
              <button
                onClick={handleUploadGeneral}
                className="inline-flex items-center justify-center w-full text-[14px] px-5 py-3 rounded-lg border border-border bg-surface-elevated text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                Upload document on behalf
              </button>
            )}

            {/* Credentials */}
            <div>
              <p className="text-[12px] text-muted-foreground uppercase tracking-[0.06em] mb-4">
                Credentials ({profile.credentials.length})
              </p>
              <div className="space-y-0">
                {profile.credentials.map((cred, i) => (
                  <div
                    key={cred.name}
                    className={`flex items-start justify-between py-3.5 ${
                      i < profile.credentials.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <Dot status={statusColor[cred.status]} />
                        <p className="text-[14px] text-foreground">{cred.name}</p>
                      </div>
                      {(cred.note || cred.expiration) && (
                        <p className="text-[13px] text-muted-foreground mt-1 ml-[18px]">
                          {cred.note || `Expires ${cred.expiration}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 ml-4">
                      {(cred.status === "attention" || cred.status === "expired") && !uploadedCreds.has(cred.name) && (
                        <button
                          onClick={() => handleUploadForCred(cred.name)}
                          className="text-[12px] text-muted-foreground hover:text-foreground hover:bg-surface-elevated px-2 py-1 rounded-md transition-colors cursor-pointer"
                          title={`Upload ${cred.name}`}
                        >
                          Upload
                        </button>
                      )}
                      {uploadedCreds.has(cred.name) ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-foreground/8 text-muted-foreground border border-border">
                          Uploaded by org
                        </span>
                      ) : (
                        <span className={`text-[13px] mt-0.5 ${
                          cred.status === "verified" ? "text-muted-foreground" :
                          cred.status === "pending" ? "text-muted-foreground" :
                          cred.status === "attention" ? "text-yellow" :
                          "text-red"
                        }`}>
                          {statusLabel[cred.status]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary bar */}
            <div className="bg-surface-elevated border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                {[
                  { label: "Verified", count: profile.credentials.filter(c => c.status === "verified").length },
                  { label: "Pending", count: profile.credentials.filter(c => c.status === "pending").length },
                  { label: "Issues", count: profile.credentials.filter(c => c.status === "attention" || c.status === "expired").length },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <span className="text-[14px] text-foreground tabular-nums">{s.count}</span>
                    <span className="text-[13px] text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && uploadTarget && (
        <UploadModal
          open={uploadModalOpen}
          onClose={() => { setUploadModalOpen(false); setUploadTarget(null); }}
          onComplete={handleUploadComplete}
          title={uploadTarget.name}
          description={uploadTarget.description}
          requirements={[
            "Document must be current and unexpired",
            "Must include provider name and dates",
          ]}
        />
      )}
    </>
  );
}