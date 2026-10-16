# EvidenceOS Backend API

FastAPI application delivering AI-powered extraction, source citation verification, relationship network mapping, contradiction detection, and report generation for EvidenceOS.

## Prerequisites
- Python 3.11+
- Virtual environment (`venv`)

## Setup & Running Locally

1. Create and activate a virtual environment:
```powershell
# Windows
python -m venv venv
.\venv\Scripts\Activate.ps1
```

2. Install dependencies:
```powershell
pip install -r requirements.txt
```

3. Configure environment variables in `.env`:
```env
GEMINI_API_KEY=your_api_key_here
GEMMA_MODEL=gemma-4-26b-a4b-it
DATABASE_URL=sqlite:///./evidence_os.db
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=10
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

4. Run the FastAPI server:
```powershell
uvicorn app.main:app --reload --port 8000
```

5. Run test suite:
```powershell
$env:PYTHONPATH="."
pytest -v tests/
```

## Health Check
`GET http://localhost:8000/api/health`
