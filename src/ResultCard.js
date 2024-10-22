import React from 'react';

const ResultCard = ({ results }) => {
  return (
    <div className="result-card">
      <h3>Results</h3>
      {results && results.length > 0 ? (
        <ul>
          {results.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </ul>
      ) : (
        <p>No data available yet.</p>
      )}
    </div>
  );
};

export default ResultCard;