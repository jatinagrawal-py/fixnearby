import React from 'react';
import {  Send, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

const ServiceRequestModal = ({
  showModal,
  onClose,
  onSubmit,
  descriptionInput,
  setDescriptionInput,
  isSubmitting,
  submitError,
  submitSuccessMessage,
  selectedRepairer, 
  serviceCategory,
  userLocation
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Service Request</h2>
        <p className="text-gray-600 mb-4">
          For: <span className="font-semibold">{selectedRepairer?.fullname}</span>
        </p>
        <p className="text-gray-600 mb-4">
          Service: <span className="font-semibold">{serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)}</span>
        </p>
        <p className="text-gray-600 mb-4">
          Location: <span className="font-semibold">{userLocation?.fullAddress}, {userLocation?.pincode}</span>
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="descriptionInput" className="block text-sm font-medium text-gray-700 mb-1">
              Describe Your Issue
            </label>
            <textarea
              id="descriptionInput"
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., My kitchen sink is leaking, need a plumber to fix it urgently."
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              disabled={isSubmitting}
              required
            ></textarea>
          </div>

          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>{submitError}</span>
            </div>
          )}
          {submitSuccessMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl flex items-center space-x-2">
              <CheckCircle size={20} />
              <span>{submitSuccessMessage}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:opacity-90 transition-opacity flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={16} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceRequestModal;