from flask import request, jsonify
from langchain_ollama import ChatOllama
from langchain_postgres import PGVector
from langchain_ollama import OllamaEmbeddings
from langchain_core.prompts import ChatPromptTemplate

from src.chat import bp
from src.config import Config


def get_retriever_for_collection(collection_name):
    """Get a retriever for a specific collection"""
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
    
    # Debug: Check if collection exists and has documents
    try:
        # Try basic similarity search first
        test_docs = vector_store.similarity_search("test", k=1)
        print(f"Debug: Collection '{collection_name}' has {len(test_docs)} documents in similarity search")
        
        # Check what collections exist in the database
        from src.database import db
        from src.documents.models import LangchainPgCollection
        collections = db.session.query(LangchainPgCollection.name).all()
        existing_collections = [c[0] for c in collections]
        print(f"Debug: Existing collections in DB: {existing_collections}")
        
    except Exception as debug_error:
        print(f"Debug: Error checking collection: {debug_error}")
    
    # Use simple similarity search instead of score threshold
    return vector_store.as_retriever()


def format_docs(docs):
    """Format retrieved documents for the prompt"""
    return "\n\n".join(doc.page_content for doc in docs)


@bp.route('/', methods=['POST', 'OPTIONS'])
def chat():
    """Chat with documents using RAG"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        question = data.get('question')
        collection_name = data.get('collection_name')
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        if not collection_name:
            return jsonify({'error': 'Collection name is required'}), 400
        
        # Initialize the LLM
        llm = ChatOllama(
            model=Config.CHAT_MODEL,
            temperature=0.8,
            base_url=Config.OLLAMA_BASE_URL
        )
        
        # Get retriever for the specified collection
        retriever = get_retriever_for_collection(collection_name)
        
        try:
            # Test retrieval
            retrieved_docs = retriever.invoke(question)
            print(f"Debug: Retrieved {len(retrieved_docs)} documents")
            
            context = format_docs(retrieved_docs)
            print(f"Debug: Context length: {len(context)}")
            
        except Exception as retrieval_error:
            print(f"Debug: Retrieval error: {retrieval_error}")
            return jsonify({
                'error': f'Retrieval error: {str(retrieval_error)}'
            }), 500
        
        # Create the prompt template
        prompt = ChatPromptTemplate.from_template("""You are a helpful assistant that answers questions based on the provided context from documents.

        Context:
        {context}

        Question: {question}

        Please provide a clear and accurate answer based on the context provided. If the answer cannot be found in the context, please say so.""")
        
        # Create the RAG chain - simplified approach
        try:
            # Format the prompt with context and question
            formatted_prompt = prompt.format(context=context, question=question)
            print(f"Debug: Formatted prompt length: {len(formatted_prompt)}")
            
            # Get answer from LLM
            answer = llm.invoke(formatted_prompt).content
            
        except Exception as llm_error:
            print(f"Debug: LLM error: {llm_error}")
            return jsonify({
                'error': f'LLM error: {str(llm_error)}'
            }), 500
        
        return jsonify({
            'answer': answer,
            'collection_name': collection_name,
            'question': question
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Chat error: {str(e)}'
        }), 500



