import { z } from "zod";
import { db } from "../utils/db.js";
import { analyzeJobMatch } from "../utils/gemini.js";
const config = {
  name: "SearchJobsAPI",
  type: "api",
  path: "/jobs/search",
  method: "GET",
  description: "Search for jobs with filters",
  emits: [],
  flows: ["job-discovery-flow"],
  responseSchema: {
    200: z.object({
      jobs: z.array(z.object({
        id: z.string(),
        title: z.string(),
        company: z.string(),
        location: z.string(),
        remote: z.boolean(),
        salary: z.string().optional(),
        description: z.string(),
        applyUrl: z.string(),
        postedAt: z.string(),
        matchScore: z.number().optional()
      })),
      total: z.number(),
      page: z.number(),
      totalPages: z.number()
    }),
    401: z.object({
      error: z.string()
    })
  }
};
const handler = async (req, { logger }) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return {
      status: 401,
      body: { error: "Authorization required" }
    };
  }
  const token = authHeader.replace("Bearer ", "");
  const session = db.get("sessions", token);
  if (!session) {
    return {
      status: 401,
      body: { error: "Invalid session" }
    };
  }
  const { query, location, remote, minSalary, maxSalary, page = "1", limit = "20" } = req.queryParams;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  logger.info("Searching jobs", { query, location, remote, userId: session.userId });
  const profile = db.get("user_profiles", session.userId);
  const mockJobs = await generateMockJobs(query, location, remote === "true", profile);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedJobs = mockJobs.slice(startIndex, startIndex + limitNum);
  return {
    status: 200,
    body: {
      jobs: paginatedJobs,
      total: mockJobs.length,
      page: pageNum,
      totalPages: Math.ceil(mockJobs.length / limitNum)
    }
  };
};
async function generateMockJobs(query, location, remote, profile) {
  const companies = ["TechCorp", "StartupAI", "CloudSolutions", "DataDriven Inc", "InnovateTech", "FutureLabs"];
  const titles = [
    "Senior Software Engineer",
    "Full Stack Developer",
    "Backend Engineer",
    "Frontend Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Product Manager",
    "Engineering Manager"
  ];
  const locations = ["San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Remote"];
  const userSkills = profile?.skills || [];
  const userExperience = profile?.experienceYears || 0;
  const jobs = await Promise.all(titles.slice(0, 6).map(async (title, index) => {
    const jobSkills = ["Python", "JavaScript", "React", "Node.js", "AWS", "PostgreSQL"];
    const description = `We're looking for a ${title} to join our team. You'll work on exciting projects using modern technologies. Requirements include experience with ${jobSkills.slice(0, 3).join(", ")}.`;
    let matchScore = 70 + Math.floor(Math.random() * 20);
    if (userSkills.length > 0) {
      try {
        const analysis = await analyzeJobMatch(description, userSkills, userExperience);
        matchScore = analysis.score;
      } catch (error) {
        const matchingSkills = userSkills.filter(
          (s) => jobSkills.some((js) => js.toLowerCase() === s.toLowerCase())
        );
        matchScore = Math.round(matchingSkills.length / Math.max(userSkills.length, 1) * 100);
      }
    }
    return {
      id: `job_${Date.now()}_${index}`,
      title: query ? `${title} - ${query}` : title,
      company: companies[index % companies.length],
      location: location || locations[index % locations.length],
      remote: remote ?? index % 2 === 0,
      salary: `$${100 + index * 20}k - $${150 + index * 20}k`,
      description,
      applyUrl: `https://careers.example.com/job/${index}`,
      postedAt: new Date(Date.now() - index * 864e5).toISOString(),
      matchScore
    };
  }));
  return jobs.filter((job) => !profile || job.matchScore >= 50);
}
export {
  config,
  handler
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vc3JjL2pvYnMvc2VhcmNoLWpvYnMtYXBpLnN0ZXAudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB0eXBlIHsgQXBpUm91dGVDb25maWcsIEhhbmRsZXJzIH0gZnJvbSAnbW90aWEnO1xyXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuaW1wb3J0IHsgZGIgfSBmcm9tICcuLi91dGlscy9kYic7XHJcbmltcG9ydCB7IGFuYWx5emVKb2JNYXRjaCB9IGZyb20gJy4uL3V0aWxzL2dlbWluaSc7XHJcblxyXG5pbnRlcmZhY2UgU2Vzc2lvbiB7XHJcbiAgdXNlcklkOiBzdHJpbmc7XHJcbiAgZW1haWw6IHN0cmluZztcclxuICBjcmVhdGVkQXQ6IHN0cmluZztcclxuICBleHBpcmVzQXQ6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIFVzZXJQcm9maWxlIHtcclxuICB1c2VySWQ6IHN0cmluZztcclxuICBza2lsbHM6IHN0cmluZ1tdO1xyXG4gIGV4cGVyaWVuY2VZZWFyczogbnVtYmVyO1xyXG4gIHByZWZlcnJlZFJvbGVzOiBzdHJpbmdbXTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbmZpZzogQXBpUm91dGVDb25maWcgPSB7XHJcbiAgbmFtZTogJ1NlYXJjaEpvYnNBUEknLFxyXG4gIHR5cGU6ICdhcGknLFxyXG4gIHBhdGg6ICcvam9icy9zZWFyY2gnLFxyXG4gIG1ldGhvZDogJ0dFVCcsXHJcbiAgZGVzY3JpcHRpb246ICdTZWFyY2ggZm9yIGpvYnMgd2l0aCBmaWx0ZXJzJyxcclxuICBlbWl0czogW10sXHJcbiAgZmxvd3M6IFsnam9iLWRpc2NvdmVyeS1mbG93J10sXHJcbiAgcmVzcG9uc2VTY2hlbWE6IHtcclxuICAgIDIwMDogei5vYmplY3Qoe1xyXG4gICAgICBqb2JzOiB6LmFycmF5KHoub2JqZWN0KHtcclxuICAgICAgICBpZDogei5zdHJpbmcoKSxcclxuICAgICAgICB0aXRsZTogei5zdHJpbmcoKSxcclxuICAgICAgICBjb21wYW55OiB6LnN0cmluZygpLFxyXG4gICAgICAgIGxvY2F0aW9uOiB6LnN0cmluZygpLFxyXG4gICAgICAgIHJlbW90ZTogei5ib29sZWFuKCksXHJcbiAgICAgICAgc2FsYXJ5OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXHJcbiAgICAgICAgZGVzY3JpcHRpb246IHouc3RyaW5nKCksXHJcbiAgICAgICAgYXBwbHlVcmw6IHouc3RyaW5nKCksXHJcbiAgICAgICAgcG9zdGVkQXQ6IHouc3RyaW5nKCksXHJcbiAgICAgICAgbWF0Y2hTY29yZTogei5udW1iZXIoKS5vcHRpb25hbCgpXHJcbiAgICAgIH0pKSxcclxuICAgICAgdG90YWw6IHoubnVtYmVyKCksXHJcbiAgICAgIHBhZ2U6IHoubnVtYmVyKCksXHJcbiAgICAgIHRvdGFsUGFnZXM6IHoubnVtYmVyKClcclxuICAgIH0pLFxyXG4gICAgNDAxOiB6Lm9iamVjdCh7XHJcbiAgICAgIGVycm9yOiB6LnN0cmluZygpXHJcbiAgICB9KVxyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyOiBIYW5kbGVyc1snU2VhcmNoSm9ic0FQSSddID0gYXN5bmMgKHJlcSwgeyBsb2dnZXIgfSkgPT4ge1xyXG4gIGNvbnN0IGF1dGhIZWFkZXIgPSByZXEuaGVhZGVycy5hdXRob3JpemF0aW9uO1xyXG4gIGlmICghYXV0aEhlYWRlcikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhdHVzOiA0MDEsXHJcbiAgICAgIGJvZHk6IHsgZXJyb3I6ICdBdXRob3JpemF0aW9uIHJlcXVpcmVkJyB9XHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICBjb25zdCB0b2tlbiA9IGF1dGhIZWFkZXIucmVwbGFjZSgnQmVhcmVyICcsICcnKTtcclxuICBjb25zdCBzZXNzaW9uID0gZGIuZ2V0PFNlc3Npb24+KCdzZXNzaW9ucycsIHRva2VuKTtcclxuICBpZiAoIXNlc3Npb24pIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1czogNDAxLFxyXG4gICAgICBib2R5OiB7IGVycm9yOiAnSW52YWxpZCBzZXNzaW9uJyB9XHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICBjb25zdCB7IHF1ZXJ5LCBsb2NhdGlvbiwgcmVtb3RlLCBtaW5TYWxhcnksIG1heFNhbGFyeSwgcGFnZSA9ICcxJywgbGltaXQgPSAnMjAnIH0gPSByZXEucXVlcnlQYXJhbXM7XHJcbiAgY29uc3QgcGFnZU51bSA9IHBhcnNlSW50KHBhZ2UpO1xyXG4gIGNvbnN0IGxpbWl0TnVtID0gcGFyc2VJbnQobGltaXQpO1xyXG4gIFxyXG4gIGxvZ2dlci5pbmZvKCdTZWFyY2hpbmcgam9icycsIHsgcXVlcnksIGxvY2F0aW9uLCByZW1vdGUsIHVzZXJJZDogc2Vzc2lvbi51c2VySWQgfSk7XHJcbiAgXHJcbiAgLy8gR2V0IHVzZXIgcHJvZmlsZSBmb3IgbWF0Y2hpbmdcclxuICBjb25zdCBwcm9maWxlID0gZGIuZ2V0PFVzZXJQcm9maWxlPigndXNlcl9wcm9maWxlcycsIHNlc3Npb24udXNlcklkKTtcclxuICBcclxuICAvLyBJbiBwcm9kdWN0aW9uLCB0aGlzIHdvdWxkIHF1ZXJ5IGEgZGF0YWJhc2Ugb3IgZXh0ZXJuYWwgam9iIEFQSXNcclxuICAvLyBGb3IgZGVtbywgcmV0dXJuIG1vY2sgam9icyB3aXRoIEFJLXBvd2VyZWQgc2NvcmluZ1xyXG4gIGNvbnN0IG1vY2tKb2JzID0gYXdhaXQgZ2VuZXJhdGVNb2NrSm9icyhxdWVyeSwgbG9jYXRpb24sIHJlbW90ZSA9PT0gJ3RydWUnLCBwcm9maWxlKTtcclxuICBcclxuICAvLyBQYWdpbmF0ZSByZXN1bHRzXHJcbiAgY29uc3Qgc3RhcnRJbmRleCA9IChwYWdlTnVtIC0gMSkgKiBsaW1pdE51bTtcclxuICBjb25zdCBwYWdpbmF0ZWRKb2JzID0gbW9ja0pvYnMuc2xpY2Uoc3RhcnRJbmRleCwgc3RhcnRJbmRleCArIGxpbWl0TnVtKTtcclxuICBcclxuICByZXR1cm4ge1xyXG4gICAgc3RhdHVzOiAyMDAsXHJcbiAgICBib2R5OiB7XHJcbiAgICAgIGpvYnM6IHBhZ2luYXRlZEpvYnMsXHJcbiAgICAgIHRvdGFsOiBtb2NrSm9icy5sZW5ndGgsXHJcbiAgICAgIHBhZ2U6IHBhZ2VOdW0sXHJcbiAgICAgIHRvdGFsUGFnZXM6IE1hdGguY2VpbChtb2NrSm9icy5sZW5ndGggLyBsaW1pdE51bSlcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG5cclxuLy8gQUktcG93ZXJlZCBqb2IgZ2VuZXJhdG9yIHdpdGggR2VtaW5pIHNjb3JpbmdcclxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVNb2NrSm9icyhxdWVyeT86IHN0cmluZywgbG9jYXRpb24/OiBzdHJpbmcsIHJlbW90ZT86IGJvb2xlYW4sIHByb2ZpbGU/OiBVc2VyUHJvZmlsZSB8IG51bGwpIHtcclxuICBjb25zdCBjb21wYW5pZXMgPSBbJ1RlY2hDb3JwJywgJ1N0YXJ0dXBBSScsICdDbG91ZFNvbHV0aW9ucycsICdEYXRhRHJpdmVuIEluYycsICdJbm5vdmF0ZVRlY2gnLCAnRnV0dXJlTGFicyddO1xyXG4gIGNvbnN0IHRpdGxlcyA9IFtcclxuICAgICdTZW5pb3IgU29mdHdhcmUgRW5naW5lZXInLCAnRnVsbCBTdGFjayBEZXZlbG9wZXInLCAnQmFja2VuZCBFbmdpbmVlcicsXHJcbiAgICAnRnJvbnRlbmQgRGV2ZWxvcGVyJywgJ0Rldk9wcyBFbmdpbmVlcicsICdEYXRhIFNjaWVudGlzdCcsXHJcbiAgICAnTWFjaGluZSBMZWFybmluZyBFbmdpbmVlcicsICdQcm9kdWN0IE1hbmFnZXInLCAnRW5naW5lZXJpbmcgTWFuYWdlcidcclxuICBdO1xyXG4gIGNvbnN0IGxvY2F0aW9ucyA9IFsnU2FuIEZyYW5jaXNjbywgQ0EnLCAnTmV3IFlvcmssIE5ZJywgJ1NlYXR0bGUsIFdBJywgJ0F1c3RpbiwgVFgnLCAnUmVtb3RlJ107XHJcbiAgXHJcbiAgY29uc3QgdXNlclNraWxscyA9IHByb2ZpbGU/LnNraWxscyB8fCBbXTtcclxuICBjb25zdCB1c2VyRXhwZXJpZW5jZSA9IHByb2ZpbGU/LmV4cGVyaWVuY2VZZWFycyB8fCAwO1xyXG4gIFxyXG4gIGNvbnN0IGpvYnMgPSBhd2FpdCBQcm9taXNlLmFsbCh0aXRsZXMuc2xpY2UoMCwgNikubWFwKGFzeW5jICh0aXRsZSwgaW5kZXgpID0+IHtcclxuICAgIGNvbnN0IGpvYlNraWxscyA9IFsnUHl0aG9uJywgJ0phdmFTY3JpcHQnLCAnUmVhY3QnLCAnTm9kZS5qcycsICdBV1MnLCAnUG9zdGdyZVNRTCddO1xyXG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBgV2UncmUgbG9va2luZyBmb3IgYSAke3RpdGxlfSB0byBqb2luIG91ciB0ZWFtLiBZb3UnbGwgd29yayBvbiBleGNpdGluZyBwcm9qZWN0cyB1c2luZyBtb2Rlcm4gdGVjaG5vbG9naWVzLiBSZXF1aXJlbWVudHMgaW5jbHVkZSBleHBlcmllbmNlIHdpdGggJHtqb2JTa2lsbHMuc2xpY2UoMCwgMykuam9pbignLCAnKX0uYDtcclxuICAgIFxyXG4gICAgLy8gVXNlIEdlbWluaSBBSSBmb3IgbWF0Y2ggc2NvcmluZ1xyXG4gICAgbGV0IG1hdGNoU2NvcmUgPSA3MCArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKTtcclxuICAgIGlmICh1c2VyU2tpbGxzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBhbmFseXNpcyA9IGF3YWl0IGFuYWx5emVKb2JNYXRjaChkZXNjcmlwdGlvbiwgdXNlclNraWxscywgdXNlckV4cGVyaWVuY2UpO1xyXG4gICAgICAgIG1hdGNoU2NvcmUgPSBhbmFseXNpcy5zY29yZTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAvLyBGYWxsYmFjayB0byBiYXNpYyBzY29yaW5nIGlmIEFJIGZhaWxzXHJcbiAgICAgICAgY29uc3QgbWF0Y2hpbmdTa2lsbHMgPSB1c2VyU2tpbGxzLmZpbHRlcigoczogc3RyaW5nKSA9PiBcclxuICAgICAgICAgIGpvYlNraWxscy5zb21lKGpzID0+IGpzLnRvTG93ZXJDYXNlKCkgPT09IHMudG9Mb3dlckNhc2UoKSlcclxuICAgICAgICApO1xyXG4gICAgICAgIG1hdGNoU2NvcmUgPSBNYXRoLnJvdW5kKChtYXRjaGluZ1NraWxscy5sZW5ndGggLyBNYXRoLm1heCh1c2VyU2tpbGxzLmxlbmd0aCwgMSkpICogMTAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpZDogYGpvYl8ke0RhdGUubm93KCl9XyR7aW5kZXh9YCxcclxuICAgICAgdGl0bGU6IHF1ZXJ5ID8gYCR7dGl0bGV9IC0gJHtxdWVyeX1gIDogdGl0bGUsXHJcbiAgICAgIGNvbXBhbnk6IGNvbXBhbmllc1tpbmRleCAlIGNvbXBhbmllcy5sZW5ndGhdLFxyXG4gICAgICBsb2NhdGlvbjogbG9jYXRpb24gfHwgbG9jYXRpb25zW2luZGV4ICUgbG9jYXRpb25zLmxlbmd0aF0sXHJcbiAgICAgIHJlbW90ZTogcmVtb3RlID8/IGluZGV4ICUgMiA9PT0gMCxcclxuICAgICAgc2FsYXJ5OiBgJCR7MTAwICsgaW5kZXggKiAyMH1rIC0gJCR7MTUwICsgaW5kZXggKiAyMH1rYCxcclxuICAgICAgZGVzY3JpcHRpb24sXHJcbiAgICAgIGFwcGx5VXJsOiBgaHR0cHM6Ly9jYXJlZXJzLmV4YW1wbGUuY29tL2pvYi8ke2luZGV4fWAsXHJcbiAgICAgIHBvc3RlZEF0OiBuZXcgRGF0ZShEYXRlLm5vdygpIC0gaW5kZXggKiA4NjQwMDAwMCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgbWF0Y2hTY29yZVxyXG4gICAgfTtcclxuICB9KSk7XHJcbiAgXHJcbiAgcmV0dXJuIGpvYnMuZmlsdGVyKGpvYiA9PiAhcHJvZmlsZSB8fCBqb2IubWF0Y2hTY29yZSA+PSA1MCk7XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIkFBQ0EsU0FBUyxTQUFTO0FBQ2xCLFNBQVMsVUFBVTtBQUNuQixTQUFTLHVC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
