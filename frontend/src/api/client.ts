const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}

// Types
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Profile {
  userId: string;
  skills: string[];
  experienceYears: number;
  preferredRoles: string[];
  summary: string;
  resumeUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  remote: boolean;
  applyUrl: string;
  postedAt: string;
  matchScore?: number;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'draft' | 'applied' | 'interview' | 'offer' | 'rejected';
  appliedAt: string;
  coverLetter?: string;
}

export interface DashboardStats {
  totalApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  activeJobMatches: number;
  applicationsByStatus: Record<string, number>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
};

// Profile API
export const profileApi = {
  get: (_userId: string) => request<{ profile: Profile }>('/profile').then(r => r.profile),

  update: (_userId: string, data: Partial<Profile>) =>
    request<{ profile: Profile }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(r => r.profile),

  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/profile/resume`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
};

// Jobs API
export const jobsApi = {
  search: (params: { query?: string; location?: string; remote?: boolean; page?: number }) =>
    request<{ jobs: Job[]; total: number; page: number }>(
      `/jobs/search?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )}`
    ),

  getDetails: (jobId: string) => request<Job>(`/jobs/${jobId}`),

  getMatches: (userId: string) =>
    request<{ jobs: Job[] }>(`/jobs/matches/${userId}`),
};

// Applications API
export const applicationsApi = {
  list: (_userId: string) =>
    request<{ applications: Application[] }>('/applications'),

  apply: (jobId: string, generateCoverLetter: boolean, customMessage?: string) =>
    request<{ applicationId: string; coverLetter?: string; prefillData?: Record<string, unknown>; applyUrl: string }>(
      '/applications/assisted-apply',
      {
        method: 'POST',
        body: JSON.stringify({ jobId, generateCoverLetter, customMessage }),
      }
    ),

  updateStatus: (applicationId: string, status: Application['status']) =>
    request<Application>(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Dashboard API
export const dashboardApi = {
  getStats: (_userId: string) => request<DashboardStats>('/dashboard'),
};
