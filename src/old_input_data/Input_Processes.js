// src/Input_Processes.js

// Function to generate processes data for electric heaters
const generateProcessesData = (electricHeaters) => {
  return electricHeaters.reduce((acc, heater) => {
    // Set cf and eff_ts to the desired structure
    const cf = {
      ts_data: [],
      index: {}
    };

    const eff_ts = {
      ts_data: [],
      index: {}
    };

    // Create the process data for each heater
    const process = {
      name: heater.id,
      groups: heater.groups || ["p1"],
      conversion: heater.conversion || 1,
      is_cf: heater.is_cf || false,
      is_cf_fix: heater.is_cf_fix || false,
      is_online: heater.is_online || false,
      is_res: heater.is_res || false,
      eff: heater.eff || 1.0,
      load_min: heater.load_min || 0.0,
      load_max: heater.load_max || 1.0,
      start_cost: heater.start_cost || 0.0,
      min_online: heater.min_online || 0.0,
      min_offline: heater.min_offline || 0.0,
      max_online: heater.max_online || 0.0,
      max_offline: heater.max_offline || 0.0,
      initial_state: heater.initial_state !== undefined ? heater.initial_state : true,
      is_scenario_independent: heater.is_scenario_independent || false,
      topos: [],
      cf: cf, // Assign the structured cf
      eff_ts: eff_ts, // Assign the structured eff_ts
      eff_ops: heater.eff_ops || [],
      eff_fun: heater.eff_fun || []
    };

    // Define common parameters for topologies
    const capacity = heater.capacity || 1.0;
    const vom_cost = heater.vom_cost || 0.0;
    const ramp_up = heater.ramp_up || 1.0;
    const ramp_down = heater.ramp_down || 1.0;
    const initial_load = heater.initial_load || 0.7;
    const initial_flow = heater.initial_flow || 0.7;

    // Set cap_ts to the desired structure
    const cap_ts = {
      ts_data: [],
      index: {}
    };

    // Input topology: From 'electricitygrid' to the heater process
    const inputTopology = {
      source: 'electricitygrid',
      sink: heater.id,
      capacity: capacity,
      vom_cost: vom_cost,
      ramp_up: ramp_up,
      ramp_down: ramp_down,
      initial_load: initial_load,
      initial_flow: initial_flow,
      cap_ts: cap_ts // Assign the structured cap_ts
    };

    // Output topology: From the heater process to the room node
    const outputTopology = {
      source: heater.id,
      sink: heater.roomId || 'interiorair',
      capacity: capacity,
      vom_cost: vom_cost,
      ramp_up: ramp_up,
      ramp_down: ramp_down,
      initial_load: initial_load,
      initial_flow: initial_flow,
      cap_ts: cap_ts // Assign the structured cap_ts
    };

    // Assign topologies to the process
    process.topos = [inputTopology, outputTopology];

    // Add the process to the accumulator
    acc[heater.id] = process;
    return acc;
  }, {});
};

export default generateProcessesData;
