// frontend/src/components/LandingPage/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ isMenuOpen, setIsMenuOpen }) => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white text-gray-800 shadow-md z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
  
        <Link to="/" className="flex items-center flex-shrink-0">
          <img
            src="/images/logooo.png"
            alt="Fix Nearby Logo"
            className="h-20 w-auto object-contain"
            style={{ maxHeight: '48px' }}
          />
        </Link>

        <div className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">
            Home
          </Link>
          <Link to="/user/getotp" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">
            Services
          </Link>
          <Link to="/contact-us" className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium">
            Contact
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Link 
            to="/user/login" 
            className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium"
          >
            Login
          </Link>
          <Link
            to="/user/getotp"
            className="px-6 py-2 bg-green-500 text-white rounded-md
                       hover:bg-green-600 transition-colors duration-200 shadow-md font-medium"
          >
            Sign Up
          </Link>
        </div>

        <button
          className="md:hidden text-gray-800 focus:outline-none p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-2">
            <Link 
              to="/" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/user/login" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              to="/contact" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <hr className="my-2 border-gray-200" />
            <Link 
              to="/user/login" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              to="/user/signup" 
              className="block px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;