from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from .config import Config
from .documents import bp as documents_bp
from .chat import bp as chat_bp
from .database import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for all routes with explicit configuration
    CORS(app, 
         origins="*",
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=False)
    
    # Global OPTIONS handler for preflight requests
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = jsonify()
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "*")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response
    
    with app.app_context():
        app.register_blueprint(documents_bp)
        app.register_blueprint(chat_bp)

        db.init_app(app)
        migrate = Migrate(app, db)
    
    return app
