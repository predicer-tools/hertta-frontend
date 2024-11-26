// src/App.js
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import ConfigPage from './pages/ConfigPage';
import Dashboard from './pages/Dashboard';
import InputData from './pages/InputData';
import DataTable from './pages/DataTable';
import ConfigContext from './context/ConfigContext';

function App() {
  const { isConfigured } = useContext(ConfigContext);
  console.log('App isConfigured:', isConfigured); // Debugging log

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={isConfigured ? <Dashboard /> : <Navigate to="/config" replace />}
        />
        <Route
          path="/config"
          element={isConfigured ? <Navigate to="/" replace /> : <ConfigPage />}
        />
        <Route
          path="/dashboard"
          element={isConfigured ? <Dashboard /> : <Navigate to="/config" replace />}
        />
        <Route
          path="/input-data"
          element={isConfigured ? <InputData /> : <Navigate to="/config" replace />}
        />
        <Route
          path="/data-table"
          element={
            isConfigured ? (
              <DataTable
                rooms={[]} // Ensure these props are correctly populated
                homeAssistantSensors={[]}
                fetchedDevices={[]}
                deleteHeater={() => {}}
                deleteRoom={() => {}}
              />
            ) : (
              <Navigate to="/config" replace />
            )
          }
        />
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to={isConfigured ? "/" : "/config"} replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
