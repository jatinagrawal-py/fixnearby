// frontend/src/components/LandingPage/PopularServicesSection.jsx
import React from 'react';
import { IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link

const PopularServicesSection = ({ popularServices }) => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-12 animate-fade-in-up">
          Popular Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularServices.map((service, index) => (
            <Link
              to="/user/login" 
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden block
                         transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-in-out"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-6 text-left">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-black flex items-center">
                    <IndianRupee className="w-6 h-6 mr-1" />
                    {service.price}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularServicesSection;