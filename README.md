# Document Examination System

A full-stack document processing and chat application that uses RAG (Retrieval-Augmented Generation) to enable intelligent conversations with PDF documents. Built with React frontend, Flask backend, and PostgreSQL with vector search capabilities.

## Features

- **Document Upload**: Upload PDF documents with automatic text extraction and processing
- **Vector Embeddings**: Generate embeddings using Ollama's nomic-embed-text model
- **Document Chat**: Ask questions about uploaded documents using RAG with llama3.2
- **Document Management**: View and manage uploaded documents with metadata
- **Responsive UI**: Modern React interface with Tailwind CSS

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software

1. **Python 3.12+**
   - Download from [python.org](https://www.python.org/downloads/)
   - Verify installation: `python --version`

2. **Poetry** (Python dependency management)
   - Install via official installer: `curl -sSL https://install.python-poetry.org | python3 -`
   - Or via pip: `pip install poetry`
   - Verify installation: `poetry --version`

3. **Node.js 18+** and **npm**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

4. **Docker** (for PostgreSQL database)
   - Download from [docker.com](https://www.docker.com/get-started)
   - Verify installation: `docker --version`

5. **Ollama** (for AI models)
   - Download from [ollama.ai](https://ollama.ai/)
   - Verify installation: `ollama --version`

6. **Make** (for running Makefile commands)
   - **Linux/macOS**: Usually pre-installed
   - **Windows**: Choose one of the following options:
     - **Option 1 - Chocolatey**: `choco install make`
     - **Option 2 - Scoop**: `scoop install make`
     - **Option 3 - Git Bash**: Use Git for Windows which includes make
     - **Option 4 - WSL**: Use Windows Subsystem for Linux
     - **Option 5 - Manual**: Run commands directly instead of using `make`

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd document-exam
```

### 2. Set Up the Database

Start PostgreSQL with pgvector extension using Docker:

```bash
make setup-database
```

This runs:
```bash
docker run --name document-exam-db \
  -e POSTGRES_USER=langchain \
  -e POSTGRES_PASSWORD=langchain \
  -e POSTGRES_DB=langchain \
  -p 50003:5432 \
  -d pgvector/pgvector:pg16
```

For subsequent runs, use:
```bash
make "start database"  # Start existing container
make "stop database"   # Stop container
```

**Alternative Docker commands** (if not using Make):
```bash
# Initial setup
docker run --name document-exam-db -e POSTGRES_USER=langchain -e POSTGRES_PASSWORD=langchain -e POSTGRES_DB=langchain -p 50003:5432 -d pgvector/pgvector:pg16

# Start existing container
docker start document-exam-db

# Stop container
docker stop document-exam-db
```

### 3. Set Up Ollama Models

Download the required AI models:

```bash
# Download embedding model
ollama pull nomic-embed-text

# Download chat model  
ollama pull llama3.2
```

### 4. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
poetry install
```

Setup the venv:
```bash
poetry env activate
<copy and paste the output to run the activate script>
```


Set up the database tables:

```bash
# Run database migrations
poetry run flask db upgrade
```

### 5. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```


## Running the Application

### Quick Start (Just Want to Run the Project)

If you just want to run the project without making any changes, use Docker Compose. This approach only requires Docker and Ollama with the required models:

**Prerequisites:**
- Docker and Docker Compose
- Ollama with models: `ollama pull nomic-embed-text` and `ollama pull llama3.2`

**Run the application:**
```bash
# Run all services (frontend, backend, database)
make run-docker

# Or run in background/detached mode
make run-docker-detached

# View logs
make logs-docker

# Stop services
make stop-docker

# Remove services
make remove-docker
```

**Access the application:**
- **Frontend**: http://localhost:50002
- **Backend API**: http://localhost:50001
- **Database**: PostgreSQL on localhost:50003 (database: langchain, username: langchain, password: langchain)

### Local Development Setup

For development work, you can run both frontend and backend using the provided Makefile commands:

```bash
# Terminal 1: Start backend (requires the venv to be active)
make run-backend

# Terminal 2: Start frontend  
make run-frontend
```

### Manual Startup

Alternatively, start each service manually:

**Backend (Terminal 1):**
```bash
cd backend
poetry run flask run  # Runs on default port 5000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev  # Runs on default port 5173
```

### Access the Application

**When running with Docker:**
- **Frontend**: http://localhost:50002
- **Backend API**: http://localhost:50001
- **Database**: PostgreSQL on localhost:50003 (database: langchain, username: langchain, password: langchain)

**When running locally:**
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:5000 (Flask default)
- **Database**: PostgreSQL on localhost:50003 (database: langchain, username: langchain, password: langchain)

## Usage

1. **Upload Documents**: Navigate to the Documents page and upload PDF files
2. **View Documents**: See all uploaded documents with processing status and metadata
3. **Chat with Documents**: Go to the Chat page, select a document, and ask questions
4. **Document Processing**: PDFs are automatically processed into embeddings and stored in the vector database

## Development

### Backend Development

```bash
cd backend

# Run with debug mode
poetry run flask run -p 50001 --debug

# Create new migration
poetry run flask db migrate -m "Description of changes"

# Apply migrations
poetry run flask db upgrade
```

### Frontend Development

```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

### Database Management

```bash
# View running containers
docker ps

# View database logs
docker logs document-exam-db

# Connect to database (optional)
docker exec -it document-exam-db psql -U langchain -d langchain
```

## Configuration

### Backend Configuration

Key settings in `backend/src/config.py`:

```python
# Database
DATABASE_URL = "postgresql+psycopg://langchain:langchain@localhost:50003/langchain"

# File uploads
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB
ALLOWED_EXTENSIONS = {'pdf'}

# AI Models
EMBEDDINGS_MODEL = "nomic-embed-text"
CHAT_MODEL = "llama3.2"
```

### Frontend Configuration

Environment variables in `frontend/.env`:

```bash
VITE_BACKEND_URL=http://localhost:50001
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure Docker is running: `docker ps`
   - Start database: `make start-database`

2. **Ollama Models Not Found**
   - Download models: `ollama pull nomic-embed-text` and `ollama pull llama3.2`
   - Check Ollama is running and models are available: `ollama list`

3. **Port Already in Use**
   - Backend (50001): Check for existing Flask processes
   - Frontend (50002): Check for existing Vite processes
   - Database (50003): Check for existing Docker containers

4. **Poetry Installation Issues**
   - Update Poetry: `poetry self update`
   - Clear cache: `poetry cache clear --all pypi`

5. **Node/npm Issues**
   - Clear cache: `npm cache clean --force`
   - Delete node_modules: `rm -rf node_modules && npm install`

### Development Tips

- Use `poetry run` to execute commands in the Python virtual environment
- Backend API endpoints are prefixed with `/documents` and `/chat`
- Frontend uses React Router for navigation
- Database migrations are automatically applied on startup
- PDF files are deleted after processing to save disk space

## Project Structure

```
document-exam/
├── backend/           # Flask API server
│   ├── src/          # Application source code
│   ├── migrations/   # Database migrations
│   └── uploads/      # Temporary file uploads
├── frontend/         # React SPA
│   ├── src/         # Application source code
│   └── dist/        # Production build
├── Makefile         # Development commands
└── CLAUDE.md        # Development guidance
```

## License

[Add your license information here]
