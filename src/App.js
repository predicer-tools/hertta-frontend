// src/App.js

import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import ConfigPage from './pages/ConfigPage';
import InputData from './pages/InputData';
import DataTable from './pages/DataTable';
import ConfigContext from './context/ConfigContext';
import DashboardGrid from './pages/DashboardGrid';
import ManageInputData from './graphql/ManageInputData';
import EditConfigPage from './pages/EditConfigPage';
import UpdateInputDataSetup from './graphql/UpdateInputDataSetup';
import GraphQLActions from './graphql/GraphQLActions';
import ModelPage from './pages/ModelPage';

function App() {
  const { isConfigured } = useContext(ConfigContext);
  console.log('App isConfigured:', isConfigured); // Debugging log

  return (
    <Layout>
      <Routes>
        {/* Root Route */}
        <Route
          path="/"
          element={isConfigured ? <DashboardGrid /> : <Navigate to="/config" replace />}
        />

        {/* Configuration Route */}
        <Route
          path="/config"
          element={<ConfigPage />}
        />

        {/* Edit Configuration Route */}
        <Route
          path="/edit-config"
          element={isConfigured ? <EditConfigPage /> : <Navigate to="/config" replace />}
        />

        {/* Dashboard Route */}
        <Route
          path="/dashboard"
          element={isConfigured ? <DashboardGrid /> : <Navigate to="/config" replace />}
        />

        {/* DashboardGrid Route */}
        <Route
          path="/dashboard-grid"
          element={isConfigured ? <DashboardGrid /> : <Navigate to="/config" replace />}
        />

        {/* Input Data Route */}
        <Route
          path="/input-data"
          element={isConfigured ? <InputData /> : <Navigate to="/config" replace />}
        />

                {/* Input Data Route */}
        <Route
          path="/model"
          element={isConfigured ? <ModelPage /> : <Navigate to="/model" replace />}
        />

        {/* Data Table Route */}
        <Route
          path="/data-table"
          element={
            isConfigured ? (
              <DataTable /> // Removed props as DataTable now consumes DataContext
            ) : (
              <Navigate to="/config" replace />
            )
          }
        />

        {/* Manage Input Data Route */}
        <Route
          path="/manage-input-data"
          element={
            isConfigured ? <ManageInputData /> : <Navigate to="/config" replace />
          }
        />

        {/* Manage Input Data Route */}
        <Route
          path="/input-data-setup"
          element={
            isConfigured ? <GraphQLActions /> : <Navigate to="/config" replace />
          }
        />

        {/* Redirect Unknown Routes */}
        <Route
          path="*"
          element={<Navigate to={isConfigured ? "/" : "/config"} replace />}
        />
      </Routes>
    </Layout>
  );
}

export default App;
