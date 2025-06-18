// frontend/src/pages/repairer/dashboard/RepairerNotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Loader, CheckCircle, Info, XCircle, MessageCircle, Star, Package } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { getRepairerNotifications, markRepairerNotificationAsRead } from '../../../services/apiService'
import LoadingSpinner from '../../../components/LoadingSpinner';


const RepairerNotificationsPage = () => {
  const { repairer } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!repairer || !repairer._id) {
        setLoading(false);
        setError("Repairer not logged in or ID is missing.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetchedNotifications = await getRepairerNotifications();
        setNotifications(Array.isArray(fetchedNotifications) ? fetchedNotifications : []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.message || "Failed to load notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [repairer]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, read: true } : n))
      );
      await markRepairerNotificationAsRead(notificationId);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, read: false } : n)) 
      );
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_accepted': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'new_message': return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'system_update': return <Info className="w-5 h-5 text-gray-600" />;
      case 'job_cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'rating_received': return <Star className="w-5 h-5 text-yellow-600" />;
      case 'new_job_request': return <Package className="w-5 h-5 text-purple-600" />;
      case 'payment_received': return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'job_in_progress': return <CheckCircle className="w-5 h-5 text-blue-600" />; 
      case 'quote_provided': return <DollarSign className="w-5 h-5 text-orange-600" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffSeconds = Math.floor((now - notificationTime) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  if (!repairer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in as a repairer to view notifications.</p>
          <Link to="/repairer/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error && notifications.length === 0) { 
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Notifications</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link to="/repairer/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/repairer/dashboard" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="w-8 h-8 mr-3 text-blue-600" />
            Notifications
          </h1>
        </div>
        
        <p className="text-lg text-gray-700 mb-6">
          This is your **Notifications Page**. Stay updated on new jobs, messages, and system alerts.
        </p>

        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No new notifications.</div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`flex items-center space-x-4 p-4 rounded-xl border ${
                  notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200 font-semibold'
                } cursor-pointer`}
                onClick={() => handleMarkAsRead(notification._id)} 
              >
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  <p className="text-gray-800">{notification.message}</p>
                  <span className="text-sm text-gray-500">{getTimeAgo(notification.createdAt)}</span>
                </div>
                {!notification.read && (
                  <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-auto animate-pulse" title="Unread"></span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RepairerNotificationsPage;