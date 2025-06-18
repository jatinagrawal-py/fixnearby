// frontend/src/components/RepairerDashboard/InprogressJobCard.jsx
import React from 'react';
import { format } from 'date-fns';
import {
  MapPin,
  User,
  Phone,
  CheckCircle,
  MessageCircle,
  DollarSign,
  Calendar,
  ClipboardList,
  Edit,
  Info,
} from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

const InprogressJobCard = ({
  job,
  quoteInputs,
  editingQuote,
  handleQuoteInputChange,
  handleQuoteSubmit,
  toggleEditQuote,
  handleConfirmCompleted,
  handleChat,
  handleCallCustomer,
  isSubmittingQuote,
  isSendingOtp,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col">
      {/* Header Section (Themed like OnlineDashboard JobCard) */}
      <div className="bg-green-50 p-4 -mx-6 -mt-6 mb-4 rounded-t-xl border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{job.serviceType}</h3>
            {/* Category as a distinct, slightly smaller element */}
            <p className="text-gray-600 text-sm font-medium">{job.category}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${ 
              job.status === 'accepted'
                ? 'bg-green-100 text-green-800'
                : job.status === 'in_progress'
                ? 'bg-blue-100 text-blue-800'
                : job.status === 'quoted'
                ? 'bg-purple-100 text-purple-800'
                : job.status === 'pending_quote'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {job.status
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Core Job Details - More Compact Layout */}
      {/* Reduced vertical margin (mb-4 instead of mb-6) and smaller font for details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-gray-700 mb-4 text-sm">
        <div className="flex items-center">
          <Info className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="font-medium">Issue:</span> <span className="ml-1 truncate">{job.issue || 'N/A'}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="font-medium">Assigned:</span> <span className="ml-1">{job.assignedAt ? format(new Date(job.assignedAt), 'M/d/yyyy') : 'N/A'}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="font-medium">Location:</span> <span className="ml-1 truncate">{job.location?.address || 'N/A'}</span>
        </div>
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="font-medium">Customer:</span> <span className="ml-1 truncate">{job.customer?.fullname || 'N/A'}</span>
        </div>
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="font-medium">Phone:</span> <span className="ml-1">{job.contactInfo || 'N/A'}</span>
        </div>
      </div>

      {/* Chat & Call Buttons */}
      {job.status !== 'completed' && job.status !== 'cancelled' && job.status !== 'rejected' && (job.customer || job.contactInfo) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4"> {/* Reduced bottom margin */}
          <button
            onClick={() => handleChat(job._id, job.conversationId)}
            className="flex-1 flex items-center justify-center py-2.5 px-3 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium" // Slightly smaller padding
          >
            <MessageCircle className="w-4 h-4 mr-2" /> Chat
          </button>
          <button
            onClick={() => handleCallCustomer(job.customer?.phone || job.contactInfo)}
            className="flex-1 flex items-center justify-center py-2.5 px-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium" // Slightly smaller padding
            disabled={!(job.customer?.phone || job.contactInfo)}
          >
            <Phone className="w-4 h-4 mr-2" /> Call Customer
          </button>
        </div>
      )}

      {/* Quote Section (Conditional) */}
      {(job.status === 'pending_quote' || (job.status === 'quoted' && editingQuote[job._id])) && (
        <div className="mt-auto p-4 border border-yellow-300 bg-yellow-50 rounded-lg flex-shrink-0"> {/* Added mt-auto to push to bottom */}
          <p className="text-yellow-800 font-semibold mb-2 flex items-center text-sm">
            <DollarSign className="w-4 h-4 mr-2" />{' '}
            {job.status === 'pending_quote' ? 'Submit Your Real Cost Quote:' : 'Edit Your Quote:'}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-800">₹</span>
            <input
              type="number"
              value={quoteInputs[job._id] || ''}
              onChange={(e) => handleQuoteInputChange(job._id, e.target.value)}
              placeholder="Enter your price"
              className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <button
              onClick={() => handleQuoteSubmit(job._id)}
              disabled={isSubmittingQuote[job._id]}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
            >
              {isSubmittingQuote[job._id] ? (
                <LoadingSpinner className="h-4 w-4 border-2 text-white" />
              ) : (
                'Submit'
              )}
            </button>
          </div>
          {job.quotation && job.status === 'pending_quote' && (
            <p className="text-xs text-gray-600 mt-2">
              AI Estimate: ₹{job.quotation}
            </p>
          )}
        </div>
      )}

      {/* Quoted Status Display */}
      {job.status === 'quoted' && !editingQuote[job._id] && (
        <div className="mt-auto p-4 border border-purple-300 bg-purple-50 rounded-lg text-purple-800 flex justify-between items-center flex-shrink-0">
          <div>
            <p className="font-semibold flex items-center text-sm">
              <DollarSign className="w-4 h-4 mr-2" /> Your Quote Submitted:
            </p>
            <p className="text-xl font-bold mt-1">₹{job.estimatedPrice}</p>
            <p className="text-xs mt-1">Waiting for customer acceptance.</p>
          </div>
          <button
            onClick={() => toggleEditQuote(job._id)}
            className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            title="Edit Quote"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Accepted Status Display & Completion Button */}
      {job.status === 'accepted' && (
        <>
          <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="flex flex-col items-center text-center">
              <p className="text-green-800 font-semibold flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-2" /> Quote Accepted:
              </p>
              <p className="text-xl font-bold text-green-900">
                ₹{job.estimatedPrice || job.quotation}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleConfirmCompleted(job._id)}
            disabled={isSendingOtp[job._id]}
            // New styling for prominent green button
            className="mt-6 w-full py-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-colors flex items-center justify-center cursor-pointer text-base font-semibold flex-shrink-0"
          >
            {isSendingOtp[job._id] ? (
              <LoadingSpinner className="h-5 w-5 border-2 text-white" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm Completion & Send OTP
              </>
            )}
          </button>
        </>
      )}

      {/* Pending OTP Status Display & Resend OTP Button */}
      {job.status === 'pending_otp' && (
        <button
          onClick={() => handleConfirmCompleted(job._id)}
          disabled={isSendingOtp[job._id]}
          // Improved styling for Resend OTP button
          className="mt-auto w-full py-3 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600 transition-colors flex items-center justify-center cursor-pointer text-base font-semibold flex-shrink-0"
        >
          {isSendingOtp[job._id] ? (
            <LoadingSpinner className="h-5 w-5 border-2 text-white" />
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Resend OTP
            </>
          )}
        </button>
      )}

      {/* Completed Status Display */}
      {job.status === 'completed' && (
        <div className="mt-auto p-4 bg-gray-100 rounded-lg text-gray-700 text-center flex-shrink-0">
          <p className="font-semibold text-base">Job Completed</p>
          <p className="text-sm">Thank you for your service!</p>
        </div>
      )}
    </div>
  );
};

export default InprogressJobCard;