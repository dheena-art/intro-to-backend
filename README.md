# ScopeLock CLM | Enterprise Scope & Contract Management Platform

> **A unified, modern Contract Lifecycle Management (CLM) and project scope control platform engineered to eliminate scope creep, automate formal change requests, dynamically recalculate timelines & budgets, and enforce legally binding digital signature workflows.**

---

## 🌟 Executive Overview

In large-scale enterprise software and engineering engagements, project scope drift and disconnected contract records are the leading causes of budget overruns, timeline delays, and legal disputes. Traditional setups scatter scope changes across emails, spreadsheets, and chat messages without legal backing or timeline recalculation.

**ScopeLock CLM** bridges project management and legal contract lifecycle management into a single system:
1. **Explicit Scope Boundaries:** Versioned requirements with strict segregation between **In-Scope Deliverables** and **Out-of-Scope Exclusions**.
2. **Automated Contract Generation:** One-click legal agreement compilation (MSA, SOW, Addenda) directly from scoped requirements.
3. **Collaborative Clause Redlining:** Real-time clause editing, standard clause libraries, and inline diff comparisons.
4. **DocuSign-Style E-Signature:** Built-in digital signature canvas, typed cursive signatures, and cryptographic SHA-256 Certificates of Completion.
5. **Formal Change Request (CR) Protocol:** Team members propose changes; client stakeholders formally review, approve, or reject.
6. **Automated Recalculation Engine:** Dynamically calculates timeline shifts (+calendar days) and budget impacts, automatically generating a legally binding **Contract Addendum**.
7. **IEEE Requirements Traceability:** Complete provenance tracking from original contract inception to deployment.
8. **Multi-Channel Alerts & Dashboards:** Single source of truth dashboard, dynamic Gantt chart, simulated Slack `#scope-and-contract-ops` bot feed, and transactional email notifications.

---

## 🏗️ Architecture & Core Workflows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ScopeLock CLM End-to-End Workflow                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                    1. Create Project Engagement & Pricing Model
                       (Fixed-Price or Time & Materials)
                                       │
                                       ▼
                    2. Define Scope Baseline v1.0
                       ├── In-Scope Deliverables (REQ-101...)
                       └── Out-of-Scope Exclusions (Boundary Rationale)
                                       │
                                       ▼
                    3. Auto-Generate Legal Agreement (MSA / SOW)
                       ├── Collaborative Clause Library & Redlining
                       └── Clause Diff Comparisons
                                       │
                                       ▼
                    4. Execute Digital Signatures (DocuSign Flow)
                       ├── Draw on Canvas / Type Cursive Signature
                       └── Cryptographic SHA-256 Certificate Generated
                                       │
                                       ▼
                    5. New Feature / Change Emerges -> Log Change Request (CR)
                       ├── Classification ("Additional Scope" vs "Original Scope")
                       ├── Quantified Impacts (+Hours, +Days Schedule, +$ Cost)
                       └── Justification / Business Reason
                                       │
                                       ▼
                    6. Formal Client Review & Approval (RBAC)
                       ├── REJECTED ──> Preserves Baseline (No Drift, Logged)
                       └── APPROVED ──> Automatically Triggers:
                                        ├── 1. Project Deadline Recalculation (+X Days)
                                        ├── 2. Project Budget Adjustment (+$$$)
                                        ├── 3. Scope Baseline Promoted to v1.1
                                        ├── 4. Contract Addendum Auto-Generated
                                        └── 5. Live Slack Webhook & Email Dispatched
                                       │
                                       ▼
                    7. E-Sign Contract Addendum
                       └── Work commences strictly after formal execution!
                                       │
                                       ▼
                    8. IEEE Traceability, Dynamic Gantt & Audit Trail
                       └── Full history permanently linked in one place
