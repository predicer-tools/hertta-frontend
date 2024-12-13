// src/pages/ManageInputData.jsx

import React from 'react';
import ClearInputDataSection from './ClearInputDataSection';
import InputDataSetupSection from './InputDataSetupSection';
import MarketSection from './MarketSection';
import NodeSection from './NodeSection';
import ProcessGroupSection from './ProcessGroupSection';

const ManageInputData = () => {
  return (
    <div style={styles.container}>
      <h1>Manage Input Data</h1>
      <ClearInputDataSection />
      <InputDataSetupSection />
      <MarketSection />
      <NodeSection />
      <ProcessGroupSection />
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
