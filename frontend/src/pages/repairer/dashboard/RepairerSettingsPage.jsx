// frontend/src/pages/repairer/dashboard/RepairerSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, Loader, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { updateRepairerSettings, getRepairerProfileDetails } from '../../../services/apiService';

const RepairerSettingsPage = () => {
  const { repairer, setRepairer } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    serviceRadius: 25,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      if (repairer) {
        try {
          const fullProfile = await getRepairerProfileDetails();
          setSettingsData({
            emailNotifications: fullProfile.preferences?.emailNotifications ?? true,
            smsNotifications: fullProfile.preferences?.smsNotifications ?? false,
            serviceRadius: fullProfile.preferences?.serviceRadius ?? 25,
          });
        } catch (err) {
          console.error("Error loading repairer settings:", err);
          setSaveError("Failed to load current settings. Please try refreshing.");
        }
      }
      setLoading(false);
    };

    loadSettings();
  }, [repairer]);

  const handleSettingChange = (e) => {
    const { name, type, value, checked } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSaveSuccess(null);
    setSaveError(null);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    if (!repairer || !repairer._id) {
      setSaveError("Repairer not authenticated. Please log in again.");
      setIsSaving(false);
      return;
    }

    try {
      const updatedResponse = await updateRepairerSettings(settingsData);
      setSaveSuccess(updatedResponse.message || "Settings saved successfully!");

      setRepairer(prevRepairer => ({
        ...prevRepairer,
        preferences: updatedResponse.preferences
      }));
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveError(error.message || "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!repairer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-lg text-gray-600 mb-6">Please log in as a repairer to view your settings.</p>
          <Link
            to="/repairer/login"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/repairer/dashboard" className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 ease-in-out">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center">
            <Settings className="w-9 h-9 mr-3 text-indigo-600" />
            Repairer Settings
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-6" />
            <p className="text-lg text-gray-600 font-medium">Loading your settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveChanges} className="space-y-8">
            {saveSuccess && (
              <div className="flex items-center p-4 bg-green-50 text-green-800 rounded-xl shadow-md border border-green-200 animate-fadeIn">
                <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                <p className="font-medium">{saveSuccess}</p>
              </div>
            )}
            {saveError && (
              <div className="flex items-center p-4 bg-red-50 text-red-800 rounded-xl shadow-md border border-red-200 animate-fadeIn">
                <XCircle className="w-6 h-6 mr-3 text-red-600" />
                <p className="font-medium">{saveError}</p>
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-2xl shadow-inner border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <label htmlFor="emailNotifications" className="text-lg text-gray-700 cursor-pointer font-medium">
                    Email Notifications
                  </label>
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={settingsData.emailNotifications}
                    onChange={handleSettingChange}
                    className="h-6 w-6 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 transition-colors duration-200 ease-in-out cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <label htmlFor="smsNotifications" className="text-lg text-gray-700 cursor-pointer font-medium">
                    SMS Notifications
                  </label>
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    name="smsNotifications"
                    checked={settingsData.smsNotifications}
                    onChange={handleSettingChange}
                    className="h-6 w-6 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 transition-colors duration-200 ease-in-out cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl shadow-inner border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">Service Area</h2>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <label htmlFor="serviceRadius" className="block text-lg text-gray-700 font-medium mb-3">
                  Service Radius (in kilometers)
                </label>
                <input
                  type="number"
                  id="serviceRadius"
                  name="serviceRadius"
                  value={settingsData.serviceRadius}
                  onChange={handleSettingChange}
                  min="5"
                  max="200"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg shadow-sm transition-all duration-200 ease-in-out"
                />
                <p className="text-sm text-gray-500 mt-2">Adjust the maximum distance you are willing to travel for jobs. (e.g., 5-200 km)</p>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg hover:shadow-xl"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RepairerSettingsPage;
