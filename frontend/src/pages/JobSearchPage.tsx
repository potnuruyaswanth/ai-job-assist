import { useState, useEffect } from 'react';
import { useJobsStore, useApplicationsStore } from '../store';
import {
  Search,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';

export default function JobSearchPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const { jobs, isLoading, searchJobs, selectedJob, selectJob, total } = useJobsStore();
  const { applyToJob, applyResult, clearApplyResult, isLoading: isApplying } = useApplicationsStore();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    searchJobs({ page: 1 });
  }, [searchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchJobs({ query, location, remote: remoteOnly, page: 1 });
  };

  const handleApply = async (generateCoverLetter: boolean) => {
    if (!selectedJob) return;
    await applyToJob(selectedJob.id, generateCoverLetter, customMessage);
  };

  const closeApplyResult = () => {
    clearApplyResult();
    setShowApplyModal(false);
    setCustomMessage('');
    selectJob(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Search</h1>
        <p className="text-gray-600 mt-1">Find jobs that match your skills</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Job title, skills, or company"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or state"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Remote only</span>
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </div>
        </div>
      </form>

      <div className="flex items-center justify-between">
        <p className="text-gray-600">{total} jobs found</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No jobs found. Try different keywords.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => selectJob(job)}
                className={`bg-white rounded-xl p-6 border cursor-pointer transition-all ${
                  selectedJob?.id === job.id
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <Building2 className="w-4 h-4" />
                      {job.company}
                    </p>
                  </div>
                  {job.matchScore && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      {job.matchScore}% match
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salary}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(job.postedAt).toLocaleDateString()}
                  </span>
                  {job.remote && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Remote</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-xl border border-gray-100 sticky top-8">
          {selectedJob ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
                  <p className="text-gray-600 mt-1">{selectedJob.company}</p>
                </div>
                <button onClick={() => selectJob(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {selectedJob.location}
                </span>
                {selectedJob.salary && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    {selectedJob.salary}
                  </span>
                )}
                {selectedJob.remote && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Remote</span>
                )}
              </div>

              <div className="prose prose-sm max-w-none mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <div 
                  className="text-gray-600 job-description max-h-80 overflow-y-auto"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedJob.description
                      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                  }} 
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Assisted Apply
                </button>
                <a
                  href={selectedJob.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Direct
                </a>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a job to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Assisted Apply</h2>
                <button onClick={closeApplyResult} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">{selectedJob.title} at {selectedJob.company}</p>
            </div>

            {applyResult ? (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Application prepared!</span>
                </div>

                {applyResult.coverLetter && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Generated Cover Letter</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                      {applyResult.coverLetter}
                    </div>
                  </div>
                )}

                <a
                  href={applyResult.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  Continue to Application →
                </a>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (optional)
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add any custom notes for your cover letter..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleApply(true)}
                    disabled={isApplying}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isApplying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    Generate Cover Letter & Apply
                  </button>
                  <button
                    onClick={() => handleApply(false)}
                    disabled={isApplying}
                    className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Apply Without Cover Letter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
