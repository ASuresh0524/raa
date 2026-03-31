# Credentialing Passport — Product Strategy & Positioning

This document captures strategic product direction: market context, competitors, non‑negotiable scope, and regulatory alignment. It complements `architecture.md` (how we build) and `data-sources.md` (external data).

---

## Why this matters: revenue, not just admin

Credentialing and enrollment delays are not only administrative friction—they **directly delay time to revenue**.

- **TechTarget** (reported January 2026): **69%** of health systems, hospitals, and provider groups said they were losing **$1,000–$5,000 per provider per day** because of payer enrollment delays; **12%** of provider groups reported **more than $1 million** in impact from credentialing bottlenecks.

The product must optimize for **path to the most revenue**, not only path to administrative completion—“**safe billable status**.”

---

## Adjacent opportunity: directory accuracy & network intelligence

- **HHS OIG** (October 2025) recommended that **CMS** use data to monitor provider networks, improve **Medicare Advantage** directory accuracy, work with states on **Medicaid managed care** directories, and continue exploring how a **nationwide directory** could reduce inaccuracies and administrative inefficiency.

**Direction over time**

- **Directory accuracy** — keep every provider record true and current.  
- **Network intelligence** — turn that truth into access, adequacy, contracting, market expansion, and growth decisions.

---

## The core problem

The **provider-side burden** is enormous because the **same information is requested repeatedly** in different formats across:

- Credentialing  
- Privileging  
- Payer enrollment  
- Reassignment  
- Committee review  
- Downstream provider data workflows  

---

## Vendors, hospitals, labs, HIPAA, and plug-and-play CVO (market shape)

### Hospitals will not rip-and-replace their credentialing system

**Forcing hospitals to migrate** from Symplr, Verity, Medallion, internal CVO stacks, etc.—especially as a startup—is **“like moving mountains.”** They hold the leverage, they often **do not pay** for vendor credentialing workflows, and they already meet accreditation requirements with incumbent tools.

**Implication:** the winning shape is **not** “replace the hospital CVO.” It is **our own passport platform** plus **maximum plug-and-play into whatever system each hospital already uses**.

### Who pays and how we price

- **Vendors** (locums, staffing, device/clinical services, telehealth benches) **pay** because **time-to-case-coverage** is revenue.  
- **Charge vendors lightly** — high volume, low friction, clear ROI vs. 7–14 day background loops and opaque rejections.  
- **Hospitals** may be **distribution and trust**, not the primary payer for this wedge.

### The interface moat

Build **adapters and export packs** that **pull from the passport** and **place the right documents and fields** into **each** credentialing system’s expected shape (upload bundles, CSV maps, form populate, future RPA/API where contracts allow). **Vending companies pay** for guaranteed, faster paths to **hospital access** without the vendor manually re-uploading the same artifacts into ten different portals.

### Labs, drug screens, and HIPAA

- **Lab and health-screening results** used for credentialing are **PHI** — treat as **HIPAA-protected** end to end.  
- **Signup includes a HIPAA authorization / release** (and BAA chain with labs and clearing) so the platform can **receive and process** results on the user’s behalf.  
- **AI / document-ingestion agents** normalize PDFs, lab reports, and background vendor outputs into the **passport vault** with provenance — so the **vendor is not manually shuttling every file** into every hospital portal.

### Security

Must be **top-tier**: encryption in transit and at rest, access controls, audit logs, minimum-necessary exposure, and a design that survives **delegation audits** and customer security reviews.

### Example: background check and drug screen (today vs passport path)

**Typical today**

- Background: SSN-based criminal / employment checks via a **third-party screening vendor** (often **7–14 days**); vendor or clinician **pays upfront** and seeks **employer reimbursement**.  
- Drug screen: **clinic visit** with employer-issued requisition; vendor receives a **file** and must **upload** into the **hospital credentialing portal**.  
- Some bundlers include drug results in one report; others require **separate uploads**.  
- **Universal pain:** the vendor **manually uploads** each artifact, waits for **opaque rejections**, fixes and re-uploads, and only then can **chase the hospital** for final access — **case coverage is delayed throughout**.

**Passport path**

- **One authorization** at onboarding (HIPAA + scope).  
- Agents **ingest** screening and lab outputs into a **single evidence bundle** with timestamps and source.  
- **Pre-flight** catches format and completeness issues **before** hospital submission.  
- **Exports** push the **same truth** into **each** destination CVO format — **faster path to “approved for facility access.”**

### Moat (one sentence)

**Own the passport and the automation layer; plug into every hospital CVO — don’t try to replace it.**

---

## Competitive landscape

| Player | How to treat it |
|--------|------------------|
| **Verifiable** | Clearest explicit **AI-native / agentic** competitor in credentialing today. **CredAgent** is positioned as an autonomous credentialing agent for productivity with **audit-ready** accuracy. |
| **Medallion** | Serious **benchmark**: AI-powered positioning; public examples include **AI phone agents** and tools that **map web forms** to a provider data model **without human intervention**. Benchmark on **actual workflow depth and autonomy in demos**, not marketing alone. |
| **Symplr** | Not the clearest agentic-AI story, but a **major incumbent**: application, credentialing, privileging, enrollment, and performance monitoring in one system. **Do not dismiss** for lack of AI-forward messaging. |

