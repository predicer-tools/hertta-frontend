// src/graphql/ScenarioSection.jsx

import React, { useState } from 'react';
import { GRAPHQL_ENDPOINT, CREATE_SCENARIO_MUTATION } from './queries_old';

const ScenarioSection = () => {
  const [scenarioStatus, setScenarioStatus] = useState(null);

  // Predefined scenario values
  const scenarioName = "s1";
  const scenarioWeight = 1.0;

  const handleCreateScenario = async () => {
    setScenarioStatus('Processing...');
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: CREATE_SCENARIO_MUTATION,
          variables: { name: scenarioName, weight: scenarioWeight },
        }),
      });

      const result = await response.json();

      // Check for top-level GraphQL errors
      if (result.errors) {
        const errorMessages = result.errors.map(e => e.message).join(', ');
        setScenarioStatus(`GraphQL Errors: ${errorMessages}`);
        return;
      }

      // Check for MaybeError response
      if (result.data.createScenario.error) {
        setScenarioStatus(`Error: ${result.data.createScenario.error}`);
      } else {
        setScenarioStatus(`Scenario "${scenarioName}" created successfully.`);
      }
    } catch (error) {
      setScenarioStatus(`Error: ${error.message}`);
    }
  };

  return (
    <section style={styles.section}>
      <h2>Create Scenario "{scenarioName}"</h2>
      <button onClick={handleCreateScenario} style={styles.button}>
        Add Scenario "{scenarioName}"
      </button>
      {scenarioStatus && <p>{scenarioStatus}</p>}
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

export default ScenarioSection;
