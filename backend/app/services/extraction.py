"""
EvidenceOS Extraction Service
Orchestrates document extraction and AI intelligence extraction pipelines.
"""

from typing import List, Dict, Any, Tuple
from app.services.document_parser import parse_document, DocumentParsingError
from app.services.gemma import run_gemma_extraction
from app.schemas import AIExtractionResult


def extract_evidence_document(file_path: str, filename: str) -> Dict[str, Any]:
    """
    Parses an evidence file and extracts text and metadata.
    """
    return parse_document(file_path, filename)


def extract_intelligence_from_evidence(
    evidence_items: List[Dict[str, Any]]
) -> Tuple[AIExtractionResult, str, bool]:
    """
    Extracts entities, events, claims, and relationships from processed evidence items
    using Gemma 4 via Google GenAI SDK.
    
    Returns:
        (AIExtractionResult, model_name, is_live_api)
    """
    return run_gemma_extraction(evidence_items)
