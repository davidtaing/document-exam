# Run full stack with Docker Compose
run-docker:
	docker compose up --build

# Run full stack in background
run-docker-detached:
	docker compose up --build -d

# Stop Docker Compose services
stop-docker:
	docker compose stop

# Remove Docker Compose services
remove-docker:
	docker compose down

# View Docker Compose logs
logs-docker:
	docker compose logs -f

# Run backend only (local development)
run-backend:
	cd backend && flask run -p 50001

# Run frontend only (local development)
run-frontend:
	cd frontend && npm run dev

# Setup database (standalone - use run-docker instead)
setup-database:
	docker run --name document-exam-db \
	  -e POSTGRES_USER=langchain \
	  -e POSTGRES_PASSWORD=langchain \
	  -e POSTGRES_DB=langchain \
	  -p 50003:5432 \
	  -d pgvector/pgvector:pg16

# Start standalone database
start-database:
	docker start document-exam-db

# Stop standalone database
stop-database:
	docker stop document-exam-db
