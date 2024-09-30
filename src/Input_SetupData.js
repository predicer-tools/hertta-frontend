// src/Input_SetupData.js

function Input_SetupData() {
  const setupData = {
    setup: {
      contains_reserves: false,
      contains_online: false,
      contains_states: true,
      contains_piecewise_eff: false,
      contains_risk: false,
      contains_diffusion: true,
      contains_delay: false,
      contains_markets: true,
      reserve_realisation: false,
      use_market_bids: true,
      common_timesteps: 0,
      common_scenario_name: "common scenario",
      use_node_dummy_variables: true,
      use_ramp_dummy_variables: true,
      node_dummy_variable_cost: 0.0, // Added field
      ramp_dummy_variable_cost: 0.0  // Added field
    }
  };

  return setupData;
}

export default Input_SetupData;
