import React, { useState } from 'react';
import './vmenu.css';

const VMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={`vmenu-container ${isOpen ? 'vmenu-open' : ''}`}>
        <ul className="vmenu-list">
          <li className="vmenu-item">
            <a href="#" className="vmenu-link">Home</a>
          </li>
          <li className="vmenu-item">
            <a href="#" className="vmenu-link">About</a>
          </li>
          <li className="vmenu-item">
            <a href="#" className="vmenu-link">Services</a>
          </li>
          <li className="vmenu-item">
            <a href="#" className="vmenu-link">Contact</a>
          </li>
        </ul>
      </div>
      <button 
        className={`vmenu-toggle ${isOpen ? 'vmenu-open' : ''}`}
        onClick={toggleMenu}
      >
        {isOpen ? '<' : '>'}
      </button>
    </>
  );
};

export default VMenu; 