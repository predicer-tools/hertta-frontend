// src/components/HeaterSwitch.js

import React from 'react';
import Switch from "react-switch";

const HeaterSwitch = React.memo(({ isEnabled, onToggle, heaterSize }) => (
  <Switch
    onChange={onToggle}
    checked={isEnabled}
    offColor="#888"
    onColor="#4CAF50"
    uncheckedIcon={false}
    checkedIcon={false}
    height={heaterSize * 0.5}
    width={heaterSize * 1.2}
    handleDiameter={heaterSize * 0.4}
    aria-label="Toggle heater"
  />
));

export default HeaterSwitch;
