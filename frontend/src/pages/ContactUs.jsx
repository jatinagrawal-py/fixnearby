import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Users, Shield, CreditCard, AlertCircle, CheckCircle, Send, Headphones } from 'lucide-react';
import { Link } from "react-router-dom";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    userType: '',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

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
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.userType) newErrors.userType = 'Please select user type';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
      
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          mobile: '',
          userType: '',
          subject: '',
          message: '',
          priority: 'medium'
        });
      }, 3000);
    }
  };

  const contactOptions = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Customer Support",
      description: "24/7 support for urgent issues",
      contact: "+91 98765 43210",
      bgColor: "bg-emerald-50", 
      iconColor: "text-emerald-600", 
      textColor: "text-emerald-800" 
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "General Inquiries",
      description: "For non-urgent questions",
      contact: "support@fixnearby.com",
      bgColor: "bg-emerald-50", 
      iconColor: "text-emerald-600",
      textColor: "text-emerald-800" 
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Report Issues",
      description: "Report repairer misconduct",
      contact: "report@fixnearby.com",
      bgColor: "bg-red-50", 
      iconColor: "text-red-600", 
      textColor: "text-red-800" 
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Payment Issues",
      description: "Commission & payment help",
      contact: "payments@fixnearby.com",
      bgColor: "bg-amber-50", 
      iconColor: "text-amber-600", 
      textColor: "text-amber-800" 
    }
  ];

  const quickHelp = [
    {
      question: "How do I become a repairer?",
      answer: "Download the app, complete registration with your mobile number, and start accepting service requests!"
    },
    {
      question: "What if the repairer doesn't show up?",
      answer: "Contact our support immediately. Remember, we're a connecting platform - resolve directly with repairer first."
    },
    {
      question: "How does commission work?",
      answer: "Commission is automatically deducted from customer payment before transferring to your UPI ID."
    },
    {
      question: "Can I get a refund for poor service?",
      answer: "Service quality disputes are between you and the repairer. We don't provide refunds as we're just a platform."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100"> 
        
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-emerald-700 bg-opacity-30 backdrop-blur p-3 rounded-full"> 
                <Headphones className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto"> 
              Need help? We're here for you! Choose the best way to reach out based on your query type.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Contact Options */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Get in Touch</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactOptions.map((option, index) => (
              <div key={index} className={`${option.bgColor} p-6 rounded-xl hover:shadow-lg transition-shadow`}>
                <div className={`${option.iconColor} mb-4`}>
                  {option.icon}
                </div>
                <h3 className={`font-bold text-lg mb-2 ${option.textColor}`}>
                  {option.title}
                </h3>
                <p className={`text-sm mb-3 ${option.textColor} opacity-80`}>
                  {option.description}
                </p>
                <div className={`font-semibold ${option.textColor}`}>
                  {option.contact}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-emerald-600" /> 
              Send us a Message
            </h2>
            
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-600">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${ 
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${ 
                        errors.mobile ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      I am a *
                    </label>
                    <select
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        errors.userType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select user type</option>
                      <option value="customer">Customer</option>
                      <option value="repairer">Repairer</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.userType && <p className="text-red-500 text-xs mt-1">{errors.userType}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${ 
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Brief description of your issue"
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="5"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${ 
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Please provide detailed information about your query..."
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-800 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            )}
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-8">
            {/* Office Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-emerald-600" /> {/* Changed text color */}
                Our Office
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Address</h3>
                    <p className="text-gray-600">
                      123 Tech Hub, Sector 62<br />
                      Noida, Uttar Pradesh 201301<br />
                      India
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 7:00 PM<br />
                      Saturday: 10:00 AM - 5:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">24/7 Support</h3>
                    <p className="text-gray-600">
                      Emergency issues are handled<br />
                      round the clock via app notifications
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600" /> {/* Changed text color */}
                Quick Help
              </h2>
              <div className="space-y-4">
                {quickHelp.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-gray-800 mb-2">{item.question}</h3>
                    <p className="text-gray-600 text-sm">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}