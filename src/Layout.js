import React, { useState } from 'react';
import styles from './Layout.module.css';
import Sidebar from './components/Sidebar/Sidebar.js';

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.layout}>
      <button className={styles.sidebarToggle} onClick={toggleSidebar}>
        <div className={`${styles.hamburger} ${isSidebarOpen ? styles.open : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <Sidebar isOpen={isSidebarOpen} />
      <main className={`${styles.content} ${isSidebarOpen ? '' : styles['sidebar-closed']}`}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
