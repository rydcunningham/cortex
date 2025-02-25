import os
import json
import logging

logger = logging.getLogger(__name__)

def save_to_json(result: dict):
    """Save processing result to JSON database."""
    filename = 'data/processed_files.json'
    try:
        os.makedirs('data', exist_ok=True)
        
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                data = json.load(f)
        else:
            data = {}
            
        data[result["id"]] = result
        
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
            
        logger.info(f"Saved results to {filename}")
        
    except Exception as e:
        logger.error(f"Error saving to JSON: {str(e)}")

def is_file_processed(file_id: str) -> bool:
    """Check if a file has already been processed."""
    try:
        if os.path.exists('data/processed_files.json'):
            with open('data/processed_files.json', 'r') as f:
                data = json.load(f)
                return file_id in data
        return False
    except Exception as e:
        logger.error(f"Error checking processed files: {str(e)}")
        return False 