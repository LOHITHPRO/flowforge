import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import VMenu from '../vmenu/vmenu';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <div className="layout-content">
        <VMenu />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 