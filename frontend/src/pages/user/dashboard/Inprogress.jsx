import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../../../store/authStore.js";
import { axiosInstance } from "../../../lib/axios.js";
import {
  getInProgressServices,
  customerRejectQuote,
} from "../../../services/apiService.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../components/LoadingSpinner.jsx";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  MessageSquare,
  Phone,
  Check,
  Clock,
  MapPin,
  AlertCircle,
  User,
  XCircle,
  CheckCircle,
  IndianRupee,
} from "lucide-react";

const Inprogress = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [showConfirmAcceptModal, setShowConfirmAcceptModal] = useState(false);
  const [showConfirmRejectModal, setShowConfirmRejectModal] = useState(false);
  const [showConfirmCompletionModal, setShowConfirmCompletionModal] =
    useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(null);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fetchInProgressRequests = useCallback(async () => {
    if (!user || !user._id) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const responseData = await getInProgressServices();
      setRequests(responseData);
    } catch (err) {
      console.error(
        "Error fetching in-progress requests:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Failed to load your in-progress service requests."
      );
      toast.error("Failed to load your in-progress service requests.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInProgressRequests();
  }, [fetchInProgressRequests]);

  const showAcceptModal = (requestId) => {
    setCurrentRequestId(requestId);
    setShowConfirmAcceptModal(true);
  };

  const showRejectModal = (requestId) => {
    setCurrentRequestId(requestId);
    setShowConfirmRejectModal(true);
  };

  const showCompletionModal = (requestId) => {
    setCurrentRequestId(requestId);
    setShowConfirmCompletionModal(true);
    setOtpInput("");
    setOtpError(null);
  };

  const handleCancelModal = () => {
    setShowConfirmAcceptModal(false);
    setShowConfirmRejectModal(false);
    setShowConfirmCompletionModal(false);
    setCurrentRequestId(null);
    setOtpInput("");
    setOtpError(null);
  };

  const handleAcceptQuoteConfirmed = async () => {
    setShowConfirmAcceptModal(false);
    if (!currentRequestId) return;

    setActionMessage(null);
    try {
      const response = await axiosInstance.put(
        `/service-requests/user/${currentRequestId}/accept-quote`
      );

      if (response.status === 200 || response.data.success) {
        toast.success("Quotation accepted! Repairer will be notified.");
        fetchInProgressRequests();
      } else {
        setActionMessage({
          type: "error",
          text: response.data?.message || "Failed to accept quotation.",
        });
        toast.error("Failed to accept quotation.");
      }
    } catch (err) {
      console.error(
        "Error accepting quote:",
        err.response?.data || err.message
      );
      setActionMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "An error occurred while accepting the quotation.",
      });
      toast.error(
        err.response?.data?.message ||
          "An error occurred while accepting the quotation."
      );
    } finally {
      setCurrentRequestId(null);
    }
  };

  const handleRejectQuoteConfirmed = async () => {
    setShowConfirmRejectModal(false);
    if (!currentRequestId) return;

    setActionMessage(null);
    try {
      const response = await customerRejectQuote(currentRequestId);

      if (response.success && response.paymentId) {
        toast.success(
          "Quotation rejected. Redirecting to pay rejection fee..."
        );
        navigate(`/rejection-fee/${response.paymentId}`);
      } else {
        setActionMessage({
          type: "error",
          text: response?.message || "Failed to reject quotation.",
        });
        toast.error("Failed to reject quotation.");
      }
    } catch (err) {
      console.error(
        "Error rejecting quote:",
        err.response?.data || err.message
      );
      setActionMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "An error occurred while rejecting the quotation.",
      });
      toast.error(
        err.response?.data?.message ||
          "An error occurred while rejecting the quotation."
      );
    } finally {
      setCurrentRequestId(null);
    }
  };

  const handleConfirmCompletionConfirmed = async () => {
    setOtpError(null);

    if (!otpInput || otpInput.length !== 6 || !/^\d{6}$/.test(otpInput)) {
      setOtpError("Invalid OTP. Please enter a valid 6-digit code.");
      return;
    }

    try {
      const otpResponse = await axiosInstance.post("/user/verify-serviceotp/", {
        requestId: currentRequestId,
        otp: otpInput,
      });

      if (otpResponse.status === 200 || otpResponse.status === 201) {
        toast.success("OTP verified successfully!");
        setActionMessage(null);
        const statusUpdateResponse = await axiosInstance.put(
          `/service-requests/user/${currentRequestId}/status`,
          {
            status: "pending_payment",
          }
        );

        if (
          statusUpdateResponse.status === 200 ||
          statusUpdateResponse.data.success
        ) {
          const newPaymentId = statusUpdateResponse.data.paymentId;

          if (newPaymentId) {
            toast.success("Service confirmed as completed!");
            toast.success("Redirecting to payment page...");
            navigate(`/user/payment/${newPaymentId}`);
          } else {
            toast.error(
              "Service updated, but no payment ID received. Please check pending payments."
            );
            navigate("/user/dashboard");
          }

          fetchInProgressRequests();
          setShowConfirmCompletionModal(false);
          setCurrentRequestId(null);
          setOtpInput("");
        } else {
          setActionMessage({
            type: "error",
            text:
              statusUpdateResponse.data?.message ||
              "Failed to confirm service completion.",
          });
          toast.error("Failed to confirm service completion.");
        }
      } else {
        setOtpError(
          otpResponse.data?.message ||
            "OTP verification failed. Please try again."
        );
        toast.error(otpResponse.data?.message || "OTP verification failed.");
      }
    } catch (err) {
      console.error(
        "Error in completion process:",
        err.response?.data || err.message
      );
      const errorMessage =
        err.response?.data?.message || "An error occurred during verification.";
      setOtpError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleChatClick = (serviceId) => {
    navigate(`/user/chat/${serviceId}`);
  };

  if (loading) {
    return (
      // Full screen loader with white background
      <div className="flex justify-center items-center h-screen bg-white">
        <LoadingSpinner message="Loading your in-progress services..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 bg-red-100 text-red-700 rounded-xl shadow-lg mb-6">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Your Services in Progress
        </h1>
      </div>

      {actionMessage && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
            actionMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="ml-auto text-current"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {requests.length === 0 && !loading && !error ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No active services
          </h3>
          <p className="text-gray-600">
            You don't have any services currently in progress. Create a new
            service request to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {request.title}
                    </h2>
                    <p className="text-gray-600 mt-1">{request.description}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                    ${
                                      request.status === "accepted"
                                        ? "bg-green-100 text-green-800"
                                        : request.status === "quoted"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : request.status === "in_progress"
                                        ? "bg-blue-100 text-blue-800"
                                        : request.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                  >
                    {request.status === "accepted"
                      ? "Accepted"
                      : request.status === "quoted"
                      ? "Quoted"
                      : request.status === "in_progress"
                      ? "In Progress"
                      : request.status === "pending_quote"
                      ? "Pending Quote"
                      : request.status === "requested"
                      ? "Requested"
                      : request.status === "rejected"
                      ? "Rejected"
                      : request.status}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center mb-3">
                    <Wrench className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="font-medium">Service Type:</span>
                    <span className="ml-2 capitalize">
                      {request.serviceType}
                    </span>
                  </div>

                  <div className="flex items-center mb-3">
                    <Clock className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="font-medium">Requested:</span>
                    <span className="ml-2">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">
                      {request.location?.address}, {request.location?.pincode}
                    </span>
                  </div>

                  {request.repairer && (
                    <div className="flex items-center mb-3">
                      <User className="w-5 h-5 text-gray-500 mr-2" />
                      <div>
                        <div className="font-medium">
                          Repairer: {request.repairer.fullname}
                        </div>
                        <div className="text-sm text-gray-600">
                          Phone: {request.repairer.phone || "N/A"}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    {request.estimatedPrice > 0 && (
                      <div className="flex items-center mb-3">
                        <IndianRupee className="w-5 h-5 text-gray-700 mr-2" />
                        <span className="font-medium text-lg text-gray-900">
                          Final Amount:
                        </span>
                        <span className="ml-2 text-xl font-bold text-green-700">
                          ₹{request.estimatedPrice}
                        </span>
                      </div>
                    )}
                    {request.quotation && request.estimatedPrice === 0 && (
                      <div className="flex items-center mb-3 text-gray-600">
                        <span className="font-medium">Initial Estimate:</span>
                        <span className="ml-2">₹{request.quotation}</span>
                      </div>
                    )}

                    {request.status === "quoted" &&
                    request.estimatedPrice > 0 ? (
                      <>
                        <p className="text-gray-600 mb-4">
                          Please review the quoted amount by the repairer and
                          decide.
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => showAcceptModal(request._id)}
                            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                          >
                            <Check className="w-5 h-5 mr-2" /> Accept Amount
                          </button>
                          <button
                            onClick={() => showRejectModal(request._id)}
                            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-5 h-5 mr-2" /> Reject Quote
                          </button>
                        </div>
                      </>
                    ) : request.status === "pending_quote" ? (
                      <div className="flex items-center mb-3 text-blue-700">
                        <Clock className="w-5 h-5 mr-2" />
                        <span className="font-medium">
                          Awaiting Repairer's Quotation...
                        </span>
                      </div>
                    ) : request.status === "accepted" &&
                      request.estimatedPrice > 0 ? (
                      <div className="flex items-center mb-3 text-green-700">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Quotation Accepted!</span>
                        <span className="ml-2 text-lg font-bold">
                          ₹{request.estimatedPrice}
                        </span>
                      </div>
                    ) : request.status === "rejected" ? (
                      <div className="flex items-center mb-3 text-red-700">
                        <XCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Quotation Rejected.</span>
                        {request.estimatedPrice > 0 && (
                          <span className="ml-2 text-gray-600">
                            Original Quote: ₹{request.estimatedPrice}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex justify-between mt-6 space-x-2">
                  {request.repairer && (
                    <>
                      <button
                        onClick={() => handleChatClick(request._id)}
                        className="flex items-center text-blue-600 hover:text-blue-800 p-2 rounded-md"
                      >
                        <MessageSquare className="w-5 h-5 mr-1" /> Chat
                      </button>
                      {request.repairer.phone && (
                        <a
                          href={`tel:${request.repairer.phone}`}
                          className="flex items-center text-gray-600 hover:text-gray-800 p-2 rounded-md"
                        >
                          <Phone className="w-5 h-5 mr-1" /> Call Repairer
                        </a>
                      )}
                    </>
                  )}

                  {request.status === "pending_otp" && (
                    <button
                      onClick={() => showCompletionModal(request._id)}
                      className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
                    >
                      <Check className="w-5 h-5 mr-1" /> Confirm Completed &
                      Verify OTP
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showConfirmAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Acceptance
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to **accept this quotation**? This will mark
              the service as accepted and notify the repairer.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptQuoteConfirmed}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                Yes, Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Rejection
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to **reject this quotation**? A rejection
              fee of ₹150 will be charged.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectQuoteConfirmed}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
              >
                Yes, Reject
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Service Completion
            </h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to confirm this service as completed? This
              will initiate payment.
            </p>
            <div className="mb-6">
              <label
                htmlFor="otp"
                className="block text-left text-gray-700 font-medium mb-2"
              >
                Enter 6-digit OTP:
              </label>
              <input
                type="text"
                id="otp"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                maxLength="6"
                className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 ${
                  otpError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="e.g., 123456"
              />
              {otpError && (
                <p className="text-red-500 text-sm mt-2 text-left">
                  {otpError}
                </p>
              )}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompletionConfirmed}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                Confirm & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inprogress;