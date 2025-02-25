# Cortex

## Overview

Cortex is an agentic researcher library designed for solo VC funds to organize, process, and manage an expanding knowledge base for fund research and deal diligence. It employs a system of agents and daemons to automate the ingestion, analysis, and organization of research materials, creating a structured and searchable repository of investment intelligence.

Cortex streamlines the research workflow by automatically processing documents, extracting key insights, generating summaries and analyses, and organizing content with relevant tags - all while optimizing storage efficiency.

## Key Features

### Automated Document Ingestion
- Seamless integration with Google Drive for document storage
- Support for direct PDF uploads and URL-to-PDF conversion
- Automatic processing queue for newly added materials

### Intelligent Content Analysis
- Text extraction from various document formats
- AI-powered summarization and technical analysis via Gemini 2.0 Flash
- Comprehensive metadata extraction including authors and affiliations
- Structured analysis with investment-focused insights

### Storage Optimization
- Automatic PDF compression and downscaling
- Parallel storage of original and compressed versions
- Intelligent file management to reduce storage requirements

### Smart Organization
- Automated tagging system based on document content
- Structured JSON database of all processed materials
- Searchable repository organized by topics, technologies, and investment themes

### API-First Design
- FastAPI-based endpoints for processing control
- Flexible processing options (batch or individual files)
- Easy integration with other tools and workflows

## Technical Details

### Technology Stack
- **Backend**: Python, FastAPI
- **Storage**: Google Drive API
- **Document Processing**: PyPDF, Ghostscript
- **AI Analysis**: Google Generative AI (Gemini 2.0 Flash)
- **Database**: JSON-based document store
- **Authentication**: Google Service Account
- **Environment**: Docker-ready with environment variables

### Processing Pipeline

1. **Document Ingestion**
   - Files uploaded to dedicated Google Drive folder
   - URLs converted to PDFs via web printing service
   - Initial metadata extraction (filename, size, creation date)

2. **Content Extraction & Analysis**
   - Text extraction from PDFs using PyPDF
   - AI processing via Gemini 2.0 Flash
   - Generation of structured analysis with:
     - Key findings
     - Technical innovation
     - Market applications
     - Competitive landscape
     - Technical limitations
     - Investment relevance
     - Diligence questions
   - Extraction of authors and institutional affiliations
   - Concise executive summary generation

3. **Storage Optimization**
   - PDF compression using Ghostscript
   - Creation of parallel compressed version
   - Metadata updating with new file references

4. **Organization & Tagging**
   - Content-based tag generation
   - JSON database updates
   - Relationship mapping between documents

### Data Model

The core data structure is a JSON database with entries keyed by Google Drive File IDs:

```json
{
  "file_ID": {
    "id": "file_ID",
    "name": "Example Research.pdf",
    "drive_link": "https://drive.google.com/file/d/file_ID/view",
    "created_date": "2025-02-20T14:30:00Z",
    "added_date": "2025-02-25T08:30:00Z",
    "processed_date": "2025-02-25T08:35:42Z",
    "authors": ["Jane Smith", "John Doe", "Dr. Robert Chen"],
    "affiliations": ["Stanford University", "OpenAI", "MIT Media Lab"],
    "title": "Advances in Quantum Computing for Financial Modeling",
    "original_ID": "original_file_ID",
    "converted_ID": "compressed_file_ID",
    "file_size": 2458361,
    "compressed_size": 876543,
    "source_url": "https://example.com/research-paper",
    "summary": "This research introduces a novel quantum algorithm that provides a 10x speedup for derivative pricing models while reducing computational complexity by 60%. The approach enables real-time risk assessment for complex financial instruments, outperforming classical methods in both accuracy and resource utilization.",
    "analysis": "# Key Findings\n- Achieved 10x speedup for derivative pricing models\n- Reduced computational complexity by 60%\n- Demonstrated 99.2% accuracy on benchmark datasets\n- Successfully implemented on current-generation quantum hardware\n- Validated with real-world financial data from major institutions\n\n# Technical Innovation\n...",
    "tags": ["quantum computing", "fintech", "algorithms", "series A", "financial modeling"]
  }
}
```

## Project Structure

```
cortex/
├── README.md
├── requirements.txt
├── .env.example
├── .env
├── main.py
├── service-account.json
├── agents/
│   ├── __init__.py
│   ├── document_processor.py
│   ├── content_analyzer.py
│   ├── tagger.py
│   └── search_agent.py
├── daemons/
│   ├── __init__.py
│   ├── file_watcher.py
│   ├── compression_daemon.py
│   └── database_updater.py
├── api/
│   ├── __init__.py
│   ├── endpoints.py
│   ├── models.py
│   └── dependencies.py
├── connectors/
│   ├── __init__.py
│   ├── google_drive.py
│   ├── gemini_api.py
│   └── url_to_pdf.py
├── utils/
│   ├── __init__.py
│   ├── pdf_tools.py
│   ├── text_extraction.py
│   └── metadata_helpers.py
├── data/
│   ├── processed_files.json
│   └── tag_taxonomy.json
├── temp/
│   └── .gitkeep
└── web/
    ├── app.py
    ├── templates/
    │   ├── index.html
    │   ├── search.html
    │   └── upload.html
    └── static/
        ├── css/
        └── js/
```

## Getting Started

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and configure environment variables
4. Set up Google Drive API service account and save credentials as `service-account.json`
5. Run the FastAPI application: `uvicorn main:app --reload`

## Configuration

Cortex is configured through environment variables in a `.env` file:

```
# Google API Configuration
GOOGLE_API_KEY=your_gemini_api_key
WATCH_FOLDER_ID=your_google_drive_folder_id

# Processing Configuration
BATCH_SIZE=5
CONCURRENT_PROCESSES=2
COMPRESSION_LEVEL=3
MAX_ORIGINAL_SIZE_MB=50

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

## API Endpoints

### `/process-folder`
Process all PDF files in the watched Google Drive folder.

**Method**: GET  
**Response**: JSON object with processing results

### `/process-latest`
Process only the most recent PDF file in the watched folder.

**Method**: GET  
**Response**: JSON object with processing result

## Document Analysis Structure

Cortex generates a comprehensive analysis for each document with the following sections:

1. **Key Findings**: 4-5 bullet points on the most significant discoveries or contributions
2. **Technical Innovation**: Novel methodologies, algorithms, or frameworks introduced
3. **Market Applications**: Potential commercial applications and relevant industry sectors
4. **Competitive Landscape**: Positioning against existing solutions
5. **Technical Limitations**: Critical constraints or weaknesses in the approach
6. **Investment Relevance**: Alignment with emerging technology trends and investment thesis
7. **Diligence Questions**: Technical questions to probe with founders

## Future Enhancements

- Integration with market data APIs
- Competitor analysis module
- Investment thesis alignment scoring
- Portfolio company monitoring
- Founder background analysis
- Custom report generation
- Automated trend analysis across document corpus
- Integration with LLM-powered search capabilities