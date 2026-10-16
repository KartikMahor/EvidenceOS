import re
from typing import List, Dict, Any, Optional
from app.models import Contradiction, Claim, Event, Entity, generate_uuid


def extract_dollar_amounts(text: str) -> List[int]:
    """Extracts integer dollar values from text like $45,000 or $55000."""
    matches = re.findall(r"\$([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)", text)
    amounts = []
    for m in matches:
        clean = m.replace(",", "")
        try:
            amounts.append(int(clean))
        except ValueError:
            pass
    return amounts


def extract_dates(text: str) -> List[str]:
    """Finds date patterns like 2026-10-12 or October 12, 2026."""
    iso_dates = re.findall(r"\b20\d{2}-\d{2}-\d{2}\b", text)
    named_dates = re.findall(r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2}\b", text, re.IGNORECASE)
    return iso_dates + named_dates


def detect_contradictions_in_investigation(
    investigation_id: str,
    claims: List[Claim],
    events: List[Event],
    entities: List[Entity]
) -> List[Contradiction]:
    """
    Identifies potential contradictions between claims and records.
    Focuses on:
    1. Amount discrepancies (e.g., $45,000 vs $55,000)
    2. Date discrepancies for related actions
    3. Direct assertion/denial conflicts (e.g., authorized vs denied authorization)
    """
    contradictions: List[Contradiction] = []
    seen_pairs = set()

    # 1. Check pairwise claims for amount conflicts
    for i, c1 in enumerate(claims):
        amounts_1 = extract_dollar_amounts(c1.text + " " + " ".join(c1.source_quotes or []))
        dates_1 = extract_dates(c1.text + " " + " ".join(c1.source_quotes or []))

        for j in range(i + 1, len(claims)):
            c2 = claims[j]
            pair_key = tuple(sorted([c1.id, c2.id]))
            if pair_key in seen_pairs:
                continue

            amounts_2 = extract_dollar_amounts(c2.text + " " + " ".join(c2.source_quotes or []))
            dates_2 = extract_dates(c2.text + " " + " ".join(c2.source_quotes or []))

            # Amount conflict check
            if amounts_1 and amounts_2 and set(amounts_1) != set(amounts_2):
                diff_1 = [a for a in amounts_1 if a not in amounts_2]
                diff_2 = [a for a in amounts_2 if a not in amounts_1]
                if diff_1 and diff_2:
                    q1 = c1.source_quotes[0] if c1.source_quotes else c1.text
                    q2 = c2.source_quotes[0] if c2.source_quotes else c2.text
                    ev1 = c1.source_evidence_ids[0] if c1.source_evidence_ids else None
                    ev2 = c2.source_evidence_ids[0] if c2.source_evidence_ids else None

                    cnt = Contradiction(
                        id=generate_uuid("cnt"),
                        investigation_id=investigation_id,
                        claim_1_id=c1.id,
                        claim_2_id=c2.id,
                        contradiction_type="amount_conflict",
                        description=f"Conflicting transaction amounts reported: Claim 1 indicates ${diff_1[0]:,} while Claim 2 reports ${diff_2[0]:,}.",
                        claim_1_quote=q1,
                        claim_2_quote=q2,
                        evidence_1_id=ev1,
                        evidence_2_id=ev2,
                        status="unresolved"
                    )
                    contradictions.append(cnt)
                    seen_pairs.add(pair_key)
                    continue

            # Authorization denial statement conflict
            text1_lower = (c1.text + " " + " ".join(c1.source_quotes or [])).lower()
            text2_lower = (c2.text + " " + " ".join(c2.source_quotes or [])).lower()

            has_auth = "authorization" in text1_lower or "authorized" in text1_lower or "approved" in text1_lower
            has_denial = "never authorized" in text2_lower or "denies" in text2_lower or "rejected" in text2_lower or "forged" in text2_lower

            has_auth_2 = "authorization" in text2_lower or "authorized" in text2_lower or "approved" in text2_lower
            has_denial_2 = "never authorized" in text1_lower or "denies" in text1_lower or "rejected" in text1_lower or "forged" in text1_lower

            if (has_auth and has_denial) or (has_auth_2 and has_denial_2):
                q1 = c1.source_quotes[0] if c1.source_quotes else c1.text
                q2 = c2.source_quotes[0] if c2.source_quotes else c2.text
                ev1 = c1.source_evidence_ids[0] if c1.source_evidence_ids else None
                ev2 = c2.source_evidence_ids[0] if c2.source_evidence_ids else None

                cnt = Contradiction(
                    id=generate_uuid("cnt"),
                    investigation_id=investigation_id,
                    claim_1_id=c1.id,
                    claim_2_id=c2.id,
                    contradiction_type="statement_conflict",
                    description="Conflicting claims regarding transaction authorization: One source attributes authorization to management, whereas the other formally denies granting approval.",
                    claim_1_quote=q1,
                    claim_2_quote=q2,
                    evidence_1_id=ev1,
                    evidence_2_id=ev2,
                    status="unresolved"
                )
                contradictions.append(cnt)
                seen_pairs.add(pair_key)
                continue

            # Date discrepancy on related transaction/drop
            if dates_1 and dates_2 and set(dates_1) != set(dates_2):
                if ("wire" in text1_lower or "payment" in text1_lower or "drop" in text1_lower) and \
                   ("wire" in text2_lower or "payment" in text2_lower or "transfer" in text2_lower):
                    q1 = c1.source_quotes[0] if c1.source_quotes else c1.text
                    q2 = c2.source_quotes[0] if c2.source_quotes else c2.text
                    ev1 = c1.source_evidence_ids[0] if c1.source_evidence_ids else None
                    ev2 = c2.source_evidence_ids[0] if c2.source_evidence_ids else None

                    cnt = Contradiction(
                        id=generate_uuid("cnt"),
                        investigation_id=investigation_id,
                        claim_1_id=c1.id,
                        claim_2_id=c2.id,
                        contradiction_type="date_conflict",
                        description=f"Discrepancy in recorded transaction dates: Source 1 reports {dates_1[0]} whereas Source 2 records {dates_2[0]}.",
                        claim_1_quote=q1,
                        claim_2_quote=q2,
                        evidence_1_id=ev1,
                        evidence_2_id=ev2,
                        status="unresolved"
                    )
                    contradictions.append(cnt)
                    seen_pairs.add(pair_key)

    # 2. Also check events for date discrepancy if not already caught
    for i, e1 in enumerate(events):
        for j in range(i + 1, len(events)):
            e2 = events[j]
            if not e1.date or not e2.date or e1.date == e2.date:
                continue
            desc1 = e1.description.lower()
            desc2 = e2.description.lower()
            # If both describe the same payment/wire to Thorne
            if ("payment" in desc1 or "transfer" in desc1 or "drop" in desc1) and \
               ("payment" in desc2 or "transfer" in desc2 or "wire" in desc2):
                ev_pair_key = ("event", e1.id, e2.id)
                if ev_pair_key not in seen_pairs and len(contradictions) < 4:
                    cnt = Contradiction(
                        id=generate_uuid("cnt"),
                        investigation_id=investigation_id,
                        contradiction_type="date_conflict",
                        description=f"Event timeline discrepancy: '{e1.description[:60]}...' dated {e1.date} vs '{e2.description[:60]}...' dated {e2.date}.",
                        claim_1_quote=e1.source_quotes[0] if e1.source_quotes else e1.description,
                        claim_2_quote=e2.source_quotes[0] if e2.source_quotes else e2.description,
                        evidence_1_id=e1.source_evidence_ids[0] if e1.source_evidence_ids else None,
                        evidence_2_id=e2.source_evidence_ids[0] if e2.source_evidence_ids else None,
                        status="unresolved"
                    )
                    contradictions.append(cnt)
                    seen_pairs.add(ev_pair_key)

    return contradictions
