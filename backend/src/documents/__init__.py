from flask import Blueprint

bp = Blueprint('documents', __name__)

from . import routes