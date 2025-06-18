// frontend/src/components/RepairerDashboard/Inprogress.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getRepairerAssignedJobs,
  submitRepairerQuote,
  PendingOtp,
  getRepairerConversationsMap,
  createConversation,
} from "../../../services/apiService.js";
import InprogressJobCard from '../../../components/RepairerDashboard/InprogressJobCard.jsx'; 

const Inprogress = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quoteInputs, setQuoteInputs] = useState({});
  const [editingQuote, setEditingQuote] = useState({});
  const [isSubmittingQuote, setIsSubmittingQuote] = useState({});
  const [isSendingOtp, setIsSendingOtp] = useState({});


  const fetchRepairerJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, conversationsMap] = await Promise.all([
        getRepairerAssignedJobs(),
        getRepairerConversationsMap(),
      ]);
      const combinedJobs = jobsData.map((job) => ({
        ...job,
        conversationId: conversationsMap[job._id] || null,
      }));

      setJobs(combinedJobs);
      const initialQuoteInputs = {};
      const initialEditingQuoteState = {};
      const initialSubmittingQuoteState = {}; 
      const initialSendingOtpState = {};      

      combinedJobs.forEach((job) => {
        if (job.status === "pending_quote" || job.status === "quoted") {
          initialQuoteInputs[job._id] = job.estimatedPrice || "";
          initialEditingQuoteState[job._id] = false;
        }
        initialSubmittingQuoteState[job._id] = false; 
        initialSendingOtpState[job._id] = false;      
      });
      setQuoteInputs(initialQuoteInputs);
      setEditingQuote(initialEditingQuoteState);
      setIsSubmittingQuote(initialSubmittingQuoteState);
      setIsSendingOtp(initialSendingOtpState);          

    } catch (err) {
      console.error("Error fetching repairer jobs or conversations:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch assigned jobs or conversations."
      );
      toast.error(
        err.response?.data?.message || "Failed to load assigned jobs."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepairerJobs();
  }, [fetchRepairerJobs]);

  const handleQuoteInputChange = (jobId, value) => {
    setQuoteInputs((prev) => ({
      ...prev,
      [jobId]: value,
    }));
  };

  const handleQuoteSubmit = async (jobId) => {
    const quotation = quoteInputs[jobId];
    if (!quotation || isNaN(quotation) || parseFloat(quotation) <= 0) {
      toast.error("Please enter a valid quote amount.");
      return;
    }

    setIsSubmittingQuote((prev) => ({ ...prev, [jobId]: true })); 
    try {
      await submitRepairerQuote(jobId, parseFloat(quotation));
      toast.success("Quote submitted successfully!");
      setEditingQuote((prev) => ({ ...prev, [jobId]: false }));
      fetchRepairerJobs(); 
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast.error(error.response?.data?.message || "Failed to submit quote.");
    } finally {
      setIsSubmittingQuote((prev) => ({ ...prev, [jobId]: false })); 
    }
  };

  const toggleEditQuote = (jobId) => {
    setEditingQuote((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
    const jobToEdit = jobs.find((job) => job._id === jobId);
    if (jobToEdit && !editingQuote[jobId]) {
      setQuoteInputs((prev) => ({
        ...prev,
        [jobId]: jobToEdit.estimatedPrice || "",
      }));
    }
  };
  const handleConfirmCompleted = async (jobId) => {
    setIsSendingOtp((prev) => ({ ...prev, [jobId]: true })); 
    try {
      await PendingOtp(jobId);
      toast.success("OTP sent successfully!");
      fetchRepairerJobs();
    } catch (error) {
      console.error("Error completing job:", error);
      toast.error(
        error.response?.data?.message || "Failed to mark job as complete."
      );
    } finally {
      setIsSendingOtp((prev) => ({ ...prev, [jobId]: false })); 
    }
  };

  const handleChat = async (jobId, existingConversationId) => {
    let finalConversationId = existingConversationId;

    if (!finalConversationId) {
      toast.loading("Initiating chat...", { id: "chat-init" });
      try {
        const response = await createConversation(jobId);
        finalConversationId = response.conversationId;
        toast.success("Chat initiated!", { id: "chat-init" });
        fetchRepairerJobs(); // Re-fetch to get the new conversationId
      } catch (error) {
        console.error("Error creating conversation:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to initiate chat. Please ensure the job is assigned and try again.",
          { id: "chat-init" }
        );
        return;
      }
    }

    if (finalConversationId) {
      navigate(`/repairer/messages/${finalConversationId}`);
    } else {
      toast.error("Conversation ID is still missing. Cannot open chat.");
    }
  };

  const handleCallCustomer = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast.error("Customer phone number not available.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-blue-600">Loading assigned jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
        <p>Error: {error}</p>
        <button
          onClick={fetchRepairerJobs}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Your Assigned Jobs
      </h1>
      {jobs.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
          You currently have no assigned jobs.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <InprogressJobCard
              key={job._id}
              job={job}
              quoteInputs={quoteInputs}
              editingQuote={editingQuote}
              handleQuoteInputChange={handleQuoteInputChange}
              handleQuoteSubmit={handleQuoteSubmit}
              toggleEditQuote={toggleEditQuote}
              handleConfirmCompleted={handleConfirmCompleted}
              handleChat={handleChat}
              handleCallCustomer={handleCallCustomer}
              isSubmittingQuote={isSubmittingQuote} 
              isSendingOtp={isSendingOtp}           
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Inprogress;