import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models import Investigation, EvidenceFile, Entity, Event, Claim, Relationship, Contradiction
from app.services.document_parser import parse_document, parse_txt_file, DocumentParsingError
from app.services.validation import verify_quote_in_evidence, validate_and_ground_finding
from app.services.contradictions import detect_contradictions_in_investigation
from app.services.graph import build_investigation_graph
from app.services.report import generate_markdown_report, generate_html_report
from app.schemas import AIExtractionResult, AIExtractedEntity

from sqlalchemy.pool import StaticPool

# Setup in-memory test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data


def test_create_and_get_investigation(client):
    response = client.post("/api/investigations", json={
        "title": "Operation Chimera Leak",
        "description": "Investigating corporate data breach and unauthorized wire transfers."
    })
    assert response.status_code == 201
    data = response.json()
    inv_id = data["id"]
    assert data["title"] == "Operation Chimera Leak"
    assert data["stats"]["evidence_count"] == 0

    # Get by id
    get_res = client.get(f"/api/investigations/{inv_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == inv_id


def test_txt_parsing():
    sample_txt_path = "../sample-data/evidence_01_chat_log.txt"
    if os.path.exists(sample_txt_path):
        parsed = parse_document(sample_txt_path, "evidence_01_chat_log.txt")
        assert parsed["file_type"] == "txt"
        assert "shadow42" in parsed["text"]
        assert parsed["page_count"] == 1


def test_pdf_parsing():
    sample_pdf_path = "../sample-data/evidence_02_bank_ledger.pdf"
    if os.path.exists(sample_pdf_path):
        parsed = parse_document(sample_pdf_path, "evidence_02_bank_ledger.pdf")
        assert parsed["file_type"] == "pdf"
        assert "55,000" in parsed["text"] or "Nexus" in parsed["text"]
        assert parsed["page_count"] >= 1


def test_invalid_file_extension():
    with pytest.raises(DocumentParsingError):
        parse_document("test.exe", "test.exe")


def test_source_quote_verification():
    source_text = "The initial installment of $45,000 was wired to the escrow account as agreed."
    verified, match_type = verify_quote_in_evidence("initial installment of $45,000", source_text)
    assert verified is True
    assert match_type in ["exact_match", "normalized_match"]

    # Negative test
    verified_bad, _ = verify_quote_in_evidence("completely fabricated claim that does not exist", source_text)
    assert verified_bad is False


def test_grounding_validation():
    ev_map = {"ev_1": "Payment of $45,000 confirmed for Zurich drop on October 12, 2026."}
    res = validate_and_ground_finding(
        source_quotes=["Payment of $45,000"],
        source_evidence_ids=["ev_1"],
        evidence_map=ev_map
    )
    assert res["is_grounded"] is True
    assert res["needs_review"] is False

    # Unverified quote
    res_bad = validate_and_ground_finding(
        source_quotes=["Nonexistent $999,999 payment"],
        source_evidence_ids=["ev_1"],
        evidence_map=ev_map
    )
    assert res_bad["is_grounded"] is False
    assert res_bad["needs_review"] is True


def test_contradiction_detection():
    claims = [
        Claim(
            id="clm_1",
            investigation_id="inv_test",
            text="Initial installment of $45,000 wired to escrow.",
            source_quotes=["installment of $45,000"],
            source_evidence_ids=["ev_1"]
        ),
        Claim(
            id="clm_2",
            investigation_id="inv_test",
            text="Wire transfer record indicates $55,000 payment authorized.",
            source_quotes=["indicates $55,000 payment"],
            source_evidence_ids=["ev_2"]
        )
    ]
    contradictions = detect_contradictions_in_investigation("inv_test", claims, [], [])
    assert len(contradictions) >= 1
    assert contradictions[0].contradiction_type == "amount_conflict"
    assert "45,000" in contradictions[0].description
    assert "55,000" in contradictions[0].description


def test_graph_generation():
    ent1 = Entity(id="ent_1", investigation_id="inv_g", type="username", value="shadow42", source_evidence_ids=["ev_1"])
    ent2 = Entity(id="ent_2", investigation_id="inv_g", type="person", value="Dr. Aris Thorne", source_evidence_ids=["ev_1"])
    rel = Relationship(
        id="rel_1",
        investigation_id="inv_g",
        source_entity_id="ent_1",
        target_entity_id="ent_2",
        type="communicated_with",
        description="Coordinated drop"
    )

    graph = build_investigation_graph("inv_g", [ent1, ent2], [rel])
    assert len(graph.nodes) == 2
    assert len(graph.edges) == 1
    assert graph.edges[0].source == "ent_1"
    assert graph.edges[0].target == "ent_2"


def test_report_generation():
    inv = Investigation(
        id="inv_rep",
        title="Operation Chimera",
        description="Confidential leak inquiry.",
        status="analyzed",
        evidence_files=[],
        entities=[],
        events=[],
        claims=[],
        relationships=[],
        contradictions=[]
    )
    md = generate_markdown_report(inv)
    assert "EVIDENCE ANALYSIS REPORT: OPERATION CHIMERA" in md
    assert "LEGAL & ETHICAL RESPONSIBILITY NOTICE" in md

    html = generate_html_report(inv)
    assert "<!DOCTYPE html>" in html
    assert "EvidenceOS Report" in html


def test_upload_and_analyze_workflow(client):
    # 1. Create an investigation
    inv_res = client.post("/api/investigations", json={
        "title": "E2E Leak Workflow Test",
        "description": "Testing upload, analysis, graph, timeline, and contradiction flow."
    })
    assert inv_res.status_code == 201
    inv_id = inv_res.json()["id"]

    # 2. Upload sample evidence
    with open("../sample-data/evidence_01_chat_log.txt", "rb") as f1, \
         open("../sample-data/evidence_02_bank_ledger.txt", "rb") as f2:
        files = [
            ("files", ("evidence_01_chat_log.txt", f1, "text/plain")),
            ("files", ("evidence_02_bank_ledger.txt", f2, "text/plain")),
        ]
        up_res = client.post(f"/api/investigations/{inv_id}/evidence", files=files)
        assert up_res.status_code == 201
        uploaded = up_res.json()
        assert len(uploaded) == 2

    # 3. Trigger analysis
    analyze_res = client.post(f"/api/investigations/{inv_id}/analyze")
    assert analyze_res.status_code == 200
    analysis_data = analyze_res.json()
    assert analysis_data["status"] == "analyzed"
    assert analysis_data["entities_count"] > 0
    assert analysis_data["events_count"] > 0
    assert analysis_data["contradictions_count"] >= 1

    # 4. Check Graph API
    graph_res = client.get(f"/api/investigations/{inv_id}/graph")
    assert graph_res.status_code == 200
    graph_data = graph_res.json()
    assert len(graph_data["nodes"]) > 0

    # 5. Check Timeline API
    timeline_res = client.get(f"/api/investigations/{inv_id}/timeline")
    assert timeline_res.status_code == 200
    timeline_data = timeline_res.json()
    assert len(timeline_data["dated_events"]) > 0

    # 6. Check Contradictions API
    cnt_res = client.get(f"/api/investigations/{inv_id}/contradictions")
    assert cnt_res.status_code == 200
    cnt_data = cnt_res.json()
    assert len(cnt_data) >= 1
    cnt_id = cnt_data[0]["id"]

    # 7. Resolve a contradiction
    resolve_res = client.post(
        f"/api/investigations/{inv_id}/contradictions/{cnt_id}/resolve",
        json={"status": "resolved", "resolution_notes": "Reviewed with corporate compliance officer."}
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "resolved"

    # 8. Download Report API
    rep_res = client.get(f"/api/investigations/{inv_id}/report?format=markdown")
    assert rep_res.status_code == 200
    assert "EVIDENCE ANALYSIS REPORT" in rep_res.text

