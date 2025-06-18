import React from 'react';
import { Star, MapPin, Clock, Wrench, IndianRupee } from 'lucide-react'; 
import { serviceIcons } from '../../utils/serviceIcons'; 

const RepairerCard = ({ repairer, serviceCategory, openServiceRequestForm }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100"> {/* Added subtle border */}
      <div className="p-6">
        <div className="flex items-center mb-4">
          {/* Service Icon Container - Themed */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl w-16 h-16 flex items-center justify-center text-green-600 flex-shrink-0">
            {serviceIcons[serviceCategory.toLowerCase()] ? React.cloneElement(serviceIcons[serviceCategory.toLowerCase()], { size: 32 }) : <Wrench size={32} />}
          </div>
          <div className="ml-4 flex-grow">
            <h2 className="text-xl font-bold text-gray-900">{repairer.fullname}</h2>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(repairer.rating?.average || 0) ?
                    'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">
                ({repairer.rating?.count || 0} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-2 text-gray-500" /> 
          <span className="text-sm">{repairer.location?.address || 'Location not specified'} (Pincode: {repairer.location?.postalCode})</span>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Services Offered</h3>
          <div className="flex flex-wrap gap-2">
            {repairer.services && repairer.services.map((service, index) => (
              <div
                key={index}
                className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200" 
              >
                {serviceIcons[service.name.toLowerCase()] ? React.cloneElement(serviceIcons[service.name.toLowerCase()], { className: "w-4 h-4 mr-1" }) : <Wrench className="w-4 h-4 mr-1" />}
                <span className="flex items-center">
                  {service.name} <IndianRupee className="w-3 h-3 ml-2 mr-1" />{service.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100"> {/* Separator */}
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1 text-gray-500" /> {/* Subtle icon color */}
            <span>{repairer.experience || 0} years experience</span>
          </div>

          <button
            onClick={() => openServiceRequestForm(repairer._id)}
            className="bg-green-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-green-600 transition-colors shadow-md text-sm whitespace-nowrap" // Themed button
          >
            Request Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairerCard;