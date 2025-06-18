// frontend/src/pages/repairer/dashboard/RepairerAnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, DollarSign, CheckCircle, Star, Loader, Hammer, Droplets, Zap } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { getRepairerAnalytics } from '../../../services/apiService';

const RepairerAnalyticsPage = () => {
  const { repairer } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!repairer || !repairer._id) {
        setLoading(false);
        setError("Repairer not logged in or ID is missing.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetchedData = await getRepairerAnalytics(); // Call real API
        setAnalyticsData(fetchedData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.message || "Failed to load analytics data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [repairer]);

  if (!repairer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in as a repairer to view analytics.</p>
          <Link to="/repairer/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !analyticsData) { // Show loading only if data is not yet fetched
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !analyticsData) { // Show error only if no data at all
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Analytics</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link to="/repairer/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const displayData = analyticsData || { // Fallback for initial render or if API returns partial data
    jobsCompleted: 0,
    totalEarnings: 0,
    monthlyEarnings: Array(6).fill(0),
    topServices: [],
  };

  const getMaxEarnings = () => Math.max(...displayData.monthlyEarnings, 1); // Ensure no division by zero

  const getServiceIcon = (serviceType) => {
    switch (serviceType.toLowerCase()) {
      case 'plumbing': return <Droplets className="w-5 h-5 text-blue-600 mr-2" />;
      case 'electrical': return <Zap className="w-5 h-5 text-yellow-600 mr-2" />;
      case 'carpentry': return <Hammer className="w-5 h-5 text-brown-600 mr-2" />; // Assuming a 'brown' for carpentry
      default: return <Wrench className="w-5 h-5 text-gray-600 mr-2" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/repairer/dashboard" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-blue-600" />
            Performance Analytics
          </h1>
        </div>

        <p className="text-lg text-gray-700 mb-6">
          This is your **Performance Analytics Page**. View insights into your job performance and earnings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl flex items-center space-x-4">
            <CheckCircle className="w-10 h-10 text-blue-600" />
            <div>
              <div className="text-sm text-gray-600">Total Jobs Completed</div>
              <div className="text-2xl font-bold text-gray-900">{displayData.jobsCompleted}</div>
            </div>
          </div>
          <div className="bg-green-50 p-6 rounded-xl flex items-center space-x-4">
            <DollarSign className="w-10 h-10 text-green-600" />
            <div>
              <div className="text-sm text-gray-600">Total Earnings</div>
              <div className="text-2xl font-bold text-gray-900">${displayData.totalEarnings?.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Earnings Trend (Last 6 Months)</h3>
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex justify-around items-end h-48 py-2">
            {displayData.monthlyEarnings.map((earning, index) => {
              const monthName = new Date(new Date().getFullYear(), new Date().getMonth() - (5 - index), 1)
                                .toLocaleString('en-US', { month: 'short' });
              const heightPercentage = (earning / getMaxEarnings()) * 100;
              return (
                <div key={index} className="flex flex-col items-center group relative cursor-pointer">
                  <div
                    className="bg-blue-500 rounded-t-lg transition-all duration-300"
                    style={{ height: `${heightPercentage}%`, width: '30px' }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-1">{monthName}</span>
                  <span className="absolute bottom-full mb-2 p-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    ${earning.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            This section shows your earnings trend over the last 6 months.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Top Performing Services</h3>
        <div className="bg-gray-50 p-6 rounded-xl">
          {displayData.topServices.length > 0 ? (
            <ul className="space-y-3">
              {displayData.topServices.map((service, index) => (
                <li key={index} className="flex items-center text-gray-800 text-lg">
                  {getServiceIcon(service._id)}
                  <span className="font-medium">{service._id.charAt(0).toUpperCase() + service._id.slice(1).replace(/_/g, ' ')}:</span>
                  <span className="ml-2">{service.count} jobs completed</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No completed jobs to show top services yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairerAnalyticsPage;