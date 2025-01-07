import React from 'react';
import Modal from './Modal'; // <--- your custom Modal component

const NodeModal = ({
  isOpen,
  onClose,
  onSubmit,
  nodeForm,
  onChange,
  loading,
  error,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Create a New Node</h2>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}

      <form onSubmit={onSubmit}>
        {/* Node name */}
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={nodeForm.name}
              onChange={onChange}
              required
            />
          </label>
        </div>

        {/* Example boolean fields */}
        <div>
          <label>
            isCommodity:
            <input
              type="checkbox"
              name="isCommodity"
              checked={nodeForm.isCommodity}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            isMarket:
            <input
              type="checkbox"
              name="isMarket"
              checked={nodeForm.isMarket}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            isRes:
            <input
              type="checkbox"
              name="isRes"
              checked={nodeForm.isRes}
              onChange={onChange}
            />
          </label>
        </div>

        {/* Example numeric fields */}
        <div>
          <label>
            Cost:
            <input
              type="number"
              step="0.01"
              name="cost"
              value={nodeForm.cost}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            Inflow:
            <input
              type="number"
              step="0.01"
              name="inflow"
              value={nodeForm.inflow}
              onChange={onChange}
            />
          </label>
        </div>

        {/* Buttons */}
        <div style={{ marginTop: '20px' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Node'}
          </button>
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NodeModal;
