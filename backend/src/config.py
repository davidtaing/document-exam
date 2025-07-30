class Config:
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max file size
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'pdf'}
    
    # Database configuration
    DATABASE_URL = "postgresql+psycopg://langchain:langchain@localhost:50003/langchain"
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    
    # Embeddings configuration
    EMBEDDINGS_MODEL = "nomic-embed-text"
    
    # Chat model configuration
    CHAT_MODEL = "llama3.2"