// src/JsonViewer.js
import React from 'react';

function JsonViewer({ jsonContent }) {
  return (
    <div>
      <h1>Generated JSON Data</h1>
      <pre>{JSON.stringify(jsonContent, null, 2)}</pre>
    </div>
  );
}

export default JsonViewer;
