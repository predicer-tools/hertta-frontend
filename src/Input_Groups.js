// src/Input_Groups.js

const generateGroupsData = (electricHeaters) => {
    return {
      groups: {
        p1: {
          name: "p1",
          var_type: "process",
          members: electricHeaters.map(heater => heater.id)
        }
      }
    };
  };
  
  export default generateGroupsData;
  