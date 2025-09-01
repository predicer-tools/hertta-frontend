// src/InputDataSetupPage.js

import React, { useState } from "react";
import { Gql } from "./zeus";

// Define the default form state based on your schema's InputDataSetupUpdate
const defaultForm = {
  containsReserves: false,
  containsOnline: false,
  containsStates: false,
  containsPiecewiseEff: false,
  containsRisk: false,
  containsDiffusion: false,
  containsDelay: false,
  containsMarkets: false,
  reserveRealization: false,
  useMarketBids: false,
  commonTimesteps: 0,
  commonScenarioName: "",
  useNodeDummyVariables: false,
  useRampDummyVariables: false,
  nodeDummyVariableCost: 0,
  rampDummyVariableCost: 0,
};

const InputDataSetupPage = () => {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle changes for both checkbox and text/number inputs
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      // IMPORTANT: Use the key "mutation" (all lowercase) when calling the client.
      const response = await Gql("mutation")({
        updateInputDataSetup: [
          { setupUpdate: form },
          { errors: { field: true, message: true } },
        ],
      });

      // Check for validation errors
      if (
        response.updateInputDataSetup.errors &&
        response.updateInputDataSetup.errors.length > 0
      ) {
        setError("Validation errors occurred. Please review your input.");
        console.error("Validation errors:", response.updateInputDataSetup.errors);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An error occurred while updating the setup.");
      console.error("GraphQL error:", err);
    }
  };

  return (
    <div>
      <h1>Update Input Data Setup</h1>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && (
        <div style={{ color: "green" }}>
          Input data setup updated successfully!
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Contains Reserves:
            <input
              type="checkbox"
              name="containsReserves"
              checked={form.containsReserves}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Contains Online:
            <input
              type="checkbox"
              name="containsOnline"
              checked={form.containsOnline}
              onChange={handleChange}
            />
          </label>
        </div>
        {/* Add similar inputs for the rest of the properties */}
        <div>
          <label>
            Contains States:
            <input
              type="checkbox"
              name="containsStates"
              checked={form.containsStates}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Common Timesteps:
            <input
              type="number"
              name="commonTimesteps"
              value={form.commonTimesteps}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Common Scenario Name:
            <input
              type="text"
              name="commonScenarioName"
              value={form.commonScenarioName}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Node Dummy Variable Cost:
            <input
              type="number"
              name="nodeDummyVariableCost"
              value={form.nodeDummyVariableCost}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Ramp Dummy Variable Cost:
            <input
              type="number"
              name="rampDummyVariableCost"
              value={form.rampDummyVariableCost}
              onChange={handleChange}
            />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default InputDataSetupPage;
