# LEXOPS COUNSEL OS

> **Enterprise Legal Operations & Matter Portfolio Command Center**  
> Designed for In-House Legal Counsel, Corporate Legal Departments & Enterprise Legal Operations.

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

---

## 📌 Executive Summary

**LEXOPS COUNSEL OS** is a legal operations platform built to streamline the intake, drafting, execution, dispute resolution, conveyancing, IP protection, and external legal fee disbursements for corporate legal teams.

The platform centralizes the end-to-end legal lifecycle—from initial **Legal Document Requisition Form (LDRF)** submission to board approval, statutory Letter of Demand (LOD) defense, external panel firm retainers, and finance AP remittance tracking.

---

## 🚀 Core Functional Modules

### 1. 📊 Matter Overview Command Center
- **Executive KPI Alert Cards**: Real-time monitoring of:
  - **Expired / Overdue Matters**: High Court LOD statutory deadlines (<14 days) and expired commercial deeds.
  - **Expiring Soon (<30 Days)**: Trademark protection renewals, commercial leases, and option agreements.
  - **Pending Finance Invoices**: Unpaid external law firm tax invoices and aged payments (>14 days awaiting AP).
  - **Active Pipeline**: Real-time turnaround time (Avg TAT ~6.2 days) and SLA health index.
- **Unified Pipeline Summary**: Instant switching between active disputes, commercial contracts, property files, and intellectual property.

### 2. 📝 Agreements & LDRF Intake Tracker
- **Turnaround Time (TAT) Calculation**: Dynamic day-counter tracking elapsed business days from intake date (`requestDate`) to execution date (`executionDate`), with automatic freeze upon signing.
- **Workflow Milestones**:
  1. `LDRF Received / Drafting`
  2. `Internal Stakeholder Review`
  3. `Sent to Counterparty (External Review)`
  4. `Reverted to Legal for Finalisation`
  5. `Executed / Signed`
  6. `Active / Pending Renewal`
- **Lead Time Alerts**: Configurable prompt windows (30/60/90 days) prior to contract expiration.

### 3. ⚖️ Letter of Demand (LOD) & Dispute Tracker
- **Statutory Defense Countdown**: 7-day, 14-day statutory deadlines, or custom response windows calculated against date of service.
- **In-House vs. External Litigation Handover**: Assign matters to internal counsel or escalate directly to appointed external legal firms.
- **Fact-Finding Audit**: Track internal stakeholder inquiries (e.g., CTO, Head of Procurement, CFO) and log adverse counsel allegations.

### 4. 🏢 Property & Real Estate Conveyancing Tracker
- **Multi-Transaction Support**: Manages Tenancies, Commercial Leases, Land Acquisitions, Property Disposals, Perfection of Title, and bespoke real estate deeds.
- **Conveyancing Milestones**:
  - `Initial Drafting`
  - `SPA / Tenancy Signed`
  - `Pending Consent / State Authority Approval`
  - `Stamped & Completed`
- **Valuation & Rental Aggregation**: Real-time tracking of lease liabilities and transaction values in MYR.

### 5. 🛡️ Intellectual Property & Trademarks (MyIPO / WIPO)
- **Asset Classes**: Trademarks and Patents across Nice Classification (e.g., Class 38 Broadcast/Telecom, Class 9 Digital Assets) and IPC standards.
- **Protection Timelines**: Track filing date, statutory examination status (`Pending`, `Registered`, `Refused/Opposed`), and 10-year renewal windows with MyIPO, WIPO PCT, and regional registries (IPOS, ASEAN).

### 6. 💳 External Legal Fees & Finance Payment Tracker
- **Tax Invoice Lifecycle**: Log invoice numbers, disbursements, Professional Fees (MYR), and AP payment status (`Pending Invoice` → `Invoice Received` → `Submitted to Finance` → `Paid by Finance`).
- **One-Click Finance Remittance**: Generates electronic remittance dispatch stamps with automated audit timestamps.
- **Aging Analysis**: Visual indicators highlighting invoices delayed in finance AP over 14 business days.

### 7. 🏛️ Compliance & Governance Audits
- **MACC Section 17A**: Adequate Procedures (T.R.U.S.T.) anti-bribery & anti-corruption corporate liability compliance tracking.
- **PDPA 2010**: Personal Data Protection Act compliance audits, cross-border transfer agreements, and privacy notice consents.
- **Statutory Lodgements**: Companies Commission of Malaysia (SSM) Annual Returns, Board resolutions, and statutory filings.