```

---

## 🚀 Key Modules & Feature Highlights

### 1. 📊 Executive Dashboard (Single Source of Truth)
- Real-time KPIs: **Total Committed Budget**, **Baseline SOW vs. Approved Add-ons**, **Schedule Drift Days**, and **Contract Compliance Rate**.
- Visual budget progress bar comparing baseline funding vs. approved additions vs. pending financial exposure.
- Active contract lifecycle pipeline with real-time signature statuses.
- Live requirements feed with recent cryptographic audit stamps.

### 2. 📋 Scope Baseline & Boundary Control
- Version switcher (`v1.0` Initial Scope, `v1.1` Scope Addendum).
- **In-Scope Table:** Tracks Code, Title, Category, Priority (High/Med/Low), Estimated Effort (hrs), Acceptance Criteria, and current status.
- **Out-of-Scope Table:** Formally documents features excluded from the project boundary with contractual rationales (e.g., Phase 2 deferrals, client infrastructure responsibilities) to prevent dispute.
- **Contract Generator:** Instantly converts any scope baseline into a formal draft agreement.

### 3. 📜 Contract Hub, Clause Redlining & E-Sign
- **Printable Legal Sheet:** Clean, formal contract document styled for executive printing and PDF archival.
- **Clause Library & Redlining:** Collaborative clause management (Scope, Payment, Warranty, IP Rights, Limitation of Liability) with real-time markup tags and side-by-side diff comparisons.
- **DocuSign-Style E-Signature Modal:** HTML5 drawing canvas, typed signature styles, legal consent terms, and automatic SHA-256 certificate generation with IP and timestamp metadata.

### 4. ⚡ Formal Change Request (CR) Protocol
- Captures title, classification (*Additional Scope* vs. *In Original Scope*), description, justification, and quantified impacts.
- **Automated Recalculation:**
  - Schedule impact: Shifts final project delivery date automatically.
  - Cost impact: Recalculates total budget based on hourly rates or fixed fees.
- **Client Approval Modal:** Restricts formal approval to authorized client signers; automatically compiles a linked **Contract Addendum** and prompts for signature.

### 5. 🔗 IEEE Requirements Traceability Matrix (RTM)
- Complies with IEEE Standard 830/1233 for end-to-end requirements traceability.
- Trace every requirement from inception baseline through Change Requests and legal Addenda to final testing and verification.
- **Interactive Life Graph:** Click *"View Life Graph"* on any deliverable to visualize its complete historical journey.

### 6. 📅 Dynamic Gantt Schedule & Drift Simulator
- Visual milestone timeline representing project phases and delivery milestones.
- Highlights contractual schedule shifts caused by approved CRs (e.g., +14 days shift from baseline).
- **Interactive Drift Simulator:** Test what-if scenarios (+5 days, +10 days, +21 days) to project downstream completion dates.

### 7. 🔔 Multi-Channel Notifications (Slack & Email)
- **Live Slack Channel Simulation (`#scope-and-contract-ops`):** Real-time interactive webhook cards with actionable buttons (*"Review CR-002"*, *"Sign Addendum #1"*).
- **Transactional Email Inbox:** Formatted email previews for signature requests, approval prompts, and milestone sign-offs.
- **Notification Preferences:** Toggles for Slack, Email, SMS critical alerts, and alert fatigue throttling (Instant, Hourly, Daily Digest).

### 8. 🛡️ Immutable Cryptographic Audit Trail
- Timestamped activity log of every project event: user ID, role, action, entity reference, and details.
- **Merkle Hash Chain:** Every entry is sealed with a SHA-256 hash. Click *"Verify Merkle Hash Chain"* to validate that zero logs have been tampered with or deleted.

### 9. 📥 Reporting & Offline Exports
- **Export to CSV / Excel:** One-click download of all scope items, effort hours, status, CR references, and cost breakdown.
- **Printable Executive Briefing (PDF):** Formatted summary for offline presentation to boards and audit committees.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript (Strict Type Safety) |
| **Build & Bundler** | Vite v8 (Blazing Fast HMR & ESM Bundling) |
| **Styling & Design System** | Vanilla CSS Design System (Custom CSS Variables, Dark/Light Mode, Glassmorphism, Micro-animations) |
| **Typography** | Google Fonts (*Inter*, *Outfit*, *JetBrains Mono*) |
| **Icons** | Lucide React |
| **Signatures & Celebrations** | HTML5 Canvas API + `canvas-confetti` |
| **Storage & Architecture** | In-memory reactive state with full ACID transaction simulations and SHA-256 Merkle chain verification |

---

## 📁 Project Directory Layout

