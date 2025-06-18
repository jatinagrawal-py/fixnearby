import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ErrorMessage = ({ message, onGoBack }) => {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-center bg-white rounded-xl shadow-lg mt-8">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
      <p className="text-gray-700 mb-4">{message}</p>
      <button
        onClick={onGoBack || (() => navigate('/user/dashboard', { replace: true }))}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back to Dashboard
      </button>
    </div>
  );
};

export default ErrorMessage;