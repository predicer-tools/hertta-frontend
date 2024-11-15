// Input_Nodes.js

// Define constants for heating capacities
const AIR_HEATING_CAPACITY = 0.00278; // kWh/(m²K) for air (constant for room heating capacity)
const FLOOR_CONCRETE_HEATING_CAPACITY = 0.03; // kWh/(m²K) for floor concrete heating capacity

// Function to generate nodes data
const generateNodesData = (rooms, sensorStates) => {
  const nodes = {
    outside: {
      name: "outside",
      groups: [],
      is_commodity: false,
      is_market: false,
      is_state: true,
      is_res: false,
      is_inflow: true,
      state: {
        in_max: 1e10,
        out_max: 1e10,
        state_loss_proportional: 0.0,
        state_max: 308.15,
        state_min: 238.15,
        initial_state: 268.15,
        is_scenario_independent: false,
        is_temp: true,
        t_e_conversion: 1e9,
        residual_value: 0.0,
      },
      cost: {
        ts_data: [],
        index: {}, // Added index field
      },
      inflow: {
        ts_data: [],
        index: {}, // Added index field
      },
    },
    electricitygrid: {
      name: "electricitygrid",
      groups: [],
      is_commodity: false,
      is_market: false,
      is_state: false,
      is_res: false,
      is_inflow: false,
      state: {
        in_max: 0.0,
        out_max: 0.0,
        state_loss_proportional: 0.0,
        state_max: 0.0,
        state_min: 0.0,
        initial_state: 0.0,
        is_scenario_independent: false,
        is_temp: false,
        t_e_conversion: 1.0,
        residual_value: 0.0,
      },
      cost: {
        ts_data: [],
        index: {}, // Added index field
      },
      inflow: {
        ts_data: [],
        index: {}, // Added index field
      },
    },
  };

  rooms.forEach((room) => {
    const roomArea = parseFloat(room.roomWidth) * parseFloat(room.roomLength); // in m²
    const materialHeatingCapacityPerArea = parseFloat(room.material); // kWh/(m²K)
    const t_e_conversion_total = materialHeatingCapacityPerArea * roomArea; // kWh/K
    const t_e_conversion_int = AIR_HEATING_CAPACITY * roomArea; // kWh/K
    const t_e_conversion_env = t_e_conversion_total - t_e_conversion_int; // kWh/K
    const t_e_conversion_floor_slab = FLOOR_CONCRETE_HEATING_CAPACITY * roomArea; // kWh/K

    // Convert sensor state to a number (f64)
    let sensorState = parseFloat(sensorStates[room.sensorId]);
    if (isNaN(sensorState)) {
      sensorState = 0.0; // Default to 0°C if sensor state is invalid or missing
    }
    // Convert Celsius to Kelvin
    sensorState += 273.15;

    // Main room node (inside air)
    nodes[`${room.roomId}_air`] = {
      name: `${room.roomId}_air`,
      groups: [],
      is_commodity: false,
      is_market: false,
      is_state: true,
      is_res: false,
      is_inflow: false,
      state: {
        in_max: 1e10,
        out_max: 1e10,
        state_loss_proportional: 0.0,
        state_max: room.maxTemp,
        state_min: room.minTemp,
        initial_state: sensorState, // Set to current sensor state as f64
        is_scenario_independent: false,
        is_temp: true,
        t_e_conversion: t_e_conversion_int,
        residual_value: 0.0,
      },
      cost: {
        ts_data: [],
        index: {}, // Added index field
      },
      inflow: {
        ts_data: [],
        index: {}, // Added index field
      },
    };

    // Envelope node
    nodes[`${room.roomId}_envelope`] = {
      name: `${room.roomId}_envelope`,
      groups: [],
      is_commodity: false,
      is_market: false,
      is_state: true,
      is_res: false,
      is_inflow: false,
      state: {
        in_max: 1e10,
        out_max: 1e10,
        state_loss_proportional: 0.0,
        state_max: 308.15,
        state_min: 273.15,
        initial_state: sensorState, // Set to current sensor state as f64
        is_scenario_independent: false,
        is_temp: true,
        t_e_conversion: t_e_conversion_env,
        residual_value: 0.0,
      },
      cost: {
        ts_data: [],
        index: {}, // Added index field
      },
      inflow: {
        ts_data: [],
        index: {}, // Added index field
      },
    };

    // Floor slab node
    nodes[`${room.roomId}_soil`] = {
      name: `${room.roomId}_soil`,
      groups: [],
      is_commodity: false,
      is_market: false,
      is_state: true,
      is_res: false,
      is_inflow: true,
      state: {
        in_max: 1e10,
        out_max: 1e10,
        state_loss_proportional: 0.0,
        state_max: 308.15,
        state_min: 273.15,
        initial_state: 277.15, // Default soil temperature in Kelvin
        is_scenario_independent: false,
        is_temp: true,
        t_e_conversion: t_e_conversion_floor_slab,
        residual_value: 0.0,
      },
      cost: {
        ts_data: [],
        index: {}, // Added index field
      },
      inflow: {
        ts_data: [],
        index: {}, // Added index field
      },
    };
  });

  return nodes;
};

export default generateNodesData;
