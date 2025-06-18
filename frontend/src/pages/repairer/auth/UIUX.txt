import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router-dom for navigation
import {
  Wrench,
  Phone,
  Mail,
  ArrowRight,
  Shield,
  CheckCircle,
  Loader,
  Eye,
  EyeOff,
  User,
  Building,
  Star,
  Award
} from 'lucide-react';
import { axiosInstance } from '../../../lib/axios';

const Getotp = () => {
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    method: 'email' // Default to email as per your backend controller
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.method === 'phone') {
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    } else { // method === 'email'
      if (!formData.email) {
        newErrors.email = 'Email address is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {};
      if (formData.method === 'phone') {
        payload.phone = formData.phone;
      } else {
        payload.email = formData.email;
      }

      const response = await axiosInstance.post('/repairer/get-otp', payload);

      console.log('OTP API Response:', response.data);
      // Assuming your backend sends the email back on successful OTP verification
      // For `verifyOtp`, it sends email. For `getOtp`, it just sends a message.
      // You might want to pass the email/phone to the next page for OTP verification.
      navigate('/repairer/verify-otp', { state: { email: formData.email, phone: formData.phone } });

    } catch (error) {
      console.error('Error sending OTP:', error);
      // Display error message to user
      if (error.response && error.response.data && error.response.data.message) {
        setErrors(prev => ({ ...prev, general: error.response.data.message }));
      } else {
        setErrors(prev => ({ ...prev, general: 'Failed to send OTP. Please try again.' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Verification",
      description: "Your information is protected with enterprise-grade security"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Trusted Platform",
      description: "Join thousands of verified professionals on fixNearby"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Professional Growth",
      description: "Build your reputation and grow your repair business"
    }
  ];

  const benefits = [
    "Access to high-quality repair jobs in your area",
    "Flexible working hours and competitive pricing",
    "Direct communication with verified customers",
    "Secure payment processing and timely payouts",
    "Professional profile and rating system",
    "24/7 support and business tools"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                fixNearby
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/repairer/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Already have an account?
              </a>
              <a href="/user/getotp" className="text-blue-600 hover:text-purple-600 font-medium transition-colors">
                Looking for repairs?
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Join as Professional</h1>
              <p className="text-gray-600 text-lg">
                Start your journey as a trusted repair professional
              </p>
            </div>

            {/* Method Selection */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, method: 'phone' }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.method === 'phone'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Phone className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Phone</div>
                  <div className="text-sm text-gray-500">Get OTP via SMS</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, method: 'email' }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.method === 'email'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Mail className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-500">Get OTP via Email</div>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {formData.method === 'phone' ? (
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.phone ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={`block w-full pl-10 pr-3 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              )}

              {errors.general && (
                <p className="mt-2 text-sm text-red-600 text-center">{errors.general}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
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

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                By continuing, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-purple-600 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-purple-600 font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Right Side - Benefits */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Join{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  fixNearby?
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join the leading platform connecting skilled professionals with customers who need quality repair services.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What you'll get:</h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Active Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50K+</div>
                <div className="text-sm text-gray-600">Jobs Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">4.9★</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Professional Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join fixNearby today and connect with customers who need your expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Get Started Now</span>
            </button>
            <a href="#" className="text-white hover:text-blue-100 font-medium flex items-center space-x-2">
              <span>Learn more about our platform</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">fixNearby</span>
              </div>
              <p className="text-gray-400">
                Connecting skilled professionals with customers who need quality repair services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Professionals</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Join as Professional</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Professional Login</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Find Professionals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Book Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Customer Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety & Trust</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 fixNearby. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Getotp;