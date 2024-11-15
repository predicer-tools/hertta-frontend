// src/Input_GenConstraints.js

const generateGenConstraintsData = (interiorAirSensors) => {
  const constraints = interiorAirSensors.reduce((acc, sensor) => {
    const upConstraint = {
      name: `c_${sensor.sensorId}_up`,
      gc_type: "st",
      is_setpoint: true,
      penalty: 15.0,
      factors: [
        {
          var_type: "state",
          var_tuple: [sensor.sensorId, ""], // Tuple representation
          data: {
            ts_data: [],
            index: {}
          }
        }
      ],
      constant: {
        ts_data: [],
        index: {}
      }
    };

    const downConstraint = {
      name: `c_${sensor.sensorId}_down`,
      gc_type: "gt",
      is_setpoint: true,
      penalty: 1000.0,
      factors: [
        {
          var_type: "state",
          var_tuple: [sensor.sensorId, ""], // Tuple representation
          data: {
            ts_data: [],
            index: {}
          }
        }
      ],
      constant: {
        ts_data: [],
        index: {}
      }
    };

    acc[`c_${sensor.sensorId}_up`] = upConstraint;
    acc[`c_${sensor.sensorId}_down`] = downConstraint;

    return acc;
  }, {});

  return { gen_constraints: constraints };
};

export default generateGenConstraintsData;
