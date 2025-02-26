import os
import json
import logging
from typing import List, Dict, Any
import google.generativeai as genai

logger = logging.getLogger(__name__)

class ContentTagger:
    def __init__(self, api_key: str):
        """Initialize the content tagger with Gemini configuration."""
        self.configure_ai(api_key)
        self.skipped_count = 0
        logger.info("Content tagger initialized")

    def configure_ai(self, api_key: str):
        """Configure the Gemini AI model."""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-lite')

    async def process_document(self, doc: Dict[str, Any]) -> List[str]:
        """Process a single document and generate tags."""
        try:
            # Combine summary and analysis for context
            content = f"""Summary: {doc.get('summary', '')}

Analysis: {doc.get('analysis', '')}"""
            
            # Generate tags using Gemini
            tags = await self._generate_tags(content)
            logger.info(f"Generated {len(tags)} tags for document: {doc.get('name')}")
            
            return tags

        except Exception as e:
            logger.error(f"Error processing document {doc.get('name')}: {str(e)}")
            return []

    async def _generate_tags(self, content: str) -> List[str]:
        """Generate tags from document content using Gemini."""
        prompt = """Based on this research document summary and analysis, generate a list of the MOST RELEVANT tags (maximum 20). 
Include concepts, methodologies, application domains, and key innovations.
Return only comma-separated tags, no other text.

Example tags format: artificial-intelligence, infrastructure, geopolitics, strategy, machine-learning, computer-vision, object-detection, spiking-neural-networks, energy-based-models

Content:
{content}"""

        try:
            response = self.model.generate_content(prompt.format(content=content))
            tags_text = response.text.strip('" \n').lower()
            
            # Split, clean, and limit tags
            tags = [
                tag.strip().replace(' ', '-') 
                for tag in tags_text.split(',')
                if tag.strip()
            ]
            
            # Remove duplicates and limit to 20 tags
            unique_tags = list(dict.fromkeys(tags))[:20]
            logger.info(f"Generated {len(unique_tags)} tags")
            return unique_tags
            
        except Exception as e:
            logger.error(f"Error generating tags: {str(e)}")
            return []

    def _has_tags(self, doc: Dict[str, Any]) -> bool:
        """Check if a document already has tags."""
        return 'tags' in doc and isinstance(doc['tags'], list) and len(doc['tags']) > 0

    async def process_all_documents(self, skip_tagged=False) -> Dict[str, List[str]]:
        """Process all documents in the processed files database, with option to skip already tagged documents."""
        try:
            self.skipped_count = 0  # Reset counter
            
            if not os.path.exists('data/processed_files.json'):
                logger.warning("No processed files database found")
                return {}

            with open('data/processed_files.json', 'r') as f:
                documents = json.load(f)

            results = {}
            
            for doc_id, doc in documents.items():
                # Skip if already tagged and skip_tagged is True
                if skip_tagged and self._has_tags(doc):
                    logger.info(f"Skipping already tagged document: {doc.get('name', 'Unknown')}")
                    self.skipped_count += 1
                    continue
                    
                tags = await self.process_document(doc)
                if tags:
                    results[doc_id] = tags
                    
                    # Update the document with tags and save immediately
                    doc['tags'] = tags
                    
                    # Save after each successful tagging
                    with open('data/processed_files.json', 'w') as f:
                        json.dump(documents, f, indent=2)
                    logger.info(f"Updated tags for document {doc.get('name')}")
            
            logger.info(f"Processed {len(results)} documents, skipped {self.skipped_count} documents")
            return results

        except Exception as e:
            logger.error(f"Error processing documents: {str(e)}")
            return {} 