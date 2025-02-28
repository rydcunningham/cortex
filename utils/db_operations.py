import os
import json
import logging
import sqlite3
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

def save_document_to_db(document: Dict[str, Any], db_path: str = "data/documents.db") -> bool:
    """
    Save a processed document to the SQLite database.
    
    Args:
        document: Document data dictionary
        db_path: Path to the SQLite database
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Ensure database exists
        if not os.path.exists(db_path):
            logger.info(f"Database does not exist at {db_path}. Creating new database...")
            from utils.data_handling import convert_json_to_sqlite
            # Create an empty database with the schema
            temp_data = {document["id"]: document}
            temp_json_path = "data/temp_document.json"
            os.makedirs(os.path.dirname(temp_json_path), exist_ok=True)
            
            with open(temp_json_path, 'w') as f:
                json.dump(temp_data, f)
                
            convert_json_to_sqlite(temp_json_path, db_path)
            os.remove(temp_json_path)
            return True
            
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if document already exists
        cursor.execute("SELECT id FROM documents WHERE id = ?", (document["id"],))
        exists = cursor.fetchone() is not None
        
        if exists:
            # Update existing document
            cursor.execute('''
            UPDATE documents SET
                name = ?,
                drive_link = ?,
                created_date = ?,
                added_date = ?,
                processed_date = ?,
                title = ?,
                summary = ?,
                analysis = ?,
                document_type = ?
            WHERE id = ?
            ''', (
                document.get('name', ''),
                document.get('drive_link', ''),
                document.get('created_date', ''),
                document.get('added_date', ''),
                document.get('processed_date', ''),
                document.get('title', ''),
                document.get('summary', ''),
                document.get('analysis', ''),
                document.get('document_type', ''),
                document["id"]
            ))
            
            # Delete existing relationships to recreate them
            cursor.execute("DELETE FROM document_authors WHERE document_id = ?", (document["id"],))
            cursor.execute("DELETE FROM document_affiliations WHERE document_id = ?", (document["id"],))
            cursor.execute("DELETE FROM document_tags WHERE document_id = ?", (document["id"],))
            
            logger.info(f"Updated document {document['id']} in database")
        else:
            # Insert new document
            cursor.execute('''
            INSERT INTO documents (
                id, name, drive_link, created_date, added_date, processed_date,
                title, summary, analysis, document_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                document["id"],
                document.get('name', ''),
                document.get('drive_link', ''),
                document.get('created_date', ''),
                document.get('added_date', ''),
                document.get('processed_date', datetime.now().isoformat()),
                document.get('title', ''),
                document.get('summary', ''),
                document.get('analysis', ''),
                document.get('document_type', '')
            ))
            
            logger.info(f"Inserted new document {document['id']} into database")
        
        # Process authors
        if 'authors' in document and isinstance(document['authors'], list):
            for i, author_name in enumerate(document['authors']):
                # Insert author if not exists
                cursor.execute('INSERT OR IGNORE INTO authors (name) VALUES (?)', (author_name,))
                
                # Get author id
                cursor.execute('SELECT id FROM authors WHERE name = ?', (author_name,))
                author_id = cursor.fetchone()[0]
                
                # Insert document-author relationship
                cursor.execute('''
                INSERT INTO document_authors (document_id, author_id, author_order)
                VALUES (?, ?, ?)
                ''', (document["id"], author_id, i))
        
        # Process affiliations
        if 'affiliations' in document and isinstance(document['affiliations'], list):
            for i, affiliation_name in enumerate(document['affiliations']):
                # Insert affiliation if not exists
                cursor.execute('INSERT OR IGNORE INTO affiliations (name) VALUES (?)', (affiliation_name,))
                
                # Get affiliation id
                cursor.execute('SELECT id FROM affiliations WHERE name = ?', (affiliation_name,))
                affiliation_id = cursor.fetchone()[0]
                
                # Insert document-affiliation relationship
                cursor.execute('''
                INSERT INTO document_affiliations (document_id, affiliation_id, affiliation_order)
                VALUES (?, ?, ?)
                ''', (document["id"], affiliation_id, i))
        
        # Process tags
        if 'tags' in document and isinstance(document['tags'], list):
            for tag_name in document['tags']:
                # Insert tag if not exists
                cursor.execute('INSERT OR IGNORE INTO tags (name) VALUES (?)', (tag_name,))
                
                # Get tag id
                cursor.execute('SELECT id FROM tags WHERE name = ?', (tag_name,))
                tag_id = cursor.fetchone()[0]
                
                # Insert document-tag relationship
                cursor.execute('''
                INSERT INTO document_tags (document_id, tag_id)
                VALUES (?, ?)
                ''', (document["id"], tag_id))
        
        # Commit changes and close connection
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"Error saving document to database: {str(e)}")
        return False

def is_document_in_db(document_id: str, db_path: str = "data/documents.db") -> bool:
    """
    Check if a document exists in the database.
    
    Args:
        document_id: Document ID to check
        db_path: Path to the SQLite database
        
    Returns:
        bool: True if document exists, False otherwise
    """
    try:
        if not os.path.exists(db_path):
            return False
            
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM documents WHERE id = ?", (document_id,))
        result = cursor.fetchone() is not None
        
        conn.close()
        return result
        
    except Exception as e:
        logger.error(f"Error checking if document exists in database: {str(e)}")
        return False

def get_document_from_db(document_id: str, db_path: str = "data/documents.db") -> Optional[Dict[str, Any]]:
    """
    Retrieve a document from the database.
    
    Args:
        document_id: Document ID to retrieve
        db_path: Path to the SQLite database
        
    Returns:
        Optional[Dict[str, Any]]: Document data or None if not found
    """
    try:
        if not os.path.exists(db_path):
            return None
            
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # This enables column access by name
        cursor = conn.cursor()
        
        # Get document
        cursor.execute("SELECT * FROM documents WHERE id = ?", (document_id,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return None
            
        # Convert row to dict
        doc = dict(row)
        
        # Get authors
        cursor.execute('''
        SELECT a.name, da.author_order
        FROM authors a
        JOIN document_authors da ON a.id = da.author_id
        WHERE da.document_id = ?
        ORDER BY da.author_order
        ''', (document_id,))
        doc['authors'] = [row[0] for row in cursor.fetchall()]
        
        # Get affiliations
        cursor.execute('''
        SELECT a.name, da.affiliation_order
        FROM affiliations a
        JOIN document_affiliations da ON a.id = da.affiliation_id
        WHERE da.document_id = ?
        ORDER BY da.affiliation_order
        ''', (document_id,))
        doc['affiliations'] = [row[0] for row in cursor.fetchall()]
        
        # Get tags
        cursor.execute('''
        SELECT t.name
        FROM tags t
        JOIN document_tags dt ON t.id = dt.tag_id
        WHERE dt.document_id = ?
        ''', (document_id,))
        doc['tags'] = [row[0] for row in cursor.fetchall()]
        
        conn.close()
        return doc
        
    except Exception as e:
        logger.error(f"Error retrieving document from database: {str(e)}")
        return None

def get_latest_document_id(db_path: str = "data/documents.db") -> Optional[str]:
    """
    Get the ID of the most recently processed document.
    
    Args:
        db_path: Path to the SQLite database
        
    Returns:
        Optional[str]: Document ID or None if no documents found
    """
    try:
        if not os.path.exists(db_path):
            return None
            
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM documents ORDER BY processed_date DESC LIMIT 1")
        result = cursor.fetchone()
        
        conn.close()
        return result[0] if result else None
        
    except Exception as e:
        logger.error(f"Error getting latest document ID: {str(e)}")
        return None

def get_all_document_ids(db_path: str = "data/documents.db") -> List[str]:
    """
    Get all document IDs from the database.
    
    Args:
        db_path: Path to the SQLite database
        
    Returns:
        List[str]: List of document IDs
    """
    try:
        if not os.path.exists(db_path):
            return []
            
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM documents")
        results = cursor.fetchall()
        
        conn.close()
        return [row[0] for row in results]
        
    except Exception as e:
        logger.error(f"Error getting all document IDs: {str(e)}")
        return [] 