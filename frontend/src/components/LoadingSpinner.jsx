import React from 'react';
import './LoadingSpinner.css'; 

const LoadingSpinner = ({ message = "Loading...", showMessage = true }) => {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      {showMessage && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;