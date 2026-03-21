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

---

## Related docs

- `docs/architecture.md` — system and agent architecture  
- `docs/data-sources.md` — NPPES, CMS, OIG, state boards, etc.  
- `docs/roadmap.md` — legacy RAA notes; credentialing roadmap should track against this file  

---

*Internal strategy document. External citations (TechTarget, OIG, NCQA, Joint Commission) should be verified against primary sources for investor or regulatory-facing materials.*
