from flask import Flask
from .config import Config
from .documents import bp as documents_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    with app.app_context():
        app.register_blueprint(documents_bp, url_prefix='/documents')
    
    return app