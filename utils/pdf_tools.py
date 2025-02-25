from datetime import datetime
from pypdf import PdfReader
import logging

logger = logging.getLogger(__name__)

def extract_pdf_metadata(pdf_path: str) -> dict:
    """Extract metadata from PDF file."""
    try:
        reader = PdfReader(pdf_path)
        info = reader.metadata
        
        def parse_pdf_date(date_str: str) -> str:
            if date_str and date_str.startswith('D:'):
                date_str = date_str[2:14]
                try:
                    return datetime.strptime(date_str, '%Y%m%d%H%M').isoformat()
                except ValueError:
                    return None
            return None
        
        return {
            "created_date": parse_pdf_date(info.get('/CreationDate')),
            "modified_date": parse_pdf_date(info.get('/ModDate')),
            "title": info.get('/Title', '')
        }
    except Exception as e:
        logger.error(f"Error extracting PDF metadata: {str(e)}")
        return {
            "created_date": None,
            "modified_date": None,
            "title": None
        } 