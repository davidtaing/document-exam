import os
import json
from datetime import datetime
from flask import request, jsonify
from werkzeug.utils import secure_filename

from src.documents import bp
from src.config import Config

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def get_documents_index():
    index_file = os.path.join(Config.UPLOAD_FOLDER, 'index.json')
    if os.path.exists(index_file):
        with open(index_file, 'r') as f:
            return json.load(f)
    return []

def save_documents_index(documents):
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    index_file = os.path.join(Config.UPLOAD_FOLDER, 'index.json')
    with open(index_file, 'w') as f:
        json.dump(documents, f, indent=2)

@bp.route('/list', methods=['GET'])
def list_documents():
    documents = get_documents_index()
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
        
        # Add to index
        documents = get_documents_index()
        doc_info = {
            'id': str(len(documents) + 1),
            'filename': filename,
            'filepath': filepath,
            'status': 'completed',
            'created_at': datetime.now().isoformat(),
            'file_size': os.path.getsize(filepath)
        }
        documents.append(doc_info)
        save_documents_index(documents)
        
        return jsonify({
            'message': 'File uploaded successfully',
            'document': doc_info
        }), 200
    
    return jsonify({'error': 'File type not allowed'}), 400
