import React from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const StatusMessage = ({ type, message, className = '' }) => {
  let icon, bgColor, textColor;

  switch (type) {
    case 'success':
      icon = <CheckCircle size={20} />;
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      break;
    case 'error':
      icon = <AlertCircle size={20} />;
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      break;
    case 'info':
      icon = <AlertCircle size={20} />; // Or a different info icon if preferred
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      break;
    case 'loading':
      icon = <LoadingSpinner size={20} className="animate-spin" />;
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-700';
      break;
    default:
      return null;
  }

  return (
    <div className={`p-3 rounded-xl flex items-center space-x-2 ${bgColor} ${textColor} ${className}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

export default StatusMessage;