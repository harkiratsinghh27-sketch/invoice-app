# Smart Invoice AI

> Automated invoice and receipt processing platform with multimodal vision extraction, arithmetic reconciliation, and conversational accounts payable analytics.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-invoice--app--jade--one.vercel.app-2563EB?style=flat)](https://invoice-app-jade-one.vercel.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma%205.22-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Live Production URL:** [https://invoice-app-jade-one.vercel.app](https://invoice-app-jade-one.vercel.app)

---

## Overview

Smart Invoice AI is an intelligent document processing application designed to eliminate manual data entry from accounts payable workflows. It converts physical receipts, scanned documents, and digital PDFs into validated financial records.

Unlike legacy OCR templates that break when layouts shift, the platform uses **Google Gemini 2.5 Flash Multimodal Vision** with strictly enforced JSON schemas. Extracted records undergo server-side arithmetic checks to verify line-item sums against stated totals before being written to PostgreSQL via Prisma ORM.

---

## System Architecture

```mermaid
flowchart TD
    User([User / Accounts Payable]) <-->|Upload PDF or Camera Scan| Frontend[Next.js 16 Dashboard]

    subgraph "Extraction & Parsing"
        Frontend -->|POST /api/extract| Extractor[Multimodal Vision Pipeline]
        Extractor --> VisionModel[Google Gemini 2.5 Flash]
        VisionModel -->|Strict JSON Output| Validator[Schema Validator & Type Guard]
    end

    subgraph "Verification & Math Reconciliation"
        Validator --> MathCheck{Line Sum == Total?}
        MathCheck -->|Verified| Scorer[Confidence Scorer & Classifier]
        MathCheck -->|Mismatch| Flag[Flag Discrepancy & Anomaly Warning]
    end

    subgraph "Persistence & Reporting"
        Scorer --> DB[(PostgreSQL via Prisma ORM)]
        Flag --> DB
        DB <--> InvoicesView[Invoices List, Filters & Detail Drawers]
    end

    subgraph "Conversational AP Copilot"
        User <-->|Natural Language Queries| ChatAPI[/api/chat]
        ChatAPI <-->|Contextual Schema Search| DB
    end
```

---

## Core Engineering Highlights

### 1. Zero-Shot Multimodal Document Parsing
* **Layout Independence:** Accommodates skewed mobile photos, multi-page PDFs, and international receipts without pre-configured bounding boxes or OCR templates.
* **Granular Extraction:** Extracts vendor information, invoice IDs, issue/due dates, currencies, line-item descriptions, quantities, unit prices, tax brackets, and totals.

### 2. Server-Side Mathematical Reconciliation
* Validates that $\sum (\text{Quantity} \times \text{Unit Price}) + \text{Tax} - \text{Discount} = \text{Total}$.
* Any discrepancy generates an explicit arithmetic warning in the dashboard, safeguarding against fraudulent or inaccurate billings.

### 3. Relational Persistence via Prisma ORM
* Backed by PostgreSQL with normalized relational models separating Invoices from LineItems and User audit trails.
* Enforces status workflows (`PENDING`, `REVIEWED`, `APPROVED`, `REJECTED`) with historical timestamps.

### 4. Interactive AP Assistant
* Natural language chat assistant built into the application allowing finance teams to query vendor spend (e.g., *"How much have we paid Acme Corp this month?"* or *"List all invoices awaiting approval"*).

---

## Database Schema (Prisma)

```prisma
model Invoice {
  id               String       @id @default(uuid())
  userId           String
  vendorName       String?
  vendorAddress    String?
  invoiceNumber    String?
  invoiceDate      DateTime?
  dueDate          DateTime?
  currency         String?
  subtotal         Float?
  tax              Float?
  discount         Float?
  total            Float?
  status           String       @default("PENDING")
  processingStatus String       @default("PROCESSING")
  confidenceScore  Float?
  createdAt        DateTime     @default(now())
  lineItems        LineItem[]
}

model LineItem {
  id          String   @id @default(uuid())
  invoiceId   String
  description String?
  quantity    Float?
  unitPrice   Float?
  tax         Float?
  total       Float?
}
```

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16.4 (App Router), React 19.3, Lucide Icons, Sonner |
| **Backend & Routing** | Next.js Server Actions & API Route Handlers |
| **Database** | PostgreSQL, Prisma ORM 5.22 |
| **Vision Extraction** | Google Gemini 2.5 Flash via `@google/genai` |
| **Analytics & UI** | Recharts, PDFKit, Date-fns |
| **Deployment** | Vercel Serverless Edge Network |

---

## Getting Started

### Prerequisites
* Node.js 20.0 or higher
* PostgreSQL database instance (local or hosted via Supabase/Neon/Railway)
* Gemini API Key

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harkiratsinghh27-sketch/invoice-app.git
   cd invoice-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file:
   ```env
   POSTGRES_URL="postgresql://user:password@localhost:5432/invoice_db?schema=public"
   GEMINI_API_KEY="your_gemini_api_key"
   ```

4. **Sync database schema:**
   ```bash
   npx prisma db push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the app locally.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
