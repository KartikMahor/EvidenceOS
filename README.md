# EvidenceOS — AI-Powered Evidence Analysis & Intelligence Platform

EvidenceOS is a forensic intelligence platform that transforms unstructured digital evidence into structured, source-traceable intelligence using **Gemma 4** through the official Google GenAI Python SDK (`google-genai`).

Investigators can ingest case documents (such as chat transcripts, bank ledgers, incident escalations, and witness interviews), extract grounded entities, claims, and timeline events, discover contradictory statements, visualize relationship graphs, and export court-ready investigative reports.

---

## Key Features

1. **Digital Evidence Ingestion & Parsing**:
   - High-throughput parsing of `.txt` and `.pdf` files (powered by PyMuPDF).
   - Strict 10 MB per-file size validation and file integrity checks.
   - Stable custody IDs and page-level reference tracking.

2. **Gemma 4 Structured Intelligence Extraction**:
   - Powered by official `google-genai` SDK with `gemma-4-26b-a4b-it`.
   - Strict Pydantic output validation for entities, dated events, reported claims, and relationships.
   - Resilient evaluation mode with automatic fallbacks so judges can test immediately without setup friction.

3. **100% Verbatim Source Quotation Grounding**:
   - Every substantive entity, event, claim, and relationship links back to exact verbatim text excerpts.
   - Non-matching or ambiguous inferences are flagged with `"needs_review: true"`.

4. **Interactive Intelligence Graph**:
   - Built on React Flow (`@xyflow/react`) with an orbital layout.
   - Differentiates Persons, Usernames, Phones, Emails, Organizations, Locations, and Financial Accounts.
   - Interactive node dossier drawer showing full source excerpts.

5. **Chronological Timeline Reconstruction**:
   - Strict separation between dated events (chronologically sequenced) and undated occurrences.
   - Source provenance badges and participant tags.

6. **Automated Contradiction Engine**:
   - Discovers conflicting amounts (e.g. $45,000 chat installment vs $55,000 bank ledger transfer).
   - Flags date discrepancies on related transactions.
   - Side-by-side claim comparison with investigator resolution notes.

7. **Downloadable Investigation Reports**:
   - One-click export in **Markdown (`.md`)** and **HTML Dossier (`.html`)**.
   - Includes full chain of custody, entity matrix, chronological timeline, flagged contradictions, and mandatory responsible AI notices.

---

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS v4, Lucide React icons, `@xyflow/react` for graph visualization, Recharts.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, SQLAlchemy, SQLite, PyMuPDF (`pymupdf`), `google-genai` SDK, Pydantic v2, Pytest.
- **AI Model**: Google Gemma 4 (`gemma-4-26b-a4b-it` or compatible hosted endpoint).

---

## Project Structure

```text
EvidenceOS/
├── frontend/                     # Next.js 16 application
│   ├── app/
│   │   ├── page.tsx              # Root landing & intelligence portal
│   │   ├── dashboard/page.tsx    # Operations dashboard with metrics & case launcher
│   │   └── investigations/
│   │       ├── page.tsx          # Investigations directory & search
│   │       └── [id]/page.tsx     # Investigation workspace (Graph, Timeline, etc.)
│   ├── components/
│   │   ├── layout/               # Sidebar, Header
│   │   ├── evidence/             # UploadModal (with 1-click demo load), EvidenceFileList
│   │   ├── intelligence/         # IntelligenceGraph, EntitiesTable, EventsTimeline, etc.
│   │   └── reports/              # ReportView with Markdown/HTML exports
│   ├── lib/
│   │   ├── api.ts                # Strongly-typed API client
│   │   └── types.ts              # Shared TypeScript definitions
│   ├── .env.example
│   └── package.json
│
├── backend/                      # FastAPI application
│   ├── app/
│   │   ├── main.py               # Application entrypoint & CORS
│   │   ├── config.py             # Settings via pydantic-settings
│   │   ├── database.py           # SQLAlchemy SQLite session engine
│   │   ├── models.py             # Relational data models (Investigation, EvidenceFile, etc.)
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   ├── api/
│   │   │   ├── investigations.py # Case CRUD, graph, timeline, and contradictions
│   │   │   ├── evidence.py       # TXT & PDF upload and parsing
│   │   │   ├── analysis.py       # Gemma 4 extraction & grounding pipeline
│   │   │   └── reports.py        # Report downloads (.md and .html)
│   │   └── services/
│   │       ├── gemma.py          # Gemma 4 client via google-genai
│   │       ├── document_parser.py# TXT & PyMuPDF PDF parser
│   │       ├── validation.py     # Verbatim source quote verification
│   │       ├── graph.py          # React Flow node/edge orbital layout builder
│   │       ├── contradictions.py # Amount, date, and statement conflict detector
│   │       └── report.py         # Markdown and HTML dossier generators
│   ├── tests/
│   │   └── test_backend.py       # Pytest unit and e2e test suite
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── sample-data/                  # Synthetic demonstration forensic files
│   ├── evidence_01_chat_log.txt  # Intercepted encrypted chat with shadow42 ($45k)
│   ├── evidence_02_bank_ledger.txt # Nexus Financial offshore transfer ($55k conflict)
│   ├── evidence_02_bank_ledger.pdf # PDF format of bank ledger
│   ├── evidence_03_incident_report.txt # Apex BioTech network gateway breach log
│   └── evidence_04_witness_interview.txt # Marcus Baxter sworn deposition
│
├── README.md
└── .gitignore
```

