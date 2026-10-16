import re
from typing import Tuple, Dict, Any, List


def normalize_text_for_search(text: str) -> str:
    """Normalizes whitespace and lowercases for robust grounding search."""
    if not text:
        return ""
    # Collapse whitespace and strip
    text = re.sub(r"\s+", " ", text).strip()
    return text.lower()


def verify_quote_in_evidence(quote: str, evidence_text: str) -> Tuple[bool, str]:
    """
    Verifies whether a given quote genuinely appears in the source evidence text.
    Returns: (is_verified, reason_or_match_type)
    """
    if not quote or not quote.strip():
        return False, "Quote is empty"

    clean_quote = quote.strip()

    # 1. Exact verbatim match
    if clean_quote in evidence_text:
        return True, "exact_match"

    # 2. Normalized whitespace / case-insensitive match
    norm_quote = normalize_text_for_search(clean_quote)
    norm_evidence = normalize_text_for_search(evidence_text)

    if norm_quote in norm_evidence:
        return True, "normalized_match"

    # 3. Substring check: if quote has quotation marks around it, strip them
    stripped_quote = clean_quote.strip("\"'“”)")
    if stripped_quote and normalize_text_for_search(stripped_quote) in norm_evidence:
        return True, "stripped_quote_match"

    # 4. If long quote, check if at least 70% of words appear in sequence
    words = norm_quote.split()
    if len(words) >= 5:
        sub_phrase = " ".join(words[:4])
        if sub_phrase in norm_evidence:
            return True, "partial_match"

    return False, "unverified_quote"


def validate_and_ground_finding(
    source_quotes: List[str],
    source_evidence_ids: List[str],
    evidence_map: Dict[str, str]
) -> Dict[str, Any]:
    """
    Validates quotes against the corresponding evidence text.
    evidence_map: dict of evidence_id -> extracted_text
    """
    if not source_evidence_ids:
        return {
            "is_grounded": False,
            "needs_review": True,
            "verification_status": "missing_evidence_reference",
            "verified_quotes": []
        }

    verified_quotes = []
    unverified_count = 0

    for quote in source_quotes:
        found_in_any = False
        for ev_id in source_evidence_ids:
            if ev_id in evidence_map:
                ev_text = evidence_map[ev_id]
                is_ver, match_type = verify_quote_in_evidence(quote, ev_text)
                if is_ver:
                    verified_quotes.append({"quote": quote, "evidence_id": ev_id, "match_type": match_type})
                    found_in_any = True
                    break

        if not found_in_any:
            unverified_count += 1

    is_grounded = len(verified_quotes) > 0 and unverified_count == 0
    needs_review = not is_grounded or unverified_count > 0

    return {
        "is_grounded": is_grounded,
        "needs_review": needs_review,
        "verification_status": "verified" if is_grounded else ("partially_verified" if verified_quotes else "unverified"),
        "verified_quotes": verified_quotes,
        "unverified_count": unverified_count
    }
