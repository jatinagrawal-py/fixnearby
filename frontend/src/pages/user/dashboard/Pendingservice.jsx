import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { axiosInstance } from '../../../lib/axios';
import {
  Clock,
  XCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Loader
} from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

const statusIcons = {
  requested: <Clock className="w-5 h-5 text-yellow-500" />,
  cancelled: <XCircle className="w-5 h-5 text-red-500" />,
  in_progress: <Info className="w-5 h-5 text-blue-500" />,
  completed: <CheckCircle className="w-5 h-5 text-green-500" />
};

const Pendingservice = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelMessage, setCancelMessage] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [requestIdToCancel, setRequestIdToCancel] = useState(null);

  const { user } = useAuthStore();

  const fetchServiceRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/service-requests/user/my-requests?statusFilter=requested');
      setRequests(response.data.data);
    } catch (err) {
      console.error('Error fetching pending requests:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load pending service requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user._id) {
      fetchServiceRequests();
    } else {
      setError("You must be logged in to view your service requests.");
      setLoading(false);
    }
  }, [user, fetchServiceRequests]);

  const confirmCancelRequest = (requestId) => {
    setRequestIdToCancel(requestId);
    setShowConfirmModal(true);
  };

  const handleCancelConfirmation = async () => {
    setShowConfirmModal(false);
    if (!requestIdToCancel) return;

    setIsCancelling(true);
    setCancelMessage(null);

    try {
      const response = await axiosInstance.put(`/service-requests/user/${requestIdToCancel}/status`, {
        status: 'cancelled'
      });
      if (response.status === 200 || response.data.success) {
        setCancelMessage({ type: 'success', text: 'Request cancelled successfully!' });
        fetchServiceRequests();
      } else {
        setCancelMessage({ type: 'error', text: response.data?.message || 'Failed to cancel request.' });
      }
    } catch (err) {
      console.error('Error cancelling request:', err.response?.data || err.message);
      setCancelMessage({ type: 'error', text: err.response?.data?.message || 'Failed to cancel request due to an unexpected error.' });
    } finally {
      setIsCancelling(false);
      setRequestIdToCancel(null);
    }
  };

  const handleCancelModalClose = () => {
    setShowConfirmModal(false);
    setRequestIdToCancel(null);
    setCancelMessage(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
     
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center bg-white rounded-xl shadow-lg mt-8">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
        <p className="text-gray-700 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Service Requests</h1>
      </div>

      {cancelMessage && (
        <div className={`mb-4 p-3 rounded-xl flex items-center space-x-2 ${
          cancelMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {cancelMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{cancelMessage.text}</span>
          <button onClick={() => setCancelMessage(null)} className="ml-auto text-current">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No pending requests</h3>
          <p className="text-gray-600">
            You don't have any pending service requests. Create a new request to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repairer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map(request => (
                  <tr key={request.id || request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {statusIcons[request.status] || <Info className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.title}</div>
                          <div className="text-sm text-gray-500">{request.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.repairer?.fullname || 'Not assigned'}</div>
                      {request.repairer?.phone && (
                        <div className="text-xs text-gray-500">Phone: {request.repairer.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status.replace(/_/g, ' ').charAt(0).toUpperCase() + request.status.replace(/_/g, ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {request.status === 'requested' && (
                        <button
                          onClick={() => confirmCancelRequest(request.id || request._id)}
                          disabled={isCancelling}
                          className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCancelling && requestIdToCancel === (request.id || request._id) ? (
                            <LoadingSpinner className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-1" />
                          )}
                          Cancel
                        </button>
                      )}
                      {request.status === 'in_progress' && (
                        <span className="text-gray-500">Contact repairer</span>
                      )}
                      {request.status === 'completed' && (
                        <span className="text-green-600">Service Done!</span>
                      )}
                      {request.status === 'cancelled' && (
                        <span className="text-red-600">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Cancellation</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to cancel this service request?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelModalClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isCancelling}
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelConfirmation}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <LoadingSpinner className="w-5 h-5 animate-spin" />
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pendingservice;