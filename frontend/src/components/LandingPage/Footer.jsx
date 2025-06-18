// frontend/src/components/LandingPage/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 py-12 border-t border-gray-200">
      <div className="container mx-auto px-4 text-center">
        {/* Logo in the footer */}
        <Link to="/" className="inline-block mb-6">
          <img src="/images/logooo.png" alt="Fix Nearby Logo" className="h-16 w-auto" /> 
        </Link>

        <div className="flex flex-wrap justify-center space-x-6 md:space-x-12 mb-4 text-lg">
          <a href="/privacy-policy" className="hover:text-green-600 transition-colors duration-200">
            Privacy Policy
          </a>
          <a href="/terms-and-conditions" className="hover:text-green-600 transition-colors duration-200">
            Terms & Conditions
          </a>
          <a href="/contact-us" className="hover:text-green-600 transition-colors duration-200">
            Contact Us & FAQ's
          </a>
        </div>
        <p className="text-sm">&copy; 2025 FixNearby. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;