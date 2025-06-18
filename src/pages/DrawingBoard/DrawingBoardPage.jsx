import React from 'react';
import Draw from '../../components/draw/Draw';
import './DrawingBoardPage.css';

const DrawingBoardPage = () => {
  return (
    <div className="drawing-board-page">
      <div className="page-header">
        <h1>Drawing Board</h1>
        <p className="text-muted">Create and edit your flow diagrams</p>
      </div>
      <div className="drawing-board-container">
        <Draw />
      </div>
    </div>
  );
};

export default DrawingBoardPage; 