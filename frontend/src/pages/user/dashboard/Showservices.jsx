import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../lib/axios.js';


import RepairerCard from '../../../components/ShowServices/RepairerCard.jsx';
import ServiceRequestModal from '../../../components/ShowServices/ServiceRequestModal.jsx';
import LoadingSpinner from '../../../components/LoadingSpinner.jsx'; 
import ErrorMessage from '../../../components/ErrorMessage.jsx'; 
import StatusMessage from '../../../components/StatusMessage.jsx'; 

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
  Info 
} from "lucide-react";


const Showservices = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { serviceCategory, userLocation } = location.state || {};

  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showServiceRequestForm, setShowServiceRequestForm] = useState(false);
  const [selectedRepairerForRequest, setSelectedRepairerForRequest] = useState(null);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [autoSubmitSuccess, setAutoSubmitSuccess] = useState(false);
  const [autoSubmitError, setAutoSubmitError] = useState(null);
  const [hasAttemptedAutoSubmit, setHasAttemptedAutoSubmit] = useState(false);

  const autoSubmitRequestSentRef = useRef(false);

  const allowedServiceTypes = useMemo(() => [
    'electronics', 'appliances', 'plumbing', 'electrical',
    'carpentry', 'painting', 'automotive', 'hvac', 'other'
  ], []);

  const autoSubmitServiceRequest = useCallback(async () => {
    console.log('autoSubmitServiceRequest called. hasAttemptedAutoSubmit (state):', hasAttemptedAutoSubmit, 'autoSubmitting (state):', autoSubmitting, 'autoSubmitRequestSentRef.current:', autoSubmitRequestSentRef.current);

    if (autoSubmitRequestSentRef.current) {
      console.log('autoSubmitServiceRequest: Request already sent via ref, returning.');
      return;
    }

    if (hasAttemptedAutoSubmit || autoSubmitting) {
      console.log('autoSubmitServiceRequest: Already attempted (state) or currently submitting (state), returning.');
      return;
    }

    autoSubmitRequestSentRef.current = true;

    setAutoSubmitting(true);
    setAutoSubmitError(null);
    setAutoSubmitSuccess(false);

    try {
      console.log('autoSubmitServiceRequest: Sending request...');
      const requestPayload = {
        title: `${serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)} Service Request`,
        serviceType: serviceCategory,
        description: `Service request for ${serviceCategory} at ${userLocation.fullAddress}. No immediate repairer found.`,
        locationData: userLocation,
        preferredTimeSlot: 'flexible',
        urgency: 'medium',
        repairerId: null
      };

      const response = await axiosInstance.post('/service-requests', requestPayload);

      if (response.status === 201 || response.data.success) {
        setAutoSubmitSuccess(true);
        console.log('Auto-submitted service request successfully:', response.data);
      } else {
        setAutoSubmitError(response.data?.message || 'Failed to auto-submit service request.');
        console.error('Auto-submission failed:', response.data);
        autoSubmitRequestSentRef.current = false;
      }
    } catch (err) {
      console.error('Error during auto-submission:', err.response?.data || err.message);
      setAutoSubmitError(err.response?.data?.message || 'An unexpected error occurred during auto-submission.');
      autoSubmitRequestSentRef.current = false; 
    } finally {
      setAutoSubmitting(false);
      setHasAttemptedAutoSubmit(true);
      console.log('autoSubmitServiceRequest: Finished, hasAttemptedAutoSubmit set to true.');
    }
  }, [serviceCategory, userLocation, hasAttemptedAutoSubmit, autoSubmitting]);

  const fetchRepairers = useCallback(async () => {
    console.log('fetchRepairers called. hasAttemptedAutoSubmit:', hasAttemptedAutoSubmit, 'autoSubmitRequestSentRef.current:', autoSubmitRequestSentRef.current);

    if (!userLocation || !userLocation.pincode || !serviceCategory || !allowedServiceTypes.includes(serviceCategory.toLowerCase())) {
      setError("Invalid service category or location data is missing. Please go back and select a service and location.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setRepairers([]); 

    try {
      const response = await axiosInstance.get(`/user/dashboard?postalCode=${userLocation.pincode}&serviceType=${serviceCategory}`);
      setRepairers(response.data);

      if (response.data.length === 0 && !autoSubmitRequestSentRef.current) {
        console.log('fetchRepairers: No repairers found, attempting to auto-submit service request.');
        autoSubmitServiceRequest();
      } else if (response.data.length === 0 && autoSubmitRequestSentRef.current) {
        console.log('fetchRepairers: No repairers found, but auto-submit already sent via ref.');
      }

    } catch (err) {
      console.error('Error fetching repairers:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load available repairers.');
      if (!autoSubmitRequestSentRef.current) {
        console.log('Error fetching repairers, attempting to auto-submit service request as fallback.');
        autoSubmitServiceRequest();
      }
    } finally {
      setLoading(false);
    }
  }, [userLocation, serviceCategory, autoSubmitRequestSentRef, autoSubmitServiceRequest, hasAttemptedAutoSubmit, allowedServiceTypes]);

  useEffect(() => {
    console.log('Initial useEffect for Showservices.jsx triggered.');
    if (userLocation && serviceCategory) {
      fetchRepairers();
    } else {
      console.log('Initial useEffect: Missing userLocation or serviceCategory, redirecting.');
      navigate('/user/dashboard', { replace: true });
    }
  }, [fetchRepairers, userLocation, serviceCategory, navigate]);

  const openServiceRequestForm = (repairerId) => {
    const repairer = repairers.find(r => r._id === repairerId);
    setSelectedRepairerForRequest(repairer); 
    setDescriptionInput('');
    setSubmitSuccessMessage(null);
    setShowServiceRequestForm(true);
    setSubmitError(null);
  };

  const handleSubmitServiceRequest = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccessMessage(null);
    setIsSubmittingRequest(true);

    if (!descriptionInput) {
      setSubmitError("Please provide a description for your service request.");
      setIsSubmittingRequest(false);
      return;
    }
    if (!selectedRepairerForRequest) {
      setSubmitError("No repairer selected. Please select a repairer.");
      setIsSubmittingRequest(false);
      return;
    }

    try {
      console.log('handleSubmitServiceRequest: Sending request...');
      const response = await axiosInstance.post('/service-requests', {
        repairerId: selectedRepairerForRequest._id,
        title: `${serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)} Service Request`,
        serviceType: serviceCategory,
        description: descriptionInput,
        locationData: userLocation,
        preferredTimeSlot: 'flexible',
        urgency: 'medium'
      });

      if (response.status === 201 || response.data.success) {
        setSubmitSuccessMessage(`Service request submitted successfully for ${selectedRepairerForRequest.fullname}!`);
        setDescriptionInput('');
        setSelectedRepairerForRequest(null);
        setShowServiceRequestForm(false);
      } else {
        setSubmitError(response.data?.message || "Failed to submit service request.");
      }
    } catch (err) {
      console.error('Error creating service request:', err.response?.data || err.message);
      setSubmitError(err.response?.data?.message || 'An error occurred while submitting your request. Please try again.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (loading || autoSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-700">
        <LoadingSpinner />
        <p className="mt-8 text-xl font-medium text-gray-800">
          {loading ? `Finding repairers for ${serviceCategory || 'your service'}...` : 'Saving your service request...'}
        </p>
        <p className="mt-2 text-md text-gray-600">
          {loading ? 'Please wait a moment.' : 'We are saving your request and will notify you when a repairer is available.'}
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[80vh] bg-white rounded-xl shadow-lg my-8"> 
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Available Repairers for {serviceCategory ? serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1) : 'Your Service'}
      </h1>
      {userLocation && (
        <p className="text-lg text-gray-700 mb-8">
          Showing repairers for: <span className="font-semibold">{userLocation.fullAddress}</span> (Pincode: <span className="font-semibold">{userLocation.pincode}</span>)
        </p>
      )}

      {repairers.length > 0 ? (
        <>
          {submitError && (
            <StatusMessage type="error" message={submitError} className="mb-4" />
          )}
          {submitSuccessMessage && (
            <StatusMessage type="success" message={submitSuccessMessage} className="mb-4" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repairers.map(repairer => (
              <RepairerCard
                key={repairer._id}
                repairer={repairer}
                serviceCategory={serviceCategory}
                openServiceRequestForm={openServiceRequestForm}
              />
            ))}
          </div>

          <ServiceRequestModal
            showModal={showServiceRequestForm}
            onClose={() => setShowServiceRequestForm(false)}
            onSubmit={handleSubmitServiceRequest}
            descriptionInput={descriptionInput}
            setDescriptionInput={setDescriptionInput}
            isSubmitting={isSubmittingRequest}
            submitError={submitError}
            submitSuccessMessage={submitSuccessMessage}
            selectedRepairer={selectedRepairerForRequest}
            serviceCategory={serviceCategory}
            userLocation={userLocation}
          />
        </>
      ) : (
        <div className="text-center md:col-span-3 py-12 bg-white rounded-xl shadow-lg border border-gray-100">
          <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" /> {/* Neutral info icon */}
          <h3 className="text-xl font-medium text-gray-900 mb-2">No immediate repairers found</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any repairers available for your selected service ({serviceCategory.charAt(0).toUpperCase() + serviceCategory.slice(1)}) in pincode {userLocation.pincode} right now.
          </p>
          {autoSubmitting && (
            <StatusMessage type="loading" message="Saving your request automatically..." className="inline-flex mt-4" />
          )}
          {autoSubmitSuccess && (
            <StatusMessage type="success" message="Your request has been saved! We'll notify you when a repairer is available." className="inline-flex mt-4" />
          )}
          {autoSubmitError && (
            <StatusMessage type="error" message={`Error saving request: ${autoSubmitError}. Please try again later.`} className="inline-flex mt-4" />
          )}
          {!autoSubmitting && !autoSubmitSuccess && !autoSubmitError && hasAttemptedAutoSubmit && (
            <p className="text-gray-600 mt-4">
              Your request has been recorded. We will notify you via email when a repairer accepts.
            </p>
          )}

          <button
            onClick={() => navigate('/user/dashboard', { replace: true })}
            className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
          >
            Go Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default Showservices;