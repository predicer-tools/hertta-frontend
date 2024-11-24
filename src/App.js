import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout'; // Import Layout
import ConfigPage from './pages/ConfigPage';
import Dashboard from './pages/Dashboard';
import InputData from './pages/InputData';
import DataTable from './pages/DataTable'; // Import DataTable

function App() {
  const isConfigured = localStorage.getItem('isConfigured') === 'true';

  return (
    <Layout>
      <Routes>
        <Route path="/" element={isConfigured ? <Dashboard /> : <ConfigPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/input-data" element={<InputData />} />
        <Route
          path="/data-table"
          element={
            <DataTable
              rooms={[]} // Pass the required props for DataTable
              homeAssistantSensors={[]}
              fetchedDevices={[]}
              deleteHeater={() => {}}
              deleteRoom={() => {}}
            />
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
