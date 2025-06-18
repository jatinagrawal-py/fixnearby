// frontend/src/components/LandingPage/ServicesSection.jsx
import React from 'react';
import { Zap, Wrench, Paintbrush, Pipette, Home, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom'; 

const ServicesSection = ({ services }) => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-12 animate-fade-in-up">
          Our Services
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Link
                to="/user/login" 
                key={index}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-lg
                           hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer"
              >
                {IconComponent && <IconComponent className="w-16 h-16 text-black mb-4 transform hover:scale-110 transition-transform" />}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;