import { create } from 'zustand';
import {
  authApi,
  profileApi,
  jobsApi,
  applicationsApi,
  dashboardApi,
  type User,
  type Profile,
  type Job,
  type Application,
  type DashboardStats,
} from '../api/client';

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.login(email, password);
      localStorage.setItem('token', token);
      set({ user, token, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.register(name, email, password);
      localStorage.setItem('token', token);
      set({ user, token, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  initialize: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token });
    }
  },
}));

// Profile Store
interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: Partial<Profile>) => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,

  fetchProfile: async (userId) => {
    set({ isLoading: true });
    try {
      const profile = await profileApi.get(userId);
      set({ profile, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateProfile: async (userId, data) => {
    set({ isLoading: true });
    try {
      const profile = await profileApi.update(userId, data);
      set({ profile, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  uploadResume: async (file) => {
    set({ isLoading: true });
    try {
      await profileApi.uploadResume(file);
      set({ isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

// Jobs Store
interface JobsState {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  total: number;
  page: number;
  searchJobs: (params: { query?: string; location?: string; remote?: boolean; page?: number }) => Promise<void>;
  selectJob: (job: Job | null) => void;
  getMatches: (userId: string) => Promise<void>;
}

export const useJobsStore = create<JobsState>((set) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  total: 0,
  page: 1,

  searchJobs: async (params) => {
    set({ isLoading: true });
    try {
      const { jobs, total, page } = await jobsApi.search(params);
      set({ jobs, total, page, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectJob: (job) => set({ selectedJob: job }),

  getMatches: async (userId) => {
    set({ isLoading: true });
    try {
      const { jobs } = await jobsApi.getMatches(userId);
      set({ jobs, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

// Applications Store
interface ApplyResult {
  applicationId: string;
  coverLetter?: string;
  prefillData?: Record<string, unknown>;
  applyUrl: string;
}

interface ApplicationsState {
  applications: Application[];
  isLoading: boolean;
  applyResult: ApplyResult | null;
  fetchApplications: (userId: string) => Promise<void>;
  applyToJob: (jobId: string, generateCoverLetter: boolean, customMessage?: string) => Promise<void>;
  updateStatus: (applicationId: string, status: Application['status']) => Promise<void>;
  clearApplyResult: () => void;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  isLoading: false,
  applyResult: null,

  fetchApplications: async (userId) => {
    set({ isLoading: true });
    try {
      const { applications } = await applicationsApi.list(userId);
      set({ applications, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  applyToJob: async (jobId, generateCoverLetter, customMessage) => {
    set({ isLoading: true });
    try {
      const result = await applicationsApi.apply(jobId, generateCoverLetter, customMessage);
      set({ applyResult: result, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateStatus: async (applicationId, status) => {
    try {
      const updated = await applicationsApi.updateStatus(applicationId, status);
      set({
        applications: get().applications.map((a) =>
          a.id === applicationId ? { ...a, status: updated.status } : a
        ),
      });
    } catch {
      // Handle error
    }
  },

  clearApplyResult: () => set({ applyResult: null }),
}));

// Dashboard Store
interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  fetchStats: (userId: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,

  fetchStats: async (userId) => {
    set({ isLoading: true });
    try {
      const stats = await dashboardApi.getStats(userId);
      set({ stats, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
