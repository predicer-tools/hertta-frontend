// src/components/Modal/TopologyModal.jsx

import React, { useState } from 'react';
import Modal from './Modal';
import { useMutation, useQuery } from '@apollo/client';
import { GET_NODE_NAMES_QUERY, GET_PROCESS_NAMES_QUERY, CREATE_TOPOLOGY_MUTATION } from '../../graphql/queries.js';

const TopologyModal = ({ isOpen, onClose }) => {
  // Fetch existing nodes
  const { data: nodeData, loading: nodesLoading, error: nodesError } = useQuery(GET_NODE_NAMES_QUERY);

  // Fetch existing processes
  const { data: processData, loading: processesLoading, error: processesError } = useQuery(GET_PROCESS_NAMES_QUERY);

  // State for form inputs
  const [sourceNode, setSourceNode] = useState('');
  const [sinkNode, setSinkNode] = useState('');
  const [processName, setProcessName] = useState('');
  const [topology, setTopology] = useState({
    capacity: '',
    vomCost: '',
    rampUp: '',
    rampDown: '',
    initialLoad: '',
    initialFlow: '',
    capTs: '',
  });

  // Mutation for creating topology
  const [createTopology, { loading: mutationLoading, error: mutationError }] = useMutation(CREATE_TOPOLOGY_MUTATION, {
    onCompleted: (response) => {
      if (response.createTopology.errors.length === 0) {
        alert('Topology created successfully!');
        handleClose();
      } else {
        // Handle validation errors
        const errorMessages = response.createTopology.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('\n');
        alert(`Errors:\n${errorMessages}`);
      }
    },
    onError: (error) => {
      console.error('Create Topology Mutation Error:', error);
      alert('An unexpected error occurred while creating the topology.');
    },
  });

  const handleClose = () => {
    // Reset form fields when closing
    setSourceNode('');
    setSinkNode('');
    setProcessName('');
    setTopology({
      capacity: '',
      vomCost: '',
      rampUp: '',
      rampDown: '',
      initialLoad: '',
      initialFlow: '',
      capTs: '',
    });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!processName) {
      alert('Process Name is required.');
      return;
    }

    if (
      !topology.capacity ||
      !topology.vomCost ||
      !topology.rampUp ||
      !topology.rampDown ||
      !topology.initialLoad ||
      !topology.initialFlow ||
      !topology.capTs
    ) {
      alert('Please fill in all required topology fields.');
      return;
    }

    // Prepare variables for mutation
    const variables = {
      topology: {
        capacity: parseFloat(topology.capacity),
        vomCost: parseFloat(topology.vomCost),
        rampUp: parseFloat(topology.rampUp),
        rampDown: parseFloat(topology.rampDown),
        initialLoad: parseFloat(topology.initialLoad),
        initialFlow: parseFloat(topology.initialFlow),
        capTs: parseFloat(topology.capTs),
      },
      processName: processName,
      sourceNodeName: sourceNode || null,
      sinkNodeName: sinkNode || null,
    };

    // Trigger the mutation
    createTopology({ variables });
  };

  const isLoading = nodesLoading || processesLoading;
  const hasError = nodesError || processesError;

  if (isLoading) return <p>Loading...</p>;
  if (hasError)
    return (
      <p style={{ color: 'red' }}>
        Error loading data: {nodesError?.message || processesError?.message}
      </p>
    );

  const nodeOptions = nodeData.model.inputData.nodes.map((node) => (
    <option key={node.name} value={node.name}>
      {node.name}
    </option>
  ));

  const processOptions = processData.model.inputData.processes.map((process) => (
    <option key={process.name} value={process.name}>
      {process.name}
    </option>
  ));

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2>Add New Topology</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Process Name:</label>
          <select
            value={processName}
            onChange={(e) => setProcessName(e.target.value)}
            required
            style={styles.select}
          >
            <option value="">Select a Process</option>
            {processOptions}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Source Node:</label>
          <select
            value={sourceNode}
            onChange={(e) => setSourceNode(e.target.value)}
            style={styles.select}
          >
            <option value="">None</option>
            {nodeOptions}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Sink Node:</label>
          <select
            value={sinkNode}
            onChange={(e) => setSinkNode(e.target.value)}
            style={styles.select}
          >
            <option value="">None</option>
            {nodeOptions}
          </select>
        </div>

        {/* Topology Fields */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Capacity:</label>
          <input
            type="number"
            value={topology.capacity}
            onChange={(e) => setTopology({ ...topology, capacity: e.target.value })}
            required
            style={styles.input}
            placeholder="e.g., 100.0"
            step="0.01"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>VOM Cost:</label>
          <input
            type="number"
            value={topology.vomCost}
            onChange={(e) => setTopology({ ...topology, vomCost: e.target.value })}
            required
            style={styles.input}
            placeholder="e.g., 200.0"
            step="0.01"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Ramp Up:</label>
          <input
            type="number"
            value={topology.rampUp}
            onChange={(e) => setTopology({ ...topology, rampUp: e.target.value })}
            required
            style={styles.input}
            placeholder="e.g., 1.0"
            step="0.01"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Ramp Down:</label>
          <input
            type="number"
            value={topology.rampDown}
            onChange={(e) => setTopology({ ...topology, rampDown: e.target.value })}
            required
            style={styles.input}
            placeholder="e.g., 1.0"
            step="0.01"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Initial Load:</label>
          <input
            type="number"
            value={topology.initialLoad}
            onChange={(e) => setTopology({ ...topology, initialLoad: e.target.value })}
            required
            style={styles.input}
            placeholder="e.g., 50.0"
            step="0.01"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Initial Flow:</label>
          <input
            type="number"
            value={topology.initialFlow}
            onChange={(e) => setTopology({ ...topology, initialFlow: e.target.value })}
            required
            style={styles.input}
            placeholder="e.g., 20.0"
            step="0.01"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Cap TS:</label>
          <input
            type="number"
            value={topology.capTs}
            onChange={(e) => setTopology({ ...topology, capTs: e.target.value })}
            required
            style={styles.input}
            placeholder="e.g., 1.0"
            step="0.01"
          />
        </div>

        <button type="submit" disabled={mutationLoading} style={styles.submitButton}>
          {mutationLoading ? 'Creating...' : 'Create Topology'}
        </button>

        {/* Display mutation errors */}
        {mutationError && <p style={styles.error}>Error: {mutationError.message}</p>}
      </form>
    </Modal>
  );
};

// Basic styling
const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
    display: 'block',
  },
  input: {
    padding: '8px',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '8px',
    width: '100%',
    boxSizing: 'border-box',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default TopologyModal;
