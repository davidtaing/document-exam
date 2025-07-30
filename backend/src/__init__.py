from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from .config import Config
from .documents import bp as documents_bp
from .database import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for all routes
    CORS(app)
    
    with app.app_context():
        app.register_blueprint(documents_bp, url_prefix='/documents')

        db.init_app(app)
        migrate = Migrate(app, db)
    
    return app
