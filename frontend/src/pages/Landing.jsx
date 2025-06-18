// frontend/src/pages/Landing.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/LandingPage/Header.jsx';
import HeroSection from '../components/LandingPage/HeroSection.jsx';
import ServicesSection from '../components/LandingPage/ServicesSection.jsx';
import PopularServicesSection from '../components/LandingPage/PopularServicesSection.jsx';
import TestimonialsSection from '../components/LandingPage/TestimonialsSection.jsx'; 
import CtaSection from '../components/LandingPage/CtaSection.jsx'; 
import Footer from '../components/LandingPage/Footer.jsx';

import { Zap, Wrench, Paintbrush, Pipette, Home, Sprout } from 'lucide-react';


const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const services = [
    { icon: Zap, title: "Electrician" },
    { icon: Wrench, title: "Handyman" },
    { icon: Paintbrush, title: "Painting" },
    { icon: Pipette, title: "Plumbing" },
    { icon: Home, title: "Cleaning" },
    { icon: Sprout, title: "Gardening" }
  ];

  const popularServices = [
    {
      image: '/images/pb.png', 
      title: "Plumbing",
      description: "Fix leaky faucets, blocked drains, and more.",
      price: 499
    },
    {
      image: '/images/ac.png', 
      title: "AC Service",
      description: "Service and repair of all AC systems.",
      price: 599
    },
    {
      image: '/images/dc.png',
      title: "Deep Cleaning",
      description: "Thorough cleaning of homes and offices.",
      price: 599
    }
  ];

  const testimonials = [
    {
      name: "Jatin Agrawal",
      rating: 4,
      review: "Ramesh did a great job and handled everything smoothly. Just a little more attention to detail would have made it perfect."
    },
    {
      name: "Swarnim Agrawal",
      rating: 5,
      review: "Absolutely satisfied with the service! Quick, professional, and friendly throughout the entire process."
    },
    {
      name: "Bhuvan Sharma",
      rating: 4,
      review: "I had an electrical emergency, and he provided urgent help."
    },
    {
      name: "Divyaksh",
      rating: 5,
      review: "I had an plumbing emergency, and he provided urgent help"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <main>
        <HeroSection />
        <ServicesSection services={services} />

        <PopularServicesSection popularServices={popularServices} />
        <section className="py-16 text-center bg-gray-50"> 
          <div className="container mx-auto px-4">
            <Link
              to="/user/login" 
              className="inline-flex items-center justify-center px-10 py-4
                         bg-green-500 text-white text-xl font-semibold rounded-full
                         shadow-lg hover:bg-green-600 transform hover:scale-105
                         transition-all duration-300 ease-in-out"
            >
              View All Services
            </Link>
          </div>
        </section>
        <TestimonialsSection testimonials={testimonials} />

        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