---

## Quickstart & Installation Guide

### 1. Backend Setup

In a terminal:
```powershell
cd backend

# Note: The virtual environment is already created in the workspace!
# You do not need to run 'python -m venv venv'. Simply activate it:
.\venv\Scripts\Activate.ps1

# (Optional) If starting the server manually when not already running:
uvicorn app.main:app --reload --port 8000
```
Backend will start at: `http://localhost:8000`  
Health check: `http://localhost:8000/api/health`

### 2. Frontend Setup

In a separate terminal:
```powershell
cd frontend

# Install packages (already installed)
npm install

# Start Next.js development server
npm run dev
```
Frontend will start at: `http://localhost:3000`

---

## Testing & Verification

Run the automated backend test suite:
```powershell
cd backend
$env:PYTHONPATH="."
.\venv\Scripts\python.exe -m pytest -v tests/
```

### Actual Test Results
```text
tests/test_backend.py::test_health_check PASSED                          [  9%]
tests/test_backend.py::test_create_and_get_investigation PASSED          [ 18%]
tests/test_backend.py::test_txt_parsing PASSED                           [ 27%]
tests/test_backend.py::test_pdf_parsing PASSED                           [ 36%]
tests/test_backend.py::test_invalid_file_extension PASSED                [ 45%]
tests/test_backend.py::test_source_quote_verification PASSED             [ 54%]
tests/test_backend.py::test_grounding_validation PASSED                  [ 63%]
tests/test_backend.py::test_contradiction_detection PASSED               [ 72%]
tests/test_backend.py::test_graph_generation PASSED                      [ 81%]
tests/test_backend.py::test_report_generation PASSED                     [ 90%]
tests/test_backend.py::test_upload_and_analyze_workflow PASSED           [100%]

======================== 11 passed in 1.08s ========================
```

---

## Live Demonstration Workflow (Hackathon Ready)

1. Open `http://localhost:3000`. You will be welcomed to the **EvidenceOS Intelligence Operations Dashboard**.
2. Click **"Launch Chimera Leak Demo"** or **"New Investigation"**.
3. In the investigation workspace:
   - Click **"Upload Evidence"** -> Click **"Load 4 Samples"** to ingest the synthetic forensic custody records in 1 second.
   - Click **"Run Gemma 4 Analysis"**.
   - Watch Gemma 4 extract grounded entities, reconstruct the timeline, map the relationship graph, and flag the $45K vs $55K contradiction.
4. Switch across tabs:
   - **Intelligence Graph**: Pan, zoom, select nodes and edges, inspect verbatim quotations.
   - **Entities**: Filter by Persons, Usernames, Phones, Emails, Organizations, Locations.
   - **Timeline**: Review chronological sequence of dated events.
   - **Contradictions**: Review side-by-side claim conflict and record investigator resolution notes.
   - **Report Export**: Click **"Download .MD"** or **"Export HTML Report"**.

---

## Responsible AI & Guardrails

- **Provenance First**: No AI allegation is ever presented as verified fact without verifiable source quotes.
- **Untrusted File Ingestion**: Uploaded content is isolated as raw data and never executed.
- **Privacy & Security**: API keys are isolated exclusively on the FastAPI backend and never exposed to client browsers.
