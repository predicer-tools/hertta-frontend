// src/graphql/ManageInputData.jsx

import React, { useEffect, useState } from 'react';
import ClearInputDataSection from './ClearInputDataSection';
import InputDataSetupSection from './InputDataSetupSection';
import MarketSection from './MarketSection';
import NodeSection from './NodeSection';
import ProcessGroupSection from './ProcessGroupSection';
import RiskSection from './RiskSection';
import ScenarioSection from './ScenarioSection';

const GRAPHQL_ENDPOINT = 'http://localhost:3030/graphql'; // Adjust if needed

// A simple query to get all nodes from the model's input data
const GET_NODES_QUERY = `
  query {
    model {
      inputData {
        nodes {
          name
        }
      }
    }
  }
`;

const ManageInputData = () => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all nodes to see what was added
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: GET_NODES_QUERY }),
        });
        const result = await response.json();
        if (result.errors) {
          setError(result.errors.map(e => e.message).join(', '));
        } else {
          setNodes(result.data.model.inputData.nodes);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, []);

  return (
    <div style={styles.container}>
      <h1>Manage Input Data</h1>
      <ClearInputDataSection />
      <InputDataSetupSection />
      <MarketSection />
      <NodeSection />
      <ProcessGroupSection />
      <RiskSection />
      <ScenarioSection />

      <h2>Current Nodes (from GraphQL Response)</h2>
      {loading && <p>Loading nodes...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <ul>
          {nodes.map((node) => (
            <li key={node.name}>{node.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
};

export default ManageInputData;
