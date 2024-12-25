// src/graphql/ProcessGroupSection.jsx

import React, { useState } from 'react';
import { GRAPHQL_ENDPOINT, CREATE_PROCESS_GROUP_MUTATION } from './queries_old';

const ProcessGroupSection = () => {
  const [groupStatus, setGroupStatus] = useState(null);

  const handleCreateProcessGroup = async () => {
    setGroupStatus('Processing...');
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: CREATE_PROCESS_GROUP_MUTATION,
          variables: { name: "p1" },
        }),
      });

      const result = await response.json();
      if (result.data.createProcessGroup.error) {
        setGroupStatus(`Error: ${result.data.createProcessGroup.error}`);
      } else {
        setGroupStatus('Process group "p1" created successfully.');
      }
    } catch (error) {
      setGroupStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section style={styles.section}>
      <h2>Create Process Group "p1"</h2>
      <button onClick={handleCreateProcessGroup} style={styles.button}>
        Add Process Group p1
      </button>
      {groupStatus && <p>{groupStatus}</p>}
    </section>
  );
};

const styles = {
  section: {
    marginBottom: '40px',
    border: '1px solid #ccc',
    padding: '20px',
    borderRadius: '8px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#FFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default ProcessGroupSection;
