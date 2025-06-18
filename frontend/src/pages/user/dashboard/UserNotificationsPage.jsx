// frontend/src/pages/user/notifications/UserNotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowLeft, Loader, Info } from 'lucide-react';
import toast from 'react-hot-toast'; 

import { getUserNotifications } from '../../../services/apiService.js'; 

const UserNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getUserNotifications(); 
        if (response.success) {
          setNotifications(response.notifications);
        } else {
          setError(response.message);
          toast.error(response.message);
        }
      } catch (err) {
        console.error("Error fetching user notifications:", err);
        setError("Failed to load notifications. Please try again.");
        toast.error("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []); 

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="w-8 h-8 text-purple-600 mr-3" /> Notifications
          </h1>
          <Link
            to="/user/dashboard"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="w-8 h-8 animate-spin text-purple-500" />
            <p className="ml-3 text-lg text-gray-600">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
            <p className="text-sm mt-2">Please ensure you are logged in and your internet connection is stable.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg mb-2">No new notifications.</p>
            <p className="text-sm">Check back later for updates on your services and new offers!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map(notification => (
              <li key={notification._id || notification.id} className="py-4 flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {/* You might want different icons based on notification type */}
                  <Info className="w-5 h-5 text-gray-500" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-gray-800 text-md font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserNotificationsPage;
