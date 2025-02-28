import json
import sqlite3
import os
from datetime import datetime
from typing import Dict, Any, Optional, List, Union
from pathlib import Path
import time

def convert_json_to_sqlite(
    json_file_path: Union[str, Path], 
    db_file_path: Union[str, Path],
    overwrite: bool = True,
    update_existing: bool = False
) -> None:
    """
    Convert a JSON file containing document data to a SQLite database.
    
    Args:
        json_file_path: Path to the JSON file containing document data
        db_file_path: Path where the SQLite database will be created
        overwrite: If True, overwrite existing database; if False, raise error if exists
        update_existing: If True and database exists, update existing records instead of recreating
        
    Returns:
        None
    
    Raises:
        FileExistsError: If database file exists, overwrite is False, and update_existing is False
        FileNotFoundError: If JSON file does not exist
    """
    # Convert paths to Path objects for better handling
    json_file_path = Path(json_file_path)
    db_file_path = Path(db_file_path)
    
    # Check if JSON file exists
    if not json_file_path.exists():
        raise FileNotFoundError(f"JSON file not found: {json_file_path}")
    
    # Load JSON data
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    # Handle existing database file
    db_exists = db_file_path.exists()
    
    # Initialize counters for logging
    added_count = 0
    updated_count = 0
    skipped_count = 0
    
    if db_exists:
        if update_existing:
            # Update existing database
            conn = sqlite3.connect(db_file_path)
            cursor = conn.cursor()
            cursor.execute("PRAGMA foreign_keys = ON")
            
            print(f"Updating existing database at {db_file_path}")
            
            # Process each document as an update
            for doc_id, doc in data.items():
                # Check if document exists
                cursor.execute("SELECT id FROM documents WHERE id = ?", (doc_id,))
                if cursor.fetchone():
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
                        doc.get('name', ''),
                        doc.get('drive_link', ''),
                        doc.get('created_date', ''),
                        doc.get('added_date', ''),
                        doc.get('processed_date', ''),
                        doc.get('title', ''),
                        doc.get('summary', ''),
                        doc.get('analysis', ''),
                        doc.get('document_type', ''),
                        doc_id
                    ))
                    
                    # Delete existing relationships to recreate them
                    cursor.execute("DELETE FROM document_authors WHERE document_id = ?", (doc_id,))
                    cursor.execute("DELETE FROM document_affiliations WHERE document_id = ?", (doc_id,))
                    cursor.execute("DELETE FROM document_tags WHERE document_id = ?", (doc_id,))
                    
                    updated_count += 1
                else:
                    # Insert new document
                    cursor.execute('''
                    INSERT INTO documents (
                        id, name, drive_link, created_date, added_date, processed_date,
                        title, summary, analysis, document_type
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        doc.get('id', doc_id),
                        doc.get('name', ''),
                        doc.get('drive_link', ''),
                        doc.get('created_date', ''),
                        doc.get('added_date', ''),
                        doc.get('processed_date', ''),
                        doc.get('title', ''),
                        doc.get('summary', ''),
                        doc.get('analysis', ''),
                        doc.get('document_type', '')
                    ))
                    
                    added_count += 1
                
                # Process relationships (authors, affiliations, tags)
                # Process authors
                if 'authors' in doc and isinstance(doc['authors'], list):
                    for i, author_name in enumerate(doc['authors']):
                        # Insert author if not exists
                        cursor.execute('INSERT OR IGNORE INTO authors (name) VALUES (?)', (author_name,))
                        
                        # Get author id
                        cursor.execute('SELECT id FROM authors WHERE name = ?', (author_name,))
                        author_id = cursor.fetchone()[0]
                        
                        # Insert document-author relationship
                        cursor.execute('''
                        INSERT INTO document_authors (document_id, author_id, author_order)
                        VALUES (?, ?, ?)
                        ''', (doc_id, author_id, i))
                
                # Process affiliations
                if 'affiliations' in doc and isinstance(doc['affiliations'], list):
                    for i, affiliation_name in enumerate(doc['affiliations']):
                        # Insert affiliation if not exists
                        cursor.execute('INSERT OR IGNORE INTO affiliations (name) VALUES (?)', (affiliation_name,))
                        
                        # Get affiliation id
                        cursor.execute('SELECT id FROM affiliations WHERE name = ?', (affiliation_name,))
                        affiliation_id = cursor.fetchone()[0]
                        
                        # Insert document-affiliation relationship
                        cursor.execute('''
                        INSERT INTO document_affiliations (document_id, affiliation_id, affiliation_order)
                        VALUES (?, ?, ?)
                        ''', (doc_id, affiliation_id, i))
                
                # Process tags
                if 'tags' in doc and isinstance(doc['tags'], list):
                    for tag_name in doc['tags']:
                        # Insert tag if not exists
                        cursor.execute('INSERT OR IGNORE INTO tags (name) VALUES (?)', (tag_name,))
                        
                        # Get tag id
                        cursor.execute('SELECT id FROM tags WHERE name = ?', (tag_name,))
                        tag_id = cursor.fetchone()[0]
                        
                        # Insert document-tag relationship
                        cursor.execute('''
                        INSERT INTO document_tags (document_id, tag_id)
                        VALUES (?, ?)
                        ''', (doc_id, tag_id))
            
            # Commit changes and close connection
            conn.commit()
            conn.close()
            
            print(f"Database update complete:")
            print(f"  - Added {added_count} new documents")
            print(f"  - Updated {updated_count} existing documents")
            print(f"  - Total documents processed: {len(data)}")
            return
        elif not overwrite:
            raise FileExistsError(f"Database file already exists: {db_file_path}")
        else:
            print(f"Overwriting existing database at {db_file_path}")
            os.remove(db_file_path)
    else:
        print(f"Creating new database at {db_file_path}")
    
    # Create database directory if it doesn't exist
    db_file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_file_path)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON")
    
    # Create tables
    # Main documents table
    cursor.execute('''
    CREATE TABLE documents (
        id TEXT PRIMARY KEY,
        name TEXT,
        drive_link TEXT,
        created_date TEXT,
        added_date TEXT,
        processed_date TEXT,
        title TEXT,
        summary TEXT,
        analysis TEXT,
        document_type TEXT
    )
    ''')
    
    # Authors table (many-to-many relationship with documents)
    cursor.execute('''
    CREATE TABLE authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )
    ''')
    
    # Document-Author relationship table
    cursor.execute('''
    CREATE TABLE document_authors (
        document_id TEXT,
        author_id INTEGER,
        author_order INTEGER,
        PRIMARY KEY (document_id, author_id),
        FOREIGN KEY (document_id) REFERENCES documents (id),
        FOREIGN KEY (author_id) REFERENCES authors (id)
    )
    ''')
    
    # Affiliations table (many-to-many relationship with documents)
    cursor.execute('''
    CREATE TABLE affiliations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )
    ''')
    
    # Document-Affiliation relationship table
    cursor.execute('''
    CREATE TABLE document_affiliations (
        document_id TEXT,
        affiliation_id INTEGER,
        affiliation_order INTEGER,
        PRIMARY KEY (document_id, affiliation_id),
        FOREIGN KEY (document_id) REFERENCES documents (id),
        FOREIGN KEY (affiliation_id) REFERENCES affiliations (id)
    )
    ''')
    
    # Tags table (many-to-many relationship with documents)
    cursor.execute('''
    CREATE TABLE tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    )
    ''')
    
    # Document-Tag relationship table
    cursor.execute('''
    CREATE TABLE document_tags (
        document_id TEXT,
        tag_id INTEGER,
        PRIMARY KEY (document_id, tag_id),
        FOREIGN KEY (document_id) REFERENCES documents (id),
        FOREIGN KEY (tag_id) REFERENCES tags (id)
    )
    ''')
    
    # Process each document
    for doc_id, doc in data.items():
        # Insert into documents table
        cursor.execute('''
        INSERT INTO documents (
            id, name, drive_link, created_date, added_date, processed_date,
            title, summary, analysis, document_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            doc.get('id', doc_id),
            doc.get('name', ''),
            doc.get('drive_link', ''),
            doc.get('created_date', ''),
            doc.get('added_date', ''),
            doc.get('processed_date', ''),
            doc.get('title', ''),
            doc.get('summary', ''),
            doc.get('analysis', ''),
            doc.get('document_type', '')
        ))
        
        added_count += 1
        
        # Process authors
        if 'authors' in doc and isinstance(doc['authors'], list):
            for i, author_name in enumerate(doc['authors']):
                # Insert author if not exists
                cursor.execute('INSERT OR IGNORE INTO authors (name) VALUES (?)', (author_name,))
                
                # Get author id
                cursor.execute('SELECT id FROM authors WHERE name = ?', (author_name,))
                author_id = cursor.fetchone()[0]
                
                # Insert document-author relationship
                cursor.execute('''
                INSERT INTO document_authors (document_id, author_id, author_order)
                VALUES (?, ?, ?)
                ''', (doc_id, author_id, i))
        
        # Process affiliations
        if 'affiliations' in doc and isinstance(doc['affiliations'], list):
            for i, affiliation_name in enumerate(doc['affiliations']):
                # Insert affiliation if not exists
                cursor.execute('INSERT OR IGNORE INTO affiliations (name) VALUES (?)', (affiliation_name,))
                
                # Get affiliation id
                cursor.execute('SELECT id FROM affiliations WHERE name = ?', (affiliation_name,))
                affiliation_id = cursor.fetchone()[0]
                
                # Insert document-affiliation relationship
                cursor.execute('''
                INSERT INTO document_affiliations (document_id, affiliation_id, affiliation_order)
                VALUES (?, ?, ?)
                ''', (doc_id, affiliation_id, i))
        
        # Process tags
        if 'tags' in doc and isinstance(doc['tags'], list):
            for tag_name in doc['tags']:
                # Insert tag if not exists
                cursor.execute('INSERT OR IGNORE INTO tags (name) VALUES (?)', (tag_name,))
                
                # Get tag id
                cursor.execute('SELECT id FROM tags WHERE name = ?', (tag_name,))
                tag_id = cursor.fetchone()[0]
                
                # Insert document-tag relationship
                cursor.execute('''
                INSERT INTO document_tags (document_id, tag_id)
                VALUES (?, ?)
                ''', (doc_id, tag_id))
    
    # Create indexes for better query performance
    cursor.execute('CREATE INDEX idx_document_authors_document_id ON document_authors (document_id)')
    cursor.execute('CREATE INDEX idx_document_authors_author_id ON document_authors (author_id)')
    cursor.execute('CREATE INDEX idx_document_affiliations_document_id ON document_affiliations (document_id)')
    cursor.execute('CREATE INDEX idx_document_affiliations_affiliation_id ON document_affiliations (affiliation_id)')
    cursor.execute('CREATE INDEX idx_document_tags_document_id ON document_tags (document_id)')
    cursor.execute('CREATE INDEX idx_document_tags_tag_id ON document_tags (tag_id)')
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print(f"Database creation complete:")
    print(f"  - Added {added_count} new documents")
    print(f"  - Total documents processed: {len(data)}")


