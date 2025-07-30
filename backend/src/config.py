import os

class Config:
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max file size
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'pdf'}
    
    # Database configuration
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://langchain:langchain@localhost:50003/langchain")
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    
    # Ollama configuration
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    # Embeddings configuration
    EMBEDDINGS_MODEL = "nomic-embed-text"
    
    # Chat model configuration
    CHAT_MODEL = "llama3.2"