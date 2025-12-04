# mock-backend/app/weather.py

from flask import Blueprint, request, jsonify
import pandas as pd
from fmiopendata.wfs import download_stored_query
import datetime
from flask_cors import CORS

weather_bp = Blueprint('weather', __name__)

def collect_data(start_time, end_time, place):
    """
    Collect weather data from FMI Open Data API.

    Args:
        start_time (str): Start time in ISO format (e.g., "2023-10-01T00:00:00Z").
        end_time (str): End time in ISO format (e.g., "2023-10-02T00:00:00Z").
        place (str): Place name (e.g., "Helsinki").

    Returns:
        dict: Raw data from the API.
    """
    collection_string = "fmi::forecast::harmonie::surface::point::multipointcoverage"
    parameters = ["Temperature"]
    parameters_str = ','.join(parameters)

    snd = download_stored_query(
        collection_string,
        args=[
            "place=" + place,
            "starttime=" + start_time,
            "endtime=" + end_time,
            "parameters=" + parameters_str
        ]
    )

    return snd.data

def reshape_dict(data):
    """
    Reshape the raw data into a list of dictionaries with time and temperature values.

    Args:
        data (dict): Raw data from the API.

    Returns:
        list: List of dictionaries containing 'time' and 'value'.
    """
    values_list = []
    for time_key in data:
        # Convert time_key to string if it's a datetime object
        if isinstance(time_key, datetime.datetime):
            time_str = time_key.isoformat() + 'Z'  # Append 'Z' to indicate UTC
        else:
            time_str = str(time_key)
        
        for location_data in data[time_key].values():
            for param_data in location_data.values():
                value = param_data.get("value")
                if isinstance(value, (float, int)):  # Ensure the value is numeric
                    values_list.append({
                        'time': time_str,
                        'value': value
                    })
    return values_list

@weather_bp.route('/get_weather_data', methods=['GET'])
def get_weather_data():
    """
    Endpoint to get weather data.

    Query Parameters:
        - start_time: Start time in ISO format.
        - end_time: End time in ISO format.
        - place: Place name.

    Returns:
        JSON response containing weather data or error messages.
    """
    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')
    place = request.args.get('place')

    # Check for missing parameters
    if not all([start_time, end_time, place]):
        return jsonify({'error': 'Bad Request: Missing parameters.'}), 400

    try:
        # Collect and reshape data to return the time and values
        data = collect_data(start_time, end_time, place)
        values_list = reshape_dict(data)

        # Construct the response with times and values
        response_data = {
            'place': place,
            'weather_values': values_list
        }

        return jsonify(response_data), 200
    except Exception as e:
        # Handle any exceptions during data collection
        return jsonify({'error': f'Internal Server Error: {str(e)}'}), 500
