# In-House Operation System Tracker

> **Enterprise Legal Operations & Matter Portfolio Command Center**  
> Designed for In-House Legal Counsel, Corporate Legal Departments & Enterprise Legal Operations.

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

---

## 📌 Executive Summary

**In-House Operation System Tracker** is an enterprise-grade legal operations platform engineered to manage the intake, drafting, internal/external negotiation, signing, dispute resolution, real estate conveyancing, intellectual property protection, and external legal fee disbursements for corporate legal teams.

The platform centralizes the end-to-end legal lifecycle—from initial **Legal Document Requisition Form (LDRF)** submission to board approval, statutory Letter of Demand (LOD) defense, external panel firm retainers, and finance AP remittance tracking.

---

## 🚀 Key Highlights & Architectural Features

### 1. 🔐 Multi-User Authentication & Isolated Firestore Databases
- **Firebase Authentication**: Email/Password login and Google Workspace Single Sign-On (SSO).
- **Isolated Per-User Data Partitioning**: Each legal counsel operates in their own isolated Firestore subcollections (`/users/{uid}/agreements`, `/users/{uid}/lods`, etc.), ensuring zero cross-tenant contamination.
- **Dedicated Demo Profiles**:
  - **Existing User Demo**: Pre-loaded with full corporate legal pipeline matters across agreements, disputes, property, trademarks, and panel firm invoices.
  - **New User Demo**: Enters a 100% clean, blank personal workspace with 0 matters and 0 alerts, featuring an intuitive blank-slate onboarding card with a 1-click sample data loader.

### 2. ⚡ Live Alert Synchronization (Real-Time Dynamic Metrics)
- Top alert metric cards compute **100% live** directly from the active user's database:
  - **Expired / Overdue Matters**: High Court LOD statutory deadlines and expired commercial agreements.
  - **Expiring Soon (<30 Days)**: Contract renewals, property lease terms, and trademark renewal windows.
  - **Pending Finance Invoices**: Unpaid external law firm tax invoices and aged payments (>14 days awaiting AP).
  - **Active Pipeline & Dynamic TAT**: Computes average Turnaround Time (TAT) and tracks active uncompleted matters in real time.
- **Dynamic Breakdown**: Metric cards display exact item breakdowns (e.g. `1 LOD • 2 AGR • 1 PROP`) that match table filtering when clicked.

### 3. 📝 Agreements & LDRF Intake Tracker
- **Turnaround Time (TAT) Calculation**: Dynamic day-counter tracking elapsed business days from intake date (`requestDate`) to execution date (`executionDate`), with automatic freeze upon signing.
- **Workflow Milestones**:
  1. `LDRF Received / Drafting`
  2. `Internal Stakeholder Review`
  3. `Sent to Counterparty (External Review)`
  4. `Reverted to Legal for Finalisation`
  5. `Executed / Signed`
  6. `Active / Pending Renewal`
- **Lead Time Alerts**: Configurable prompt windows (30/60/90 days) prior to contract expiration.

### 4. ⚖️ Letter of Demand (LOD) & Dispute Management
- **Statutory Defense Countdown**: 7-day, 14-day statutory deadlines, or custom response windows calculated against date of service.
- **In-House vs. External Litigation Handover**: Assign matters to internal counsel or escalate directly to appointed external legal firms.
- **Fact-Finding Audit**: Track internal stakeholder inquiries (e.g., CTO, Head of Procurement, CFO) and log adverse counsel allegations.

### 5. 🏢 Property & Real Estate Conveyancing Tracker
- **Multi-Transaction Support**: Manages Tenancies, Commercial Leases, Land Acquisitions, Property Disposals, Perfection of Title, and bespoke real estate deeds.
- **Conveyancing Milestones**:
  - `Initial Drafting`
  - `SPA-Tenancy Signed`
  - `Pending Consent-State Approval`
  - `Stamped-Completed`
- **Valuation & Rental Aggregation**: Real-time tracking of lease liabilities and transaction values in MYR.

### 6. 🛡️ Intellectual Property & Trademarks (MyIPO / WIPO)
- **Asset Classes**: Trademarks and Patents across Nice Classification and IPC standards.
- **Protection Timelines**: Track filing date, statutory examination status (`Pending`, `Registered`, `Refused`), and 10-year renewal windows with MyIPO, WIPO PCT, and regional registries.

### 7. 💳 External Legal Fees & Finance Payment Tracker
- **Tax Invoice Lifecycle**: Log invoice numbers, disbursements, Professional Fees (MYR), and AP payment status (`Pending Invoice` → `Invoice Received` → `Submitted to Finance` → `Paid by Finance`).
- **One-Click Finance Remittance**: Generates electronic remittance dispatch stamps with automated audit timestamps.
- **Aging Analysis**: Visual indicators highlighting invoices delayed in finance AP over 14 business days.

### 8. 🔍 Interactive Matter Inspection & Audit Drawer
- **Drawer Workflow**: Deep inspection panel accessible by clicking any matter row across the system.
- **Direct Inline Editing**:
  - Update workflow stage
  - Edit statutory/contract deadlines
  - Change appointed external law firm
  - Reassign internal legal counsel
  - Upload & attach supporting documents
  - Update finance tax invoices and remittance status
- **Persistent Synchronization**: Real-time persistence with instant visual feedback badges.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19 (Hooks, Context API, Suspense) |
| **Language** | TypeScript 5+ (Strict Type Checking) |
| **Build & Dev Tool** | Vite 8 + ESBuild |
| **Styling** | Tailwind CSS v4 + Autoprefixer (Monochrome dark/light design system) |
| **Icons & UI** | Lucide React |
| **Authentication & Database** | Firebase Authentication + Cloud Firestore |
| **Runtime / Server** | Node.js / Express (Port 3000) |
| **Storage & Export** | Google Drive Integration + CSV Audit Log Exporter |

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**: v1.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/in-house-operation-system-tracker.git
   cd in-house-operation-system-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
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

---

## 🔒 Security & Compliance Design

- **Audit Trails**: Built-in CSV audit export generating verifiable records of legal updates, counsel reassignments, and fee approvals.
- **Client-Side Data Privacy**: Default isolated user storage sandboxes prevent unintentional leakage of confidential commercial terms and litigation strategies.
- **Enterprise Design Standards**: High information density, crisp typography, clean data tables, and rapid keyboard shortcut navigation (`⌘K` / `Ctrl+K` global search).

---

## 📄 License & Credits

Developed for Corporate In-House Legal Counsel Operations.  
Confidential & Proprietary. All rights reserved.
