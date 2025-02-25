import os
import logging
from typing import Optional, Tuple
import subprocess
from pathlib import Path
from googleapiclient.http import MediaFileUpload
from connectors.google_drive import get_drive_service

logger = logging.getLogger(__name__)

class CompressionDaemon:
    def __init__(self, compression_level: int = 3, compressed_folder_id: str = "1IAnpWPKBxfWklXYUxooRqSNMc7-Jg_ZG"):
        """Initialize the compression daemon with configuration."""
        self.compression_level = compression_level
        self.compressed_folder_id = compressed_folder_id
        self.drive_service = get_drive_service()
        self._verify_ghostscript()
        logger.info(f"Compression daemon initialized with level {compression_level}")
        logger.info(f"Using compressed folder ID: {compressed_folder_id}")

    def _verify_ghostscript(self):
        """Verify Ghostscript is installed."""
        try:
            result = subprocess.run(['gs', '--version'], capture_output=True, text=True, check=True)
            logger.info(f"Ghostscript version {result.stdout.strip()} found")
        except (subprocess.CalledProcessError, FileNotFoundError):
            logger.error("Ghostscript not found. Please install Ghostscript.")
            raise RuntimeError("Ghostscript is required but not installed")

    def is_already_compressed(self, filename: str) -> bool:
        """Check if a compressed version of the file already exists in the compressed folder."""
        try:
            # Query Drive for file with same name in compressed folder
            query = f"name = '{filename}' and '{self.compressed_folder_id}' in parents"
            results = self.drive_service.files().list(
                q=query,
                fields="files(id, name)",
                spaces='drive'
            ).execute()
            
            files = results.get('files', [])
            if files:
                logger.info(f"Found existing compressed version of {filename}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error checking for existing compressed file: {str(e)}")
            return False

    def compress_pdf(self, input_path: str, original_filename: str) -> Optional[Tuple[str, int, str]]:
        """
        Compress PDF file using Ghostscript and upload to Drive.
        Returns tuple of (output_path, compressed_size, drive_id) or None if compression fails.
        """
        try:
            if not os.path.exists(input_path):
                logger.error(f"Input file not found: {input_path}")
                return None

            # Verify PDF is valid before attempting compression
            try:
                with open(input_path, 'rb') as f:
                    header = f.read(1024)
                    if not header.startswith(b'%PDF-'):
                        logger.error(f"Invalid PDF file (wrong header): {original_filename}")
                        return None
            except Exception as e:
                logger.error(f"Error reading PDF file {original_filename}: {str(e)}")
                return None

            original_size = os.path.getsize(input_path)
            logger.info(f"Original file size: {original_size/1024/1024:.2f}MB")

            # Create output path in compressed directory
            os.makedirs("compressed", exist_ok=True)
            
            # Use original filename for the compressed version
            filename_stem = Path(original_filename).stem
            compressed_filename = f"{filename_stem}.pdf"
            output_path = str(Path("compressed") / compressed_filename)

            logger.info(f"Compressing {original_filename} to {compressed_filename}")

            # Ghostscript compression command
            gs_command = [
                'gs',
                '-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.4',
                '-dPDFSETTINGS=/ebook',  # Balance between size and quality
                f'-dCompressLevel={self.compression_level}',
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                f'-sOutputFile={output_path}',
                input_path
            ]

            # Run compression with timeout
            try:
                result = subprocess.run(
                    gs_command, 
                    capture_output=True, 
                    text=True,
                    timeout=300  # 5 minute timeout
                )
            except subprocess.TimeoutExpired:
                logger.error(f"Compression timed out for {original_filename}")
                return None
            
            if result.returncode != 0:
                logger.error(f"Compression failed for {original_filename}: {result.stderr}")
                return None

            # Verify the compressed file is valid
            try:
                with open(output_path, 'rb') as f:
                    header = f.read(1024)
                    if not header.startswith(b'%PDF-'):
                        logger.error(f"Compression produced invalid PDF for {original_filename}")
                        os.remove(output_path)
                        return None
            except Exception as e:
                logger.error(f"Error verifying compressed PDF {original_filename}: {str(e)}")
                if os.path.exists(output_path):
                    os.remove(output_path)
                return None

            compressed_size = os.path.getsize(output_path)
            reduction = (1 - compressed_size/original_size) * 100
            
            logger.info(f"Compression complete:")
            logger.info(f"Original size: {original_size/1024/1024:.2f}MB")
            logger.info(f"Compressed size: {compressed_size/1024/1024:.2f}MB")
            logger.info(f"Size reduction: {reduction:.1f}%")

            # Upload compressed file to Drive
            logger.info(f"Uploading compressed file to Drive folder {self.compressed_folder_id}")
            
            file_metadata = {
                'name': compressed_filename,
                'parents': [self.compressed_folder_id]
            }
            
            media = MediaFileUpload(
                output_path,
                mimetype='application/pdf',
                resumable=True
            )
            
            file = self.drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()
            
            drive_id = file.get('id')
            logger.info(f"Compressed file uploaded to Drive with ID: {drive_id}")

            return output_path, compressed_size, drive_id

        except Exception as e:
            logger.error(f"Error during compression of {original_filename}: {str(e)}")
            # Clean up any partial output
            if 'output_path' in locals() and os.path.exists(output_path):
                try:
                    os.remove(output_path)
                except Exception:
                    pass
            return None

    def verify_compression(self, original_size: int, compressed_size: int) -> bool:
        """Verify compression resulted in smaller file size."""
        if compressed_size >= original_size:
            logger.warning("Compressed file is larger than original")
            return False
        return True

    def cleanup_original(self, file_path: str, compressed_path: str):
        """
        Cleanup original file after successful compression and verification.
        """
        try:
            # Verify compressed file exists and is valid
            if os.path.exists(compressed_path) and os.path.getsize(compressed_path) > 0:
                os.remove(file_path)
                logger.info(f"Removed original file: {file_path}")
            else:
                logger.warning(f"Compressed file verification failed: {compressed_path}")
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}") 