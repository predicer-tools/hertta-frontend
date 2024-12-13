// src/graphql/ManageInputData.jsx

import React from 'react';
import ClearInputDataSection from './ClearInputDataSection';
import InputDataSetupSection from './InputDataSetupSection';
import MarketSection from './MarketSection';
import NodeSection from './NodeSection';
import ProcessGroupSection from './ProcessGroupSection';
import RiskSection from './RiskSection';
import ScenarioSection from './ScenarioSection';

const ManageInputData = () => {
  return (
    <div style={styles.container}>
      <h1>Manage Input Data</h1>
      <ClearInputDataSection />
      <InputDataSetupSection />
      <MarketSection />
      <NodeSection />
      <ProcessGroupSection />
      <RiskSection />
      <ScenarioSection />
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
};

export default ManageInputData;
