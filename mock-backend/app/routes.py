import requests
from flask import Blueprint, jsonify, request

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
    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')

    if not start_time or not end_time:
        return jsonify({"error": "start_time and end_time are required parameters"}), 400

    api_url = f"https://dashboard.elering.ee/api/nps/price?start={start_time}&end={end_time}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        return jsonify(data), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

main_bp.register_blueprint(weather_bp)
main_bp.register_blueprint(mock_homeassistant_bp)
