// src/graphql/ManageInputData.jsx

import React, { useEffect, useState, useCallback } from 'react';
import ClearAllData from './ClearAllData'; // Import the updated component
import ClearInputDataSection from './ClearInputDataSection';
import InputDataSetupSection from './InputDataSetupSection';
import MarketSection from './MarketSection';
import NodeSection from './NodeSection';
import ProcessGroupSection from './ProcessGroupSection';
import RiskSection from './RiskSection';
import ScenarioSection from './ScenarioSection';

const GRAPHQL_ENDPOINT = 'http://localhost:3030/graphql'; // Adjust if needed

// Queries
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

const GET_DIFFUSIONS_QUERY = `
  query {
    model {
      inputData {
        nodeDiffusion {
          fromNode {
            name
          }
          toNode {
            name
          }
          coefficient
        }
      }
    }
  }
`;

const ManageInputData = () => {
  const [nodes, setNodes] = useState([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [nodesError, setNodesError] = useState(null);

  const [diffusions, setDiffusions] = useState([]);
  const [diffusionsLoading, setDiffusionsLoading] = useState(true);
  const [diffusionsError, setDiffusionsError] = useState(null);

  // Function to fetch all nodes
  const fetchNodes = useCallback(async () => {
    setNodesLoading(true);
    setNodesError(null);
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_NODES_QUERY }),
      });
      const result = await response.json();
      if (result.errors) {
        setNodesError(result.errors.map(e => e.message).join(', '));
      } else {
        setNodes(result.data.model.inputData.nodes);
      }
    } catch (err) {
      setNodesError(err.message);
    } finally {
      setNodesLoading(false);
    }
  }, []);

  // Function to fetch all diffusions
  const fetchDiffusions = useCallback(async () => {
    setDiffusionsLoading(true);
    setDiffusionsError(null);
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_DIFFUSIONS_QUERY }),
      });
      const result = await response.json();
      if (result.errors) {
        setDiffusionsError(result.errors.map(e => e.message).join(', '));
      } else {
        setDiffusions(result.data.model.inputData.nodeDiffusion);
      }
    } catch (err) {
      setDiffusionsError(err.message);
    } finally {
      setDiffusionsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial data fetch
    fetchNodes();
    fetchDiffusions();

    // Event listener for data changes
    const handleDataChanged = () => {
      fetchNodes();
      fetchDiffusions();
    };

    window.addEventListener('dataChanged', handleDataChanged);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('dataChanged', handleDataChanged);
    };
  }, [fetchNodes, fetchDiffusions]);

  // Function to reset frontend data (nodes and diffusions)
  const resetFrontendData = () => {
    setNodes([]);
    setDiffusions([]);
    setNodesError(null);
    setDiffusionsError(null);
    setNodesLoading(false);
    setDiffusionsLoading(false);
  };

  // Function to trigger node creation
  const triggerNodeCreation = () => {
    // Dispatch a custom event to trigger node creation in NodeSection.jsx
    window.dispatchEvent(new Event('runNodeCreation'));
  };

  return (
    <div style={styles.container}>
      <h1>Manage Input Data</h1>
      
      {/* Clear All Data Section */}
      <ClearAllData
        onClearFrontendData={resetFrontendData}
        onRunNodeCreation={triggerNodeCreation}
      />

      {/* Other Sections */}
      <ClearInputDataSection />
      <InputDataSetupSection />
      <MarketSection />
      <NodeSection />
      <ProcessGroupSection />
      <RiskSection />
      <ScenarioSection />

      {/* Display Current Nodes */}
      <h2>Current Nodes (from GraphQL Response)</h2>
      {nodesLoading && <p>Loading nodes...</p>}
      {nodesError && <p style={styles.error}>Error: {nodesError}</p>}
      {!nodesLoading && !nodesError && (
        <ul>
          {nodes.map((node) => (
            <li key={node.name}>{node.name}</li>
          ))}
        </ul>
      )}

      {/* Display Current Diffusions */}
      <h2>Current Diffusions (from GraphQL Response)</h2>
      {diffusionsLoading && <p>Loading diffusions...</p>}
      {diffusionsError && <p style={styles.error}>Error: {diffusionsError}</p>}
      {!diffusionsLoading && !diffusionsError && (
        <ul>
          {diffusions.map((diff, index) => (
            <li key={index}>
              {diff.fromNode.name} → {diff.toNode.name} (coefficient: {diff.coefficient})
            </li>
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
  error: {
    color: 'red',
  },
};

export default ManageInputData;
