// frontend/src/components/RepairerDashboard/OnlineDashboardContent.jsx
import React, { useState, useEffect } from 'react';
import { Navigation, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner.jsx'; 
import ErrorMessage from '../ErrorMessage.jsx';
import JobCard from './JobCard.jsx'; 

const OnlineDashboardContent = ({
  jobs,
  loadingJobs,
  errorJobs,
  searchQuery,
  selectedFilter,
  handleAcceptJob, 
  getUrgencyColor
}) => {
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                            (job.category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || (job.category?.toLowerCase() || '') === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!loadingJobs && !errorJobs) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [loadingJobs, errorJobs]);


  return (
    <div className="space-y-8">
      {/* Render LoadingSpinner as an overlay if jobs are loading */}
      {loadingJobs && <LoadingSpinner message="Loading jobs for you..." />}

      {/* Welcome Section - Themed */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">You're Online & Ready!</h1>
            <p className="text-green-100 text-lg">
              {loadingJobs ? 'Loading jobs...' : `${filteredJobs.length} nearby jobs available in your area`}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6">
              <Navigation className="w-12 h-12 text-white mb-2" />
              <div className="text-sm">Actively Searching</div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Jobs</h2>
        {errorJobs ? (
          <ErrorMessage message={`Error: ${errorJobs}. Please try again later.`} />
        ) : (
          <div className={`transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            {filteredJobs.length === 0 ? (
              <div className="text-center py-6">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {/* Render JobCard component for each job */}
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    handleAcceptJob={handleAcceptJob} 
                    getUrgencyColor={getUrgencyColor}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default OnlineDashboardContent;