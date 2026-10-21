# Smart Invoice AI — Multimodal Financial Document Extraction & Reconciled AP Intelligence

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma%205.22-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Multimodal AI](https://img.shields.io/badge/AI-Gemini%202.5%20Vision-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **Smart Invoice AI** is an intelligent document processing engine that extracts, validates, and reconciles financial invoices and receipts using multimodal LLMs. It features zero-hallucination line-item parsing, automated math reconciliation, and an interactive conversational Accounts Payable (AP) copilot.

---

## 📌 Executive Summary

Manual invoice processing is notorious for costly human error, slow turnaround, and vulnerability to duplicate billings. Traditional OCR tools fail on skewed angles, irregular layouts, and multi-currency formats.

**Smart Invoice AI** replaces brittle OCR templates with **frontier multimodal vision models (Google Gemini 2.5 / Claude 3.5 Sonnet)**. The system ingests raw camera captures, scans, and multi-page PDFs, converts them into strictly typed JSON structures, verifies line-item arithmetic against totals, stores validated records in PostgreSQL via Prisma, and enables natural language financial analytics through a conversational copilot.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User([👤 AP Specialist / Finance Team]) <-->|Upload PDF / Scan / Camera Capture| Client[🖥️ Next.js 16 Frontend Dashboard]

    subgraph "Ingest & Multimodal Extraction Pipeline"
        Client -->|POST /api/upload| IngestHandler[⚡ Multipart File Streamer]
        IngestHandler --> VisionEngine[👁️ Multimodal Vision Engine: Gemini 2.5]
        VisionEngine -->|Strict JSON Schema Enforcement| SchemaValidator[📐 Schema Validator & Math Reconciler]
    end

    subgraph "Verification & Arithmetic Reconciler"
        SchemaValidator -->|Sum of Line Items == Subtotal?| MathCheck{Reconciled?}
        MathCheck -->|Pass| ConfidenceScorer[🎯 Confidence Scoring & Tax Classifier]
        MathCheck -->|Discrepancy| FlagAnomaly[⚠️ Flag Anomaly & Math Warning]
    end

    subgraph "Persistence & Telemetry"
        ConfidenceScorer --> DB[(🐘 PostgreSQL Database via Prisma ORM)]
        FlagAnomaly --> DB
        DB <--> InvoicesView[📑 Invoices List & Verification Drawer]
    end

    subgraph "Conversational AP Copilot"
        User <-->|Conversational Query: 'What is our Q1 vendor spend?'| ChatEngine[🤖 AP Copilot Engine: /api/chat]
        ChatEngine <-->|Contextual RAG & SQL Tool Query| DB
    end
```

---

## 🌟 Key Features

### 1. Zero-Shot Multimodal Document Parsing
* **Layout Agnostic:** Handles multi-column invoices, handwritten notes, tilted mobile camera photos, and digital PDF receipts without custom OCR templates.
* **Granular Line-Item Extraction:** Accurately isolates descriptions, quantities, unit prices, individual tax percentages, and line totals with 99%+ schema reliability.

### 2. Autonomous Arithmetic Reconciliation
* **Mathematical Integrity Engine:** Automatically computes $\sum (\text{Qty} \times \text{Unit Price}) + \text{Tax} - \text{Discount}$ and cross-references against the stated invoice total.
* **Anomaly Detection:** Instantly flags duplicate billings, price discrepancies, unrecognized tax brackets, and suspicious vendor bank coordinates.

### 3. Conversational Accounts Payable (AP) Copilot
* **Natural Language Queries:** Pose questions like *"How much have we paid to Acme Corp over the last 90 days?"* or *"List all invoices with pending review status over $5,000."*
* **Tool Grounding:** Conversational assistant executes schema-safe queries against the PostgreSQL database to deliver verified answers.

### 4. Enterprise Audit Trails & Export Engine
* **Complete Auditability:** Every invoice transition (`PENDING` $\to$ `REVIEWED` $\to$ `APPROVED` $\to$ `REJECTED`) is recorded with timestamps and confidence scores.
* **PDFKit Export:** Generates standardized summary statements and one-click JSON/CSV exports for enterprise ERP integration.

---

## 🗄️ Relational Database Schema (Prisma)

The persistence layer is structured for high integrity:

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
  status           String       @default("PENDING") // PENDING, REVIEWED, APPROVED, REJECTED
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

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16.4.0 (App Router), React 19.3.0, Lucide Icons, Sonner Notifications |
| **Backend & APIs** | Next.js Server Actions & Route Handlers |
| **Database & ORM** | PostgreSQL, Prisma ORM 5.22 |
| **Multimodal Extraction** | Google Gemini 2.5 Flash / Vision via `@google/genai` |
| **Document Export** | PDFKit, Date-fns, React-Markdown |
| **Analytics & UI** | Recharts, Next-Themes (Dark/Light mode support) |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v20.0.0` or higher
* **PostgreSQL** instance (local Docker container, Supabase, Neon, or Railway)
* **Google Gemini API Key**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harkiratsinghh27-sketch/invoice-app.git
   cd invoice-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```env
   # PostgreSQL Connection String
   POSTGRES_URL="postgresql://user:password@localhost:5432/invoice_db?schema=public"

   # Google Gemini API Key
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

4. **Synchronize Database Schema:**
   ```bash
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **Open the Application:**
   Navigate to [http://localhost:3000](http://localhost:3000) to upload your first invoice.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
