import express from 'express';
import cors from 'cors';
import { db } from './src/utils/db.js';
import { searchJobs, type ScrapedJob } from './src/utils/jobScraper.js';
import { generateCoverLetter, analyzeJobMatch } from './src/utils/gemini.js';

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory job cache (persists between requests)
let jobCache: Map<string, ScrapedJob> = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'AI Job Application API',
    status: 'running',
    version: '2.0.0',
    features: ['Real-time job scraping', 'Gemini AI cover letters', 'Job matching'],
    endpoints: {
      health: 'GET /health',
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      profile: 'GET/PUT /profile',
      jobs: 'GET /jobs/search',
      apply: 'POST /applications/assisted-apply',
      applications: 'GET /applications',
      dashboard: 'GET /dashboard'
    }
  });
});

// Types
interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

interface Session {
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

interface UserProfile {
  userId: string;
  skills: string[];
  experienceYears: number;
  preferredRoles: string[];
  education?: string[];
  resumeId?: string;
  updatedAt?: string;
}

interface Application {
  id: string;
  userId: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  status: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationIndex {
  userId: string;
  applicationIds: string[];
  stats: {
    total: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  };
}

// Auth middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const session = db.get<Session>('sessions', token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }
  
  (req as any).session = session;
  next();
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      ai: 'available'
    }
  });
});

