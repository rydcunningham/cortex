from pypdf import PdfReader
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text content from PDF file."""
    try:
        reader = PdfReader(pdf_path)
        text_content = ""
        for page in reader.pages:
            text_content += page.extract_text()
        return text_content
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise 