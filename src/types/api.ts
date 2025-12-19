/**
 * API Types for AI-Assisted Job Application Platform
 * These types define the request/response structures for all API endpoints
 */

// =====================
// Authentication Types
// =====================

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// =====================
// User Profile Types
// =====================

export interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  skills: string[];
  experienceYears: number;
  preferredRoles: string[];
  education: string[];
  resumeId?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
}

export interface UpdateProfileRequest {
  skills?: string[];
  experienceYears?: number;
  preferredRoles?: string[];
  preferredLocations?: string[];
  remoteOnly?: boolean;
  salaryRange?: {
    min: number;
    max: number;
  };
}

export interface ResumeUploadRequest {
  fileName: string;
  fileType: 'pdf' | 'docx';
  fileContent: string; // Base64 encoded
  fileSize: number;
}

export interface ParsedResumeData {
  skills: string[];
  jobTitles: string[];
  experienceYears: number;
  education: string[];
  contactEmail?: string;
  contactPhone?: string;
  linkedin?: string;
  github?: string;
}

// =====================
// Social Media Types
// =====================

export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin';
export type PostTone = 'professional' | 'casual' | 'engaging' | 'funny' | 'inspirational';

export interface GeneratePostRequest {
  topic: string;
  tone: PostTone;
  platforms: SocialPlatform[];
  imageUrl?: string;
  includeHashtags?: boolean;
  hashtagCount?: number;
}

export interface GeneratedPost {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedContent?: Record<SocialPlatform, string>;
  createdAt: string;
}

export interface PublishPostRequest {
  requestId: string;
  platforms: SocialPlatform[];
  content: Record<string, string>;
  imageUrl?: string;
  scheduledAt?: string; // ISO date string
}

export interface SocialAccount {
  platform: SocialPlatform;
  connected: boolean;
  connectedAt?: string;
}

// =====================
// Job Types
// =====================

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary?: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  applyUrl: string;
  postedAt: string;
  matchScore?: number;
}

export interface JobSearchQuery {
  query?: string;
  location?: string;
  remote?: boolean;
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  limit?: number;
}

export interface JobSearchResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

export interface JobMatch {
  jobId: string;
  jobTitle: string;
  company: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

export interface JobMatchAnalysis {
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

// =====================
// Application Types
// =====================

export type ApplicationStatus = 'draft' | 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  status: ApplicationStatus;
  coverLetter?: string;
  appliedAt?: string;
  interviewDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: Array<{
    status: ApplicationStatus;
    changedAt: string;
    notes?: string;
  }>;
}

export interface AssistedApplyRequest {
  generateCoverLetter?: boolean;
  customMessage?: string;
}

export interface AssistedApplyResponse {
  applicationId: string;
  status: string;
  applyUrl: string;
  coverLetter?: string;
  prefillData?: {
    name: string;
    email: string;
    phone?: string;
    skills: string[];
    experience: string;
  };
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  notes?: string;
  interviewDate?: string;
}

export interface ApplicationStats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

// =====================
// Dashboard Types
// =====================

export interface DashboardData {
  user: {
    name: string;
    email: string;
    profileComplete: boolean;
  };
  applications: ApplicationStats & {
    recentApplications: Array<{
      id: string;
      jobTitle: string;
      company: string;
      status: ApplicationStatus;
      appliedAt?: string;
    }>;
  };
  socialMedia: {
    connectedPlatforms: SocialPlatform[];
    scheduledPosts: number;
    publishedThisWeek: number;
  };
  jobMatches: {
    newMatches: number;
    topMatch?: {
      jobTitle: string;
      company: string;
      score: number;
    };
  };
}

// =====================
// System Types
// =====================

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services: {
    database: string;
    queue: string;
    ai: string;
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  ip?: string;
  endpoint?: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}
