import { useEffect, useState } from 'react';
import { useApplicationsStore } from '../store';
import {
  FileText,
  Building2,
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2,
} from 'lucide-react';
import type { Application } from '../api/client';

const statusColors: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText },
  applied: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  interview: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Calendar },
  offer: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

export default function ApplicationsPage() {
  const { applications, isLoading, fetchApplications, updateStatus } = useApplicationsStore();
  const [filter, setFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications('demo-user');
  }, [fetchApplications]);

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter((app) => app.status === filter);

  const handleStatusChange = async (app: Application, newStatus: Application['status']) => {
    setUpdatingId(app.id);
    await updateStatus(app.id, newStatus);
    setUpdatingId(null);
  };

  const statusOptions: Application['status'][] = ['draft', 'applied', 'interview', 'offer', 'rejected'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600 mt-1">Track and manage your job applications</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({applications.length})
        </button>
        {statusOptions.map((status) => {
          const count = applications.filter((a) => a.status === status).length;
          const { bg, text } = statusColors[status];
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filter === status ? 'bg-blue-600 text-white' : `${bg} ${text} hover:opacity-80`
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No applications found</p>
          <a
            href="/jobs"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Search Jobs
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const { bg, text, icon: StatusIcon } = statusColors[app.status];
            return (
              <div
                key={app.id}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{app.jobTitle}</h3>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="capitalize">{app.status}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {app.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app, e.target.value as Application['status'])}
                      disabled={updatingId === app.id}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status} className="capitalize">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    
                    <a
                      href={`https://apply.example.com/job/${app.jobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {app.coverLetter && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:underline">
                      View Cover Letter
                    </summary>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                      {app.coverLetter}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
