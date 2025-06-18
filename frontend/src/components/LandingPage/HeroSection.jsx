// frontend/src/components/LandingPage/HeroSection.jsx
import React from 'react';

const HeroSection = () => {
  return (
    <section
      className="relative h-[600px] md:h-[700px] flex items-center justify-center text-center text-white overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>

      <div className="relative z-10 p-4">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          {/* Staggered lines for a smoother, more elegant reveal */}
          <span className="block animate-fade-slide-in" style={{ animationDelay: '0.2s' }}>Your Home,</span>
          <span className="block animate-fade-slide-in" style={{ animationDelay: '0.5s' }}>Our Expertise</span>
        </h1>
      </div>

      <style>{`
        @keyframes fade-slide-in {
          0% {
            opacity: 0;
            transform: translateY(25px) scale(0.98); 
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1); 
          }
        }

        .animate-fade-slide-in {
         
          animation: fade-slide-in 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;