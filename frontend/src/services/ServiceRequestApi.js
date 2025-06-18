// api/serviceRequestApi.js
import axios from 'axios';


const api = axios.create({
  baseURL:  'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const serviceRequestApi = {
  
  createServiceRequest: async (serviceRequestData) => {
    try {
      const response = await api.post('/service-requests', serviceRequestData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create service request',
        details: error.response?.data?.errors || []
      };
    }
  },

  
  getUserServiceRequests: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/service-requests/my-requests?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch service requests'
      };
    }
  },

  
  getServiceRequestsByLocation: async (locationParams) => {
    try {
      const params = new URLSearchParams();
      if (locationParams.pincode) params.append('pincode', locationParams.pincode);
      if (locationParams.serviceType) params.append('serviceType', locationParams.serviceType);
      if (locationParams.latitude) params.append('latitude', locationParams.latitude);
      if (locationParams.longitude) params.append('longitude', locationParams.longitude);
      if (locationParams.radius) params.append('radius', locationParams.radius);

      const response = await api.get(`/service-requests/location?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch service requests by location'
      };
    }
  },

  // Update service request status
  updateServiceRequestStatus: async (requestId, status) => {
    try {
      const response = await api.patch(`/service-requests/${requestId}/status`, { status });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update service request status'
      };
    }
  },

  // Cancel service request
  cancelServiceRequest: async (requestId) => {
    try {
      const response = await api.patch(`/service-requests/${requestId}/status`, { 
        status: 'cancelled' 
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel service request'
      };
    }
  }
};

export default api;