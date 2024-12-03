// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import './App.module.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'normalize.css';
import { ConfigProvider } from './context/ConfigContext'; // Import ConfigProvider
import { DataProvider } from './context/DataContext'; // Import DataProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <ConfigProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </ConfigProvider>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
