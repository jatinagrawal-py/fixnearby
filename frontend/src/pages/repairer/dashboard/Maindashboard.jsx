import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore.js';

import Header from '../../../components/RepairerDashboard/Header.jsx';
import OnlineDashboardContent from '../../../components/RepairerDashboard/OnlineDashboardContent.jsx';
import OfflineDashboardContent from '../../../components/RepairerDashboard/OfflineDashboardContent.jsx';

import {
  getNearbyJobs,
  getRepairerDashboardStats,
  getRepairerRecentActivity,
  acceptJob,
  getRepairerNotifications,
  logoutRepairer
} from '../../../services/apiService.js';
import toast from 'react-hot-toast';

const getUrgencyColor = (urgency) => {
  switch (urgency?.toLowerCase()) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const RepairerMainDashboard = () => {
  const navigate = useNavigate();
  const { repairer, clearRepairer, clearUser, clearAdmin } = useAuthStore();

  const [isOnline, setIsOnline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [errorJobs, setErrorJobs] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [errorActivity, setErrorActivity] = useState(null);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const displayName = repairer?.fullname || 'Repairer';
  const repairerId = repairer?._id;

  const fetchNearbyJobs = useCallback(async () => {
    if (!isOnline) {
      setJobs([]);
      setLoadingJobs(false);
      return;
    }
    setLoadingJobs(true);
    setErrorJobs(null);
    try {
      const data = await getNearbyJobs();
      setJobs(data);
    } catch (err) {
      setErrorJobs("Failed to load nearby jobs.");
      console.error("Error fetching nearby jobs:", err);
      toast.error("Failed to load nearby jobs.");
    } finally {
      setLoadingJobs(false);
    }
  }, [isOnline]);
  console.log(loadingNotifications);

  const fetchDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      const data = await getRepairerDashboardStats();
      setStats([
        { title: "Jobs Completed", value: data.jobsCompleted || "0", change: data.jobsCompletedChange || "N/A", icon: 'CheckCircle' },
        { title: "Earnings This Month", value: `$${data.earningsThisMonth?.toLocaleString() || "0"}`, change: data.earningsChange || "N/A", icon: 'DollarSign' },
        { title: "Average Rating", value: data.averageRating?.toFixed(1) || "0.0", change: data.ratingChange || "N/A", icon: 'Star' },
        { title: "Active Jobs", value: data.activeJobs || "0", change: data.activeJobsChange || "N/A", icon: 'Target' }
      ]);
    } catch (err) {
      setErrorStats("Failed to load dashboard stats.");
      console.error("Error fetching dashboard stats:", err);
      toast.error("Failed to load dashboard stats.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    setLoadingActivity(true);
    setErrorActivity(null);
    try {
      const data = await getRepairerRecentActivity();
      setRecentActivity(data);
    } catch (err) {
      setErrorActivity("Failed to load recent activity.");
      console.error("Error fetching recent activity:", err);
      toast.error("Failed to load recent activity.");
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    setLoadingNotifications(true);
    try {
      const notifications = await getRepairerNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;
      setUnreadNotificationCount(unreadCount);
    } catch (err) {
      console.error("Error fetching unread notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    if (isOnline) {
      fetchNearbyJobs();
    } else {
      setJobs([]);
    }
  }, [isOnline, fetchNearbyJobs]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
    fetchUnreadNotifications();
  }, [fetchDashboardStats, fetchRecentActivity, fetchUnreadNotifications]);

  const handleAcceptJob = async (jobId) => {
    console.log(`Attempting to accept job: ${jobId}`);
    if (!repairerId) {
      toast.error("Repairer ID not available. Please log in again.");
      return;
    }
    try {
      const response = await acceptJob(jobId, { status: 'accept_request_for_quote' });
      toast.success('Job request accepted! Please provide your quote on the In Progress page.');
      fetchDashboardStats();
      fetchRecentActivity();
      fetchUnreadNotifications();
      console.log(response);
      navigate('/repairer/inprogress');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept job. Please try again.');
      console.error('Accept job error:', error);
      fetchNearbyJobs();
    }
  };

  const handleLogout = async () => {
    console.log("Logout button clicked. Logging out...");
    try {
      await logoutRepairer();
      toast.success('Logged out successfully!');
      clearRepairer();
      clearUser();
      clearAdmin();
      navigate('/repairer/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to logout. Please try again.');
      console.error('Logout error:', error);
    }
  };

  const handleSettingsClick = () => {
    console.log("Settings button clicked. Navigating to /repairer/settings");
    navigate('/repairer/settings');
  };

  const handleNotificationsClick = () => {
    console.log("Notifications button clicked. Navigating to /repairer/notifications");
    navigate('/repairer/notifications');
    fetchUnreadNotifications();
  };

  const handleProfileClick = () => {
    console.log("Profile button clicked. Navigating to /repairer/profile");
    navigate('/repairer/profile');
  };

  const handleViewAnalyticsClick = () => {
    console.log("View Analytics button clicked. Navigating to /repairer/analytics");
    navigate('/repairer/analytics');
  };

  const handleMessagesClick = () => {
    console.log("Messages button clicked. Navigating to /repairer/messages");
    navigate('/repairer/messages');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header
        displayName={displayName}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        onSettingsClick={handleSettingsClick}
        onLogout={handleLogout}
        onNotificationsClick={handleNotificationsClick}
        onProfileClick={handleProfileClick}
        unreadNotificationCount={unreadNotificationCount}
        onMessagesClick={handleMessagesClick}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isOnline ? (
          <OnlineDashboardContent
            key="online-dashboard"
            jobs={jobs}
            loadingJobs={loadingJobs}
            errorJobs={errorJobs}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            handleAcceptJob={handleAcceptJob}
            getUrgencyColor={getUrgencyColor}
          />
        ) : (
          <OfflineDashboardContent
            key="offline-dashboard"
            displayName={displayName}
            stats={stats}
            loadingStats={loadingStats}
            errorStats={errorStats}
            recentActivity={recentActivity}
            loadingActivity={loadingActivity}
            errorActivity={errorActivity}
            onViewAnalyticsClick={handleViewAnalyticsClick}
            onManageProfileClick={handleProfileClick}
          />
        )}
      </div>
    </div>
  );
};

export default RepairerMainDashboard;