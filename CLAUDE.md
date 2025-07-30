# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Flask + Poetry)
- `cd backend && flask run -p 50001` - Run backend server on port 50001
- `cd backend && flask db migrate -m "description"` - Create database migration
- `cd backend && flask db upgrade` - Apply database migrations
- `make run-backend` - Shortcut to run backend
- `make setup-database` - Start PostgreSQL with pgvector in Docker

### Frontend (React + Vite + TypeScript)
- `cd frontend && npm run dev` - Run development server with hot reload
- `cd frontend && npm run build` - Build for production (runs TypeScript check first)
- `cd frontend && npm run lint` - Run ESLint
- `cd frontend && npm run preview` - Preview production build
- `make run-frontend` - Shortcut to run frontend

### Database Setup
The application requires PostgreSQL with pgvector extension. Use `make setup-database` to run:
```bash
docker run --name document-exam-db \
  -e POSTGRES_USER=langchain \
  -e POSTGRES_PASSWORD=langchain \
  -e POSTGRES_DB=langchain \
  -p 50003:5432 \
  -d pgvector/pgvector:pg16
```

## Architecture Overview

### High-Level System
This is a document processing and chat application with RAG (Retrieval-Augmented Generation) capabilities:
- **Frontend**: React SPA with TypeScript, Tailwind CSS, and React Router
- **Backend**: Flask API with LangChain integration for document processing and chat
- **Database**: PostgreSQL with pgvector for vector embeddings storage
- **ML Models**: Ollama for embeddings (`nomic-embed-text`) and chat (`llama3.2`)

### Backend Structure
- **Flask Application Factory**: `src/__init__.py` creates the app with CORS and blueprint registration
- **Document Processing**: `src/documents/routes.py` handles PDF upload, parsing with PyMuPDF4LLM, and embedding storage in PGVector
- **Chat/RAG**: `src/chat/routes.py` implements retrieval-augmented generation using LangChain
- **Database Models**: SQLAlchemy models in `src/documents/models.py` for PGVector collections and embeddings
- **Migrations**: Flask-Migrate setup in `backend/migrations/` with Alembic

### Frontend Structure
- **Single Page App**: React Router with `/`, `/documents`, `/chat` routes
- **Components**: Dashboard, Documents (file upload/management), Chat (RAG interface), Sidebar navigation
- **Styling**: Tailwind CSS v4 with Vite plugin
- **Build**: Vite with TypeScript, ESLint configuration

### Key Integration Points
- **Document Flow**: Upload PDF → PyMuPDF4LLM parsing → Ollama embeddings → PGVector storage → Collection creation
- **Chat Flow**: User question → Vector similarity search in collection → LangChain prompt template → Ollama LLM → Response
- **API Communication**: Frontend calls Flask API at `localhost:50001`, CORS enabled for development

### Dependencies
- **Backend**: LangChain ecosystem (core, community, ollama, postgres), Flask, SQLAlchemy, pgvector
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons, React Router DOM

### Configuration
- Database URL: `postgresql+psycopg://langchain:langchain@localhost:50003/langchain`
- File uploads: 100MB limit, PDF only, stored in `backend/uploads/` (deleted after processing)
- Models: Configurable in `src/config.py` (embeddings: `nomic-embed-text`, chat: `llama3.2`)