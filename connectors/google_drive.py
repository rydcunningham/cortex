import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
import logging
from typing import List, Dict, Any, Optional

from utils.db_operations import is_document_in_db

logger = logging.getLogger(__name__)

# Define scopes needed for both reading and writing
SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',  # For reading files
    'https://www.googleapis.com/auth/drive.file'       # For creating/writing files
]

def get_drive_service():
    """Get authenticated Google Drive service using environment variables."""
    try:
        # Create credentials dict from environment variables
        credentials_dict = {
            "type": "service_account",
            "project_id": os.getenv("GCP_PROJECT_ID"),
            "private_key_id": os.getenv("GCP_PRIVATE_KEY_ID"),
            "private_key": os.getenv("GCP_PRIVATE_KEY"),
            "client_email": os.getenv("GCP_CLIENT_EMAIL"),
            "client_id": os.getenv("GCP_CLIENT_ID"),
            "auth_uri": os.getenv("GCP_AUTH_URI"),
            "token_uri": os.getenv("GCP_TOKEN_URI"),
            "auth_provider_x509_cert_url": os.getenv("GCP_AUTH_PROVIDER_CERT_URL"),
            "client_x509_cert_url": os.getenv("GCP_CLIENT_CERT_URL")
        }

        # Create credentials object
        credentials = service_account.Credentials.from_service_account_info(
            credentials_dict,
            scopes=SCOPES
        )
        
        return build('drive', 'v3', credentials=credentials)
    except Exception as e:
        logger.error(f"Failed to initialize Drive service: {str(e)}")
        raise

def get_latest_file(folder_id: str) -> Optional[Dict[str, Any]]:
    """
    Get the most recent file from a Google Drive folder.
    
    Args:
        folder_id: ID of the Google Drive folder
        
    Returns:
        Dict containing file information or None if no files found
    """
    try:
        service = get_drive_service()
        
        # List files in the folder, ordered by most recent first
        results = service.files().list(
            q=f"'{folder_id}' in parents and mimeType='application/pdf'",
            fields="files(id, name, webViewLink, createdTime)",
            orderBy="createdTime desc",
            pageSize=1
        ).execute()
        
        files = results.get('files', [])
        if not files:
            return None
            
        return files[0]
    except Exception as e:
        logger.error(f"Error getting latest file: {str(e)}")
        return None

def get_unprocessed_files(folder_id: str) -> List[Dict[str, Any]]:
    """
    Get files from a Google Drive folder that haven't been processed yet.
    
    Args:
        folder_id: ID of the Google Drive folder
        
    Returns:
        List of dictionaries containing file information
    """
    try:
        service = get_drive_service()
        
        # List all files in the folder
        results = service.files().list(
            q=f"'{folder_id}' in parents and mimeType='application/pdf'",
            fields="files(id, name, webViewLink, createdTime)",
            orderBy="createdTime desc",
            pageSize=50  # Get more than we need to filter
        ).execute()
        
        files = results.get('files', [])
        
        # Filter out files that have already been processed
        unprocessed_files = []
        for file in files:
            if not is_document_in_db(file['id']):
                unprocessed_files.append(file)
                    
        return unprocessed_files
    except Exception as e:
        logger.error(f"Error getting unprocessed files: {str(e)}")
        return [] 