### 8. 🔍 Interactive Matter Inspection & Audit Drawer
- **Drawer Workflow**: Deep inspection panel accessible by clicking any matter row across the system.
- **Direct Inline Editing**:
  - Update workflow stage
  - Edit statutory/contract deadlines
  - Change appointed external law firm (with custom firm specification)
  - Reassign internal legal counsel
  - Upload & attach supporting documents (contracts, demand letters, fee quotes)
  - Update finance tax invoices and remittance status
- **Persistent Synchronization**: Real-time persistence with instant visual feedback badges (`Saved Successfully! ✓`).
- **Quick Re-Open Shortcut**: Floating bottom-right widget to reopen inspection details when working in wide table mode.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19 (Hooks, Context API, Suspense) |
| **Language** | TypeScript 5+ (Strict Type Checking) |
| **Build & Dev Tool** | Vite 8 + ESBuild |
| **Styling** | Tailwind CSS v4 + Autoprefixer |
| **Icons & UI** | Lucide React |
| **Runtime / Server** | Node.js / Express (Port 3000) |
| **Storage & Persistence**| LocalStorage Client Cache + CSV Audit Log Exporter |

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**: v1.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/lexops-counsel-os.git
   cd lexops-counsel-os
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite development server on `http://0.0.0.0:3000` |
| `npm run build` | Compiles TypeScript and builds production distribution in `/dist` |
| `npm run start` | Launches Node.js production server (`server.js`) |
| `npm run lint` | Runs TypeScript compiler checks without emitting files (`tsc --noEmit`) |
| `npm run clean` | Deletes the production `dist` directory |

---

## 🔒 Security & Compliance Design

- **Audit Trails**: Built-in CSV audit export generating verifiable records of legal updates, counsel reassignments, and fee approvals.
- **Client-Side Data Privacy**: Default local storage sandbox prevents unintentional leakage of confidential commercial terms and litigation strategies.
- **Zero Pill / Anti-AI Slop UI**: Designed in accordance with enterprise executive design standards—high information density, crisp typography, clean data tables, and rapid keyboard shortcut navigation (`⌘K` / `Ctrl+K` global search).

---

## 📂 Project Structure

```
lexops-counsel-os/
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # Brand, global search (⌘K), quick actions
│   │   ├── Sidebar.tsx                # Left navigation with collapse/expand toggle
│   │   ├── MetricCards.tsx            # Top 4 critical alert & SLA metric cards
│   │   ├── SubTabBar.tsx              # Smooth horizontal scroll module navigator
│   │   ├── MatterOverview.tsx         # Executive dashboard & status matrix
│   │   ├── AgreementsTable.tsx        # Commercial contract repository & TAT tracker
│   │   ├── LodTrackerTable.tsx        # LOD & dispute management table
│   │   ├── PropertyMattersTable.tsx   # Conveyancing, tenancy & lease tracker
│   │   ├── IpTrademarksTable.tsx      # Trademark & patent portfolio
│   │   ├── PaymentTrackerTable.tsx    # Legal invoice & finance AP tracker
│   │   ├── ComplianceAuditsView.tsx   # MACC, PDPA & statutory compliance audits
│   │   ├── ExternalCounselView.tsx    # Law firm directory & SLA ratings
│   │   ├── MatterInspectionDrawer.tsx # Slide-out audit & update inspection drawer
│   │   ├── NewIntakeModal.tsx         # Multi-stream matter intake form
│   │   ├── QuickLdrfModal.tsx         # Fast LDRF requisition modal
│   │   └── DocumentationModal.tsx     # In-app PRD & workflow documentation
│   ├── context/
│   │   └── LegalContext.tsx           # Global legal state management & persistence
│   ├── types/
│   │   └── legal.ts                   # Strict TypeScript contracts & domain models
│   ├── utils/
│   │   └── dateUtils.ts               # TAT computation, SLA countdowns, currency formatting
│   ├── App.tsx                        # Main application layout & drawer orchestrator
│   └── main.tsx                       # React DOM root entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── server.js
└── README.md
```

---

## 📄 License & Credits

Developed for Corporate In-House Legal Counsel Operations.  
Confidential & Proprietary. All rights reserved.