def query_documents(
    db_file_path: Union[str, Path],
    filters: Optional[Dict[str, Any]] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """
    Query documents from the SQLite database with optional filtering.
    
    Args:
        db_file_path: Path to the SQLite database
        filters: Dictionary of filters to apply (e.g., {'document_type': 'academic-paper'})
        limit: Maximum number of results to return
        offset: Number of results to skip
        
    Returns:
        List of document dictionaries with all related data
    """
    db_file_path = Path(db_file_path)
    if not db_file_path.exists():
        raise FileNotFoundError(f"Database file not found: {db_file_path}")
    
    conn = sqlite3.connect(db_file_path)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    cursor = conn.cursor()
    
    # Build query based on filters
    query = "SELECT * FROM documents"
    params = []
    
    if filters:
        conditions = []
        for key, value in filters.items():
            if key in ['id', 'name', 'title', 'document_type']:
                conditions.append(f"{key} = ?")
                params.append(value)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
    
    query += f" LIMIT {limit} OFFSET {offset}"
    
    cursor.execute(query, params)
    results = []
    
    for row in cursor.fetchall():
        doc = dict(row)
        doc_id = doc['id']
        
        # Get authors
        cursor.execute('''
        SELECT a.name, da.author_order
        FROM authors a
        JOIN document_authors da ON a.id = da.author_id
        WHERE da.document_id = ?
        ORDER BY da.author_order
        ''', (doc_id,))
        doc['authors'] = [row[0] for row in cursor.fetchall()]
        
        # Get affiliations
        cursor.execute('''
        SELECT a.name, da.affiliation_order
        FROM affiliations a
        JOIN document_affiliations da ON a.id = da.affiliation_id
        WHERE da.document_id = ?
        ORDER BY da.affiliation_order
        ''', (doc_id,))
        doc['affiliations'] = [row[0] for row in cursor.fetchall()]
        
        # Get tags
        cursor.execute('''
        SELECT t.name
        FROM tags t
        JOIN document_tags dt ON t.id = dt.tag_id
        WHERE dt.document_id = ?
        ''', (doc_id,))
        doc['tags'] = [row[0] for row in cursor.fetchall()]
        
        results.append(doc)
    
    conn.close()
    return results


def export_to_json(
    db_file_path: Union[str, Path],
    json_file_path: Union[str, Path],
    pretty_print: bool = True
) -> None:
    """
    Export the entire database back to JSON format.
    
    Args:
        db_file_path: Path to the SQLite database
        json_file_path: Path where the JSON file will be created
        pretty_print: If True, format JSON with indentation
        
    Returns:
        None
    """
    documents = query_documents(db_file_path, limit=1000000)  # Set a high limit to get all docs
    
    # Convert to the original format (dict with doc_id as keys)
    data = {doc['id']: doc for doc in documents}
    
    with open(json_file_path, 'w', encoding='utf-8') as f:
        if pretty_print:
            json.dump(data, f, indent=2, ensure_ascii=False)
        else:
            json.dump(data, f, ensure_ascii=False)
    
    print(f"Successfully exported {len(data)} documents to {json_file_path}")


# Example usage
if __name__ == "__main__":
    json_file_path = "data/processed_files.json"
    db_file_path = "data/documents.db"
    
    # Check if database already exists
    if Path(db_file_path).exists():
        print("Database already exists. Updating with new documents...")
        convert_json_to_sqlite(json_file_path, db_file_path, update_existing=True)
    else:
        print("Creating new database...")
        convert_json_to_sqlite(json_file_path, db_file_path)
    
    # Example query
    start = time.time()
    academic_papers = query_documents(
        db_file_path, 
        filters={"document_type": "academic-paper"},
        limit=10
    )
    end = time.time()
    print(f"Found {len(academic_papers)} academic papers in {end - start} seconds")