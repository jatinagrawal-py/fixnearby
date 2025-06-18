import React from 'react';
import { LogOut, Bell, User, Settings, ClipboardList, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ displayName, isOnline, setIsOnline, onSettingsClick, onLogout, onNotificationsClick, onProfileClick, unreadNotificationCount, onMessagesClick }) => {
  const navigate = useNavigate();

  const handleAssignedJobsClick = () => {
    navigate('/repairer/inprogress');
  };

  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between rounded-b-3xl">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Welcome, {displayName}!
        </h1>
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-gray-600 text-sm md:text-base">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-gray-700 font-medium hidden md:block">Go {isOnline ? 'Offline' : 'Online'}:</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isOnline}
            onChange={() => setIsOnline(!isOnline)}
          />
          {/* Themed Toggle Switch */}
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onMessagesClick}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          aria-label="Messages"
        >
          <MessageSquare className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={handleAssignedJobsClick}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          aria-label="Assigned Jobs"
        >
          <ClipboardList className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={onNotificationsClick}
          className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        <button
          onClick={onProfileClick}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          aria-label="Profile"
        >
          <User className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={onSettingsClick}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={onLogout}
          className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors hidden md:block"
          aria-label="Logout"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;