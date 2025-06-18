import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import { Loader, TrendingUp, User, Wrench, ClipboardList } from 'lucide-react';
import { getLucideIcon } from '../../utils/lucideIconMap.js';

const OfflineDashboardContent = ({
  stats,
  loadingStats,
  errorStats,
  recentActivity,
  loadingActivity,
  errorActivity,
  onViewAnalyticsClick,
  onManageProfileClick,
}) => {
  const [showStats, setShowStats] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    if (!loadingStats && !errorStats) {
      const timer = setTimeout(() => setShowStats(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowStats(false);
    }
  }, [loadingStats, errorStats]);

  useEffect(() => {
    if (!loadingActivity && !errorActivity) {
      const timer = setTimeout(() => setShowActivity(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowActivity(false);
    }
  }, [loadingActivity, errorActivity]);


  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : errorStats ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            Error loading stats: {errorStats}
          </div>
        ) : (
          <div className={`transition-opacity duration-500 ${showStats ? 'opacity-100' : 'opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const IconComponent = getLucideIcon(stat.icon, Wrench);
                return (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">{stat.title}</div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.change}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        {/* Quick actions are static, no loading state for them, but still look nice with hover animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={onViewAnalyticsClick}
            className="flex flex-col items-center justify-center p-6 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-colors duration-200 ease-in-out transform hover:-translate-y-1"
          >
            <TrendingUp className="w-10 h-10 mb-2" />
            <span className="font-semibold text-lg">View Analytics</span>
            <span className="text-sm opacity-80 text-center">Track your performance & earnings.</span>
          </button>
          <Link
            to="/repairer/inprogress"
            className="flex flex-col items-center justify-center p-6 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition-colors duration-200 ease-in-out transform hover:-translate-y-1"
          >
            <ClipboardList className="w-10 h-10 mb-2" />
            <span className="font-semibold text-lg">Assigned Jobs</span>
            <span className="text-sm opacity-80 text-center">Manage your active service requests.</span>
          </Link>
          <button
            onClick={onManageProfileClick}
            className="flex flex-col items-center justify-center p-6 bg-teal-600 text-white rounded-xl shadow-md hover:bg-teal-700 transition-colors duration-200 ease-in-out transform hover:-translate-y-1"
          >
            <User className="w-10 h-10 mb-2" />
            <span className="font-semibold text-lg">Manage Profile</span>
            <span className="text-sm opacity-80 text-center">Update your details & services.</span>
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        {loadingActivity ? (
          <div className="bg-white p-6 rounded-xl shadow-md animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 mb-4 last:mb-0">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-grow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : errorActivity ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            Error loading activity: {errorActivity}
          </div>
        ) : (
          <div className={`transition-opacity duration-500 ${showActivity ? 'opacity-100' : 'opacity-0'}`}>
            {recentActivity.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-md text-center text-gray-500">
                No recent activity to display.
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <ul className="divide-y divide-gray-200">
                  {recentActivity.map((activity, index) => {
                    const Icon = getLucideIcon(
                      activity.type === 'completed'
                        ? 'CheckCircle'
                        : activity.type === 'accepted'
                        ? 'Handshake'
                        : 'Bell',
                      Wrench
                    );
                    return (
                      <li key={index} className="flex items-center py-4 first:pt-0 last:pb-0">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4
                            ${
                              activity.type === 'completed'
                                ? 'bg-green-100 text-green-600'
                                : activity.type === 'accepted'
                                ? 'bg-emerald-100 text-emerald-600'
                                : activity.type === 'new_request'
                                ? 'bg-lime-100 text-lime-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-gray-800 font-medium">{activity.message}</p>
                          {activity.amount && (
                            <p className="text-sm text-gray-600">Earnings: {activity.amount}</p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default OfflineDashboardContent;