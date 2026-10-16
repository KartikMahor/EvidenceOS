from datetime import datetime, timezone
from typing import List, Dict, Any
from app.models import Investigation, EvidenceFile, Entity, Event, Claim, Relationship, Contradiction


def generate_markdown_report(investigation: Investigation) -> str:
    """
    Generates a comprehensive, source-traceable intelligence report in GitHub-flavored Markdown.
    """
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    md_lines = [
        f"# EVIDENCE ANALYSIS REPORT: {investigation.title.upper()}",
        f"**Classification:** SENSITIVE / INVESTIGATIVE INTELLIGENCE",
        f"**Investigation ID:** `{investigation.id}`",
        f"**Generated On:** {now_str}",
        f"**Status:** {investigation.status.upper()}",
        "",
        "> [!IMPORTANT]",
        "> **LEGAL & ETHICAL RESPONSIBILITY NOTICE:**",
        "> This report incorporates artificial intelligence extraction via Gemma 4. All AI-generated entities, events, claims, and inferences require independent human review and physical evidence verification prior to legal or operational action.",
        "",
        "---",
        "",
        "## 1. Executive Summary",
        investigation.description or "No formal narrative description recorded.",
        "",
        f"- **Total Evidence Files Analyzed:** {len(investigation.evidence_files)}",
        f"- **Entities Extracted:** {len(investigation.entities)}",
        f"- **Events Reconstructed:** {len(investigation.events)}",
        f"- **Claims Documented:** {len(investigation.claims)}",
        f"- **Relationships Mapped:** {len(investigation.relationships)}",
        f"- **Contradictions Flagged:** {len(investigation.contradictions)}",
        "",
        "---",
        "",
        "## 2. Chain of Custody & Evidence Sources",
        "",
        "| Evidence ID | Filename | Format | Size (Bytes) | Pages | Uploaded Date |",
        "|---|---|---|---|---|---|"
    ]

    ev_lookup = {}
    for ev in investigation.evidence_files:
        ev_lookup[ev.id] = ev.filename
        up_date = ev.uploaded_at.strftime("%Y-%m-%d %H:%M") if ev.uploaded_at else "N/A"
        md_lines.append(f"| `{ev.id}` | **{ev.filename}** | {ev.file_type.upper()} | {ev.file_size:,} | {ev.page_count} | {up_date} |")

    md_lines.extend([
        "",
        "---",
        "",
        "## 3. Extracted Entity Directory",
        "",
        "| Type | Entity Value | Classification | Source Evidence | Supporting Verbatim Excerpt |",
        "|---|---|---|---|---|"
    ])

    for ent in investigation.entities:
        sources_str = ", ".join([f"`{ev_lookup.get(sid, sid)}`" for sid in (ent.source_evidence_ids or [])])
        first_quote = (ent.source_quotes[0] if ent.source_quotes else "No quote logged").replace("|", "\\|").replace("\n", " ")
        if len(first_quote) > 120:
            first_quote = first_quote[:117] + "..."
        md_lines.append(f"| `{ent.type}` | **{ent.value}** | {ent.classification} | {sources_str} | \"{first_quote}\" |")

    md_lines.extend([
        "",
        "---",
        "",
        "## 4. Chronological Event Reconstruction",
        ""
    ])

    sorted_events = sorted(investigation.events, key=lambda x: (x.date is None, x.date or ""))
    for evt in sorted_events:
        date_badge = f"**[{evt.date or 'UNDATED'}]**"
        sources_str = ", ".join([f"`{ev_lookup.get(sid, sid)}`" for sid in (evt.source_evidence_ids or [])])
        quote_str = (evt.source_quotes[0] if evt.source_quotes else "").replace("\n", " ")
        md_lines.append(f"### {date_badge} {evt.description}")
        md_lines.append(f"- **Evidence Sources:** {sources_str}")
        if quote_str:
            md_lines.append(f"- **Verbatim Quote:** *\"{quote_str}\"*")
        md_lines.append("")

    md_lines.extend([
        "---",
        "",
        "## 5. Potential Contradictions & Discrepancies",
        ""
    ])

    if not investigation.contradictions:
        md_lines.append("No active contradictions flagged across source materials.")
    else:
        for cnt in investigation.contradictions:
            status_emoji = "⚠️" if cnt.status == "unresolved" else "✅"
            md_lines.append(f"### {status_emoji} {cnt.contradiction_type.replace('_', ' ').upper()} ({cnt.status.upper()})")
            md_lines.append(f"{cnt.description}\n")
            md_lines.append(f"- **Claim / Excerpt 1:** *\"{cnt.claim_1_quote}\"* (Source: `{ev_lookup.get(cnt.evidence_1_id, cnt.evidence_1_id)}`)")
            md_lines.append(f"- **Claim / Excerpt 2:** *\"{cnt.claim_2_quote}\"* (Source: `{ev_lookup.get(cnt.evidence_2_id, cnt.evidence_2_id)}`)")
            if cnt.resolution_notes:
                md_lines.append(f"- **Reviewer Notes:** {cnt.resolution_notes}")
            md_lines.append("")

    md_lines.extend([
        "---",
        "",
        "## 6. Entity Relationship Matrix",
        ""
    ])

    ent_map = {e.id: e.value for e in investigation.entities}
    for rel in investigation.relationships:
        src = ent_map.get(rel.source_entity_id, rel.source_entity_id)
        tgt = ent_map.get(rel.target_entity_id, rel.target_entity_id)
        quote = (rel.source_quotes[0] if rel.source_quotes else "").replace("\n", " ")
        md_lines.append(f"- **{src}** —`[{rel.type}]`→ **{tgt}**: {rel.description}")
        if quote:
            md_lines.append(f"  - *Supporting quote:* \"{quote}\"")

    md_lines.extend([
        "",
        "---",
        "",
        "**Report Generated by EvidenceOS** • *Confidential Investigation Intelligence*",
        ""
    ])

    return "\n".join(md_lines)


