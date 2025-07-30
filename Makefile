# Run backend only
run-backend:
	cd backend && flask run -p 50001

# Run frontend only  
run-frontend:
	cd frontend && npm run dev

setup-database:
	docker run --name document-exam-db \
	  -e POSTGRES_USER=langchain \
	  -e POSTGRES_PASSWORD=langchain \
	  -e POSTGRES_DB=langchain \
	  -p 50003:5432 \
	  -d pgvector/pgvector:pg16

start database:
	docker start document-exam-db

stop database:
	docker stop document-exam-db
