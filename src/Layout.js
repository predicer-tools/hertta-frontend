// src/Layout.js
import React from 'react';
import './Layout.css';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        {children}
      </div>
    </div>
  );
}

export default Layout;