def generate_html_report(investigation: Investigation) -> str:
    """
    Renders an HTML formatted intelligence report suitable for browser preview or PDF printing.
    """
    md = generate_markdown_report(investigation)
    # Simple clean styling wrapper
    import html
    title = html.escape(investigation.title)
    
    body_content = ""
    for line in md.split("\n"):
        line_clean = line.strip()
        if line_clean.startswith("# "):
            body_content += f"<h1 style='color:#38bdf8;border-bottom:2px solid #0284c7;padding-bottom:8px;'>{html.escape(line_clean[2:])}</h1>"
        elif line_clean.startswith("## "):
            body_content += f"<h2 style='color:#7dd3fc;margin-top:24px;border-bottom:1px solid #334155;padding-bottom:6px;'>{html.escape(line_clean[3:])}</h2>"
        elif line_clean.startswith("### "):
            body_content += f"<h3 style='color:#e2e8f0;margin-top:16px;'>{html.escape(line_clean[4:])}</h3>"
        elif line_clean.startswith("> "):
            body_content += f"<div style='background:#1e293b;border-left:4px solid #f59e0b;padding:12px 16px;margin:12px 0;border-radius:4px;color:#fde68a;'>{html.escape(line_clean[2:])}</div>"
        elif line_clean.startswith("- "):
            body_content += f"<li style='margin-left:20px;color:#cbd5e1;'>{html.escape(line_clean[2:])}</li>"
        elif line_clean == "---":
            body_content += "<hr style='border:none;border-top:1px solid #334155;margin:20px 0;'/>"
        elif line_clean:
            body_content += f"<p style='color:#94a3b8;line-height:1.6;'>{html.escape(line_clean)}</p>"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>EvidenceOS Report - {title}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: #1e293b;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            border: 1px solid #334155;
        }}
        code {{
            background: #0f172a;
            padding: 2px 6px;
            border-radius: 4px;
            color: #38bdf8;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <div class="container">
        {body_content}
    </div>
</body>
</html>"""
