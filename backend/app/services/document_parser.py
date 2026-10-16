import os
from typing import Tuple, Dict, Any, List
import pymupdf


class DocumentParsingError(Exception):
    pass


def parse_txt_file(file_path: str) -> Tuple[str, int]:
    """
    Parses a plain text file.
    Returns: (extracted_text, page_count)
    """
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
    text = ""
    for enc in encodings:
        try:
            with open(file_path, "r", encoding=enc) as f:
                text = f.read()
            break
        except UnicodeDecodeError:
            continue

    if not text.strip():
        raise DocumentParsingError("Text file is empty or cannot be decoded with standard encodings.")

    # Remove null characters
    clean_text = text.replace("\x00", "")
    return clean_text, 1


def parse_pdf_file(file_path: str) -> Tuple[str, int, List[Dict[str, Any]]]:
    """
    Parses a PDF file using PyMuPDF.
    Returns: (extracted_text, page_count, pages_metadata)
    """
    try:
        doc = pymupdf.open(file_path)
    except Exception as e:
        raise DocumentParsingError(f"Failed to open PDF file: {str(e)}")

    if doc.page_count == 0:
        doc.close()
        raise DocumentParsingError("PDF file contains 0 pages.")

    pages_meta = []
    full_text_parts = []

    try:
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            text = page.get_text()
            clean_page_text = text.replace("\x00", "").strip()
            pages_meta.append({
                "page_number": page_num + 1,
                "text_length": len(clean_page_text),
                "text_preview": clean_page_text[:150]
            })
            if clean_page_text:
                full_text_parts.append(f"--- PAGE {page_num + 1} ---\n{clean_page_text}")
    except Exception as e:
        doc.close()
        raise DocumentParsingError(f"Error reading PDF pages: {str(e)}")

    doc.close()

    full_text = "\n\n".join(full_text_parts).strip()
    if not full_text:
        raise DocumentParsingError("PDF file contains no extractable text (it may be scanned or empty).")

    return full_text, len(pages_meta), pages_meta


def parse_document(file_path: str, filename: str) -> Dict[str, Any]:
    """
    High-level document parser supporting TXT and PDF.
    """
    if not os.path.exists(file_path):
        raise DocumentParsingError(f"File not found: {file_path}")

    ext = filename.lower().split(".")[-1] if "." in filename else ""

    if ext == "txt":
        text, page_count = parse_txt_file(file_path)
        return {
            "text": text,
            "page_count": page_count,
            "file_type": "txt",
            "pages_meta": [{"page_number": 1, "text_length": len(text)}]
        }
    elif ext == "pdf":
        text, page_count, pages_meta = parse_pdf_file(file_path)
        return {
            "text": text,
            "page_count": page_count,
            "file_type": "pdf",
            "pages_meta": pages_meta
        }
    else:
        raise DocumentParsingError(f"Unsupported file format '.{ext}'. Supported formats are: .txt, .pdf")
