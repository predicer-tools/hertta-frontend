// src/InputDataSender.js

import React, { useState } from 'react';
import ResultCard from './ResultCard';

function InputDataSender({ jsonContent }) {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to start the optimization task
  const handleSendData = async () => {
    try {
      if (!jsonContent || Object.keys(jsonContent).length === 0) {
        console.error('No JSON content generated');
        setError('No JSON content generated');
        return;
      }

      // Define query parameters based on your optimization options
      const params = new URLSearchParams({
        fetch_time_data: 'true',          // Example: 'true' or 'false'
        fetch_weather_data: 'true',       // Example: 'true' or 'false'
        fetch_elec_data: 'elering',       // Example: 'elering' or 'entsoe'
        country: 'Finland',               // Replace with dynamic values if needed
        location: 'Helsinki',             // Replace with dynamic values if needed
      });

      setIsProcessing(true);

      // Correct the URL to use `localhost`
      const response = await fetch(`http://localhost:3030/api/optimize?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonContent), // Ensure jsonContent is valid
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResults(data);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <button onClick={handleSendData} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Send Data'}
      </button>
      {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
      {results && <ResultCard results={results} />}
    </div>
  );
}

export default InputDataSender;
