# mock-backend/app/electricity.py

from flask import Blueprint, jsonify
import requests
from datetime import datetime, timedelta, timezone
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

electricity_bp = Blueprint('electricity', __name__)

@electricity_bp.route('/api/electricity-prices', methods=['GET'])
def get_electricity_prices():
    """
    Endpoint to fetch electricity prices for the 'fi' (Finland) region.

    Returns:
        JSON response containing success status and electricity prices data.
    """
    prices = fetch_electricity_prices()
    if prices is not None:
        return jsonify({
            'success': True,
            'data': prices
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Failed to fetch electricity prices.'
        }), 500

def fetch_electricity_prices():
    """
    Fetches electricity prices for the 'fi' (Finland) region from the Elering API.

    Returns:
        list: A list of dictionaries containing 'time' and 'price' for each hour.
    """
    # Define the API endpoint
    api_url = "https://dashboard.elering.ee/api/nps/price"

    # Calculate the current UTC time and the time 12 hours ahead
    now = datetime.now(timezone.utc)
    end_time = now + timedelta(hours=12)

    # Format the times in ISO 8601 format with milliseconds to match API requirements
    start_time_str = now.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    end_time_str = end_time.strftime("%Y-%m-%dT%H:%M:%S.000Z")

    # Set up the parameters for the API request
    params = {
        "start": start_time_str,
        "end": end_time_str
    }

    logger.info(f"Fetching electricity prices from {start_time_str} to {end_time_str}")

    try:
        # Make the API request
        response = requests.get(api_url, params=params, headers={"accept": "*/*"})
        response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse the JSON response
        data = response.json()

        logger.debug(f"API Response: {data}")

        # Check if the API call was successful
        if not data.get("success", False):
            logger.error("Elering API returned unsuccessful response.")
            return None

        # Extract the 'fi' prices
        fi_prices = data.get("data", {}).get("fi", [])

        if not fi_prices:
            logger.warning("No 'fi' prices found in the API response.")
            return None

        # Initialize a list to store the results
        results = []

        # Iterate over the next 12 hours
        for i in range(12):
            hour_time = now + timedelta(hours=i)
            # Format with milliseconds to match API timestamps
            hour_str = hour_time.strftime("%Y-%m-%dT%H:%M:%S.000Z")

            # Find the price for the current hour
            price_info = next((item for item in fi_prices if item["timestamp"] == hour_str), None)

            if price_info:
                price = price_info.get("price", "N/A")
                logger.debug(f"Found price for {hour_str}: {price} €/MWh")
            else:
                price = "N/A"
                logger.warning(f"No price found for {hour_str}")

            # Append the result
            results.append({
                "time": hour_str,
                "price": price
            })

        return results

    except requests.RequestException as e:
        logger.error(f"An error occurred while fetching electricity prices: {e}")
        return None
