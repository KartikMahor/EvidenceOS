import pytest
from app.services.validation import verify_quote_in_evidence, validate_and_ground_finding
from app.services.contradictions import detect_contradictions_in_investigation
from app.models import Claim


def test_source_quote_verification():
    source_text = "The initial installment of $45,000 was wired to the escrow account as agreed."
    verified, match_type = verify_quote_in_evidence("initial installment of $45,000", source_text)
    assert verified is True
    assert match_type in ["exact_match", "normalized_match"]

    # Negative test: Non-existent quote
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
