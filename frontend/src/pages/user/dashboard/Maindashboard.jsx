// frontend/src/pages/user/dashboard/Maindashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore.js';
import { getUserDashboardStats, getUserRecentActivity } from '../../../services/apiService.js';
import toast from 'react-hot-toast';
import AnimatedNumber from '../../../components/common/AnimatedNumber.jsx';
import ServiceRequestFormModal from '../../../components/user/ServiceRequestFormModal.jsx';
import DashboardHeader from '../../../components/user/DashboardHeader.jsx';

import {
  AirVent,
  User,
  Clock,
  X,
  Info,
  Sparkles, 
  Droplets,
  Hammer,
  Paintbrush,
  PaintRoller,
  Bug,
  Shield,
  Truck,
  Flower,
  Ruler,
  Wrench,
  MessageCircle,
  Bell,
  Home, 
  ClipboardList, 
  Edit,
  Users,
  ThumbsUp,
  ClipboardCheck,
  FileText,
  Briefcase,
  Rocket,
  LayoutDashboard,
  Zap,
  ArrowRight,
  CheckCircle
} from "lucide-react";


const UserMainDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore(); 

  const isAuthenticated = !!user;

  const [showServiceFormModal, setShowServiceFormModal] = useState(false);
  const [selectedServiceData, setSelectedServiceData] = useState(null);

  const [dashboardStats, setDashboardStats] = useState({
    totalServices: 0,
    completedServices: 0,
    inProgressServices: 0,
  });
  const [recentUserActivity, setRecentUserActivity] = useState([]);
  const [loadingDashboardData, setLoadingDashboardData] = useState(true);
  const [errorDashboardData, setErrorDashboardData] = useState(null);

  const serviceIcons = {
    "Appliances": AirVent,
    "Electrical": Zap,
    "Plumbing": Droplets,
    "Carpentry": Hammer,
    "Cleaning": Paintbrush,
    "Painting & Renovation": PaintRoller,
    "Pest Control": Bug,
    "Security & Automation": Shield,
    "Moving & Storage": Truck,
    "Gardening & Landscaping": Flower,
    "Interior Design": Ruler,
    "General Repairs": Wrench,
    "Specialized Services": Sparkles,
    "Service Requested": FileText, 
    "Service In Progress": Briefcase,
    "Service Completed": ClipboardCheck,
    "Service Cancelled": X,
    "Account Update": User,
    "Notification": Bell,
    "Message": MessageCircle,
  };

  const getIconForType = (type) => {
    if (serviceIcons[type]) return serviceIcons[type];
    if (type.toLowerCase().includes("requested")) return serviceIcons["Service Requested"];
    if (type.toLowerCase().includes("in progress")) return serviceIcons["Service In Progress"];
    if (type.toLowerCase().includes("completed")) return serviceIcons["Service Completed"];
    if (type.toLowerCase().includes("cancelled")) return serviceIcons["Service Cancelled"];
    if (type.toLowerCase().includes("message")) return serviceIcons["Message"];
    if (type.toLowerCase().includes("account")) return serviceIcons["Account Update"];
    return Home; 
  };


  const services = [
    {
      icon: AirVent,
      title: "Appliances",
      description: "Repair & maintenance for AC, fridge, washing machine & more.",
      category: "Appliances"
    },
    {
      icon: Zap,
      title: "Electrical",
      description: "Wiring, fixtures, short circuits, and new installations.",
      category: "Electrical"
    },
    {
      icon: Droplets,
      title: "Plumbing",
      description: "Leak repair, pipe fitting, drainage issues & bathroom fixes.",
      category: "Plumbing"
    },
    {
      icon: Hammer,
      title: "Carpentry",
      description: "Furniture repair, custom woodwork, doors, and window fixes.",
      category: "Carpentry"
    },
    {
      icon: Paintbrush,
      title: "Cleaning",
      description: "Deep home cleaning, bathroom, kitchen, & office cleaning.",
      category: "Cleaning"
    },
    {
      icon: PaintRoller,
      title: "Painting & Renovation",
      description: "Interior/exterior painting, minor wall repairs & upgrades.",
      category: "Painting & Renovation"
    },
    {
      icon: Bug,
      title: "Pest Control",
      description: "Effective solutions for termites, rodents, cockroaches & more.",
      category: "Pest Control"
    },
    {
      icon: Shield,
      title: "Security & Automation",
      description: "Smart locks, CCTV installation, alarm systems & automation.",
      category: "Security & Automation"
    },
    {
      icon: Truck,
      title: "Moving & Leasing",
      description: "Reliable packing, shifting, and secure short-term storage.",
      category: "Moving & Leasing"
    },
    {
      icon: Flower,
      title: "Gardening & Landscaping",
      description: "Garden design, plant care, lawn maintenance & landscape work.",
      category: "Gardening & Landscaping"
    },
    {
      icon: Ruler,
      title: "Interior Design",
      description: "Personalized home styling, space planning & decor solutions.",
      category: "Interior Design"
    },
    {
      icon: Wrench,
      title: "General Repairs",
      description: "Odd jobs, general household fixes, and small installations.",
      category: "Repairs and Installation"
    },
    {
      icon: Sparkles,
      title: "Specialized Services",
      description: "Accessibility mods, gutter cleaning, septic tank maintenance.",
      category: "Specialized Services"
    }
  ];
  const refreshDashboardStats = useCallback(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) {
        setLoadingDashboardData(false);
        return;
      }
      setLoadingDashboardData(true);
      setErrorDashboardData(null);
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          getUserDashboardStats(),
          getUserRecentActivity()
        ]);
        setDashboardStats({
          totalServices: statsResponse.totalServices,
          completedServices: statsResponse.completedServices,
          inProgressServices: statsResponse.inProgressServices,
        });
        setRecentUserActivity(activityResponse);
      } catch (err) {
        console.error("Error fetching user dashboard data:", err);
        setErrorDashboardData("Failed to load dashboard data. Please refresh.");
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoadingDashboardData(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    refreshDashboardStats();
  }, [user, refreshDashboardStats]);


  const handleServiceClick = (service) => {
    if (!isAuthenticated) {
      toast.error("Please login to request a service.");
      navigate('/user/login');
      return;
    }
    setSelectedServiceData(service);
    setShowServiceFormModal(true);
  };

  const handleQuickActionNewService = () => {
    if (!isAuthenticated) {
      toast.error("Please login to request a service.");
      navigate('/user/login');
      return;
    }
    setSelectedServiceData(null);
    setShowServiceFormModal(true);
  };


  const handleModalClose = () => {
    setShowServiceFormModal(false);
    setSelectedServiceData(null);
  };
  const handleMessagesClick = () => {
    console.log("User Messages button clicked. Navigating to /user/messages");
    navigate('/user/messages');
  };

  const handleNotificationsClick = () => {
    console.log("User Notifications button clicked. Navigating to /user/notifications");
    navigate('/user/notifications');
  };

  if (!user && !loadingDashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-3xl shadow-2xl border border-gray-200 animate-fadeInUp">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-8 text-xl leading-relaxed">Please log in as a user to unlock your personalized dashboard and services.</p>
          <Link to="/user/login" className="px-10 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans antialiased overflow-hidden">
  
      <DashboardHeader
        user={user}
        handleMessagesClick={handleMessagesClick}
        handleNotificationsClick={handleNotificationsClick}
      />

      {/* Main Content */}
      <main className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-10 py-16">

        <div className="mb-20 text-center animate-fadeInUp">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700">{user?.fullname?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
            Your one-stop solution for all home services. Let's make your life easier.
          </p>
        </div>

        <section className="mb-20 animate-fadeInUp delay-100">
          <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link
              to="#"
              onClick={handleQuickActionNewService}
              className="group bg-gradient-to-br from-green-500 to-green-600 text-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-offset-2"
            >
              <Rocket className="w-16 h-16 mb-4 text-green-100 transition-transform group-hover:rotate-6 group-hover:scale-110" strokeWidth={1.5} />
              <h3 className="text-3xl font-bold mb-2">Request New Service</h3>
              <p className="text-green-100 text-base leading-relaxed opacity-90">Quickly book any home repair or maintenance.</p>
            </Link>
            <Link
              to="/user/inprogress"
              className="group bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-offset-2"
            >
              <LayoutDashboard className="w-16 h-16 mb-4 text-gray-600 transition-transform group-hover:-rotate-6 group-hover:scale-110" strokeWidth={1.5} />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">View Active Requests</h3>
              <p className="text-gray-600 text-base leading-relaxed">Track the status of your ongoing and pending services.</p>
            </Link>
          </div>
        </section>


        <section className="mb-20 animate-fadeInUp delay-200">
          <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center">Explore Our Home Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
            {services.map((service, index) => (
              <div
                key={index}
                className="service-card bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer overflow-hidden group relative p-8 flex flex-col items-center text-center"
              >
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-green-50 to-white rounded-t-3xl -z-10 opacity-70"></div>
                <div className={`bg-gradient-to-br from-green-500 to-green-700 text-white w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  {React.createElement(service.icon, { className: "w-10 h-10 sm:w-12 sm:h-12" })}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">{service.description}</p>

                <div className="mt-auto w-full">
                  <button
                    onClick={() => handleServiceClick(service)}
                    className="w-full bg-green-500 text-white py-3 rounded-full font-bold text-lg hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Book Visit <span className="ml-2 px-2 py-0.5 bg-white text-green-600 rounded-full text-xs font-bold">FREE</span>
                    <ArrowRight className="ml-2 w-5 h-5 text-white transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                  </button>
                  <div className="text-xs text-gray-500 leading-snug mt-3 px-2 py-1 bg-green-50 border border-green-200 rounded-lg">
                    <strong className="text-red-600">Note:</strong> ₹150 cancellation fee applies after technician visit.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 bg-white rounded-3xl shadow-2xl p-10 lg:p-14 border border-gray-100 animate-fadeInUp delay-300">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Simple Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10 lg:gap-x-8 relative">
 
            <div className="absolute hidden lg:block inset-x-0 top-[25%] transform -translate-y-1/2 z-0">
              <div className="flex justify-between items-center px-16">
                <div className="w-full border-t-2 border-dashed border-green-300"></div>
                <div className="w-full border-t-2 border-dashed border-green-300"></div>
                <div className="w-full border-t-2 border-dashed border-green-300"></div>
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-4 relative z-10 animate-fadeInUp delay-400">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-full mb-5 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <ClipboardList className="w-12 h-12" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Choose Service</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Browse our categories and select the perfect service for your needs.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 relative z-10 animate-fadeInUp delay-500">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-full mb-5 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Edit className="w-12 h-12" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Describe Job</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Tell us what you need done, when, and where. It's quick & easy.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 relative z-10 animate-fadeInUp delay-600">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-full mb-5 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Users className="w-12 h-12" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Get Matched</h3>
              <p className="text-gray-600 text-sm leading-relaxed">We connect you with highly-rated, local service professionals.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 relative z-10 animate-fadeInUp delay-700">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-full mb-5 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <ThumbsUp className="w-12 h-12" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">4. Service Done!</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Enjoy your restored home. Pay securely after the job is complete.</p>
            </div>
          </div>
        </section>


        {/* Quick Stats */}
        <section className="mb-20 animate-fadeInUp delay-400">
          <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center">Your Dashboard At a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingDashboardData ? (
              <>
                <div className="bg-gray-200 rounded-3xl p-10 animate-pulse h-48 shadow-xl"></div>
                <div className="bg-gray-200 rounded-3xl p-10 animate-pulse h-48 shadow-xl"></div>
                <div className="bg-gray-200 rounded-3xl p-10 animate-pulse h-48 shadow-xl"></div>
              </>
            ) : errorDashboardData ? (
              <div className="md:col-span-3 bg-red-100 text-red-700 p-6 rounded-xl text-center font-medium border border-red-200 shadow-md">
                <Info className="inline-block w-5 h-5 mr-2" /> Error: {errorDashboardData}
              </div>
            ) : (
              <>
                <div className="bg-white rounded-3xl p-8 text-gray-800 flex flex-col items-center justify-center shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <Home className="w-14 h-14 text-gray-500 mb-4" strokeWidth={1.5} />
                  <p className="text-gray-600 text-lg font-medium">Total Services</p>
                  <p className="text-5xl font-extrabold text-gray-900 mt-2">
                    <AnimatedNumber value={dashboardStats.totalServices} />
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-8 text-white flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <CheckCircle className="w-14 h-14 text-green-200 mb-4" strokeWidth={1.5} />
                  <p className="text-green-100 text-lg font-medium">Completed Services</p>
                  <p className="text-5xl font-extrabold text-white mt-2">
                    <AnimatedNumber value={dashboardStats.completedServices} />
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl p-8 text-white flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <Clock className="w-14 h-14 text-orange-200 mb-4" strokeWidth={1.5} />
                  <p className="text-orange-100 text-lg font-medium">In Progress</p>
                  <p className="text-5xl font-extrabold text-white mt-2">
                    <AnimatedNumber value={dashboardStats.inProgressServices} />
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mb-16 animate-fadeInUp delay-500">
          <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center">Your Recent Activity</h2>
          {loadingDashboardData ? (
            <div className="bg-white p-10 rounded-3xl shadow-xl animate-pulse border border-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-200 rounded-lg mb-4 last:mb-0"></div>
              ))}
            </div>
          ) : errorDashboardData ? (
            <div className="bg-red-100 text-red-700 p-6 rounded-xl border border-red-200 text-center font-medium shadow-md">
              <Info className="inline-block w-5 h-5 mr-2" /> Error: {errorDashboardData}
            </div>
          ) : recentUserActivity.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center text-gray-500 text-xl border border-gray-100">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No recent activity to display yet. Let's get some services booked!</p>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
              <ul className="divide-y divide-gray-200">
                {recentUserActivity.map((activity, index) => {
                  const ActivityIcon = getIconForType(activity.message);
                  return (
                    <li key={index} className="flex flex-col sm:flex-row items-start sm:items-center py-4 first:pt-0 last:pb-0 group hover:bg-gray-50 transition-colors duration-200 rounded-lg px-3 -mx-3">
                      <div className="flex items-center mb-2 sm:mb-0 sm:mr-6 w-full sm:w-auto">
                        <div className="p-2 bg-green-100 rounded-full mr-4 shadow-sm group-hover:bg-green-200 transition-colors">
                          <ActivityIcon className="w-6 h-6 text-green-700" strokeWidth={2} />
                        </div>
                        <span className="text-gray-800 font-medium text-lg leading-snug">{activity.message}</span>
                      </div>
                      <span className="ml-auto text-sm text-gray-500 mt-1 sm:mt-0 whitespace-nowrap">{activity.time}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

      </main>

      <ServiceRequestFormModal
        isOpen={showServiceFormModal}
        onClose={handleModalClose}
        initialServiceType={selectedServiceData?.category || null}
        initialDefaultTitle={selectedServiceData?.title || null}
        onServiceCreated={refreshDashboardStats}
      />

      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }

        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slideInDown { animation: slideInDown 0.5s ease-out forwards; }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }

        /* Custom focus styles for inputs and buttons for better accessibility and visual feedback */
        input:focus, textarea:focus, select:focus, button:focus {
          outline: none;
          box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.5), 0 0 0 2px white; /* Green focus ring */
          border-color: #4CAF50; /* Ensure border also changes to green */
        }

        /* Custom style to hide default dropdown arrow and use Lucide icon */
        select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: none;
        }

        /* Note: Confetti and modal specific animations are now in ServiceRequestFormModal.jsx */
        /* Note: spin-slow animation is now in ServiceRequestFormModal.jsx */
        `}
      </style>
    </div>
  );
};

export default UserMainDashboard;