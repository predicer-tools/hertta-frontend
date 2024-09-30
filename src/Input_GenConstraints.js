const generateGenConstraintsData = (interiorAirSensors) => {
  const constraints = interiorAirSensors.reduce((acc, sensor) => {
    const upConstraint = {
      name: `c_${sensor.sensorId}_up`,
      var_type: "st",
      is_setpoint: true,
      penalty: 1000.0,
      factors: [
        {
          var_type: "state",
          var_tuple: [sensor.sensorId, ""], // Tuple representation
          data: {
            ts_data: [
              { scenario: "s1", series: {} },
              { scenario: "s2", series: {} }
            ]
          }
        }
      ],
      constant: {
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} }
        ]
      }
    };

    const downConstraint = {
      name: `c_${sensor.sensorId}_down`,
      var_type: "gt",
      is_setpoint: true,
      penalty: 1000.0,
      factors: [
        {
          var_type: "state",
          var_tuple: [sensor.sensorId, ""], // Tuple representation
          data: {
            ts_data: [
              { scenario: "s1", series: {} },
              { scenario: "s2", series: {} }
            ]
          }
        }
      ],
      constant: {
        ts_data: [
          { scenario: "s1", series: {} },
          { scenario: "s2", series: {} }
        ]
      }
    };

    acc[`c_${sensor.sensorId}_up`] = upConstraint;
    acc[`c_${sensor.sensorId}_down`] = downConstraint;

    return acc;
  }, {});

  return { gen_constraints: constraints };
};

export default generateGenConstraintsData;
