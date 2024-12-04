from flask import Blueprint, jsonify
import requests
from .weather import weather_bp
from .mock_homeassistant import mock_homeassistant_bp

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/mock-data', methods=['GET'])
def get_mock_data():
    data = {
        'message': 'This is mock data from the backend!',
        'status': 'success',
        'data': {
            'temperature': 22,
            'humidity': 45
        }
    }
    return jsonify(data)

@main_bp.route('/api/electricity-prices', methods=['GET'])
def get_electricity_prices():
    api_url = "https://dashboard.elering.ee/api/nps/price?start=2024-12-04T00%3A00%3A00.000Z&end=2024-12-04T12%3A00%3A00.000Z"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        return jsonify(data), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

main_bp.register_blueprint(weather_bp)
main_bp.register_blueprint(mock_homeassistant_bp)
