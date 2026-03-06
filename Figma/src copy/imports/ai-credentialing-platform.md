Design a simple clean high trust marketing site and product web app for an end to end AI credentialing platform. The product has two user types with separate experiences: Clinicians and Organizations. The core concept is a Credentialing Passport that stores all clinician data and documents, continuously verifies everything is correct and up to date, prevents expirations, and powers automated submissions. Agents do the work end to end: they gather required information, verify primary sources, fill forms, submit to the correct agencies and destinations, track status, and follow up. If an agent cannot find something, hits uncertainty, or detects conflicting data, it creates a human intervention task with a clear explanation and one click resolution options.

Design style

Match xAI simplicity: dark minimal aesthetic, crisp typography, generous whitespace, thin dividers, subtle gradients, minimal icons, no clutter. Use short confident copy. Use status chips and timelines instead of long text. Subtle micro interactions.

Information architecture

Public marketing
Home
How it works
Security
For Clinicians
For Organizations
Pricing
Login
Request demo

Product app
Login
Role Select
Clinician web app
Organization web app

Global UI components

Primary button
Secondary button
Outline button
Status chips: Verified, In progress, Blocked, Expiring soon, Needs attention
Passport card component
Metric tiles
Timeline component
Task card component
Table row component
Wizard modal component
Evidence drawer component
Role switcher dropdown component

Marketing homepage sections

Hero
Headline: Credentialing that runs itself
Subheadline: Agents collect, verify, submit, and maintain everything inside an always current Credentialing Passport. Anything uncertain is escalated for human review.
CTAs: Request demo, See how it works
Hero visual: a Passport card plus a live timeline of agent actions and submission receipts

Core value cards
End to end automation
Human intervention only when needed
Always current passport

How it works
Step 1 Connect and consent
Step 2 Agent retrieval and verification
Step 3 Auto assembly and submission to the right agencies and organizations
Step 4 Tracking, follow up, and exception routing
Step 5 Continuous monitoring and renewal autopilot

Dual audience section with tabs
For Clinicians
For Organizations
Each tab shows a mini mock of the respective dashboard

Security section
Encrypted vault, granular permissions, audit trail, continuous primary source verification

Final CTA
Make credentialing effortless
Request demo
Get started

Product app entry flow

Login screen
Simple email and password, SSO optional, minimal.

Role Select screen after login
Title: Choose your workspace
Two large centered cards with subtle hover glow

Card 1 Clinician
One line: Manage your Credentialing Passport, grant access, resolve tasks, and stay continuously verified.
Button: Continue as Clinician

Card 2 Organization
One line: Add clinicians, request credentialing work, monitor progress, resolve exceptions, and manage compliance.
Button: Continue as Organization

Role based web app launch
If Clinician chosen, launch the Clinician web app with clinician navigation.
If Organization chosen, launch the Organization web app with org navigation.

In app role switcher
Top right header shows current role and workspace.
Dropdown options: Switch workspace, Log out.

Flow A Organization experience

Goal
Organizations onboard once, add clinicians, request credentialing work, monitor progress, resolve exceptions, and stay continuously compliant.

Organization navigation
Home
Providers
Requests
Needs attention
Monitoring
Reports
Settings

Org onboarding wizard screens
1 Create org workspace
Org name, org type, primary admin
2 Add facilities and locations
Facility list, states, specialties
3 Invite team and roles
Admin, credentialing staff, viewer
4 Set policies
Alert thresholds 90 60 30 days, verification cadence, escalation rules
Finish: Go to dashboard

Org dashboard home
Four main widgets
Providers by status
Needs attention tasks
Recent submissions receipts
Upcoming deadlines
Primary CTAs
Add clinician
Request packet

Providers section
Provider roster table with filters and status chips
Columns: Name, Specialty, Facility, Passport status percent, Blockers count, Expiring soon, Stage, Next action
Row actions: View, Request, Message

