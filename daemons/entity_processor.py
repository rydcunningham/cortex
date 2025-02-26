from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
import json
import os
from pathlib import Path

class Entity(BaseModel):
    id: str
    type: str
    name: str
    aliases: List[str] = Field(default_factory=list)
    related_documents: List[str] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class EntityDatabase(BaseModel):
    entities: Dict[str, Entity] = Field(default_factory=dict)

class EntityProcessor:
    def __init__(self):
        self.entities_file = Path("data/entities.json")
        self.processed_files_path = Path("data/processed_files.json")
        self.db = self._load_or_create_db()

    def _load_or_create_db(self) -> EntityDatabase:
        if self.entities_file.exists():
            with open(self.entities_file) as f:
                data = json.load(f)
                return EntityDatabase.model_validate(data)
        return EntityDatabase()

    def _save_db(self):
        with open(self.entities_file, "w") as f:
            json.dump(self.db.model_dump(), f, indent=2, default=str)

    def _generate_entity_id(self, name: str, type: str) -> str:
        """Generate a unique ID for an entity based on name and type"""
        import hashlib
        combined = f"{name.lower()}_{type.lower()}"
        return hashlib.md5(combined.encode()).hexdigest()[:12]

    def _add_or_update_entity(self, name: str, type: str, doc_id: str):
        """Add or update an entity in the database"""
        entity_id = self._generate_entity_id(name, type)
        
        if entity_id in self.db.entities:
            entity = self.db.entities[entity_id]
            if doc_id not in entity.related_documents:
                entity.related_documents.append(doc_id)
                entity.last_updated = datetime.utcnow()
        else:
            entity = Entity(
                id=entity_id,
                type=type,
                name=name,
                related_documents=[doc_id],
                last_updated=datetime.utcnow()
            )
            self.db.entities[entity_id] = entity

    def process_documents(self):
        """Process all documents and extract entities"""
        if not self.processed_files_path.exists():
            print("No processed files database found")
            return

        with open(self.processed_files_path) as f:
            processed_files = json.load(f)

        for doc_id, doc_data in processed_files.items():
            # Process authors as people
            for author in doc_data.get("authors", []):
                self._add_or_update_entity(author, "person", doc_id)

            # Process affiliations as organizations
            for affiliation in doc_data.get("affiliations", []):
                self._add_or_update_entity(affiliation, "organization", doc_id)

        self._save_db()

def main():
    processor = EntityProcessor()
    processor.process_documents()

if __name__ == "__main__":
    main() 