// frontend/src/components/LandingPage/CtaSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50 text-center"> {/* Background is light gray */}
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8 animate-fade-in-up">
          Ready to Get Started?
        </h2>
        <Link
          to="/user/login" 
          className="inline-flex items-center justify-center px-12 py-4
                     bg-green-500 text-white text-xl font-semibold rounded-full
                     shadow-lg hover:bg-green-600 transform hover:scale-105
                     transition-all duration-300 ease-in-out"
        >
          Book Now
        </Link>
      </div>
    </section>
  );
};

export default CtaSection;