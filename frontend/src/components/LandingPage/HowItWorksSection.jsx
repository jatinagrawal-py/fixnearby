// frontend/src/components/LandingPage/HowItWorksSection.jsx
import React from 'react';
import { Phone, Users, CheckCircle } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      step: "1",
      title: "Book Service",
      description: "Choose your service and schedule at your convenience",
      icon: <Phone className="w-8 h-8" />
    },
    {
      step: "2",
      title: "Expert Arrives",
      description: "Certified professional arrives at your scheduled time",
      icon: <Users className="w-8 h-8" />
    },
    {
      step: "3",
      title: "Job Done",
      description: "Quality work completed with satisfaction guarantee",
      icon: <CheckCircle className="w-8 h-8" />
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Simple steps to get your home repairs done</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Step {item.step}</h3>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;