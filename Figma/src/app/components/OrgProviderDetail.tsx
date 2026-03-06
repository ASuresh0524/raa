import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Dot, SectionLabel } from "./ui-components";
import { useState } from "react";
import { UploadModal } from "./UploadModal";
import { toast } from "sonner";

const timeline = [
  { label: "CA Medical License verified", detail: "CA Medical Board — primary source", time: "2h", status: "verified" as const },
  { label: "DEA certificate extracted", detail: "#FC1234567", time: "4h", status: "verified" as const },
  { label: "Submitted to Blue Shield", detail: "Confirmation BS-2026-8843", time: "1d", status: "verified" as const },
  { label: "Board certification verified", detail: "ABIM IM — exp May 2026", time: "2d", status: "warning" as const },
  { label: "Renewal initiated", detail: "ABIM recertification", time: "2d", status: "pending" as const },
];

const evidence = [
  { label: "CA Medical License", date: "Mar 1", source: "CA Medical Board" },
  { label: "NPI Registration", date: "Mar 1", source: "NPPES" },
  { label: "DEA Certificate", date: "Mar 1", source: "DEA CSOS" },
  { label: "ABIM Internal Medicine", date: "Feb 25", source: "ABIM Portal" },
  { label: "Medical School", date: "Feb 20", source: "AMA Masterfile" },
];

type MetricFilter = "verified" | "error" | "warning" | null;

const metricCredentials: Record<string, { name: string; source: string; detail: string; status: "verified" | "pending" | "warning" }[]> = {
  verified: [
    { name: "CA Medical License", source: "CA Medical Board", detail: "#MD-48291 — exp Dec 2027", status: "verified" },
    { name: "DEA Registration", source: "DEA CSOS", detail: "#FC1234567 — Schedule II–V", status: "verified" },
    { name: "NPI Registration", source: "NPPES", detail: "NPI 1234567890", status: "verified" },
    { name: "ABIM Internal Medicine", source: "ABIM Portal", detail: "Certified — exp May 2026", status: "verified" },
    { name: "Medical School Diploma", source: "AMA Masterfile", detail: "Stanford School of Medicine, 2012", status: "verified" },
  ],
  error: [
    { name: "Malpractice Insurance Certificate", source: "Not found", detail: "Searched email, portals, and registries", status: "pending" },
    { name: "Hospital Privilege Letter", source: "Not found", detail: "Required for Blue Shield enrollment", status: "pending" },
  ],
  warning: [
    { name: "ABIM Internal Medicine", source: "ABIM Portal", detail: "Expires May 2026 — renewal recommended", status: "warning" },
  ],
};

