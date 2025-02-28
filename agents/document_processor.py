import os
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from pypdf import PdfReader
import google.generativeai as genai
from googleapiclient.http import MediaIoBaseDownload
import json

from connectors.google_drive import get_drive_service
from utils.pdf_tools import extract_pdf_metadata
from utils.text_extraction import extract_text_from_pdf
from utils.db_operations import (
    save_document_to_db, 
    is_document_in_db, 
    get_document_from_db,
    get_latest_document_id,
    get_all_document_ids
)

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
            if is_document_in_db(file['id']):
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
        
        # Extract title using AI prompt
        extracted_title = await self._extract_title(text_content)
        title = extracted_title or file['name']  # Fall back to file name if extraction fails
        
        # Classify document type
        document_type = await self._classify_document(text_content)
        
        # Generate tags
        tags = await self._generate_tags(analysis.text)
        
        result = {
            "id": file['id'],
            "title": title,
            "authors": authors,
            "name": file['name'],
            "drive_link": file.get('webViewLink', ''),
            "created_date": metadata['created_date'],
            "added_date": file.get('createdTime'),
            "processed_date": datetime.now().isoformat(),
            "affiliations": affiliations,
            "document_type": document_type,
            "summary": summary.text,
            "analysis": analysis.text,
            "tags": tags
        }

        # Save to database
        save_document_to_db(result)
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

    async def _generate_tags(self, analysis: str):
        """Generate tags from document analysis."""
        prompt = """Based on the document analysis, generate 10-20 specific, hyphenated keyword tags that accurately represent the key concepts, technologies, and applications discussed.

Format the tags as a comma-separated list of lowercase, hyphenated terms (e.g., machine-learning, neural-networks).

Analysis:
{analysis}"""
        
        try:
            response = self.model.generate_content(prompt.format(analysis=analysis))
            tag_text = response.text.strip('"\'')
            return [tag.strip() for tag in tag_text.split(',') if tag.strip()]
        except Exception as e:
            logger.error(f"Error generating tags: {str(e)}")
            return []

    def _clean_title(self, title: str) -> str:
        """Clean and normalize a document title."""
        if not title:
            return ""
        
        # Remove quotes
        title = title.strip('"\'')
        
        # Replace newlines and carriage returns with spaces
        title = title.replace('\n', ' ').replace('\r', ' ')
        
        # Normalize whitespace (replace multiple spaces with single space)
        import re
        title = re.sub(r'\s+', ' ', title)
        
        # Final trim
        return title.strip()

    async def _extract_title(self, text_content: str) -> str:
        """Extract document title using Gemini."""
        prompt = """Extract the formal title of this document. Return ONLY the title as a single string, with no additional text, quotes, or formatting. If you cannot determine a clear title, extract what appears to be the main heading or subject.

Document text:
{text_content}"""
        
        try:
            # Only use the first 1000 characters where titles typically appear
            response = self.model.generate_content(prompt.format(text_content=text_content[:1000]))
            title = self._clean_title(response.text)
            return title
        except Exception as e:
            logger.error(f"Error extracting title: {str(e)}")
            return ""

    async def retitle_document(self, doc_id: str) -> Dict[str, Any]:
        """Retitle a single document that has already been processed."""
        try:
            # Get the document from database
            doc_data = get_document_from_db(doc_id)
            if not doc_data:
                return {"status": "error", "message": f"Document {doc_id} not found in database"}
            
            # Get the file from Google Drive
            file = self.drive_service.files().get(fileId=doc_id, fields="id,name,webViewLink").execute()
            
            # Download the file
            temp_path = f"temp/{doc_id}.pdf"
            os.makedirs("temp", exist_ok=True)
            
            request = self.drive_service.files().get_media(fileId=doc_id)
            with open(temp_path, 'wb') as f:
                downloader = MediaIoBaseDownload(f, request)
                done = False
                while done is False:
                    status, done = downloader.next_chunk()
            
            logger.info(f"Downloaded file to {temp_path} for retitling")
            
            # Extract text content
            text_content = extract_text_from_pdf(temp_path)
            
            # Extract new title
            new_title = await self._extract_title(text_content)
            old_title = doc_data.get('title', '')
            
            # Update the document data
            if new_title:
                doc_data['title'] = new_title
                logger.info(f"Updated title from '{old_title}' to '{new_title}'")
                
                # Save updated document to database
                save_document_to_db(doc_data)
            else:
                logger.warning(f"Could not extract new title for {doc_id}, keeping existing title")
            
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                logger.info(f"Cleaned up temp file: {temp_path}")
                
            return {
                "id": doc_id,
                "old_title": old_title,
                "new_title": new_title if new_title else old_title,
                "updated": bool(new_title)
            }
            
        except Exception as e:
            logger.error(f"Error retitling document {doc_id}: {str(e)}")
            return {
                "id": doc_id,
                "error": str(e)
            }

    async def retitle_latest_document(self) -> Dict[str, Any]:
        """Retitle the most recent document in the database."""
        try:
            # Get the latest document ID
            latest_doc_id = get_latest_document_id()
            
            if not latest_doc_id:
                return {"status": "error", "message": "No documents found in database"}
            
            # Retitle the document
            result = await self.retitle_document(latest_doc_id)
            
            return {
                "status": "success",
                "document": result
            }
            
        except Exception as e:
            logger.error(f"Error retitling latest document: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def retitle_all_documents(self) -> Dict[str, Any]:
        """Retitle all documents in the database."""
        try:
            # Get all document IDs
            doc_ids = get_all_document_ids()
            
            if not doc_ids:
                return {"status": "error", "message": "No documents found in database"}
            
            results = []
            
            # Process each document
            for doc_id in doc_ids:
                result = await self.retitle_document(doc_id)
                results.append(result)
            
            return {
                "status": "success",
                "updated_count": sum(1 for r in results if r.get('updated', False)),
                "total_count": len(results),
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Error retitling all documents: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def _classify_document(self, text_content: str) -> str:
        """Classify document into a specific document type category."""
        try:
            if not text_content or not text_content.strip():
                logger.warning("Empty text content provided for classification")
                return "other"
                
            # Use a representative sample of the document for classification
            # We'll use more text than for title extraction but less than full document
            sample_text = text_content[:5000]  # First 5000 chars should be enough for classification
            
            prompt = """Classify this document into exactly ONE of the following categories based on its content, structure, and style:

- academic-paper: Research papers, scholarly articles, conference proceedings
- equity-research-report: Financial analysis, stock reports, investment research
- article: News articles, magazine pieces, journalistic content
- blog-post: Blog entries, opinion pieces, informal web content
- book-chapter: Book excerpts, textbook sections, monograph chapters
- presentation: Slide decks, talks, conference presentations
- technical-report: White papers, industry reports, technical documentation
- legal-document: Contracts, patents, legal filings, regulations
- social-media: Tweets, social media posts, short-form content
- other: Documents that don't fit other categories

Return ONLY the category name as a single word or hyphenated phrase, with no additional text.

Document text:
{text_content}"""
            
            response = self.model.generate_content(prompt.format(text_content=sample_text))
            document_type = response.text.strip().lower()
            
            # Validate the response is one of our expected categories
            valid_categories = [
                'academic-paper', 'equity-research-report', 'article', 'blog-post', 
                'book-chapter', 'presentation', 'technical-report', 'legal-document',
                'social-media', 'other'
            ]
            
            if document_type not in valid_categories:
                logger.warning(f"Unexpected document type: {document_type}, defaulting to 'other'")
                document_type = 'other'
            
            logger.info(f"Document classified as: {document_type}")
            return document_type
            
        except Exception as e:
            logger.error(f"Error classifying document: {str(e)}")
            return "other"  # Default to 'other' if classification fails

    async def reclassify_all_documents(self) -> Dict[str, Any]:
        """Reclassify all documents in the database."""
        try:
            # Get all document IDs
            doc_ids = get_all_document_ids()
            
            if not doc_ids:
                return {"status": "error", "message": "No documents found in database"}
            
            results = []
            updated_count = 0
            
            # Process each document
            for doc_id in doc_ids:
                try:
                    # Get document from database
                    doc_data = get_document_from_db(doc_id)
                    if not doc_data:
                        results.append({
                            "id": doc_id,
                            "error": "Document not found in database"
                        })
                        continue
                    
                    # Get the file from Google Drive
                    file = self.drive_service.files().get(fileId=doc_id, fields="id,name").execute()
                    
                    # Download and process the file
                    temp_path = f"temp/{doc_id}.pdf"
                    os.makedirs("temp", exist_ok=True)
                    
                    request = self.drive_service.files().get_media(fileId=doc_id)
                    with open(temp_path, 'wb') as f:
                        downloader = MediaIoBaseDownload(f, request)
                        done = False
                        while done is False:
                            status, done = downloader.next_chunk()
                    
                    # Extract text and classify
                    text_content = extract_text_from_pdf(temp_path)
                    old_type = doc_data.get('document_type', 'unknown')
                    new_type = await self._classify_document(text_content)
                    
                    # Update document data
                    doc_data['document_type'] = new_type
                    
                    # Save updated document to database
                    if old_type != new_type:
                        save_document_to_db(doc_data)
                        updated_count += 1
                    
                    result = {
                        "id": doc_id,
                        "name": doc_data.get('name', file['name']),
                        "old_type": old_type,
                        "new_type": new_type,
                        "updated": old_type != new_type
                    }
                    
                    results.append(result)
                    
                    # Clean up temp file
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                        
                except Exception as e:
                    logger.error(f"Error reclassifying document {doc_id}: {str(e)}")
                    results.append({
                        "id": doc_id,
                        "error": str(e)
                    })
            
            return {
                "status": "success",
                "updated_count": updated_count,
                "total_count": len(results),
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Error reclassifying documents: {str(e)}")
            return {"status": "error", "message": str(e)} 