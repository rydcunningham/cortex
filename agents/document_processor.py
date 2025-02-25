import os
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from pypdf import PdfReader
import google.generativeai as genai
from googleapiclient.http import MediaIoBaseDownload

from connectors.google_drive import get_drive_service
from utils.pdf_tools import extract_pdf_metadata
from utils.text_extraction import extract_text_from_pdf
from utils.metadata_helpers import save_to_json, is_file_processed

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self, api_key: str):
        """Initialize the document processor with necessary configurations."""
        self.configure_ai(api_key)
        self.drive_service = get_drive_service()
        
    def configure_ai(self, api_key: str):
        """Configure the Gemini AI model."""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    async def process_file(self, file: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single file from Google Drive."""
        temp_path = None
        try:
            # Download file regardless of processing status
            temp_path = f"temp/{file['id']}.pdf"
            os.makedirs("temp", exist_ok=True)
            
            request = self.drive_service.files().get_media(fileId=file['id'])
            with open(temp_path, 'wb') as f:
                downloader = MediaIoBaseDownload(f, request)
                done = False
                while done is False:
                    status, done = downloader.next_chunk()
            
            logger.info(f"Downloaded file to {temp_path}")

            # Check if already processed
            if is_file_processed(file['id']):
                logger.info(f"File {file['name']} already processed, skipping analysis")
                return {
                    "status": "skipped",
                    "file": file['name'],
                    "temp": temp_path
                }

            # If not processed, continue with analysis
            analysis_result = await self._analyze_document(temp_path, file)
            
            return {
                "status": "success",
                "file": analysis_result,
                "temp": temp_path
            }
            
        except Exception as e:
            logger.error(f"Error processing {file['name']}: {str(e)}")
            # Clean up temp file on error
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                    logger.info(f"Cleaned up temp file after error: {temp_path}")
                except Exception as cleanup_error:
                    logger.error(f"Error cleaning up temp file: {str(cleanup_error)}")
            return {"status": "error", "file": file['name'], "error": str(e)}

    async def _analyze_document(self, pdf_path: str, file: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive document analysis."""
        # Extract text content
        text_content = extract_text_from_pdf(pdf_path)
        
        # Generate analysis, summary, and extract metadata
        analysis = await self._generate_analysis(text_content)
        summary = await self._generate_summary(analysis.text)
        authors = await self._extract_authors(text_content)
        affiliations = await self._extract_affiliations(text_content)
        metadata = extract_pdf_metadata(pdf_path)

        result = {
            "id": file['id'],
            "name": file['name'],
            "drive_link": file.get('webViewLink', ''),
            "created_date": metadata['created_date'],
            "added_date": file.get('createdTime'),
            "processed_date": datetime.now().isoformat(),
            "authors": authors,
            "affiliations": affiliations,
            "title": metadata['title'] or file['name'],
            "summary": summary.text,
            "analysis": analysis.text
        }

        # Save to database
        save_to_json(result)
        return result

    async def _generate_analysis(self, text_content: str):
        """Generate document analysis using Gemini."""
        prompt = """Provide a comprehensive yet concise summary of this document with the following structure in Markdown format:

1. Key Findings: 4-5 bullet points on the most significant discoveries or contributions
2. Technical Innovation: Identify novel methodologies, algorithms, or frameworks introduced
3. Market Applications: Potential commercial applications and relevant industry sectors
4. Competitive Landscape: How this research positions against existing solutions mentioned in the document
5. Technical Limitations: Critical constraints or weaknesses in the approach
6. Investment Relevance: Alignment with emerging technology trends and investment thesis
7. Diligence Questions: 3 technical questions to probe with founders claiming to implement this research

Document text:
{text_content}"""
        
        return self.model.generate_content(prompt.format(text_content=text_content))

    async def _generate_summary(self, analysis: str):
        """Generate executive summary from analysis."""
        prompt = """Distill the core value of this document analysis in 3-4 sentences addressing:

1. The fundamental innovation or insight presented
2. Its practical market application and potential impact
3. If applicable, the key differentiator from existing approaches
4. The most relevant consideration for investment decision-making

Analysis:
{analysis}"""
        
        return self.model.generate_content(prompt.format(analysis=analysis))

    async def _extract_authors(self, text_content: str):
        """Extract author names from document."""
        prompt = """Extract all author names from this document text. Return only a comma-separated list of full names.

Document text:
{text_content}"""
        
        response = self.model.generate_content(prompt.format(text_content=text_content[:2000]))
        author_text = response.text.strip('"\'')
        return [name.strip() for name in author_text.split(',') if name.strip()]

    async def _extract_affiliations(self, text_content: str):
        """Extract institutional affiliations from document."""
        prompt = """Extract all institutional affiliations from this document text. Return only a comma-separated list of affiliations.

Document text:
{text_content}"""
        
        response = self.model.generate_content(prompt.format(text_content=text_content[:2000]))
        affiliation_text = response.text.strip('"\'')
        return list(dict.fromkeys([aff.strip() for aff in affiliation_text.split(',') if aff.strip()])) 