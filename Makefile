# Run backend only
run-backend:
	cd backend && flask run -p 50001

# Run frontend only  
run-frontend:
	cd frontend && npm run dev
