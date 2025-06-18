import React, { useState } from 'react';
import { MoreVertical, MapPin, Calendar, Clock, DollarSign, Tag, AlertTriangle, ClipboardList } from 'lucide-react';

const JobCard = ({ job, handleAcceptJob, getUrgencyColor }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const date = new Date(job.date);
  const formattedDate = date.toLocaleDateString();

  const onAcceptClick = async () => {
    setIsAccepting(true);
    try {
      await handleAcceptJob(job.id);
    } catch (error) {
      console.error("Error accepting job:", error);
      setIsAccepting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-50">
      <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200">
        <div className="bg-green-50 p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h3>
              <p className="text-gray-600 font-medium">{job.category}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getUrgencyColor(job.urgency)} backdrop-blur-sm`}>
                {job.urgency} Priority
              </span>
              <button className="p-2 hover:bg-gray-100 hover:shadow-md rounded-xl transition-all duration-200">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center text-green-700">
                <DollarSign className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-600">Quotation</p>
                  <p className="text-xl font-bold text-green-800">₹{job.quotation}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center text-emerald-700">
                <Calendar className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-emerald-600">Preferred Date</p>
                  <p className="text-sm font-semibold text-emerald-800">{formattedDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-lime-50 p-4 rounded-xl border border-lime-200">
              <div className="flex items-center text-lime-700">
                <Clock className="w-5 h-5 mr-2" />
                <div>
                  <p className="text-sm font-medium text-lime-600">Preferred Time</p>
                  <p className="text-sm font-semibold text-lime-800">{job.time}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Tag className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.tags && job.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-sm font-medium border border-green-300 hover:shadow-md transition-all duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {showDetails && (
            <>
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex-grow bg-white border border-amber-200 py-2 px-3 rounded-lg shadow-sm flex items-start space-x-2 max-w-full sm:max-w-[calc(50%-0.5rem)] md:max-w-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-700 text-xs">Issue:</h4>
                    <p className="text-gray-800 text-xs leading-tight">{job.issue}</p>
                  </div>
                </div>
                <div className="flex-grow bg-white border border-green-200 py-2 px-3 rounded-lg shadow-sm flex items-start space-x-2 max-w-full sm:max-w-[calc(50%-0.5rem)] md:max-w-xs">
                  <ClipboardList className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-green-700 text-xs">Description:</h4>
                    <p className="text-gray-800 text-xs leading-tight">{job.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-gray-700 mb-6 bg-gray-50 p-3 rounded-xl">
                <MapPin className="w-5 h-5 mr-3 text-red-500" />
                <span className="font-medium">{job.location}</span>
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              <span className="font-medium">Posted:</span> {job.postedTime}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-center flex items-center justify-center"
              >
                {showDetails ? 'Show Less' : 'View Details'}
              </button>
              <button
                onClick={onAcceptClick}
                disabled={isAccepting}
                className="px-8 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white rounded-xl hover:shadow-xl hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-300 font-semibold cursor-pointer flex items-center justify-center"
              >
                {isAccepting ? (
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                ) : (
                  'Accept Job'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;