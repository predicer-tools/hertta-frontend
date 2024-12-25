import React, { useEffect, useState, useCallback } from 'react';

const GRAPHQL_ENDPOINT = 'http://localhost:3030/graphql';

// Query to fetch all model components
const GET_MODEL_QUERY = `
  query {
    model {
      inputData {
        processes {
          name
          conversion
          isOnline
        }
        nodes {
          name
          isCommodity
        }
        markets {
          name
          mType
        }
        scenarios {
          name
          weight
        }
        processGroups {
          name
          members {
            name
          }
        }
      }
    }
  }
`;

const AddedModel = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModelData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_MODEL_QUERY }),
      });
      const result = await response.json();
      if (result.errors) {
        setError(result.errors.map((e) => e.message).join(', '));
      } else {
        setData(result.data.model.inputData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModelData();

    const handleDataChanged = () => fetchModelData();
    window.addEventListener('dataChanged', handleDataChanged);
    return () => window.removeEventListener('dataChanged', handleDataChanged);
  }, [fetchModelData]);

  return (
    <div style={styles.container}>
      <h2>Model Components</h2>
      {loading && <p>Loading model data...</p>}
      {error && <p style={styles.error}>Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* Processes */}
          <h3>Processes</h3>
          {data.processes?.length > 0 ? (
            <ul>
              {data.processes.map((process) => (
                <li key={process.name}>
                  {process.name} - Conversion: {process.conversion}, Online: {process.isOnline ? 'Yes' : 'No'}
                </li>
              ))}
            </ul>
          ) : (
            <p>No processes available.</p>
          )}

          {/* Nodes */}
          <h3>Nodes</h3>
          {data.nodes?.length > 0 ? (
            <ul>
              {data.nodes.map((node) => (
                <li key={node.name}>
                  {node.name} - Commodity: {node.isCommodity ? 'Yes' : 'No'}
                </li>
              ))}
            </ul>
          ) : (
            <p>No nodes available.</p>
          )}

          {/* Markets */}
          <h3>Markets</h3>
          {data.markets?.length > 0 ? (
            <ul>
              {data.markets.map((market) => (
                <li key={market.name}>
                  {market.name} - Type: {market.mType}
                </li>
              ))}
            </ul>
          ) : (
            <p>No markets available.</p>
          )}

          {/* Scenarios */}
          <h3>Scenarios</h3>
          {data.scenarios?.length > 0 ? (
            <ul>
              {data.scenarios.map((scenario) => (
                <li key={scenario.name}>
                  {scenario.name} - Weight: {scenario.weight}
                </li>
              ))}
            </ul>
          ) : (
            <p>No scenarios available.</p>
          )}

          {/* Process Groups */}
          <h3>Process Groups</h3>
          {data.processGroups?.length > 0 ? (
            <ul>
              {data.processGroups.map((group) => (
                <li key={group.name}>
                  {group.name} - Members: {group.members.map((m) => m.name).join(', ')}
                </li>
              ))}
            </ul>
          ) : (
            <p>No process groups available.</p>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '10px',
    border: '1px solid #ddd',
    marginTop: '20px',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
  },
  error: {
    color: 'red',
  },
};

export default AddedModel;
