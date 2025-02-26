import pytest
from pathlib import Path
import json
from daemons.entity_processor import EntityProcessor

@pytest.fixture
def sample_processed_files(tmp_path):
    data = {
        "doc1": {
            "authors": ["John Doe", "Jane Smith"],
            "affiliations": ["Stanford University", "Google Research"]
        },
        "doc2": {
            "authors": ["Jane Smith", "Bob Johnson"],
            "affiliations": ["Google Research", "MIT"]
        }
    }
    
    processed_files_path = tmp_path / "processed_files.json"
    with open(processed_files_path, "w") as f:
        json.dump(data, f)
    
    return processed_files_path

def test_entity_processor(tmp_path, sample_processed_files):
    # Setup
    processor = EntityProcessor()
    processor.processed_files_path = sample_processed_files
    processor.entities_file = tmp_path / "entities.json"
    
    # Process documents
    processor.process_documents()
    
    # Verify results
    with open(processor.entities_file) as f:
        entities = json.load(f)
    
    # Check that we have the expected number of entities
    assert len(entities["entities"]) == 5  # 3 authors + 3 organizations - 1 duplicate
    
    # Verify that Jane Smith appears in both documents
    jane_id = None
    for entity_id, entity in entities["entities"].items():
        if entity["name"] == "Jane Smith":
            jane_id = entity_id
            break
    
    assert jane_id is not None
    jane_entity = entities["entities"][jane_id]
    assert len(jane_entity["related_documents"]) == 2
    assert "doc1" in jane_entity["related_documents"]
    assert "doc2" in jane_entity["related_documents"] 