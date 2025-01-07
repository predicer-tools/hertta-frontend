// src/components/Modal/ProcessModal.jsx
import React from 'react';
// [CHANGED] Use your custom Modal component
import Modal from './Modal';

const ProcessModal = ({
  isOpen,
  onClose,
  onSubmit,
  processForm,
  onChange,
  loading,
  error,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Create a New Process</h2>
      {error && (
        <p style={{ color: 'red' }}>
          Error: {error.message}
        </p>
      )}
      <form onSubmit={onSubmit}>
        {/* Process Name */}
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={processForm.name}
              onChange={onChange}
              required
            />
          </label>
        </div>

        {/* Conversion (an enum) */}
        <div>
          <label>
            Conversion:
            <select
              name="conversion"
              value={processForm.conversion}
              onChange={onChange}
            >
              <option value="UNIT">UNIT</option>
              <option value="MWH">MWH</option>
              {/* Add any other valid enum values if your schema supports them */}
            </select>
          </label>
        </div>

        {/* Example checkbox fields */}
        <div>
          <label>
            isCfFix:
            <input
              type="checkbox"
              name="isCfFix"
              checked={processForm.isCfFix}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            isOnline:
            <input
              type="checkbox"
              name="isOnline"
              checked={processForm.isOnline}
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
              checked={processForm.isRes}
              onChange={onChange}
            />
          </label>
        </div>

        {/* Numeric fields */}
        <div>
          <label>
            Efficiency (eff):
            <input
              type="number"
              step="0.01"
              name="eff"
              value={processForm.eff}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            LoadMin:
            <input
              type="number"
              step="0.01"
              name="loadMin"
              value={processForm.loadMin}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            LoadMax:
            <input
              type="number"
              step="0.01"
              name="loadMax"
              value={processForm.loadMax}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            StartCost:
            <input
              type="number"
              step="0.01"
              name="startCost"
              value={processForm.startCost}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            minOnline:
            <input
              type="number"
              step="0.01"
              name="minOnline"
              value={processForm.minOnline}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            maxOnline:
            <input
              type="number"
              step="0.01"
              name="maxOnline"
              value={processForm.maxOnline}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            minOffline:
            <input
              type="number"
              step="0.01"
              name="minOffline"
              value={processForm.minOffline}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            maxOffline:
            <input
              type="number"
              step="0.01"
              name="maxOffline"
              value={processForm.maxOffline}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            initialState:
            <input
              type="checkbox"
              name="initialState"
              checked={processForm.initialState}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            isScenarioIndependent:
            <input
              type="checkbox"
              name="isScenarioIndependent"
              checked={processForm.isScenarioIndependent}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            cf:
            <input
              type="number"
              step="0.01"
              name="cf"
              value={processForm.cf}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            effTs:
            <input
              type="number"
              step="0.01"
              name="effTs"
              value={processForm.effTs}
              onChange={onChange}
            />
          </label>
        </div>

        {/* Form Buttons */}
        <div style={{ marginTop: '20px' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Process'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProcessModal;