export function OrgProviderDetail() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricFilter>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  const handleUploadComplete = (fileName: string) => {
    setUploadOpen(false);
    setUploaded(true);
    toast.success("Document uploaded", {
      description: `${fileName} uploaded for Dr. Sarah Chen`,
    });
  };

  const handleMetricUpload = (fileName: string) => {
    setUploadOpen(false);
    setUploadTarget(null);
    toast.success("Document uploaded", {
      description: `${fileName} uploaded for Dr. Sarah Chen`,
    });
  };

  const handleReverify = (name: string) => {
    toast.success("Re-verification started", {
      description: `Checking ${name} against primary sources`,
    });
  };

  const metrics = [
    { label: "Verified", value: "42", status: "verified" as const, key: "verified" as MetricFilter },
    { label: "Missing", value: "2", status: "error" as const, key: "error" as MetricFilter },
    { label: "Expiring", value: "1", status: "warning" as const, key: "warning" as MetricFilter },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/app/org/providers" className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={16} />
        Back to Providers
      </Link>

      {/* Provider info */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h1 className="text-[22px] text-foreground tracking-[-0.02em]">Dr. Sarah Chen</h1>
          <p className="text-[15px] text-muted-foreground mt-1">NPI 1234567890 &middot; Internal Medicine</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[15px] text-muted-foreground tabular-nums">93% verified</span>
          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 text-[14px] bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Send for verification
          </button>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-4 mb-2">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(activeMetric === m.key ? null : m.key)}
            className={`bg-surface-elevated border rounded-xl py-5 px-4 text-center cursor-pointer transition-all ${
              activeMetric === m.key
                ? "border-foreground/30 ring-1 ring-foreground/10"
                : "border-border hover:border-foreground/20"
            }`}
          >
            <p className="text-[22px] tracking-[-0.02em] text-foreground tabular-nums">{m.value}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Dot status={m.status} />
              <span className="text-[14px] text-muted-foreground">{m.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Expanded metric detail */}
      {activeMetric && (
        <div className="bg-surface-elevated border border-border rounded-xl divide-y divide-border mb-10 mt-2">
          {metricCredentials[activeMetric].map((cred, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Dot status={cred.status} />
                  <p className="text-[14px] text-foreground">{cred.name}</p>
                </div>
                <p className="text-[13px] text-muted-foreground mt-0.5 ml-[18px]">
                  {cred.source} &middot; {cred.detail}
                </p>
              </div>
              {(activeMetric === "error" || activeMetric === "warning") && (
                <div className="flex items-center gap-2 ml-[18px] sm:ml-0 shrink-0">
                  <button
                    onClick={() => handleReverify(cred.name)}
                    className="text-[13px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors px-3 py-1.5 rounded-md hover:bg-secondary/50"
                  >
                    Re-verify
                  </button>
                  <button
                    onClick={() => { setUploadTarget(cred.name); setUploadOpen(true); }}
                    className="text-[13px] text-muted-foreground hover:text-foreground border border-border/60 hover:border-border hover:bg-secondary/50 px-3 py-1.5 rounded-md cursor-pointer transition-colors"
                  >
                    Upload
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!activeMetric && <div className="mb-10" />}

      {/* Submit document */}
      <button
        onClick={() => setUploadOpen(true)}
        className="text-[14px] bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer mb-10"
      >
        Submit document
      </button>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Timeline */}
        <div className="md:col-span-3 bg-surface-elevated border border-border rounded-xl p-6">
          <SectionLabel>Activity</SectionLabel>
          <div className="mt-5">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center pt-1.5">
                  <Dot status={item.status} />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                </div>
                <div className="pb-6 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[15px] text-foreground">{item.label}</p>
                      <p className="text-[14px] text-muted-foreground mt-1">{item.detail}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {(item.status === "error" || item.status === "warning" || item.status === "pending") && (
                        <button
                          onClick={() => toast.success("Resolving", { description: item.label })}
                          className="text-[13px] text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      <span className="text-[13px] text-text-secondary shrink-0 tabular-nums">{item.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence */}
        <div className="md:col-span-2 bg-surface-elevated border border-border rounded-xl p-6">
          <SectionLabel>Evidence</SectionLabel>
          <div className="mt-5">
            {evidence.map((e, i) => (
              <div key={i} className={`py-3.5 ${i < evidence.length - 1 ? "border-b border-border" : ""}`}>
                <p className="text-[15px] text-foreground">{e.label}</p>
                <p className="text-[13px] text-text-secondary">{e.source} &middot; {e.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open task */}
      <div className="mt-8">
        <SectionLabel>Open tasks</SectionLabel>
        <div className="bg-surface-elevated border border-border rounded-xl p-6 mt-4">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-[16px] text-foreground">Missing malpractice certificate</p>
              <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed">
                Agent searched email, portals, and registries. Not found. Required for Blue Shield enrollment.
              </p>
              <p className="text-[14px] text-yellow mt-2">Due in 2 days</p>
            </div>
            {uploaded && (
              <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-foreground/8 text-muted-foreground border border-border shrink-0">
                Uploaded by org
              </span>
            )}
          </div>
          {!uploaded && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4 border-t border-border mt-4">
              <button
                onClick={() => setUploadOpen(true)}
                className="text-[13px] text-muted-foreground hover:text-foreground border border-border/60 hover:border-border hover:bg-secondary/50 px-3.5 py-2 rounded-md cursor-pointer transition-colors"
              >
                Upload directly
              </button>
              <div className="flex-1" />
              <button className="text-[13px] bg-foreground text-background px-4 py-2 rounded-md hover:opacity-90 transition-opacity cursor-pointer">
                Request from clinician
              </button>
            </div>
          )}
        </div>
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => { setUploadOpen(false); setUploadTarget(null); }}
        onComplete={uploadTarget ? handleMetricUpload : handleUploadComplete}
        title={uploadTarget || "Malpractice certificate"}
        description={`Upload on behalf of Dr. Sarah Chen`}
        requirements={[
          "Document must be current and unexpired",
          "Must include provider name and coverage dates",
        ]}
      />
    </div>
  );
}