---

## Scope from day one (non‑negotiable)

Include **privileging**, **reassignment**, and **enrollment** from the start—not a narrow credentialing-only SKU.

For a hospital system, **provider activation is one continuous workflow**. The product must cover:

- Private payers  
- Government payers  
- Hospital privileges  
- Committee approvals  
- **Reassignment** where applicable  

---

## Core capabilities (product moat)

### 1. Truth adjudication

Different sources **will conflict**. The system must:

- Determine what is **most likely correct**  
- **Explain why**  
- Show **confidence**  
- Identify **downstream workflows** affected  

### 2. First billable date intelligence (central, not a reporting add-on)

Calculate **best case**, **likely**, and **risk-adjusted first billable date** by:

- Payer  
- Site  
- Specialty  
- Supervising structure  

Then **prioritize work** that moves those dates forward fastest.

### 3. Provider Truth Graph (foundation)

Every provider fact is a **structured claim** with:

- Source  
- Timestamp  
- Verification status  
- **Confidence score**  
- **Conflict history**  
- **Expiration logic**  
- **Downstream dependencies**  

### 4. Self-healing

When core data changes (practice location, group affiliation, supervising relationship, specialty, etc.):

- Passport and **dependent workflows** update with clear identification of what is **stale** and what must be **corrected**.

### 5. Closed-loop rejection pathway

Treat as **native workflow states**, not manual side work:

Submission → rejection handling → correction → resubmission → approval, with **minimal human intervention** for routine cases.

### 6. Clinician-only vs shared enterprise

- **Clinician-only**: portable passport + **verified evidence bundle** via API or secure link.  
- **Both on platform**: shared mode—coordinated truth, fewer repeat requests, **automated downstream activation**.

### 7. Clinician vs organization responsibilities

Clear separation between what the **clinician submits independently** and what the **organization provides or approves**.

**Example (Medicare / PECOS):** individual practitioner must **sign**; when **new reassignments** are involved, the **organization accepting reassignment** must also **electronically sign**. This distinction is **operationally critical**.

### 8. Chat / lightweight models (later)

A chat surface and lightweight local model can help **search, explanation, and workflow guidance** later—they are **not** the core moat.

**Core moat:** provider truth, first billable date control, closed-loop execution, self-healing downstream updates.

### 9. Primary source verification (first-class)

**NCQA** credentialing standards require verification of practitioner credentials through a **primary source**, a **recognized source**, or a **contracted agent** of the primary source—build PSV as a **first-class workflow**, not a checkbox.

### 10. Pre-submission quality gate (“no lag” loop)

Before packets hit a payer, committee, or third-party CVO, run an **automated pre-flight**: completeness, consistency, expiration, name/address alignment, and “will this get kicked back?” rules. Goal: **catch errors upstream** so clinicians and staff are not waiting on avoidable rejections and rework cycles.

This connects directly to the **Data Quality & Consistency** layer and, at a higher level, to the **audit simulator** (weak / stale / incomplete file) before anything is transmitted.

### 11. Employer / org document concierge (email + guidance)

Many items cannot be self-sourced by the clinician (e.g., privilege letters, some HR attestations, facility-specific forms). The product should support:

- **Targeted outreach** to the employer or medical staff office (email or in-app task) listing **exactly** what is missing and **why** it is needed for which workflow.  
- **Guided retrieval**: for each document type, short **“how to obtain”** paths—e.g. which portal, which department, which primary source, sample wording—so coordinators are not guessing.

This is complementary to the **Provider Intake Concierge** (clinician-facing) and the **closed-loop rejection** path (org-facing follow-up).

---

## Clinician-only mode: what they can do, what needs the org, and passport value anyway

When **only the clinician** has the product, the passport must still be **worth paying for**. That requires three explicit artifacts:

### A. Responsibility matrix (per workflow type)

For each destination (hospital credentialing, payer enrollment, reassignment, etc.), show:

| Category | Examples | Who must act |
|----------|----------|----------------|
| **Clinician-alone** | Identity attestations, CV, diplomas, licenses they hold, CAQH-style self-data, many PSV-triggered confirmations | Clinician |
| **Org / employer** | Privilege verification letters, employment verification, facility contracts, some malpractice loss runs, reassignment acceptances, committee decisions | Organization |
| **Joint / sequenced** | PECOS individual sign + **organizational reassignment signature** when applicable | Both, in order |

Surface this in-product so expectations are clear and nothing is implied.

### B. Verified outputs without Symplr on platform

The clinician (or their delegate) must be able to **export** a **destination-ready package** even when the receiving org is not a customer:

- **Structured data** (JSON / CSV) + **evidence bundle** (PDF or zipped receipts + citations)  
- **Secure share link** or time-bound API access for the credentialing office  
- **Mapped field packs** where we know the target: e.g. “Symplr import checklist,” “Medallion-style packet,” state board PDF populate (already directionally in form-populate)

