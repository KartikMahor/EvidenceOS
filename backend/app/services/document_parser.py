import os
import hashlib
from typing import Tuple, Dict, Any, List
import pymupdf


class DocumentParsingError(Exception):
    pass


def compute_sha256(file_path: str) -> str:
    """Computes the SHA-256 hash of a file for cryptographic chain of custody."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(65536), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def validate_file_signature(file_path: str, claimed_ext: str) -> None:
    """
    Validates magic byte signatures rather than relying solely on file extensions.
    """
    with open(file_path, "rb") as f:
        header = f.read(16)

    if claimed_ext == "pdf":
        if not header.startswith(b"%PDF"):
            raise DocumentParsingError("File signature mismatch: File claims to be PDF but lacks '%PDF' header.")
    elif claimed_ext in ["png"]:
        if not header.startswith(b"\x89PNG\r\n\x1a\n"):
            raise DocumentParsingError("File signature mismatch: File claims to be PNG but lacks PNG magic bytes.")
    elif claimed_ext in ["jpg", "jpeg"]:
        if not header.startswith(b"\xff\xd8\xff"):
            raise DocumentParsingError("File signature mismatch: File claims to be JPEG but lacks JPEG SOI marker.")


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


def parse_pdf_file(file_path: str) -> Tuple[str, int, List[Dict[str, Any]], str]:
    """
    Parses a PDF file using PyMuPDF.
    First extracts embedded text; if unavailable, attempts OCR.
    Returns: (extracted_text, page_count, pages_metadata, extraction_method)
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
    used_ocr = False

    try:
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            text = page.get_text()
            clean_page_text = text.replace("\x00", "").strip()

            # If page text is empty, attempt OCR if available
            if not clean_page_text:
                try:
                    pix = page.get_pixmap()
                    # Check PyMuPDF OCR page capability
                    ocr_page = page.get_textpage_ocr(dpi=150, full=True)
                    clean_page_text = ocr_page.extractText().replace("\x00", "").strip()
                    if clean_page_text:
                        used_ocr = True
                except Exception:
                    pass

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
        raise DocumentParsingError("PDF file contains no extractable text (it may be blank or unscannable).")

    method = "ocr" if used_ocr else "embedded_text"
    return full_text, len(pages_meta), pages_meta, method


def parse_image_file(file_path: str, ext: str) -> Tuple[str, int, List[Dict[str, Any]], str]:
    """
    Parses an image file (PNG, JPG, JPEG) using PyMuPDF image/OCR parser.
    Returns: (extracted_text, page_count, pages_metadata, extraction_method)
    """
    try:
        doc = pymupdf.open(file_path)
        page = doc.load_page(0)
        try:
            ocr_page = page.get_textpage_ocr(dpi=150, full=True)
            text = ocr_page.extractText().replace("\x00", "").strip()
        except Exception:
            text = ""
        doc.close()

        if not text:
            # Try pytesseract if available
            try:
                import pytesseract
                from PIL import Image
                img = Image.open(file_path)
                text = pytesseract.image_to_string(img).strip()
            except Exception:
                text = f"[Image Evidence: {os.path.basename(file_path)} - Visual evidence file stored. OCR text not detected or OCR engine not installed.]"

        pages_meta = [{"page_number": 1, "text_length": len(text), "text_preview": text[:150]}]
        return text, 1, pages_meta, "ocr"

    except Exception as e:
        raise DocumentParsingError(f"Failed to parse image evidence file: {str(e)}")


def parse_document(file_path: str, filename: str) -> Dict[str, Any]:
    """
    High-level document parser supporting TXT, PDF, PNG, and JPEG.
    Preserves file hash, extraction method, and page metadata.
    """
    if not os.path.exists(file_path):
        raise DocumentParsingError(f"File not found: {file_path}")

    ext = filename.lower().split(".")[-1] if "." in filename else ""
    validate_file_signature(file_path, ext)
    file_hash = compute_sha256(file_path)

    if ext == "txt":
        text, page_count = parse_txt_file(file_path)
        return {
            "text": text,
            "page_count": page_count,
            "file_type": "txt",
            "file_hash": file_hash,
            "extraction_method": "plain_text",
            "pages_meta": [{"page_number": 1, "text_length": len(text)}]
        }
    elif ext == "pdf":
        text, page_count, pages_meta, method = parse_pdf_file(file_path)
        return {
            "text": text,
            "page_count": page_count,
            "file_type": "pdf",
            "file_hash": file_hash,
            "extraction_method": method,
            "pages_meta": pages_meta
        }
    elif ext in ["png", "jpg", "jpeg"]:
        text, page_count, pages_meta, method = parse_image_file(file_path, ext)
        return {
            "text": text,
            "page_count": page_count,
            "file_type": ext,
            "file_hash": file_hash,
            "extraction_method": method,
            "pages_meta": pages_meta
        }
    else:
        raise DocumentParsingError(f"Unsupported file format '.{ext}'. Supported formats are: .txt, .pdf, .png, .jpg, .jpeg")
