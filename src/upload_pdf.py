from langchain_pymupdf4llm import PyMuPDF4LLMLoader
from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_ollama import OllamaEmbeddings

embeddings = OllamaEmbeddings(model="nomic-embed-text")
file_path = "./aiengineering.pdf"

connection = "postgresql+psycopg://langchain:langchain@localhost:6024/langchain"

vector_store = PGVector(
    embeddings=embeddings,
    collection_name=file_path,
    connection=connection,
    use_jsonb=True,
)

loader = PyMuPDF4LLMLoader(
    file_path,
    mode="page",
    extract_images=False,
)

for page in loader.lazy_load():
    # Create a unique identifier for this page based on file path and page number
    page_id = f"{page.metadata.get('file_path', file_path)}_page_{page.metadata.get('page', 'unknown')}"
    
    # Check if document with this ID already exists
    try:
        # Try to get document by ID
        existing_doc = vector_store.get_by_id(page_id)
        if existing_doc:
            print(f"Skipping existing page: {page_id}")
            continue
    except Exception as e:
        # Document doesn't exist, so we can add it
        pass
    
    # Add the new document
    document = Document(id=page_id, page_content=page.page_content, metadata=page.metadata)
    vector_store.add_documents([document])
    print(f"Added page: {page_id}")

results = vector_store.similarity_search("Prompt Engineering")

print(results)