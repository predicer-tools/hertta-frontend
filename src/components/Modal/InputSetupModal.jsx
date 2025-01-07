// src/components/Modal/InputSetupModal.jsx

import React from 'react';
import Modal from './Modal'; // Adjust path to your actual Modal component

/**
 * Props:
 * @param {boolean} isOpen - Whether the modal is open/visible
 * @param {function} onClose - Function to close the modal (sets isOpen=false)
 * @param {boolean} loading - Whether a mutation is in progress (shows 'Saving...' on the button)
 * @param {object} error - Any GraphQL or network errors
 * @param {object} values - The entire input setup object
 * @param {function} onChange - Handler for updating form fields in the parent state
 * @param {function} onSubmit - Handler for final submission (e.g. calls updateInputDataSetup)
 */
const InputSetupModal = ({
  isOpen,
  onClose,
  loading,
  error,
  values,
  onChange,
  onSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Input Setup</h2>

      {/* If there's a mutation/network error, display it */}
      {error && <p style={styles.error}>Error: {error.message}</p>}

      <form onSubmit={onSubmit} style={styles.form}>

        {/* 1) containsReserves */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="containsReserves"
              checked={values.containsReserves}
              onChange={onChange}
            />
            Contains Reserves
          </label>
        </div>

        {/* 2) containsOnline */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="containsOnline"
              checked={values.containsOnline}
              onChange={onChange}
            />
            Contains Online
          </label>
        </div>

        {/* 3) containsStates */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="containsStates"
              checked={values.containsStates}
              onChange={onChange}
            />
            Contains States
          </label>
        </div>

        {/* 4) containsPiecewiseEff */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="containsPiecewiseEff"
              checked={values.containsPiecewiseEff}
              onChange={onChange}
            />
            Contains Piecewise Efficiency
          </label>
        </div>

        {/* 5) containsRisk */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="containsRisk"
              checked={values.containsRisk}
              onChange={onChange}
            />
            Contains Risk
          </label>
        </div>

        {/* 6) containsDiffusion */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="containsDiffusion"
              checked={values.containsDiffusion}
              onChange={onChange}
            />
            Contains Diffusion
          </label>
        </div>

        {/* 7) containsDelay */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="containsDelay"
              checked={values.containsDelay}
              onChange={onChange}
            />
            Contains Delay
          </label>
        </div>

        {/* 8) containsMarkets */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="containsMarkets"
              checked={values.containsMarkets}
              onChange={onChange}
            />
            Contains Markets
          </label>
        </div>

        {/* 9) reserveRealization */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="reserveRealization"
              checked={values.reserveRealization}
              onChange={onChange}
            />
            Reserve Realization
          </label>
        </div>

        {/* 10) useMarketBids */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="useMarketBids"
              checked={values.useMarketBids}
              onChange={onChange}
            />
            Use Market Bids
          </label>
        </div>

        {/* 11) commonTimesteps (number) */}
        <div style={styles.formGroup}>
          <label>
            Common Timesteps:
            <input
              type="number"
              name="commonTimesteps"
              value={values.commonTimesteps}
              onChange={onChange}
            />
          </label>
        </div>

        {/* 12) commonScenarioName (text) */}
        <div style={styles.formGroup}>
          <label>
            Common Scenario Name:
            <input
              type="text"
              name="commonScenarioName"
              value={values.commonScenarioName}
              onChange={onChange}
            />
          </label>
        </div>

        {/* 13) useNodeDummyVariables */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="useNodeDummyVariables"
              checked={values.useNodeDummyVariables}
              onChange={onChange}
            />
            Use Node Dummy Variables
          </label>
        </div>

        {/* 14) useRampDummyVariables */}
        <div style={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              name="useRampDummyVariables"
              checked={values.useRampDummyVariables}
              onChange={onChange}
            />
            Use Ramp Dummy Variables
          </label>
        </div>

        {/* 15) nodeDummyVariableCost (number) */}
        <div style={styles.formGroup}>
          <label>
            Node Dummy Variable Cost:
            <input
              type="number"
              step="0.01"
              name="nodeDummyVariableCost"
              value={values.nodeDummyVariableCost}
              onChange={onChange}
            />
          </label>
        </div>

        {/* 16) rampDummyVariableCost (number) */}
        <div style={styles.formGroup}>
          <label>
            Ramp Dummy Variable Cost:
            <input
              type="number"
              step="0.01"
              name="rampDummyVariableCost"
              value={values.rampDummyVariableCost}
              onChange={onChange}
            />
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit" style={styles.button}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </Modal>
  );
};

export default InputSetupModal;

// ---------- STYLES -------------
const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '1rem',
  },
  formGroup: {
    marginBottom: '10px',
  },
  button: {
    padding: '10px 20px',
    background: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};
