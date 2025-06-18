import React, { useState , useEffect} from 'react';
import { Mail, ArrowRight, Wrench, User, CheckCircle } from 'lucide-react';
import { axiosInstance } from '../../../lib/axios';
import toast from "react-hot-toast";
import { useLocation, useNavigate , Link } from 'react-router-dom';

const Verifyotp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone;

  useEffect(() => {
    if (!phone) {
      navigate("/user/getotp"); 
    }
  }, [phone, navigate]);

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(otp.length !== 6){
      toast.error('Please enter a valid 6-digit OTP');
      setOtp('');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axiosInstance.post("/user/verify-otp",{phone,otp});
      if (response.status ===200 || response.status === 201) {
        toast.success('OTP verified successfully!');
        setOtp(''); 
        navigate("/user/signup",{ state: { phone } });
        window.location.reload();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP. Please try again.';
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
          <p className="text-gray-600">Enter your OTP to verify {phone}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                6 digit OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your OTP (6 digits)"
                  maxLength="6"
                />
              </div>
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
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/user/login" className="text-emerald-600 hover:text-lime-600 font-semibold transition-colors">
              Sign in
            </a>
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <Link to="/privacy-policy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
            <Link to="/contact-us" className="hover:text-gray-700 transition-colors">Help</Link>
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
              <p className="text-xs text-emerald-700">
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

export default Verifyotp;