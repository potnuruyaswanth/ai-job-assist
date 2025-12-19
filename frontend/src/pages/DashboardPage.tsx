import { useEffect } from 'react';
import { useDashboardStore, useApplicationsStore } from '../store';
import {
  Briefcase,
  FileText,
  Calendar,
  Trophy,
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { stats, fetchStats } = useDashboardStore();
  const { applications, fetchApplications } = useApplicationsStore();

  useEffect(() => {
    fetchStats('demo-user');
    fetchApplications('demo-user');
  }, [fetchStats, fetchApplications]);

  const statCards = [
    {
      label: 'Total Applications',
      value: stats?.totalApplications || applications.length || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      label: 'Interviews Scheduled',
      value: stats?.interviewsScheduled || 0,
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      label: 'Offers Received',
      value: stats?.offersReceived || 0,
      icon: Trophy,
      color: 'bg-yellow-500',
    },
    {
      label: 'Job Matches',
      value: stats?.activeJobMatches || 0,
      icon: Briefcase,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your job search progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`${color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Application Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Application Pipeline
          </h2>
          <div className="space-y-4">
            {['draft', 'applied', 'interview', 'offer', 'rejected'].map((status) => {
              const count =
                stats?.applicationsByStatus?.[status] ||
                applications.filter((a) => a.status === status).length ||
                0;
              const total = applications.length || 1;
              const percentage = Math.round((count / total) * 100);
              const colors: Record<string, string> = {
                draft: 'bg-gray-500',
                applied: 'bg-blue-500',
                interview: 'bg-yellow-500',
                offer: 'bg-green-500',
                rejected: 'bg-red-500',
              };
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700">{status}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[status]} h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {stats?.recentActivity?.length ? (
              stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                >
                  <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-gray-800">{activity.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-sm">Start by searching for jobs!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/jobs"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Briefcase className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Search Jobs</p>
              <p className="text-sm text-gray-500">Find opportunities</p>
            </div>
          </a>
          <a
            href="/profile"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Upload Resume</p>
              <p className="text-sm text-gray-500">Update profile</p>
            </div>
          </a>
          <a
            href="/applications"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Track Progress</p>
              <p className="text-sm text-gray-500">Monitor applications</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
