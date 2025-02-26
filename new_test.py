import os
import logging
import json
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from googleapiclient.http import MediaIoBaseDownload

from agents.document_processor import DocumentProcessor
from daemons.compression_daemon import CompressionDaemon
from connectors.google_drive import get_drive_service
from agents.content_tagger import ContentTagger
from daemons.entity_processor import EntityProcessor

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Load required environment variables
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
WATCH_FOLDER_ID = os.getenv('WATCH_FOLDER_ID')
COMPRESSED_FOLDER_ID = os.getenv('COMPRESSED_FOLDER_ID')

# Initialize FastAPI
app = FastAPI(
    title="Cortex Research Processor",
    description="AI-powered research document processing and analysis system",
    version="1.0.0"
)

# Validate required environment variables
required_vars = [
    ('WATCH_FOLDER_ID', 'Watch folder ID is required for monitoring PDFs'),
    ('GEMINI_API_KEY', 'GEMINI_API_KEY is required for document analysis'),
    ('GCP_PROJECT_ID', 'GCP project ID is required for Google Drive access'),
    ('GCP_PRIVATE_KEY', 'GCP private key is required for Google Drive access'),
    ('GCP_CLIENT_EMAIL', 'GCP client email is required for Google Drive access'),
    ('COMPRESSED_FOLDER_ID', 'Compressed folder ID is required for storing compressed PDFs')
]

for var_name, error_msg in required_vars:
    if not os.getenv(var_name):
        raise ValueError(error_msg)

# Initialize core components
document_processor = DocumentProcessor(api_key=GEMINI_API_KEY)
compression_daemon = CompressionDaemon(
    compression_level=int(os.getenv('COMPRESSION_LEVEL', '3')),
    compressed_folder_id=COMPRESSED_FOLDER_ID
)
content_tagger = ContentTagger(api_key=GEMINI_API_KEY)

@app.get("/api/process-folder")
async def process_folder():
    """Process all PDF files in the watched folder."""
    try:
        service = get_drive_service()
        logger.info("Connected to Drive service")
        
        # List all files in the folder
        results = service.files().list(
            q=f"'{WATCH_FOLDER_ID}' in parents and mimeType='application/pdf'",
            fields="files(id, name, webViewLink, createdTime)",
            orderBy="createdTime desc"
        ).execute()
        
        files = results.get('files', [])
        if not files:
            return {"status": "success", "message": "No PDF files found"}
        
        logger.info(f"Found {len(files)} PDF files to process")
        
        # Process all files
        processed_results = []
        for file in files:
            # First check if file needs compression
            if compression_daemon.is_already_compressed(file['name']):
                logger.info(f"Compressed version already exists for {file['name']}")
                needs_compression = False
            else:
                logger.info(f"No compressed version found for {file['name']}, will compress")
                needs_compression = True
            
            # Process the document (this will always download the file)
            result = await document_processor.process_file(file)
            logger.info(f"Document processing complete for {file['name']}")
            
            try:
                # Handle compression if needed
                if needs_compression and "temp" in result:
                    temp_path = result["temp"]
                    if os.path.exists(temp_path):
                        original_size = os.path.getsize(temp_path)
                        compressed = compression_daemon.compress_pdf(temp_path, file['name'])
                        
                        if compressed:
                            compressed_path, compressed_size, drive_id = compressed
                            logger.info(f"Compression successful - Drive ID: {drive_id}")
                            
                            # Add compression info to result
                            if isinstance(result["file"], dict):
                                result["file"].update({
                                    "original_size": original_size,
                                    "compressed_size": compressed_size,
                                    "compressed_file_id": drive_id,
                                    "compression_ratio": f"{(1 - compressed_size/original_size) * 100:.1f}%"
                                })
                            
                            # Clean up temp files
                            try:
                                os.remove(temp_path)
                                os.remove(compressed_path)
                                logger.info(f"Cleaned up temporary files for {file['name']}")
                            except Exception as e:
                                logger.error(f"Error cleaning up temp files: {str(e)}")
                        else:
                            logger.error(f"Compression failed for {file['name']}")
                    else:
                        logger.error(f"Temp file not found: {temp_path}")
                else:
                    # Clean up temp file if we didn't need to compress
                    if "temp" in result and os.path.exists(result["temp"]):
                        try:
                            os.remove(result["temp"])
                            logger.info(f"Cleaned up temp file for already compressed document: {file['name']}")
                        except Exception as e:
                            logger.error(f"Error cleaning up temp file: {str(e)}")
                
            except Exception as e:
                logger.error(f"Error during compression process: {str(e)}")
                # Ensure temp file cleanup on error
                if "temp" in result and os.path.exists(result["temp"]):
                    try:
                        os.remove(result["temp"])
                        logger.info(f"Cleaned up temp file after error: {result['temp']}")
                    except Exception as cleanup_error:
                        logger.error(f"Error cleaning up temp file: {str(cleanup_error)}")
            
            processed_results.append(result)
        
        return {
            "status": "success",
            "processed_count": len(processed_results),
            "results": processed_results
        }
        
    except Exception as e:
        logger.error(f"Error processing folder: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/process-latest")
