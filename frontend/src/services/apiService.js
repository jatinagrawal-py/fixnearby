// frontend/src/services/apiService.js

import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast'; 

const apiRequest = async (method, url, data = {}, headers = {}) => {
    try {
        const response = await axiosInstance({ 
            method,
            url,
            data: method !== 'get' ? data : undefined,
            params: method === 'get' ? data : undefined, 
            headers,
        });
        return response.data; 
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
        console.error(`API Error: ${method.toUpperCase()} ${url}:`, errorMessage);
        throw error; 
    }
};

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api`;


export const getNearbyJobs = async () => apiRequest('get', '/repairer/nearby-jobs');
export const getRepairerDashboardStats = async () => apiRequest('get', '/repairer/dashboard-stats');
export const getRepairerRecentActivity = async () => apiRequest('get', '/repairer/recent-activity');
export const cancelRepairerJob = async (jobId, cancelDetails) => apiRequest('put', `/service-requests/cancel-by-repairer/${jobId}`, cancelDetails);
export const getRepairerProfileDetails = async () => apiRequest('get', '/repairer/profile');
export const updateRepairerProfile = async (profileData) => apiRequest('put', '/repairer/profile', profileData);
export const updateRepairerSettings = async (settingsData) => apiRequest('put', '/repairer/settings', settingsData);
export const getRepairerAnalytics = async () => apiRequest('get', '/repairer/analytics');
export const getRepairerConversationMessages = async (conversationId) => apiRequest('get', `/repairer/conversations/${conversationId}/messages`);
export const getRepairerNotifications = async () => apiRequest('get', '/repairer/notifications');
export const markRepairerNotificationAsRead = async (notificationId) => apiRequest('put', `/repairer/notifications/read/${notificationId}`);
export const getOtpRepairer = async (email) => apiRequest('post', '/repairer/get-otp', { email });
export const verifyOtpRepairer = async (email, otp) => apiRequest('post', '/repairer/verify-otp', { email, otp });
export const signupRepairer = async (signupData) => apiRequest('post', '/repairer/signup', signupData);
export const loginRepairer = async (email, password) => apiRequest('post', '/repairer/login', { email, password });
export const logoutRepairer = async () => apiRequest('post', '/repairer/logout');

export const getOtpUser = async (email) => apiRequest('post', '/user/get-otp', { email });
export const verifyOtpUser = async (email, otp) => apiRequest('post', '/user/verify-otp', { email, otp });
export const signupUser = async (signupData) => apiRequest('post', '/user/signup', signupData);
export const loginUser = async (email, password) => apiRequest('post', '/user/login', { email, password });
export const logoutUser = async () => apiRequest('post', '/user/logout');
export const getUserDashboardStats = async () => apiRequest('get', '/user/dashboard-stats');
export const getUserRecentActivity = async () => apiRequest('get', '/user/recent-activity');
export const requestService = async (serviceData) => apiRequest('post', '/service-requests', serviceData);
export const getInProgressServices = async () => apiRequest('get', '/user/in-progress-services');
export const getPendingServices = async () => apiRequest('get', '/user/pending-services');
export const cancelUserJob = async (jobId) => apiRequest('put', `/user/cancel-job/${jobId}`);
export const getUserConversations = async () => apiRequest('get', '/user/conversations');
export const getUserConversationMessages = async (conversationId) => apiRequest('get', `/user/conversations/${conversationId}/messages`);
export const checkAuthStatus = () => apiRequest('get', '/check-auth'); 

export const getUserNotifications = async () => {
    try {
        const response = await apiRequest('get', '/user/notifications');
        return { success: true, notifications: response.notifications, message: "Notifications fetched successfully" };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to fetch notifications.' };
    }
};

export const getRepairerAssignedJobs = async () => {
    try {
        const response = await apiRequest('get', '/service-requests/repairer/assigned-jobs');
        return response; 
    } catch (error) {
        console.error('API Error: Failed to fetch repairer assigned jobs', error);
        throw error;
    }
};
export const submitRepairerQuote = async (serviceId, quotation) => {
    try {
        const response = await apiRequest('put', `/service-requests/repairer/${serviceId}/quote`, { estimatedPrice : quotation });
        return response; 
    } catch (error) {
        console.error('API Error: Failed to submit repairer quote', error);
        throw error;
    }
};

export const PendingOtp = async (serviceId) => {
    const response = await apiRequest('post', `/service-requests/repairer/${serviceId}/pending`);
    return response;
};

export const completeJob = async (serviceId) => {
    const response = await apiRequest('post', `/service-requests/repairer/${serviceId}/complete`);
    return response;
};

export const acceptJob = async (jobId, data) => {
    const response = await apiRequest('put', `/service-requests/repairer/${jobId}/status`, data); 
    return response;
};

export const getRepairerConversations = async () => {
    try {
        const response = await apiRequest('get', '/repairer/conversations'); 
        return response; 
    } catch (error) {
        console.error('Error fetching repairer conversations:', error);
        throw error;
    }
};

export const getRepairerConversationsMap = async () => {
    try {
        const conversationsList = await getRepairerConversations(); 
        const conversationMap = conversationsList.reduce((acc, conv) => {
            if (conv.serviceId && conv.id) {
                acc[conv.serviceId] = conv.id;
            }
            return acc;
        }, {});
        return conversationMap;
    } catch (error) {
        console.error('Error building repairer conversations map:', error);
        throw error;
    }
};

export const createConversation = async (serviceRequestId) => {
    try {
        
        const response = await apiRequest('post', '/repairer/conversations/create', { serviceRequestId });
        return response; 
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
};
export const getServiceRequestById = async (serviceId) => apiRequest('get', `/user/service-requests/${serviceId}`);

//export const createRazorpayOrder = async (serviceRequestId) => apiRequest('post', '/user/create-razorpay-order', { serviceRequestId });

export const verifyAndTransferPayment = async (paymentDetails) => apiRequest('post', '/user/verify-and-transfer-payment', paymentDetails);

export const getPaymentDetailsById = async (paymentId) => apiRequest('get', `/user/payments/${paymentId}`);
export const customerRejectQuote = async (requestId) => {
    try {
        const response = await axiosInstance.put(`/service-requests/user/${requestId}/reject-quote`);
        return response.data; // Or whatever response you expect from the API
    } catch (error) {
        console.error(`Error rejecting quote for request ${requestId}:`, error);
        throw error;
    }
};

export const createRazorpayOrder = async (paymentRecordId) => { // Expects a string ID
    try {
        const response = await axiosInstance.post('/user/create-razorpay-order', { paymentRecordId }); // Send as an object with key
        return response.data;
    } catch (error) {
        console.error("API Error: POST /user/create-razorpay-order:", error.response?.data?.message || error.message);
        throw error;
    }
};

