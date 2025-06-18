// frontend/src/components/user/DashboardHeader.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js'; 
import toast from 'react-hot-toast';
import { logoutUser } from '../../services/apiService.js'; 

import {
  UserCircle,
  MessageCircle,
  Bell,
  Clock,
  ClipboardList,
  LogOut,
} from "lucide-react";

const DashboardHeader = ({ user, handleMessagesClick, handleNotificationsClick }) => {
  const navigate = useNavigate();
  const { clearUser, clearRepairer, clearAdmin } = useAuthStore(); 

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Logged out successfully!');
      clearUser();
      clearRepairer();
      clearAdmin();
      navigate('/user/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to logout. Please try again.');
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-xl sticky top-0 z-50 animate-slideInDown">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center py-4 sm:py-5">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 transform hover:scale-105 transition-transform duration-200">
            <img
              src="/images/logooo.png"
              alt="Fix Nearby Logo"
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="hidden md:flex items-center space-x-3 text-gray-700">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="User Avatar" className="w-9 h-9 rounded-full object-cover border-2 border-green-400 shadow-md" />
              ) : (
                <UserCircle className="w-9 h-9 text-green-600" strokeWidth={1.5} />
              )}
              <span className="font-semibold text-lg">{user?.fullname || 'Guest'}</span>
            </div>

            <button
              onClick={handleMessagesClick}
              className="p-2.5 rounded-full text-gray-600 hover:bg-green-50 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-110 shadow-sm"
              aria-label="Messages"
            >
              <MessageCircle className="w-6 h-6" strokeWidth={2} />
            </button>

            <button
              onClick={handleNotificationsClick}
              className="p-2.5 rounded-full text-gray-600 hover:bg-green-50 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-110 shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6" strokeWidth={2} />
            </button>

            <Link to="/user/inprogress" className="hidden sm:flex items-center space-x-2 bg-green-500 text-white px-5 py-2.5 rounded-full text-base font-bold hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <Clock className="w-5 h-5" strokeWidth={2} />
              <span>In Progress</span>
            </Link>

            <Link to="/user/pending-service" className="hidden sm:flex items-center space-x-2 bg-green-500 text-white px-5 py-2.5 rounded-full text-base font-bold hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <ClipboardList className="w-5 h-5" strokeWidth={2} />
              <span>Pending</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 text-white px-5 py-2.5 rounded-full text-base font-bold hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;