async def process_latest():
    """Process only the most recent PDF file in the watched folder."""
    try:
        service = get_drive_service()
        logger.info("Connected to Drive service")
        
        # List files in the folder, ordered by most recent first
        results = service.files().list(
            q=f"'{WATCH_FOLDER_ID}' in parents and mimeType='application/pdf'",
            fields="files(id, name, webViewLink, createdTime)",
            orderBy="createdTime desc",
            pageSize=1
        ).execute()
        
        files = results.get('files', [])
        if not files:
            return {"status": "success", "message": "No PDF files found"}
            
        file = files[0]  # Get the most recent file
        logger.info(f"Processing latest file: {file['name']}")
        
        # First check if file needs compression
        if compression_daemon.is_already_compressed(file['name']):
            logger.info(f"Compressed version already exists for {file['name']}")
            needs_compression = False
        else:
            logger.info(f"No compressed version found for {file['name']}, will compress")
            needs_compression = True
        
        # Process the document (this will always download the file)
        result = await document_processor.process_file(file)
        logger.info(f"Document processing complete for {file['name']}")
        
        try:
            # Handle compression if needed
            if needs_compression and "temp" in result:
                temp_path = result["temp"]
                if os.path.exists(temp_path):
                    original_size = os.path.getsize(temp_path)
                    compressed = compression_daemon.compress_pdf(temp_path, file['name'])
                    
                    if compressed:
                        compressed_path, compressed_size, drive_id = compressed
                        logger.info(f"Compression successful - Drive ID: {drive_id}")
                        
                        # Add compression info to result
                        if isinstance(result["file"], dict):
                            result["file"].update({
                                "original_size": original_size,
                                "compressed_size": compressed_size,
                                "compressed_file_id": drive_id,
                                "compression_ratio": f"{(1 - compressed_size/original_size) * 100:.1f}%"
                            })
                        
                        # Clean up temp files
                        try:
                            os.remove(temp_path)
                            os.remove(compressed_path)
                            logger.info(f"Cleaned up temporary files for {file['name']}")
                        except Exception as e:
                            logger.error(f"Error cleaning up temp files: {str(e)}")
                    else:
                        logger.error(f"Temp file not found: {temp_path}")
                else:
                    logger.error(f"No temp file path in result")
            else:
                # Clean up temp file if we didn't need to compress
                if "temp" in result and os.path.exists(result["temp"]):
                    try:
                        os.remove(result["temp"])
                        logger.info(f"Cleaned up temp file for already compressed document: {file['name']}")
                    except Exception as e:
                        logger.error(f"Error cleaning up temp file: {str(e)}")
                
        except Exception as e:
            logger.error(f"Error during compression process: {str(e)}")
            # Ensure temp file cleanup on error
            if "temp" in result and os.path.exists(result["temp"]):
                try:
                    os.remove(result["temp"])
                    logger.info(f"Cleaned up temp file after error: {result['temp']}")
                except Exception as cleanup_error:
                    logger.error(f"Error cleaning up temp file: {str(cleanup_error)}")
        
        return {
            "status": "success",
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Error processing latest file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Check the health of the service and its dependencies."""
    try:
        # Check Drive service
        service = get_drive_service()
        service.files().list(pageSize=1).execute()
        
        # Check Ghostscript
        compression_daemon._verify_ghostscript()
        
        return {
            "status": "healthy",
            "components": {
                "google_drive": "connected",
                "ghostscript": "available",
                "document_processor": "ready"
            },
            "watch_folder": WATCH_FOLDER_ID
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.get("/api/generate-tags")
async def generate_tags():
    """Generate tags for all processed documents that don't already have tags."""
    try:
        results = await content_tagger.process_all_documents(skip_tagged=True)
        return {
            "status": "success",
            "tagged_count": len(results),
            "skipped_count": content_tagger.skipped_count,
            "results": results
        }
    except Exception as e:
        logger.error(f"Error generating tags: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/retitle-latest")
async def retitle_latest():
    """Retitle the most recent document in the processed files database."""
    try:
        result = await document_processor.retitle_latest_document()
        return result
    except Exception as e:
        logger.error(f"Error retitling latest document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/retitle-folder")
async def retitle_folder():
    """Retitle all documents in the processed files database."""
    try:
        result = await document_processor.retitle_all_documents()
        return result
    except Exception as e:
        logger.error(f"Error retitling all documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reclassify-documents")
async def reclassify_documents():
    """Reclassify all documents in the processed files database."""
    try:
        result = await document_processor.reclassify_all_documents()
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        return result
    except Exception as e:
        logger.error(f"Error reclassifying documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/extract-entities")
async def extract_entities():
    """Extract entities from all processed documents."""
    try:
        processor = EntityProcessor()
        processor.process_documents()
        
        # Count the number of entities extracted
        entity_count = len(processor.db.entities)
        
        return {
            "status": "success",
            "message": "Entities extracted and saved successfully",
            "entities_file": str(processor.entities_file),
            "entity_count": entity_count,
            "types": {
                "person": len([e for e in processor.db.entities.values() if e.type == "person"]),
                "organization": len([e for e in processor.db.entities.values() if e.type == "organization"])
            }
        }
    except Exception as e:
        logger.error(f"Error extracting entities: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv('API_PORT', '8000'))
    host = os.getenv('API_HOST', '0.0.0.0')
    
    logger.info(f"Starting server on {host}:{port}")
    logger.info(f"Using watch folder ID: {WATCH_FOLDER_ID}")
    
    uvicorn.run(app, host=host, port=port) 