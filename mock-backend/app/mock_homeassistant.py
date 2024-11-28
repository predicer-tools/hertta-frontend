# mock-backend/app/mock_homeassistant.py

from flask import Blueprint, request, jsonify

mock_homeassistant_bp = Blueprint('mock_homeassistant', __name__)

# Mock API key for validation
MOCK_API_KEY = "mock-api-key-12345"

# Mock sensors and devices data
SENSORS = [
    {
        "entity_id": "sensor.temperature_living_room",
        "state": "22.5",
        "attributes": {
            "friendly_name": "Living Room Temperature",
            "unit_of_measurement": "°C"
        }
    },
    {
        "entity_id": "sensor.humidity_kitchen",
        "state": "45",
        "attributes": {
            "friendly_name": "Kitchen Humidity",
            "unit_of_measurement": "%"
        }
    }
]

DEVICES = [
    {
        "entity_id": "switch.shelly_switch_1",
        "state": "on",
        "attributes": {
            "friendly_name": "Shelly Switch 1"
        }
    },
    {
        "entity_id": "switch.shelly_switch_2",
        "state": "off",
        "attributes": {
            "friendly_name": "Shelly Switch 2"
        }
    }
]

@mock_homeassistant_bp.route('/mock-homeassistant/connect', methods=['POST'])
def connect_to_homeassistant():
    """
    Simulates connection to a mock Home Assistant server.
    """
    data = request.get_json()
    if not data or 'apiKey' not in data:
        return jsonify({
            "success": False,
            "error": "Missing API key in the request."
        }), 400

    if data['apiKey'] == MOCK_API_KEY:
        return jsonify({
            "success": True,
            "message": "Connected to Home Assistant successfully!"
        }), 200
    else:
        return jsonify({
            "success": False,
            "error": "Could not connect to Home Assistant. Check your API key and Wi-Fi connection."
        }), 401

@mock_homeassistant_bp.route('/mock-homeassistant/sensors', methods=['GET'])
def fetch_sensors():
    """
    Simulates fetching sensors from Home Assistant.
    """
    return jsonify(SENSORS)

@mock_homeassistant_bp.route('/mock-homeassistant/devices', methods=['GET'])
def fetch_devices():
    """
    Simulates fetching devices from Home Assistant.
    """
    return jsonify(DEVICES)
