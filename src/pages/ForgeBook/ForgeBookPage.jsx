import React from 'react';
import Type from '../../components/type/Type';
import './ForgeBookPage.css';

const ForgeBookPage = () => {
  return (
    <div className="forge-book-page">
      <div className="page-header">
        <h1>Forge Book</h1>
        <p className="text-muted">Document and manage your project notes</p>
      </div>
      <div className="forge-book-container">
        <Type />
      </div>
    </div>
  );
};

export default ForgeBookPage; 