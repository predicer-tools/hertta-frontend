import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PROCESS_MUTATION } from './queries';

/**
 * Component for adding a new process.  This form only asks the user for the
 * process name and efficiency, and it supplies sensible defaults for all
 * other required fields defined by the GraphQL `NewProcess` input type.
 */
const AddProcess = () => {
  // State for the form fields
  const [processData, setProcessData] = useState({ name: '', eff: '' });

  // State for validation errors
  const [errors, setErrors] = useState([]);

  // useMutation hook with callbacks for completion and error handling
  const [createProcess, { loading, error }] = useMutation(CREATE_PROCESS_MUTATION, {
    onCompleted: (data) => {
      if (data?.createProcess?.errors && data.createProcess.errors.length > 0) {
        setErrors(data.createProcess.errors);
      } else {
        // Reset form and clear errors on success
        setProcessData({ name: '', eff: '' });
        setErrors([]);
        alert('Process created successfully!');
        window.dispatchEvent(new Event('dataChanged'));
      }
    },
    onError: (err) => {
      console.error('Mutation error:', err);
      setErrors([{ field: 'general', message: 'An unexpected error occurred.' }]);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProcessData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Construct the input according to the NewProcess schema
    const input = {
      name: processData.name,
      conversion: 'UNIT',      // enum value
      isCfFix: false,
      isOnline: false,
      isRes: false,
      eff: parseFloat(processData.eff),
      loadMin: 0.0,
      loadMax: 0.0,
      startCost: 0.0,
      minOnline: 0.0,
      maxOnline: 0.0,
      minOffline: 0.0,
      maxOffline: 0.0,
      initialState: false,
      isScenarioIndependent: false,
      cf: [],                  // empty array for ValueInput list
      effTs: [],               // empty array for ValueInput list
    };

    // Execute the mutation
    createProcess({ variables: { process: input } });
  };

  return (
    <div>
      <h2>Add New Process</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label><br />
          <input
            type="text"
            id="name"
            name="name"
            value={processData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="eff">Efficiency:</label><br />
          <input
            type="number"
            id="eff"
            name="eff"
            value={processData.eff}
            onChange={handleChange}
            required
            step="0.01"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Process'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>An unexpected error occurred.</p>}
      {errors.length > 0 && (
        <div style={{ color: 'red' }}>
          <h3>Errors:</h3>
          <ul>
            {errors.map((err, index) => (
              <li key={index}>
                {err.field}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AddProcess;