// Register
app.post('/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  
  const existingUser = db.get<User>('users', email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const timestamp = new Date().toISOString();
  const passwordHash = Buffer.from(password).toString('base64');
  
  db.set<User>('users', email, {
    id: userId,
    email,
    name,
    passwordHash,
    createdAt: timestamp
  });
  
  const token = `jwt_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  db.set<Session>('sessions', token, {
    userId,
    email,
    createdAt: timestamp,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  
  console.log(`User registered: ${email}`);
  
  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: userId, email, name }
  });
});

// Login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const user = db.get<User>('users', email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const passwordHash = Buffer.from(password).toString('base64');
  if (user.passwordHash !== passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = `jwt_${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const timestamp = new Date().toISOString();
  
  db.set<Session>('sessions', token, {
    userId: user.id,
    email: user.email,
    createdAt: timestamp,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  
  console.log(`User logged in: ${email}`);
  
  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
});

// Get Profile
app.get('/profile', requireAuth, (req, res) => {
  const session = (req as any).session as Session;
  const profile = db.get<UserProfile>('user_profiles', session.userId);
  const user = db.get<User>('users', session.email);
  
  res.json({
    profile: {
      userId: session.userId,
      name: user?.name,
      email: user?.email,
      skills: profile?.skills || [],
      experienceYears: profile?.experienceYears || 0,
      preferredRoles: profile?.preferredRoles || [],
      education: profile?.education || [],
      resumeId: profile?.resumeId
    }
  });
});

// Update Profile
app.put('/profile', requireAuth, (req, res) => {
  const session = (req as any).session as Session;
  const { skills, experienceYears, preferredRoles } = req.body;
  const timestamp = new Date().toISOString();
  
  const existingProfile = db.get<UserProfile>('user_profiles', session.userId) || {} as UserProfile;
  
  const updatedProfile: UserProfile = {
    ...existingProfile,
    userId: session.userId,
    skills: skills || existingProfile.skills || [],
    experienceYears: experienceYears ?? existingProfile.experienceYears ?? 0,
    preferredRoles: preferredRoles || existingProfile.preferredRoles || [],
    updatedAt: timestamp
  };
  
  db.set<UserProfile>('user_profiles', session.userId, updatedProfile);
  
  res.json({
    message: 'Profile updated successfully',
    profile: {
      userId: session.userId,
      skills: updatedProfile.skills,
      experienceYears: updatedProfile.experienceYears,
      preferredRoles: updatedProfile.preferredRoles
    }
  });
});

// Search Jobs - Real job scraping
app.get('/jobs/search', requireAuth, async (req, res) => {
  const session = (req as any).session as Session;
  const { query, location, remote, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  
  try {
    // Get user profile for matching
    const profile = db.get<UserProfile>('user_profiles', session.userId);
    const userSkills = profile?.skills || [];
    
    // Fetch real jobs from multiple sources
    const scrapedJobs = await searchJobs(
      query as string,
      location as string,
      remote === 'true'
    );
    
    // Cache jobs for later lookup
    scrapedJobs.forEach(job => jobCache.set(job.id, job));
    
    // Calculate match scores based on user profile
    const jobsWithScores = await Promise.all(
      scrapedJobs.map(async (job) => {
        let matchScore = 70;
        
        if (userSkills.length > 0) {
          const descLower = job.description.toLowerCase();
          const titleLower = job.title.toLowerCase();
          
          const matchingSkills = userSkills.filter((skill: string) => 
            descLower.includes(skill.toLowerCase()) || 
            titleLower.includes(skill.toLowerCase())
          );
          
          matchScore = Math.min(95, 50 + (matchingSkills.length * 15));
        }
        
        return {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          salary: job.salary,
          remote: job.remote,
          applyUrl: job.applyUrl,
          postedAt: job.postedAt,
          source: job.source,
          matchScore
        };
      })
    );
    
    // Sort by match score
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
    
    // Paginate
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedJobs = jobsWithScores.slice(startIndex, startIndex + limitNum);
    
    res.json({
      jobs: paginatedJobs,
      total: jobsWithScores.length,
      page: pageNum,
      totalPages: Math.ceil(jobsWithScores.length / limitNum)
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
});

// Get Applications
app.get('/applications', requireAuth, (req, res) => {
  const session = (req as any).session as Session;
  
  const appIndex = db.get<ApplicationIndex>('user_applications_index', session.userId);
  const applicationIds = appIndex?.applicationIds || [];
  
  const applications: any[] = [];
  for (const appId of applicationIds) {
    const app = db.get<Application>('applications', appId);
    if (app) {
      applications.push({
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.jobTitle || 'Unknown Position',
        company: app.company || 'Unknown Company',
        status: app.status,
        appliedAt: app.appliedAt,
        createdAt: app.createdAt
      });
    }
  }
  
  applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };
  
  res.json({ applications, stats });
});

// Apply to Job (legacy endpoint)
app.post('/jobs/:jobId/apply', requireAuth, async (req, res) => {
  const session = (req as any).session as Session;
  const { jobId } = req.params;
  const { generateCoverLetter: genCL, customMessage } = req.body;
  
  await handleApplication(session, jobId, genCL, customMessage, res);
});

// Assisted Apply - AI-powered job application
app.post('/applications/assisted-apply', requireAuth, async (req, res) => {
  const session = (req as any).session as Session;
  const { jobId, generateCoverLetter: genCL, customMessage } = req.body;
  
  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }
  
  await handleApplication(session, jobId, genCL, customMessage, res);
});

// Shared application handler
async function handleApplication(
  session: Session,
  jobId: string,
  genCL: boolean,
  customMessage: string | undefined,
  res: express.Response
) {
  const timestamp = new Date().toISOString();
  
  const user = db.get<User>('users', session.email);
  const profile = db.get<UserProfile>('user_profiles', session.userId);
  
  // Get job from cache
  const job = jobCache.get(jobId);
  const jobTitle = job?.title || 'Software Engineer Position';
  const company = job?.company || 'Company';
  const jobDescription = job?.description || '';
  const applyUrl = job?.applyUrl || '#';
  
  // Generate cover letter with AI if requested
  let coverLetter: string | undefined;
  if (genCL) {
    coverLetter = await generateCoverLetter(
      jobTitle,
      company,
      jobDescription,
      {
        name: user?.name || 'Applicant',
        skills: profile?.skills || [],
        experienceYears: profile?.experienceYears || 0,
        preferredRoles: profile?.preferredRoles || []
      },
      customMessage
    );
  }
  
  const applicationId = `app_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  db.set<Application>('applications', applicationId, {
    id: applicationId,
    userId: session.userId,
    jobId,
    jobTitle,
    company,
    status: 'applied',
    appliedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp
  });
  
  const appIndex = db.get<ApplicationIndex>('user_applications_index', session.userId) || {
    userId: session.userId,
    applicationIds: [],
    stats: { total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 }
  };
  appIndex.applicationIds.push(applicationId);
  appIndex.stats.total++;
  appIndex.stats.applied++;
  db.set<ApplicationIndex>('user_applications_index', session.userId, appIndex);
  
  console.log(`Application created: ${applicationId} for job "${jobTitle}" at ${company}`);
  
  res.json({
    applicationId,
    status: 'applied',
    coverLetter,
    applyUrl,
    prefillData: {
      name: user?.name || '',
      email: user?.email || session.email,
      skills: profile?.skills || [],
      experience: `${profile?.experienceYears || 0} years`
    }
  });
}

// Dashboard
app.get('/dashboard', requireAuth, (req, res) => {
  const session = (req as any).session as Session;
  
  const user = db.get<User>('users', session.email);
  const profile = db.get<UserProfile>('user_profiles', session.userId);
  const appIndex = db.get<ApplicationIndex>('user_applications_index', session.userId);
  
  const applicationStats = appIndex?.stats || {
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  };
  
  const recentApplications: any[] = [];
  const appIds = (appIndex?.applicationIds || []).slice(-5).reverse();
  for (const appId of appIds) {
    const app = db.get<Application>('applications', appId);
    if (app) {
      recentApplications.push({
        id: app.id,
        type: 'application',
        description: `Applied to ${app.jobTitle} at ${app.company}`,
        timestamp: app.appliedAt || app.createdAt
      });
    }
  }
  
  const profileComplete = !!(
    profile?.skills?.length && profile.skills.length > 0 &&
    profile?.experienceYears && profile.experienceYears > 0
  );
  
  // Return format that matches DashboardStats interface
  res.json({
    totalApplications: applicationStats.total,
    interviewsScheduled: applicationStats.interview,
    offersReceived: applicationStats.offer,
    activeJobMatches: jobCache.size,
    applicationsByStatus: {
      applied: applicationStats.applied,
      interview: applicationStats.interview,
      offer: applicationStats.offer,
      rejected: applicationStats.rejected
    },
    recentActivity: recentApplications,
    // Also include legacy format for backward compatibility
    user: {
      name: user?.name || 'User',
      email: user?.email || session.email,
      profileComplete
    }
  });
});

// Update application status
app.put('/applications/:applicationId/status', requireAuth, (req, res) => {
  const session = (req as any).session as Session;
  const { applicationId } = req.params;
  const { status } = req.body;
  
  const app = db.get<Application>('applications', applicationId);
  if (!app || app.userId !== session.userId) {
    return res.status(404).json({ error: 'Application not found' });
  }
  
  const oldStatus = app.status;
  app.status = status;
  app.updatedAt = new Date().toISOString();
  db.set<Application>('applications', applicationId, app);
  
  // Update stats
  const appIndex = db.get<ApplicationIndex>('user_applications_index', session.userId);
  if (appIndex && appIndex.stats) {
    if (oldStatus in appIndex.stats) {
      (appIndex.stats as any)[oldStatus]--;
    }
    if (status in appIndex.stats) {
      (appIndex.stats as any)[status]++;
    }
    db.set<ApplicationIndex>('user_applications_index', session.userId, appIndex);
  }
  
  res.json({
    id: app.id,
    jobId: app.jobId,
    jobTitle: app.jobTitle,
    company: app.company,
    status: app.status,
    appliedAt: app.appliedAt
  });
});

// Get job details
app.get('/jobs/:jobId', requireAuth, (req, res) => {
  const { jobId } = req.params;
  const job = jobCache.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json(job);
});

app.listen(PORT, () => {
  console.log(`🚀 AI Job Application API running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /             - API info`);
  console.log(`   GET  /health       - Health check`);
  console.log(`   POST /auth/register`);
  console.log(`   POST /auth/login`);
  console.log(`   GET  /profile`);
  console.log(`   PUT  /profile`);
  console.log(`   GET  /jobs/search  - Real-time job scraping`);
  console.log(`   GET  /jobs/:jobId  - Job details`);
  console.log(`   POST /applications/assisted-apply - AI-powered apply`);
  console.log(`   GET  /applications`);
  console.log(`   PUT  /applications/:id/status`);
  console.log(`   GET  /dashboard`);
  console.log(`\n🤖 AI Features: ${process.env.GEMINI_API_KEY ? 'Gemini API configured' : 'Using fallback (set GEMINI_API_KEY for AI features)'}`);
});