```
Madathon/
├── index.html                  # HTML entry point with Google Fonts & metadata
├── package.json                # Project dependencies & npm scripts
├── tsconfig.json               # TypeScript base configuration
├── tsconfig.app.json           # Application TypeScript compiler settings
├── vite.config.ts              # Vite bundler configuration
│
├── public/                     # Public static assets & favicon
│
└── src/
    ├── main.tsx                # React DOM root initialization
    ├── App.tsx                 # Root component orchestrating all platform views
    ├── index.css               # Design system tokens, glassmorphism, themes & print styles
    │
    ├── types/
    │   └── index.ts            # TypeScript interfaces for all key entities & workflows
    │
    ├── data/
    │   └── mockData.ts         # Realistic initial seed data for projects, scopes, CRs, & contracts
    │
    ├── context/
    │   └── AppContext.tsx      # Central reactive state manager & business workflow logic
    │
    └── components/
        ├── Navbar.tsx                  # Top navigation, project selector, role switcher, theme toggle
        ├── DashboardView.tsx           # Single source of truth executive KPI dashboard
        ├── ScopeManagerView.tsx        # Scope baseline tabs, in-scope vs out-of-scope boundaries
        ├── ContractsView.tsx           # Contract lifecycle, clause library redlining, printable sheet
        ├── ChangeRequestsView.tsx      # CR management, approval/rejection modal, addendum generation
        ├── TraceabilityView.tsx        # IEEE requirements traceability matrix & provenance graph
        ├── GanttTimelineView.tsx       # Dynamic Gantt calendar, milestone drift, what-if simulator
        ├── NotificationsSlackView.tsx  # Simulated Slack channel feed, bot alerts, & email inbox
        ├── AuditTrailView.tsx          # Cryptographic SHA-256 audit log & Merkle chain verification
        ├── SignatureModal.tsx          # DocuSign-style interactive signature canvas pad & certificate
        ├── NewProjectModal.tsx         # Create new project engagement with pricing model selection
        ├── NewChangeRequestModal.tsx   # Raise new CR with automated schedule/cost impact engine
        └── ReportsExportModal.tsx      # Export to CSV/Excel and printable PDF executive summary
```

---

## 💻 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (v9 or higher)

### Installation
Clone or navigate to the project directory and install dependencies:

```bash
cd c:\Users\dheen\Madathon
npm install
```
*(On Windows PowerShell, use `npm.cmd install` if script execution policies apply)*

### Running the Development Server
Launch the live development server:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173/
```

### Production Build & Type Checking
To validate types and compile the optimized production bundle:

```bash
# Type check
npx tsc --noEmit

# Production build
npm run build
```

---

## ⚡ Supabase Cloud Database Integration

ScopeLock CLM is integrated with **Supabase Cloud Database**:
- **Project ID:** `yrsnywnpohuompjluskv`
- **API Endpoint:** `https://yrsnywnpohuompjluskv.supabase.co`

### 1. Database Tables Architecture
The platform maps all application state to 8 relational datatables:
1. `projects`: Project initiatives, pricing models, base/current budgets, target completion dates, and compliance metrics.
2. `scope_versions`: Version-controlled scope documents (`v1.0`, `v1.1`, etc.).
3. `requirements`: Granular requirements with priority, effort hours, acceptance criteria, and **In-Scope vs. Out-of-Scope boundaries**.
4. `change_requests`: Formal CRs with quantified schedule drift, cost adjustments, status, and client review decisions.
5. `contracts`: MSA, SOW, and Addenda records with payment milestone schedules and clause text.
6. `audit_logs`: Immutable timestamped event stream with SHA-256 cryptographic signatures.
7. `slack_alerts`: Incoming webhooks and notifications for `#scope-and-contract-ops`.
8. `emails`: Transactional signing requests and client review notices.

### 2. Setting Up Datatables in Supabase (1-Click SQL)
If you haven't executed the table creation migration yet:
1. Log into your [Supabase SQL Editor](https://supabase.com/dashboard/project/yrsnywnpohuompjluskv/sql).
2. Open [`supabase_schema.sql`](file:///c:/Users/dheen/Madathon/supabase_schema.sql) in this repository or click the **"Supabase Live"** button in the app header and copy the SQL.
3. Click **RUN** in the Supabase SQL editor.
4. Return to ScopeLock CLM, click **"Supabase Live"** $\rightarrow$ **"Push All Data to Supabase"** to instantly populate all your tables!

---

## 📄 License & Compliance
This software implements industry best practices for Contract Lifecycle Management (CLM) and IEEE 830/1233 Requirements Traceability. Designed for enterprise governance and scope control.
