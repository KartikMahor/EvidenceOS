import os
import pytest
from app.services.document_parser import parse_document, DocumentParsingError
from app.services.extraction import extract_evidence_document, extract_intelligence_from_evidence


def test_txt_parsing():
    sample_txt_path = "../sample-data/evidence_01_chat_log.txt"
    if not os.path.exists(sample_txt_path):
        sample_txt_path = "sample-data/evidence-01.txt"
    if os.path.exists(sample_txt_path):
        parsed = extract_evidence_document(sample_txt_path, "evidence_01_chat_log.txt")
        assert parsed["file_type"] == "txt"
        assert len(parsed["text"]) > 0
        assert parsed["page_count"] == 1


def test_pdf_parsing():
    sample_pdf_path = "../sample-data/evidence_02_bank_ledger.pdf"
    if os.path.exists(sample_pdf_path):
        parsed = extract_evidence_document(sample_pdf_path, "evidence_02_bank_ledger.pdf")
        assert parsed["file_type"] == "pdf"
        assert parsed["page_count"] >= 1
        assert len(parsed["text"]) > 0


def test_invalid_file_extension():
    with pytest.raises(DocumentParsingError):
        extract_evidence_document("test.exe", "test.exe")


def test_file_hash_and_metadata():
    sample_txt_path = "../sample-data/evidence_01_chat_log.txt"
    if os.path.exists(sample_txt_path):
        parsed = extract_evidence_document(sample_txt_path, "evidence_01_chat_log.txt")
        assert "file_hash" in parsed
        assert len(parsed["file_hash"]) == 64
        assert parsed["extraction_method"] == "plain_text"


def test_ai_extraction_service():
    evidence_items = [
        {
            "id": "ev_test_1",
            "filename": "chat.txt",
            "text": "User shadow42 sent $45,000 to Dr. Aris Thorne on October 12, 2026."
        }
    ]
    result, model_name, is_live = extract_intelligence_from_evidence(evidence_items)
    assert result is not None
    assert len(result.entities) > 0
    assert len(result.events) > 0
