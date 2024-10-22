// Define constants for heating capacities
const AIR_HEATING_CAPACITY = 0.00278; // kWh/(m²K) for air (constant for room heating capacity)
const FLOOR_CONCRETE_HEATING_CAPACITY = 0.03; // kWh/(m²K) for floor concrete heating capacity

// Function to generate nodes data
const generateNodesData = (rooms) => {
  const nodes = {
    outside: {
      name: "outside",
      groups: ["p1"],
      is_commodity: false,
      is_state: true,
      is_res: false,
      is_market: false,
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
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} },
        ],
      },
      inflow: {
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} },
        ],
      },
    },
    electricitygrid: {
      name: "electricitygrid",
      groups: ["p1"],
      is_commodity: false,
      is_state: false,
      is_res: false,
      is_market: false,
      is_inflow: false,
      state: null,
      cost: {
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} },
        ],
      },
      inflow: {
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} },
        ],
      },
    },
  };

  rooms.forEach((room) => {
    const roomArea = room.roomWidth * room.roomLength; // in m²

    // Convert material value to a number if it's a string
    const materialHeatingCapacityPerArea = parseFloat(room.material); // kWh/(m²K)

    // Calculate total heating capacity for the room (including envelope and inside air)
    const t_e_conversion_total = materialHeatingCapacityPerArea * roomArea; // kWh/K

    // Calculate room t_e_conversion (internal air heating capacity)
    const t_e_conversion_int = AIR_HEATING_CAPACITY * roomArea; // kWh/K

    // Calculate envelope t_e_conversion (excluding internal air capacity)
    const t_e_conversion_env = t_e_conversion_total - t_e_conversion_int; // kWh/K

    // Calculate floor slab t_e_conversion (always constant based on room dimensions)
    const t_e_conversion_floor_slab = FLOOR_CONCRETE_HEATING_CAPACITY * roomArea; // kWh/K

    // Main room node (inside air)
    nodes[`${room.roomId}_air`] = {
      name: `${room.roomId}_air`,
      groups: ["p1"],
      is_commodity: false,
      is_state: true,
      is_res: false,
      is_market: false,
      is_inflow: false,
      state: {
        in_max: 1e10,
        out_max: 1e10,
        state_loss_proportional: 0.0,
        state_max: room.maxTemp,
        state_min: room.minTemp,
        initial_state: 273.15, // Adjust if you have a specific initial temperature
        is_scenario_independent: false,
        is_temp: true,
        t_e_conversion: t_e_conversion_int, // Use calculated inside air heating capacity
        residual_value: 0.0,
      },
      cost: {
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} },
        ],
      },
      inflow: {
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} },
        ],
      },
    };

    // Envelope node
    nodes[`${room.roomId}_envelope`] = {
      name: `${room.roomId}_envelope`,
      groups: ["p1"],
      is_commodity: false,
      is_state: true,
      is_res: false,
      is_market: false,
      is_inflow: false,
      state: {
        in_max: 1e10,
        out_max: 1e10,
        state_loss_proportional: 0.0,
        state_max: 308.15,
        state_min: 273.15,
        initial_state: 283.15,
        is_scenario_independent: false,
        is_temp: true,
        t_e_conversion: t_e_conversion_env, // Use calculated envelope heating capacity
        residual_value: 0.0,
      },
      cost: {
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} },
        ],
      },
      inflow: {
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} },
        ],
      },
    };

    // Floor slab node
    nodes[`${room.roomId}_soil`] = {
      name: `${room.roomId}_soil`,
      groups: ["p1"],
      is_commodity: false,
      is_state: true,
      is_res: false,
      is_market: false,
      is_inflow: true,
      state: {
        in_max: 1e10,
        out_max: 1e10,
        state_loss_proportional: 0.0,
        state_max: 308.15,
        state_min: 273.15,
        initial_state: 277.15, // 4°C in Kelvin
        is_scenario_independent: false,
        is_temp: true,
        t_e_conversion: t_e_conversion_floor_slab, // Use calculated floor slab heating capacity
        residual_value: 0.0,
      },
      cost: {
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} },
        ],
      },
      inflow: {
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} },
        ],
      },
    };
  });

  return nodes;
};

export default generateNodesData;