**Symplr and peers** will not always offer a clean public API; the practical path is often **documented export layouts**, **CSV column maps**, and **human-upload-ready** bundles—still high value if it cuts days of re-keying.

### C. Temporary privileging (again, clinician + org story)

**Temporary privileges** are a bridge when the org is slow but patient access matters. The **Temporary Privileges Orchestrator** (see below) should sit in the same matrix: eligibility, evidence, 120-day cap, FPPE kickoff—so “clinician-only software” still **feeds** the hospital with a defensible temp-priv packet the org can act on.

---

## Modules to include (hospital / accreditation alignment)

### Credentialing Committee Copilot

NCQA expects a **designated credentialing committee** that reviews credentials and makes recommendations. The product should:

- Generate **committee-ready packets**  
- Surface **red flags**  
- **Summarize evidence**  
- Preserve **audit-ready provenance**  

### Temporary Privileges Orchestrator

**Joint Commission** allows **temporary privileges** in limited circumstances (e.g., important patient care needs, or while a complete application awaits review), with **new applicant** temporary privileges capped at **no more than 120 consecutive days**.

The system should:

- Determine **eligibility**  
- Assemble **evidence**  
- Document **rationale**  
- **Launch FPPE** once temporary privileges are granted  

### FPPE / OPPE automation

**Joint Commission** requires **FPPE** for new privileges and **OPPE** as part of ongoing performance evaluation and re-privileging—these are **core hospital workflows**, not optional add-ons.

### Audit simulator & remediation packages

Before **NCQA survey**, **payer delegation audit**, or **internal review**:

- **Simulate** whether a file is weak, stale, incomplete, or unsupported  
- **Generate** the supporting package needed to remediate  

NCQA also emphasizes **ongoing monitoring** of sanctions, complaints, and quality issues between recredentialing cycles—**proactive audit readiness** matters.

---

## Implementation mapping (this repo)

| Strategy pillar | In codebase today (directional) | Next build steps |
|-----------------|----------------------------------|------------------|
| Passport + evidence bundle | Passport model, workflow orchestrator, audit trail, form populate | Truth graph model (claims, confidence, conflicts) |
| PSV | Agent stubs + NPPES-oriented paths | NCQA-aligned source registry + receipts |
| Safe billable / first billable | Billing guardrail agent (stub) | Payer × site × specialty date engine + prioritization |
| Enrollment + privileging breadth | Requirements, workflows, destinations in UI | Privileging, reassignment, committee states |
| Closed-loop rejection | Fix/resubmit UI patterns in Figma | Workflow states + automation for denial/remediation |
| Directory / network | Data sources doc + future APIs | Directory sync + adequacy signals |
| Committee / temp priv / FPPE-OPPE / audit sim | Not yet first-class modules | New agents + packet generators + survey simulation |
| Pre-submission QA | Quality report + workflow gates (partial) | Hard “block send” rules + payer/committee-specific checklists |
| Employer / org email bot | Passport-based email API (`/api/email/send-passport`) | Templated “missing docs” to employer MSO/HR, tracking + reminders |
| Document finder guidance | Mostly manual / future | Per-requirement “how to obtain” content + links to sources |
| Clinician vs org matrix + export | Evidence download, form populate | In-product matrix UI; Symplr-oriented CSV/PDF export packs |
| Temporary privileging | Documented in strategy | Eligibility engine + evidence packet + FPPE trigger in workflow |
| Vendor / lab / HIPAA onboarding | Demo API + UI (`/api/demo/vendor/*`, background flow) | Real BAAs, lab interfaces, ingestion pipelines |
| Plug-and-play CVO exports | Export pack + form populate + strategy doc | Per-vendor adapters, RPA, certified integrations |
| Vendor pricing wedge | Documented (low vendor fee) | Packaging, metering, contracts |

---

## Colleague input — summary

The direction is coherent and **does get more involved as you peel the onion**—that is normal for credentialing because **multiple parties** (clinician, group, hospital, payer, **vendors**) have **different signing and sourcing rules**. The product stays tractable if we **anchor on**:

1. **Provider Truth Graph** + **safe billable / first billable** (what to believe, when money can flow).  
2. **Explicit clinician vs org responsibilities** + **export/interop** so the passport has value **without** the org on platform — and **vendors** pay for **speed into any hospital CVO**.  
3. **Automation at the bottlenecks**: pre-scan before submit, **HIPAA-scoped lab/background ingestion**, employer nudges with guidance, closed-loop rejections, temp priv + FPPE where hospitals care.  
4. **Do not try to move hospitals off their CVO** — **plug the passport into every system**; that pairing is a **massive moat**.

Chat-style AI is optional polish; **execution on truth, dates, packets, loops, and multi-CVO handoff** is the moat.

---

## Related docs

- `docs/architecture.md` — system and agent architecture  
- `docs/data-sources.md` — NPPES, CMS, OIG, state boards, etc.  
- `docs/roadmap.md` — legacy RAA notes; credentialing roadmap should track against this file  

---

*Internal strategy document. External citations (TechTarget, OIG, NCQA, Joint Commission) should be verified against primary sources for investor or regulatory-facing materials.*
