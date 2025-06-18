import React, { useState } from 'react';
import { Link , useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Wrench, User, CheckCircle, Phone } from 'lucide-react';
import { axiosInstance } from '../../../lib/axios';
import toast from "react-hot-toast";

const phoneSchema = {
  validate: (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone) {
      return { success: false, error: 'Phone number is required' };
    }
    if (!phoneRegex.test(phone)) {
      return { success: false, error: 'Please enter a valid 10-digit phone number' };
    }
    return { success: true };
  }
};

const Getotp = () => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = phoneSchema.validate(phone);
    
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axiosInstance.post("/repairer/getotp",{phone});
      if (response.status ===200 || response.status === 201) {
        toast.success('OTP sent successfully!'); 
        setPhone(''); 
        navigate("/repairer/verify-otp",{ state: { phone } });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.'; 
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6 cursor-pointer">
            <a href="/">
              <img
                src="/images/logooo.png"
                alt="fixNearby Logo"
                className="h-10 w-auto rounded-lg shadow-md cursor-pointer"
              />
            </a>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started (Repairer)</h1> 
          <p className="text-gray-600">Enter your phone to receive an OTP code</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
          
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500" 
                  placeholder="Enter your phone Number"
                  maxLength="10" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We'll send a 6-digit OTP code to this phone number
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">or</span>
            </div>
          </div>

          {/* User Registration */}
          <div className="text-center space-y-4"> 
            <p className="text-gray-600 text-sm">
              Want to look for services?
            </p>
            <Link to="/user/getotp" 
              className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:border-emerald-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center space-x-2" 
            >
              <User className="w-5 h-5" />
              <span>Register as a User</span>
            </Link>
          </div>
        </div>

        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/repairer/login" className="text-emerald-600 hover:text-lime-600 font-semibold transition-colors"> 
              Sign in
            </Link>
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <a href="/privacy-policy" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
            <a href="/terms-and-conditions" className="hover:text-gray-700 transition-colors">Terms of Service</a>
            <a href="/contact-us" className="hover:text-gray-700 transition-colors">Help</a>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4"> 
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="bg-emerald-100 rounded-full p-1"> 
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">Secure & Private</h3> 
              <p className="text-xs text-emerald-700"> {/* Theme change */}
                Your phone number is encrypted and will only be used for account verification and service updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Getotp;