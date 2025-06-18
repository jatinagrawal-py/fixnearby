import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import servicefromjson from '../../../services.json';
import {
  Wrench,
  Phone,
  Mail,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  User,
  Lock,
  MapPin,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  Loader,
  CreditCard,
  IdCard
} from 'lucide-react';
import { axiosInstance } from '../../../lib/axios';
import toast from "react-hot-toast";
import LoadingSpinner from '../../../components/LoadingSpinner';

const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone;
  
  useEffect(() => {
    if (!phone) {
      navigate("/repairer/getotp");
    }
  }, [phone, navigate]);

  const [formData, setFormData] = useState({
    fullname: '',
    password: '',
    upiId: '',
    confirmPassword: '',
    services: '',
    pincode: '',
    aadharcardNumber: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [signupSuccess, setSignupSuccess] = useState(false);

  const servicesOffered = servicefromjson.home_services.map(item => item.main_category);

  const benefits = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "Professional Growth",
      description: "Build your reputation and expand your client base"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Payments",
      description: "Get paid safely and on time for your services"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Flexible Schedule",
      description: "Work when you want and set your own rates"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }

    if (!formData.aadharcardNumber.trim()) {
      newErrors.aadharcardNumber = 'Aadhar Card Number is required';
    } else if (!/^\d{12}$/.test(formData.aadharcardNumber.trim())) {
      newErrors.aadharcardNumber = 'Aadhar Card Number must be 12 digits';
    }

    if (!formData.upiId.trim()) {
      newErrors.upiId = 'UPI ID is required';
    } else if (!/^[\w.-]{2,256}@[a-zA-Z]{3,64}$/.test(formData.upiId.trim())) { 
      newErrors.upiId = 'Please enter a correct UPI ID (e.g., yourname@bank)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } 
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.services) {
      newErrors.services = 'Please select your service';
    }
    
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (formData.pincode.length !== 6) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axiosInstance.post('/repairer/signup', {
        fullname: formData.fullname,
        phone,
        upiId: formData.upiId,
        password: formData.password,
        services: formData.services,
        aadharcardNumber: formData.aadharcardNumber,
        pincode : formData.pincode
      });

      if (response.status === 201) {
        setSignupSuccess(true);
        toast.success('Signup successful!');
        console.log('Signup successful:', response.data);

        setTimeout(() => {
          navigate('/repairer/dashboard');
          // window.location.reload(); 
        }, 2000); 
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md mx-4">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Created!</h1>
          <p className="text-gray-600 mb-6">
            You've successfully joined fixNearby. Redirecting to your dashboard...
          </p>
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
      <header className="bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center justify-center mb-6 cursor-pointer">
            <a href="/">
              <img
                src="/images/logooo.png"
                alt="fixNearby Logo"
                className="h-10 w-auto rounded-lg shadow-md cursor-pointer"
              />
            </a>
          </div>
            <div className="flex items-center space-x-4">
              <Link to="/repairer/login" className="text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                Already have an account?
              </Link>
              <Link to="/user/getotp" className="text-emerald-600 hover:text-lime-600 font-medium transition-colors">
                Looking for repairs?
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your {phone}</h1>
              <p className="text-gray-600 text-lg">
                Join as a professional and start earning today
              </p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullname" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                      errors.fullname ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.fullname && (
                  <p className="mt-2 text-sm text-red-600">{errors.fullname}</p>
                )}
              </div>

              <div>
                <label htmlFor="aadharcardNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  Aadhar Card Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="aadharcardNumber"
                    name="aadharcardNumber"
                    value={formData.aadharcardNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 12-digit Aadhar Number"
                    maxLength="12"
                    className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                      errors.aadharcardNumber ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.aadharcardNumber && (
                  <p className="mt-2 text-sm text-red-600">{errors.aadharcardNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="upiId" className="block text-sm font-semibold text-gray-700 mb-2">
                  UPI ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="upiId"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    placeholder="Enter your UPI ID (e.g., yourname@bank)"
                    className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                      errors.upiId ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.upiId && (
                  <p className="mt-2 text-sm text-red-600">{errors.upiId}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      className={`block w-full pl-10 pr-10 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className={`block w-full pl-10 pr-10 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="services" className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Offered
                  </label>
                  <div className="relative">
                    
                    
                    <select
                      id="services" 
                      name="services" 
                      value={formData.services} 
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                        errors.services ? 'border-red-300' : 'border-gray-200' 
                      }`}
                    >
                      <option value="">Select your service</option>
                      {servicesOffered.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                    <center className='text-red-600 text-sm'>*You can add more services from profile section</center>
                  </div>
                  {errors.services && (
                    <p className="mt-2 text-sm text-red-600">{errors.services}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="pincode" className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="302019"
                      maxLength="6"
                      className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                        errors.pincode ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.pincode && (
                    <p className="mt-2 text-sm text-red-600">{errors.pincode}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms-and-conditions" className="text-emerald-600 hover:text-lime-600 font-medium" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="text-emerald-600 hover:text-lime-600 font-medium" target="_blank">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Start Your{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                  Success Story
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of professionals who are building their careers on fixNearby.
              </p>
            </div>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Join Our Community</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">25+</div>
                  <div className="text-sm text-gray-600">Professionals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">100+</div>
                  <div className="text-sm text-gray-600">Jobs Done</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">4.9★</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">Jatin Agrawal</div>
                  <div className="text-emerald-100 text-sm">Electrician</div>
                </div>
              </div>
              <p className="text-emerald-100 mb-4">
                "fixNearby helped me grow my business by 80% in just 2 months. The platform is user-friendly and the support team is amazing!"
              </p>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-yellow-300" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/images/logooo.png" 
                  alt="fixNearby Logo" 
                  className="h-10 w-auto rounded-lg shadow-md" 
                />
              </div>
              <p className="text-gray-400">
                Connecting skilled professionals with customers who need quality repair services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Professionals</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Join as Professional</Link></li>
                <li><Link to="/repairer/login" className="hover:text-white transition-colors">Professional Login</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">How it Works</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/user/getotp" className="hover:text-white transition-colors">Find Professionals</Link></li>
                <li><Link to="/user/getotp" className="hover:text-white transition-colors">Book Services</Link></li>
                <li><Link to="/contact-us" className="hover:text-white transition-colors">Customer Support</Link></li>
                <li><Link to="/contact-us" className="hover:text-white transition-colors">Safety & Trust</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact-us" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="contact-us" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 fixNearby. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Signup;