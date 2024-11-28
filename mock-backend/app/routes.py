# mock-backend/app/routes.py

from flask import Blueprint, jsonify
from .weather import weather_bp
from .mock_homeassistant import mock_homeassistant_bp  # Import the mock_homeassistant blueprint

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/mock-data', methods=['GET'])
def get_mock_data():
    # Existing mock data endpoint
    data = {
        'message': 'This is mock data from the backend!',
        'status': 'success',
        'data': {
            'temperature': 22,
            'humidity': 45
        }
    }
    return jsonify(data)

# Register the weather blueprint
main_bp.register_blueprint(weather_bp)

# Register the mock_homeassistant blueprint
main_bp.register_blueprint(mock_homeassistant_bp)

# If your Flask app is defined elsewhere, ensure that `main_bp` is registered with the app.
# For example:
# from flask import Flask
# app = Flask(__name__)
# app.register_blueprint(main_bp)
