// frontend/src/components/user/ServiceRequestFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestService } from '../../services/apiService.js';
import servicefromjson from '../../services.json'; 

import {
  X,
  Info,
  SquarePen,
  ArrowLeft,
  MapPin,
  LocateFixed,
  ArrowRight,
  Loader,
  CheckCircle,
  Rocket,
  Sparkles,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import LoadingSpinner from '../LoadingSpinner.jsx';

const ServiceRequestFormModal = ({
  isOpen,
  onClose,
  initialServiceType,
  initialDefaultTitle,
  onServiceCreated
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const navigate = useNavigate();

  const [locationData, setLocationData] = useState({
    fullAddress: '',
    pincode: '',
    city: '',
    state: '',
    coordinates: [],
    captureMethod: 'manual'
  });
  const [serviceDetails, setServiceDetails] = useState({
    title: initialDefaultTitle || '',
    description: '',
    serviceType: initialServiceType || '',
    preferredTimeSlot: {
      date: new Date().toISOString().split('T')[0],
      time: ''
    },
    urgency: 'medium',
    budget: '', 
    contactInfo: '',
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [loadingEstimation, setLoadingEstimation] = useState(false);
  const [showEstimationPopup, setShowEstimationPopup] = useState(false);
  const [priceRange, setPriceRange] = useState('');

  const mainServiceCategories = servicefromjson.home_services.map(item => ({
    title: item.main_category,
    value: item.main_category
  }));

  const categories = servicefromjson.home_services.find(
    item => item.main_category.toLowerCase() === serviceDetails.title.toLowerCase()
  )?.categories || [];

  const issues = servicefromjson.home_services
    .find(item => item.main_category.toLowerCase() === serviceDetails.title.toLowerCase())
    ?.categories.find(cat => cat.category.toLowerCase() === selectedCategory.toLowerCase())
    ?.services || [];


  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedIssue('');
  };

  const handleIssueChange = (e) => {
    setSelectedIssue(e.target.value);
  };

  const handleMainServiceChange = (e) => {
    const selectedMainService = e.target.value;
    setServiceDetails(prev => ({
      ...prev,
      title: selectedMainService,
      serviceType: selectedMainService
    }));
    setSelectedCategory('');
    setSelectedIssue(''); 
    setPriceRange(''); 
  };


  useEffect(() => {
    if (initialServiceType && initialDefaultTitle) {
      setServiceDetails(prev => ({
        ...prev,
        title: initialDefaultTitle,
        serviceType: initialServiceType
      }));
    }
  }, [initialServiceType, initialDefaultTitle]);

  useEffect(() => {
    if (selectedCategory && selectedIssue && serviceDetails.title) {
      const matchedCategory = servicefromjson.home_services.find(
        item => item.main_category.toLowerCase() === serviceDetails.title.toLowerCase()
      );

      const matchedSubCategory = matchedCategory?.categories?.find(
        cat => cat.category === selectedCategory
      );

      const matchedIssue = matchedSubCategory?.services?.find(
        svc => svc.issue === selectedIssue
      );

      if (matchedIssue?.price_range) {
        setPriceRange(matchedIssue.price_range);
      } else {
        setPriceRange(""); 
      }
    }
  }, [selectedCategory, selectedIssue, serviceDetails.title]);

  const handleAIEstimation = () => {
    if (!selectedCategory || !selectedIssue) {
      toast.error("Please select both category and issue to get an estimation.");
      return;
    }

    setLoadingEstimation(true);
    setTimeout(() => {
      setLoadingEstimation(false);
      setShowEstimationPopup(true);
    }, 2000);
  };


  const resetForm = useCallback(() => {
    setStep(1);
    setLoading(false);
    setIsSubmitting(false);
    setLocationError('');
    setShowSuccessScreen(false);
    setLocationData({
      fullAddress: '',
      pincode: '',
      city: '',
      state: '',
      coordinates: [],
      captureMethod: 'manual'
    });
    setServiceDetails({
      title: initialDefaultTitle || '',
      description: '',
      serviceType: initialServiceType || '',
      preferredTimeSlot: {
        date: new Date().toISOString().split('T')[0],
        time: ''
      },
      urgency: 'medium',
      budget: '',
      contactInfo: '',
    });
    setSelectedCategory('');
    setSelectedIssue('');
    setPriceRange('');
    setShowEstimationPopup(false);
    setLoadingEstimation(false);
  }, [initialServiceType, initialDefaultTitle]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);


  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({ ...prev, [name]: value }));
    setLocationError(''); 
  };

  const handleServiceDetailsChange = (e) => {
    const { name, value } = e.target;
    if (name === 'preferredTimeSlot') {
      setServiceDetails(prev => ({
        ...prev,
        preferredTimeSlot: {
          ...prev.preferredTimeSlot,
          time: value 
        }
      }));
    } else {
      setServiceDetails(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleGeoLocate = async () => {
    setLoading(true);
    setLocationError('');
    setLocationData(prev => ({ ...prev, captureMethod: 'gps' })); 

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      const { latitude, longitude } = position.coords;
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      const response = await fetch(nominatimUrl);
      const data = await response.json();

      if (data && data.address) {
        setLocationData(prev => ({
          ...prev,
          fullAddress: data.display_name || `${data.address.road || ''}, ${data.address.neighbourhood || data.address.suburb || ''}, ${data.address.city || data.address.town || ''}`,
          pincode: data.address.postcode || '',
          city: data.address.city || data.address.town || data.address.village || '',
          state: data.address.state || '',
          coordinates: [longitude, latitude] 
        }));
        toast.success('Location detected!');
      } else {
        setLocationError("Could not retrieve detailed address for this location.");
        toast.error('Failed to get detailed address from GPS.');
      }
    } catch (err) {
      console.error("Geolocation error:", err);
      if (err.code === err.PERMISSION_DENIED) {
        setLocationError("Location access denied. Please enable location services in your browser settings.");
      } else {
        setLocationError("Failed to fetch GPS location. Please try manual entry.");
      }
      setLocationData(prev => ({ ...prev, captureMethod: 'manual' })); // Fallback to manual
    } finally {
      setLoading(false);
    }
  };


  const handleLocationNext = () => {
    if (locationData.captureMethod === 'gps' && (!locationData.fullAddress || !locationData.pincode)) {
      setLocationError("GPS location detected, but couldn't get a full address or pincode. Please ensure location services are accurate or switch to manual entry.");
      return;
    }
    if (locationData.captureMethod === 'manual' && (!locationData.fullAddress.trim() || !locationData.pincode.trim())) {
      setLocationError("Please provide a full address and pincode for manual entry.");
      return;
    }

    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(locationData.pincode)) {
      setLocationError("Please enter a valid 6-digit pincode.");
      return;
    }

    setStep(2); 
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocationError('');

    if (!serviceDetails.title) {
        toast.error("Please select a main service type.");
        setIsSubmitting(false);
        return;
    }
    if (!selectedCategory || !selectedIssue) {
      toast.error("Please select both a category and an issue.");
      setIsSubmitting(false);
      return;
    }
    if (!serviceDetails.description.trim()) {
      toast.error("Please provide a job description.");
      setIsSubmitting(false);
      return;
    }
    if (!serviceDetails.preferredTimeSlot.time) {
      toast.error("Please select a preferred time slot.");
      setIsSubmitting(false);
      return;
    }
    if (!serviceDetails.contactInfo) {
      toast.error("Please provide your contact information (phone number or email).");
      setIsSubmitting(false);
      return;
    }
    if (!locationData.fullAddress || !locationData.pincode || !locationData.captureMethod) {
      toast.error("Please provide your full address, postal code, and select a location capture method.");
      setIsSubmitting(false);
      return;
    }

    try {
      const requestPayload = {
        title: serviceDetails.title,
        serviceType: serviceDetails.title, 
        description: serviceDetails.description,
        preferredDate: serviceDetails.preferredTimeSlot.date,
        preferredTime: serviceDetails.preferredTimeSlot.time,
        contactInfo: serviceDetails.contactInfo,
        locationData: {
          fullAddress: locationData.fullAddress,
          pincode: locationData.pincode,
          city: locationData.city || undefined, 
          state: locationData.state || undefined, 
          coordinates: locationData.coordinates.length === 2 ? locationData.coordinates : undefined,
          captureMethod: locationData.captureMethod
        },
        issue: selectedIssue, 
        category: selectedCategory, 
        quotation: priceRange, 
        preferredTimeSlot: { 
          date: serviceDetails.preferredTimeSlot.date,
          time: serviceDetails.preferredTimeSlot.time,
        }
      };

      console.log("Sending service request payload:", requestPayload);

      const response = await requestService(requestPayload);

      if (response.success) {
        toast.success("Service Requested Successfully!");
        setShowSuccessScreen(true);
        if (onServiceCreated) {
          onServiceCreated(); 
        }
      } else {
        toast.error(response.message || 'Failed to create service request.');
      }
    } catch (error) {
      console.error('Error creating service request:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'An error occurred while creating service request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 sm:p-0 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative max-h-[95vh] overflow-y-auto transform transition-all duration-500 ease-out scale-90 opacity-0 animate-scaleInAndFade">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition-transform duration-200 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full p-2 z-10"
          aria-label="Close modal"
        >
          <X size={30} strokeWidth={2.5} />
        </button>

        {showSuccessScreen ? (
          <div className="flex flex-col items-center justify-center text-center py-10 animate-fadeIn">
            <div className="relative w-32 h-32 mb-8">
              <CheckCircle className="w-full h-full text-green-500 animate-popIn" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="confetti-piece left-10 top-10" style={{ transform: 'rotate(15deg) translate(-10px, -10px)' }}></div>
                <div className="confetti-piece right-10 top-20" style={{ transform: 'rotate(-25deg) translate(15px, 5px)' }}></div>
                <div className="confetti-piece left-20 bottom-10" style={{ transform: 'rotate(30deg) translate(-5px, 10px)' }}></div>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Service Requested! 🎉
            </h2>
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              Your request for <span className="font-semibold text-green-700">{serviceDetails.title}</span> has been successfully submitted.
            </p>
            <p className="text-md text-gray-600 mb-8 max-w-sm">
              We're matching you with a professional. You'll receive updates soon!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                onClick={() => {
                  onClose();
                  navigate('/user/inprogress');
                }}
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
              >
                <ClipboardList className="mr-2" size={20} /> View My Services
              </button>
              <button
                onClick={() => resetForm()}
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center justify-center"
              >
                <Rocket className="mr-2" size={20} /> Request Another
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-green-200 pb-4 flex items-center pr-12 relative">
              <Sparkles className="mr-3 text-green-500" size={30} strokeWidth={2} /> Request Service
              {serviceDetails.title && (
                 <span className="text-green-600 ml-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-[calc(100%-100px)]">
                    : {serviceDetails.title}
                 </span>
              )}
            </h2>

            <div className="flex justify-center items-center mb-8">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 text-xl
                            ${step === 1 ? 'bg-green-600 shadow-lg ring-4 ring-green-200' : 'bg-gray-300'}`}>
                {step === 1 ? '1' : <CheckCircle size={24} />}
              </div>
              <div className="flex-1 h-1.5 bg-gradient-to-r from-green-300 to-green-100 mx-3 transition-all duration-500 ease-in-out" style={{ background: step > 1 ? 'linear-gradient(to right, #4CAF50, #8BC34A)' : 'linear-gradient(to right, #E5E7EB, #F3F4F6)' }}></div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 text-xl
                            ${step === 2 ? 'bg-green-600 shadow-lg ring-4 ring-green-200' : 'bg-gray-300'}`}>
                {step === 2 ? '2' : ' '}
              </div>
            </div>


            {step === 1 && (
              <div className="animate-slideInRight">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <MapPin className="mr-3 text-green-600" size={26} strokeWidth={2} /> Step 1: Confirm Your Location
                </h3>

                <div className="space-y-5 mb-8">
                  <h4 className="font-semibold text-gray-800 text-lg">How would you like to provide your location?</h4>
                  <div className="grid grid-cols-1 gap-5">
                    {/* GPS Location Card */}
                    <button
                      onClick={() => {
                        setLocationData(prev => ({ ...prev, captureMethod: 'gps' }));
                        setLocationError('');
                      }}
                      className={`p-5 border-2 rounded-2xl text-left transition-all duration-300 ease-in-out flex items-center group
                        ${locationData.captureMethod === 'gps'
                          ? 'border-green-600 bg-green-50 shadow-lg scale-[1.02] transform'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                    >
                      <LocateFixed className={`w-8 h-8 text-green-700 mr-5 transition-transform group-hover:scale-110 group-hover:rotate-3 ${locationData.captureMethod === 'gps' ? 'scale-110 rotate-3' : ''}`} strokeWidth={2} />
                      <div>
                        <div className="font-bold text-gray-900 text-xl">Use GPS Location</div>
                        <div className="text-sm text-gray-600">Automatically detect your current location for accuracy</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setLocationData(prev => ({ ...prev, captureMethod: 'manual' }));
                        setLocationError('');
                        setLocationData(prev => ({
                          ...prev,
                          fullAddress: '',
                          pincode: '',
                          city: '',
                          state: '',
                          coordinates: []
                        }));
                      }}
                      className={`p-5 border-2 rounded-2xl text-left transition-all duration-300 ease-in-out flex items-center group
                        ${locationData.captureMethod === 'manual'
                          ? 'border-green-600 bg-green-50 shadow-lg scale-[1.02] transform'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                    >
                      <MapPin className={`w-8 h-8 text-green-700 mr-5 transition-transform group-hover:scale-110 group-hover:rotate-3 ${locationData.captureMethod === 'manual' ? 'scale-110 rotate-3' : ''}`} strokeWidth={2} />
                      <div>
                        <div className="font-bold text-gray-900 text-xl">Enter Manually</div>
                        <div className="text-sm text-gray-600">Type your address and pincode yourself</div>
                      </div>
                    </button>
                  </div>
                </div>

                {locationData.captureMethod === 'gps' && (
                  <div className="mb-6 animate-fadeIn">
                    <button
                      onClick={handleGeoLocate}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3.5 px-4 rounded-xl hover:from-green-600 hover:to-green-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner className="w-5 h-5 animate-spin" />
                          <span>Detecting Location...</span>
                        </>
                      ) : (
                        <>
                          <LocateFixed className="w-5 h-5" />
                          <span>Get My Location</span>
                        </>
                      )}
                    </button>
                    {locationData.fullAddress && (
                      <div className="bg-green-50 border border-green-300 rounded-xl p-4 mt-5 text-green-800 flex items-center animate-fadeIn">
                        <CheckCircle className="text-green-600 mr-3 w-6 h-6" />
                        <div>
                          <p className="text-sm font-bold mb-1">Detected Address:</p>
                          <p className="text-base">{locationData.fullAddress}</p>
                          <p className="text-xs text-green-600 mt-1">Pincode: {locationData.pincode || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {locationData.captureMethod === 'manual' && (
                  <div className="animate-fadeIn">
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="fullAddress">
                        Full Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="fullAddress"
                        name="fullAddress"
                        value={locationData.fullAddress}
                        onChange={handleLocationChange}
                        rows="3"
                        className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white focus:border-green-500 transition-all duration-200"
                        placeholder="e.g., House No., Street, Area"
                        required
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="pincode">
                          Postal Code (Pincode) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="pincode"
                          name="pincode"
                          value={locationData.pincode}
                          onChange={(e) => setLocationData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                          className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white focus:border-green-500 transition-all duration-200"
                          placeholder="e.g., 302001"
                          maxLength="6"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="city">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={locationData.city}
                          onChange={handleLocationChange}
                          className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white focus:border-green-500 transition-all duration-200"
                          placeholder="e.g., Jaipur"
                        />
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="state">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={locationData.state}
                        onChange={handleLocationChange}
                        className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white focus:border-green-500 transition-all duration-200"
                        placeholder="e.g., Rajasthan"
                      />
                    </div>
                  </div>
                )}

                {locationError && (
                  <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6 font-medium flex items-center animate-fadeIn">
                    <Info className="w-5 h-5 mr-2 text-red-600" />
                    <span className="block sm:inline">{locationError}</span>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={handleLocationNext}
                    disabled={loading || !locationData.captureMethod || (locationData.captureMethod === 'manual' && (!locationData.fullAddress.trim() || !locationData.pincode.trim()))}
                    className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold py-3 px-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg cursor-pointer"
                  >
                    Next <ArrowRight className="ml-3 w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="animate-slideInRight">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <SquarePen className="mr-3 text-green-600" size={26} strokeWidth={2} /> Step 2: Job Details
                </h3>

                {!initialDefaultTitle && (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="mainServiceType">
                            Select Main Service Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                id="mainServiceType"
                                name="mainServiceType"
                                value={serviceDetails.title}
                                onChange={handleMainServiceChange}
                                className="shadow-inner border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white focus:border-green-500 transition-all duration-200 appearance-none pr-8"
                                required
                            >
                                <option value="">-- Select a Main Service --</option>
                                {mainServiceCategories.map((cat, index) => (
                                    <option key={index} value={cat.value}>
                                        {cat.title}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>
                )}

                {initialDefaultTitle && (
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="title">
                            Service Type
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={serviceDetails.title}
                            readOnly
                            className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 bg-gray-100 leading-tight focus:outline-none cursor-not-allowed"
                        />
                    </div>
                )}


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="category">
                      Select Category {serviceDetails.title ? `in ${serviceDetails.title}` : ''} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            id="category"
                            name="category"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="shadow-inner border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white focus:border-green-500 transition-all duration-200 appearance-none pr-8"
                            required
                            disabled={!serviceDetails.title} 
                        >
                            <option value="">-- Select a Category --</option>
                            {categories.map((cat, index) => (
                                <option key={index} value={cat.category}>
                                    {cat.category}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="issue">
                      Select An Issue <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            id="issue"
                            name="issue"
                            value={selectedIssue}
                            onChange={handleIssueChange}
                            className="shadow-inner border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white focus:border-green-500 transition-all duration-200 appearance-none pr-8"
                            required
                            disabled={!selectedCategory} 
                        >
                            <option value="">-- Select an Issue --</option>
                            {issues.map((issue, index) => (
                                <option key={index} value={issue.issue}>
                                    {issue.issue}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleAIEstimation}
                    disabled={!selectedCategory || !selectedIssue}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 cursor-pointer font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed "
                  >
                    Get AI-Based Estimation
                  </button>
                </div>


                {/* Fullscreen Spinner for Estimation */}
                {loadingEstimation && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-2xl">
                      <div className="border-t-4 border-green-500 border-solid rounded-full w-16 h-16 animate-spin-slow mb-4"></div>
                      <p className="text-gray-700 text-lg font-medium">Calculating best estimate...</p>
                    </div>
                  </div>
                )}

                {/* Estimation Modal */}
                {showEstimationPopup && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-5 relative transform transition-all duration-300 ease-out scale-90 opacity-0 animate-scaleInAndFade border border-green-200">
                      <button
                        onClick={() => setShowEstimationPopup(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-transform duration-200 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full p-1"
                        aria-label="Close estimation popup"
                      >
                        <X size={24} strokeWidth={2.5} />
                      </button>
                      <h2 className="text-3xl font-extrabold text-green-700 mb-3 flex items-center justify-center">
                        <Sparkles className="mr-3 text-green-500" size={30} strokeWidth={2} /> AI Quotation
                      </h2>
                      <p className="text-4xl font-extrabold text-gray-900">₹{priceRange}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Based on your selection: <strong className="text-gray-800">{selectedCategory}</strong> – <em className="text-gray-700">{selectedIssue}</em>
                      </p>
                      <div className="text-xs text-gray-500 leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <strong className="text-red-600">Important:</strong> The technician will verify this and confirm the Quotation during the visit. A <span className="text-red-600 font-medium">₹150</span> fee applies if the service request is cancelled after the technician's visit.
                      </div>
                      <button
                        onClick={() => setShowEstimationPopup(false)}
                        className="mt-6 px-8 py-3 bg-green-600 text-white rounded-xl cursor:pointer hover:bg-green-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer"
                      >
                        Got It!
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="description">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={serviceDetails.description}
                    onChange={handleServiceDetailsChange}
                    rows="4"
                    className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white focus:border-green-500 transition-all duration-200"
                    placeholder="Describe the problem in detail (e.g., 'My kitchen faucet is constantly dripping, needs a new washer or full replacement.')"
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="text"
                    value={new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    readOnly
                    className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 bg-gray-100 leading-tight focus:outline-none cursor-not-allowed"
                    aria-label="Preferred Date"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Currently set to today's date automatically.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="preferredTimeSlot">
                    Preferred Time Slot <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                      <select
                          id="preferredTimeSlot"
                          name="preferredTimeSlot"
                          value={serviceDetails.preferredTimeSlot.time}
                          onChange={handleServiceDetailsChange}
                          className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white focus:border-green-500 transition-all duration-200  pr-8"
                          required
                      >
                          <option value="">Select a time slot</option>
                          <option value="morning">Morning (9 AM - 12 PM)</option>
                          <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                          <option value="evening">Evening (5 PM - 9 PM)</option>
                          <option value="flexible">Anytime during the day</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="contactInfo">
                    Contact Information (Phone Number) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="contactInfo"
                    name="contactInfo"
                    value={serviceDetails.contactInfo}
                    onChange={handleServiceDetailsChange}
                    className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white focus:border-green-500 transition-all duration-200"
                    placeholder="e.g., 9876543210"
                    required
                  />
                  <div className="text-center text-red-600 text-sm mt-1">
                    *This is where the repairer will call you or send your completion OTP
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="urgency">
                    Urgency
                  </label>
                  <div className="relative">
                      <select
                          id="urgency"
                          name="urgency"
                          value={serviceDetails.urgency}
                          onChange={handleServiceDetailsChange}
                          className="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white focus:border-green-500 transition-all duration-200  pr-8"
                      >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical (Emergency)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>


                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <ArrowLeft className="mr-3 w-5 h-5" strokeWidth={2.5} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold py-3 px-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg cursor-pointer"
                  >
                    {isSubmitting ? <Loader className="animate-spin mr-2" size={20} /> : <CheckCircle className="mr-3 w-5 h-5" strokeWidth={2.5} />}
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
      <style>
        {`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-popIn {
          animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
        }

        /* Basic confetti styling for success screen */
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: #4CAF50; /* Green */
          opacity: 0;
          animation: fadeOutAndFall 1.5s ease-out forwards;
        }

        .confetti-piece:nth-child(2) {
          background-color: #FFC107; /* Amber */
          animation-delay: 0.1s;
        }

        .confetti-piece:nth-child(3) {
          background-color: #2196F3; /* Blue */
          animation-delay: 0.2s;
        }

        @keyframes fadeOutAndFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(50px) rotate(180deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }

        @keyframes scaleInAndFade {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleInAndFade { animation: scaleInAndFade 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

        @keyframes slideInRight {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out forwards; }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 1.5s linear infinite; }
        `}
      </style>
    </div>
  );
};

export default ServiceRequestFormModal;