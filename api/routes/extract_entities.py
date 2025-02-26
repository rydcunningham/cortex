from fastapi import APIRouter
from daemons.entity_processor import EntityProcessor
from typing import Dict, Any

router = APIRouter()

@router.get("/extract-entities")
async def extract_entities() -> Dict[str, Any]:
    """
    Extract entities from processed documents and update entities.json
    """
    try:
        processor = EntityProcessor()
        processor.process_documents()
        
        # Count the number of entities extracted
        entity_count = len(processor.db.entities)
        
        return {
            "status": "success",
            "message": "Entities extracted and saved successfully",
            "entities_file": str(processor.entities_file),
            "entity_count": entity_count,  # Added count for UI feedback
            "types": {  # Added type breakdown for UI feedback
                "person": len([e for e in processor.db.entities.values() if e.type == "person"]),
                "organization": len([e for e in processor.db.entities.values() if e.type == "organization"])
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error extracting entities: {str(e)}"
        } 