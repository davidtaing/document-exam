from flask import Blueprint

bp = Blueprint('chat', __name__, url_prefix='/api/chat')

from src.chat import routes