import os
from datetime import datetime
from flask import request, jsonify
from werkzeug.utils import secure_filename
from sqlalchemy import func

from langchain_pymupdf4llm import PyMuPDF4LLMLoader
from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_ollama import OllamaEmbeddings

from src.documents import bp
from src.config import Config
from src.database import db
from .models import LangchainPgCollection, LangchainPgEmbedding

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def get_collections_from_db():
    """Get all collections from PGVector database"""
    try:
        # Query collections and their embeddings using SQLAlchemy models
        collections_data = db.session.query(
            LangchainPgCollection.name,
            func.count(LangchainPgEmbedding.id).label('page_count'),
            func.min(LangchainPgEmbedding.cmetadata['created_at'].astext).label('created_at'),
            func.max(LangchainPgEmbedding.cmetadata['file_size'].astext).label('file_size'),
            func.max(LangchainPgEmbedding.cmetadata['filename'].astext).label('filename')
        ).join(
            LangchainPgEmbedding, 
            LangchainPgCollection.uuid == LangchainPgEmbedding.collection_id
        ).group_by(
            LangchainPgCollection.name
        ).order_by(
            func.min(LangchainPgEmbedding.cmetadata['created_at'].astext).desc()
        ).all()
        
        documents = []
        for collection_name, page_count, created_at, file_size, filename in collections_data:
            documents.append({
                'id': collection_name,
                'collection_name': collection_name,
                'filename': filename or f"{collection_name}.pdf",
                'status': 'completed',
                'total_pages': page_count,
                'pages_processed': page_count,
                'embeddings': page_count,
                'created_at': created_at or datetime.now().isoformat(),
                'file_size': int(file_size) if file_size else None,
                'filepath': None  # Files are deleted after processing
            })
        
        return documents
        
    except Exception as e:
        print(f"Error fetching collections: {e}")
        return []

def process_pdf_to_embeddings(file_path, collection_name, filename, file_size):
    """Process PDF and store embeddings in PGVector database"""
    try:
        # Initialize embeddings and vector store
        embeddings = OllamaEmbeddings(
            model=Config.EMBEDDINGS_MODEL,
            base_url=Config.OLLAMA_BASE_URL
        )
        vector_store = PGVector(
            embeddings=embeddings,
            collection_name=collection_name,
            connection=Config.DATABASE_URL,
            use_jsonb=True,
        )
        
        # Load PDF pages
        loader = PyMuPDF4LLMLoader(
            file_path,
            mode="page",
            extract_images=False,
        )
        
        pages_processed = 0
        total_pages = 0
        created_at = datetime.now().isoformat()
        
        # Process each page
        for page in loader.lazy_load():
            total_pages += 1
            
            # Create a unique identifier for this page
            page_id = f"{collection_name}_page_{page.metadata.get('page', 'unknown')}"
            
            # Check if document with this ID already exists
            try:
                existing_doc = vector_store.get_by_id(page_id)
                if existing_doc:
                    continue
            except Exception:
                pass
            
            # Add the new document with enhanced metadata
            document = Document(
                id=page_id, 
                page_content=page.page_content, 
                metadata={
                    **page.metadata, 
                    'collection_name': collection_name,
                    'filename': filename,
                    'file_size': str(file_size),
                    'created_at': created_at
                }
            )
            vector_store.add_documents([document])
            pages_processed += 1
        
        return {
            'success': True,
            'total_pages': total_pages,
            'pages_processed': pages_processed,
            'collection_name': collection_name
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@bp.route('/list', methods=['GET'])
def list_documents():
    documents = get_collections_from_db()
    return jsonify({'documents': documents}), 200

@bp.route('/upload', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
        
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        file.save(filepath)
        
        file_size = os.path.getsize(filepath)
        
        # Create collection name from filename (without extension)
        collection_name = os.path.splitext(filename)[0]
        
        # Process PDF to generate embeddings
        processing_result = process_pdf_to_embeddings(filepath, collection_name, filename, file_size)
        
        # Create document info for response
        doc_info = {
            'id': collection_name,
            'filename': filename,
            'collection_name': collection_name,
            'created_at': datetime.now().isoformat(),
            'file_size': file_size,
            'filepath': None  # File will be deleted after processing
        }
        
        if processing_result['success']:
            doc_info.update({
                'status': 'completed',
                'total_pages': processing_result['total_pages'],
                'pages_processed': processing_result['pages_processed'],
                'embeddings': processing_result['pages_processed']
            })
            
            # Delete the original PDF file after successful processing
            try:
                os.remove(filepath)
            except Exception as e:
                print(f"Warning: Could not delete file {filepath}: {e}")
                
        else:
            doc_info.update({
                'status': 'error',
                'error_message': processing_result['error']
            })
        
        return jsonify({
            'message': 'File uploaded and processed successfully' if processing_result['success'] else 'File uploaded but processing failed',
            'document': doc_info,
            'processing_result': processing_result
        }), 200 if processing_result['success'] else 206
    
    return jsonify({'error': 'File type not allowed'}), 400
