import React from 'react';

function InputDataSender({ jsonContent }) {
  const handleSendData = async () => {
    try {
      if (!jsonContent) {
        console.error('No JSON content generated');
        return;
      }

      const response = await fetch('http://localhost:8000/process_json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonContent), // Ensure jsonContent is stringified here
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Backend response:', result);
        // Handle backend response if needed
      } else {
        console.error('Failed to send JSON data to the backend');
      }
    } catch (error) {
      console.error('Error sending JSON data:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSendData}>Send Data</button>
    </div>
  );
}

export default InputDataSender;