Add clinician modal
Add single clinician by email invite
Import roster CSV
After adding, provider appears with a live Passport status

Request wizard for org
Short 4 step modal
1 Select clinician
2 Choose request type: Facility credentialing, Payer enrollment, Recredentialing, Generate packet
3 Choose destination: facility or payer or agency
4 Confirm requirements auto filled and start date
Button: Start workflow

Monitoring views
Pipeline board by stage: Intake, Verify, Assemble, Submit, In review, Approved, Active
Table view with sorting and filters

Provider detail page for org
Top: Passport summary card with status chips and counts
Middle: Timeline of agent actions and submissions with receipts and confirmation numbers
Right side drawer: Evidence links and verification dates
Bottom: Open tasks, approvals, and comments

Needs attention inbox
A queue of human intervention tasks created when agents hit uncertainty
Each task card shows
Missing item
Reason and where searched
Recommended action
One click buttons: Request from clinician, Upload, Approve correction, Assign
SLA timer and priority

Submission center behavior
Show submission receipts feed with destination, timestamp, confirmation number, and what was submitted
Auto follow up rules route any request for more info into Needs attention

Compliance monitoring
Dashboard: Expiring soon queue, sanctions recheck status, upcoming recredentialing dates
Actions: Trigger re verify now, Start renewal, Export audit report

Reports
Time to credential
Exception volume and root causes
Approvals by facility payer
Exportable audit trail

Flow B Clinician experience

Goal
Clinicians sign in, grant access, watch the agent work, resolve only what is missing, and keep a personal Credentialing Passport always current and shareable.

Clinician navigation
Dashboard
Tasks
Passport
Requests
Share

Clinician onboarding screens
1 Sign in create account
2 Consent and access screen
Clear consent screen listing access options with toggles
Email access for document retrieval
Portal access for credentialing payer boards where applicable
Document upload option
Continue button
3 Identity confirmation
Confirm name, NPI, address, specialty
4 Passport created
Show initial status and what the agent will do next

Clinician dashboard home
Top Passport card with photo initials name NPI
Status chips and metrics
Verified items count
Missing items count
Expiring soon count
Active requests count
Primary CTAs
Share passport
Upload document
Resolve task

Agent activity timeline
A live feed showing
Searching sources
Extracting documents
Verifying licenses boards sanctions malpractice
Preparing forms
Submitting to destination
Follow up sent
Receipt captured

Tasks tab
Only tasks the clinician must complete
Each task card is extremely clear and minimal
What is needed
Why it is needed
How to complete
One click actions: Upload, E sign, Confirm data, Connect portal

Passport tab
Structured profile sections
Identity
Licenses
Board certification
DEA CSR
Education and training
Malpractice
Immunizations if required
Each field shows
Verified badge
Last verified date
Expiration date
Evidence drawer link

Requests tab
Shows current and past requests initiated by orgs or by clinician
Each request has a stage tracker and receipts
Clinician can approve attestations and sign forms

Share flow
One click Generate passport packet
Choose destination type: facility, payer, staffing group
Generate a clean share link or export
Show what is included and a verification status summary

Exception behavior
If an agent cannot find something it becomes a task
If conflicting data is detected it asks the clinician to confirm the correct value and attaches evidence
Clinician never hunts, they only resolve the single surfaced task

Pages to design

Marketing
Homepage
For Clinicians landing
For Organizations landing
Security page
Pricing page
Login page

Product app
Role Select
Org onboarding wizard
Org dashboard home
Org providers roster
Org provider detail
Org request wizard modal
Org needs attention inbox
Org monitoring and compliance dashboard
Clinician onboarding consent flow
Clinician dashboard home
Clinician tasks
Clinician passport profile
Clinician requests tracker
Clinician share packet flow

Copy tone

Direct confident minimal. Emphasize end to end agents, human intervention only when needed, submissions to the right agencies, and the always current passport that continuously verifies and prevents expirations.