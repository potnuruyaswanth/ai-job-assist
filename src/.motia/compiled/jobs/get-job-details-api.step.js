import { z } from "zod";
import { db } from "../utils/db.js";
import { analyzeJobMatch } from "../utils/gemini.js";
const config = {
  name: "GetJobDetailsAPI",
  type: "api",
  path: "/jobs/:jobId",
  method: "GET",
  description: "Get detailed job information with AI match analysis",
  emits: [],
  flows: ["job-discovery-flow"],
  responseSchema: {
    200: z.object({
      job: z.object({
        id: z.string(),
        title: z.string(),
        company: z.string(),
        location: z.string(),
        remote: z.boolean(),
        salary: z.string().optional(),
        description: z.string(),
        requirements: z.array(z.string()),
        benefits: z.array(z.string()),
        applyUrl: z.string(),
        postedAt: z.string()
      }),
      matchAnalysis: z.object({
        score: z.number(),
        matchingSkills: z.array(z.string()),
        missingSkills: z.array(z.string()),
        recommendation: z.string()
      })
    }),
    404: z.object({
      error: z.string()
    })
  }
};
const handler = async (req, { logger }) => {
  const { jobId } = req.pathParams;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return {
      status: 404,
      body: { error: "Authorization required" }
    };
  }
  const token = authHeader.replace("Bearer ", "");
  const session = db.get("sessions", token);
  if (!session) {
    return {
      status: 404,
      body: { error: "Invalid session" }
    };
  }
  logger.info("Fetching job details", { jobId, userId: session.userId });
  const profile = db.get("user_profiles", session.userId);
  const userSkills = profile?.skills || [];
  const job = {
    id: jobId,
    title: "Senior Software Engineer",
    company: "TechCorp",
    location: "San Francisco, CA",
    remote: true,
    salary: "$150k - $200k",
    description: `We're looking for a Senior Software Engineer to join our growing team. You'll be working on cutting-edge projects that impact millions of users.

As a Senior Engineer, you'll:
- Design and implement scalable backend services
- Mentor junior engineers
- Collaborate with product and design teams
- Contribute to architectural decisions`,
    requirements: [
      "5+ years of software development experience",
      "Strong proficiency in Python and JavaScript",
      "Experience with React and Node.js",
      "Familiarity with AWS or similar cloud platforms",
      "Strong communication skills",
      "Experience with PostgreSQL or similar databases"
    ],
    benefits: [
      "Competitive salary and equity",
      "Health, dental, and vision insurance",
      "Unlimited PTO",
      "Remote-friendly culture",
      "401(k) matching",
      "Professional development budget"
    ],
    applyUrl: `https://careers.techcorp.com/apply/${jobId}`,
    postedAt: new Date(Date.now() - 3 * 864e5).toISOString()
  };
  logger.info("Analyzing job match with Gemini AI", { jobId, userSkillsCount: userSkills.length });
  const jobRequiredSkills = ["Python", "JavaScript", "React", "Node.js", "AWS", "PostgreSQL"];
  const matchingSkills = userSkills.filter(
    (s) => jobRequiredSkills.some((js) => js.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = jobRequiredSkills.filter(
    (js) => !userSkills.some((s) => s.toLowerCase() === js.toLowerCase())
  );
  const aiAnalysis = await analyzeJobMatch(
    job.description,
    userSkills,
    profile?.experienceYears || 0
  );
  const matchScore = aiAnalysis.score;
  let recommendation;
  if (aiAnalysis.reasons.length > 0) {
    recommendation = aiAnalysis.reasons.join(" ");
  } else if (matchScore >= 80) {
    recommendation = "Excellent match! Your skills align very well with this position. We recommend applying.";
  } else if (matchScore >= 60) {
    recommendation = "Good match! You have most of the required skills. Consider highlighting relevant projects in your application.";
  } else if (matchScore >= 40) {
    recommendation = "Moderate match. Focus on transferable skills and consider upskilling in the missing areas.";
  } else {
    recommendation = "This role may require skills outside your current profile. Consider it as a stretch opportunity.";
  }
  logger.info("AI analysis complete", { matchScore, reasonsCount: aiAnalysis.reasons.length });
  return {
    status: 200,
    body: {
      job,
      matchAnalysis: {
        score: matchScore,
        matchingSkills,
        missingSkills,
        recommendation
      }
    }
  };
};
export {
  config,
  handler
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vam9icy9nZXQtam9iLWRldGFpbHMtYXBpLnN0ZXAudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB0eXBlIHsgQXBpUm91dGVDb25maWcsIEhhbmRsZXJzIH0gZnJvbSAnbW90aWEnO1xyXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuaW1wb3J0IHsgZGIgfSBmcm9tICcuLi91dGlscy9kYic7XHJcbmltcG9ydCB7IGFuYWx5emVKb2JNYXRjaCB9IGZyb20gJy4uL3V0aWxzL2dlbWluaSc7XHJcblxyXG5pbnRlcmZhY2UgU2Vzc2lvbiB7XHJcbiAgdXNlcklkOiBzdHJpbmc7XHJcbiAgZW1haWw6IHN0cmluZztcclxuICBjcmVhdGVkQXQ6IHN0cmluZztcclxuICBleHBpcmVzQXQ6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIFVzZXJQcm9maWxlIHtcclxuICB1c2VySWQ6IHN0cmluZztcclxuICBza2lsbHM6IHN0cmluZ1tdO1xyXG4gIGV4cGVyaWVuY2VZZWFyczogbnVtYmVyO1xyXG4gIHByZWZlcnJlZFJvbGVzOiBzdHJpbmdbXTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbmZpZzogQXBpUm91dGVDb25maWcgPSB7XHJcbiAgbmFtZTogJ0dldEpvYkRldGFpbHNBUEknLFxyXG4gIHR5cGU6ICdhcGknLFxyXG4gIHBhdGg6ICcvam9icy86am9iSWQnLFxyXG4gIG1ldGhvZDogJ0dFVCcsXHJcbiAgZGVzY3JpcHRpb246ICdHZXQgZGV0YWlsZWQgam9iIGluZm9ybWF0aW9uIHdpdGggQUkgbWF0Y2ggYW5hbHlzaXMnLFxyXG4gIGVtaXRzOiBbXSxcclxuICBmbG93czogWydqb2ItZGlzY292ZXJ5LWZsb3cnXSxcclxuICByZXNwb25zZVNjaGVtYToge1xyXG4gICAgMjAwOiB6Lm9iamVjdCh7XHJcbiAgICAgIGpvYjogei5vYmplY3Qoe1xyXG4gICAgICAgIGlkOiB6LnN0cmluZygpLFxyXG4gICAgICAgIHRpdGxlOiB6LnN0cmluZygpLFxyXG4gICAgICAgIGNvbXBhbnk6IHouc3RyaW5nKCksXHJcbiAgICAgICAgbG9jYXRpb246IHouc3RyaW5nKCksXHJcbiAgICAgICAgcmVtb3RlOiB6LmJvb2xlYW4oKSxcclxuICAgICAgICBzYWxhcnk6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcclxuICAgICAgICBkZXNjcmlwdGlvbjogei5zdHJpbmcoKSxcclxuICAgICAgICByZXF1aXJlbWVudHM6IHouYXJyYXkoei5zdHJpbmcoKSksXHJcbiAgICAgICAgYmVuZWZpdHM6IHouYXJyYXkoei5zdHJpbmcoKSksXHJcbiAgICAgICAgYXBwbHlVcmw6IHouc3RyaW5nKCksXHJcbiAgICAgICAgcG9zdGVkQXQ6IHouc3RyaW5nKClcclxuICAgICAgfSksXHJcbiAgICAgIG1hdGNoQW5hbHlzaXM6IHoub2JqZWN0KHtcclxuICAgICAgICBzY29yZTogei5udW1iZXIoKSxcclxuICAgICAgICBtYXRjaGluZ1NraWxsczogei5hcnJheSh6LnN0cmluZygpKSxcclxuICAgICAgICBtaXNzaW5nU2tpbGxzOiB6LmFycmF5KHouc3RyaW5nKCkpLFxyXG4gICAgICAgIHJlY29tbWVuZGF0aW9uOiB6LnN0cmluZygpXHJcbiAgICAgIH0pXHJcbiAgICB9KSxcclxuICAgIDQwNDogei5vYmplY3Qoe1xyXG4gICAgICBlcnJvcjogei5zdHJpbmcoKVxyXG4gICAgfSlcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlcjogSGFuZGxlcnNbJ0dldEpvYkRldGFpbHNBUEknXSA9IGFzeW5jIChyZXEsIHsgbG9nZ2VyIH0pID0+IHtcclxuICBjb25zdCB7IGpvYklkIH0gPSByZXEucGF0aFBhcmFtcztcclxuICBcclxuICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbjtcclxuICBpZiAoIWF1dGhIZWFkZXIpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1czogNDA0LFxyXG4gICAgICBib2R5OiB7IGVycm9yOiAnQXV0aG9yaXphdGlvbiByZXF1aXJlZCcgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyLnJlcGxhY2UoJ0JlYXJlciAnLCAnJyk7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGRiLmdldDxTZXNzaW9uPignc2Vzc2lvbnMnLCB0b2tlbik7XHJcbiAgaWYgKCFzZXNzaW9uKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXM6IDQwNCxcclxuICAgICAgYm9keTogeyBlcnJvcjogJ0ludmFsaWQgc2Vzc2lvbicgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgbG9nZ2VyLmluZm8oJ0ZldGNoaW5nIGpvYiBkZXRhaWxzJywgeyBqb2JJZCwgdXNlcklkOiBzZXNzaW9uLnVzZXJJZCB9KTtcclxuICBcclxuICAvLyBHZXQgdXNlciBwcm9maWxlIGZvciBtYXRjaGluZ1xyXG4gIGNvbnN0IHByb2ZpbGUgPSBkYi5nZXQ8VXNlclByb2ZpbGU+KCd1c2VyX3Byb2ZpbGVzJywgc2Vzc2lvbi51c2VySWQpO1xyXG4gIGNvbnN0IHVzZXJTa2lsbHMgPSBwcm9maWxlPy5za2lsbHMgfHwgW107XHJcbiAgXHJcbiAgLy8gSW4gcHJvZHVjdGlvbiwgZmV0Y2ggZnJvbSBkYXRhYmFzZVxyXG4gIC8vIE1vY2sgam9iIGRhdGEgZm9yIGRlbW9cclxuICBjb25zdCBqb2IgPSB7XHJcbiAgICBpZDogam9iSWQsXHJcbiAgICB0aXRsZTogJ1NlbmlvciBTb2Z0d2FyZSBFbmdpbmVlcicsXHJcbiAgICBjb21wYW55OiAnVGVjaENvcnAnLFxyXG4gICAgbG9jYXRpb246ICdTYW4gRnJhbmNpc2NvLCBDQScsXHJcbiAgICByZW1vdGU6IHRydWUsXHJcbiAgICBzYWxhcnk6ICckMTUwayAtICQyMDBrJyxcclxuICAgIGRlc2NyaXB0aW9uOiBgV2UncmUgbG9va2luZyBmb3IgYSBTZW5pb3IgU29mdHdhcmUgRW5naW5lZXIgdG8gam9pbiBvdXIgZ3Jvd2luZyB0ZWFtLiBZb3UnbGwgYmUgd29ya2luZyBvbiBjdXR0aW5nLWVkZ2UgcHJvamVjdHMgdGhhdCBpbXBhY3QgbWlsbGlvbnMgb2YgdXNlcnMuXHJcblxyXG5BcyBhIFNlbmlvciBFbmdpbmVlciwgeW91J2xsOlxyXG4tIERlc2lnbiBhbmQgaW1wbGVtZW50IHNjYWxhYmxlIGJhY2tlbmQgc2VydmljZXNcclxuLSBNZW50b3IganVuaW9yIGVuZ2luZWVyc1xyXG4tIENvbGxhYm9yYXRlIHdpdGggcHJvZHVjdCBhbmQgZGVzaWduIHRlYW1zXHJcbi0gQ29udHJpYnV0ZSB0byBhcmNoaXRlY3R1cmFsIGRlY2lzaW9uc2AsXHJcbiAgICByZXF1aXJlbWVudHM6IFtcclxuICAgICAgJzUrIHllYXJzIG9mIHNvZnR3YXJlIGRldmVsb3BtZW50IGV4cGVyaWVuY2UnLFxyXG4gICAgICAnU3Ryb25nIHByb2ZpY2llbmN5IGluIFB5dGhvbiBhbmQgSmF2YVNjcmlwdCcsXHJcbiAgICAgICdFeHBlcmllbmNlIHdpdGggUmVhY3QgYW5kIE5vZGUuanMnLFxyXG4gICAgICAnRmFtaWxpYXJpdHkgd2l0aCBBV1Mgb3Igc2ltaWxhciBjbG91ZCBwbGF0Zm9ybXMnLFxyXG4gICAgICAnU3Ryb25nIGNvbW11bmljYXRpb24gc2tpbGxzJyxcclxuICAgICAgJ0V4cGVyaWVuY2Ugd2l0aCBQb3N0Z3JlU1FMIG9yIHNpbWlsYXIgZGF0YWJhc2VzJ1xyXG4gICAgXSxcclxuICAgIGJlbmVmaXRzOiBbXHJcbiAgICAgICdDb21wZXRpdGl2ZSBzYWxhcnkgYW5kIGVxdWl0eScsXHJcbiAgICAgICdIZWFsdGgsIGRlbnRhbCwgYW5kIHZpc2lvbiBpbnN1cmFuY2UnLFxyXG4gICAgICAnVW5saW1pdGVkIFBUTycsXHJcbiAgICAgICdSZW1vdGUtZnJpZW5kbHkgY3VsdHVyZScsXHJcbiAgICAgICc0MDEoaykgbWF0Y2hpbmcnLFxyXG4gICAgICAnUHJvZmVzc2lvbmFsIGRldmVsb3BtZW50IGJ1ZGdldCdcclxuICAgIF0sXHJcbiAgICBhcHBseVVybDogYGh0dHBzOi8vY2FyZWVycy50ZWNoY29ycC5jb20vYXBwbHkvJHtqb2JJZH1gLFxyXG4gICAgcG9zdGVkQXQ6IG5ldyBEYXRlKERhdGUubm93KCkgLSAzICogODY0MDAwMDApLnRvSVNPU3RyaW5nKClcclxuICB9O1xyXG4gIFxyXG4gIC8vIEFJIE1hdGNoIEFuYWx5c2lzIHVzaW5nIEdlbWluaVxyXG4gIGxvZ2dlci5pbmZvKCdBbmFseXppbmcgam9iIG1hdGNoIHdpdGggR2VtaW5pIEFJJywgeyBqb2JJZCwgdXNlclNraWxsc0NvdW50OiB1c2VyU2tpbGxzLmxlbmd0aCB9KTtcclxuICBcclxuICBjb25zdCBqb2JSZXF1aXJlZFNraWxscyA9IFsnUHl0aG9uJywgJ0phdmFTY3JpcHQnLCAnUmVhY3QnLCAnTm9kZS5qcycsICdBV1MnLCAnUG9zdGdyZVNRTCddO1xyXG4gIGNvbnN0IG1hdGNoaW5nU2tpbGxzID0gdXNlclNraWxscy5maWx0ZXIoKHM6IHN0cmluZykgPT4gXHJcbiAgICBqb2JSZXF1aXJlZFNraWxscy5zb21lKGpzID0+IGpzLnRvTG93ZXJDYXNlKCkgPT09IHMudG9Mb3dlckNhc2UoKSlcclxuICApO1xyXG4gIGNvbnN0IG1pc3NpbmdTa2lsbHMgPSBqb2JSZXF1aXJlZFNraWxscy5maWx0ZXIoanMgPT4gXHJcbiAgICAhdXNlclNraWxscy5zb21lKChzOiBzdHJpbmcpID0+IHMudG9Mb3dlckNhc2UoKSA9PT0ganMudG9Mb3dlckNhc2UoKSlcclxuICApO1xyXG4gIFxyXG4gIC8vIFVzZSBHZW1pbmkgQUkgZm9yIGRlZXBlciBhbmFseXNpc1xyXG4gIGNvbnN0IGFpQW5hbHlzaXMgPSBhd2FpdCBhbmFseXplSm9iTWF0Y2goXHJcbiAgICBqb2IuZGVzY3JpcHRpb24sXHJcbiAgICB1c2VyU2tpbGxzLFxyXG4gICAgcHJvZmlsZT8uZXhwZXJpZW5jZVllYXJzIHx8IDBcclxuICApO1xyXG4gIFxyXG4gIGNvbnN0IG1hdGNoU2NvcmUgPSBhaUFuYWx5c2lzLnNjb3JlO1xyXG4gIFxyXG4gIGxldCByZWNvbW1lbmRhdGlvbjogc3RyaW5nO1xyXG4gIGlmIChhaUFuYWx5c2lzLnJlYXNvbnMubGVuZ3RoID4gMCkge1xyXG4gICAgcmVjb21tZW5kYXRpb24gPSBhaUFuYWx5c2lzLnJlYXNvbnMuam9pbignICcpO1xyXG4gIH0gZWxzZSBpZiAobWF0Y2hTY29yZSA+PSA4MCkge1xyXG4gICAgcmVjb21tZW5kYXRpb24gPSBcIkV4Y2VsbGVudCBtYXRjaCEgWW91ciBza2lsbHMgYWxpZ24gdmVyeSB3ZWxsIHdpdGggdGhpcyBwb3NpdGlvbi4gV2UgcmVjb21tZW5kIGFwcGx5aW5nLlwiO1xyXG4gIH0gZWxzZSBpZiAobWF0Y2hTY29yZSA+PSA2MCkge1xyXG4gICAgcmVjb21tZW5kYXRpb24gPSBcIkdvb2QgbWF0Y2ghIFlvdSBoYXZlIG1vc3Qgb2YgdGhlIHJlcXVpcmVkIHNraWxscy4gQ29uc2lkZXIgaGlnaGxpZ2h0aW5nIHJlbGV2YW50IHByb2plY3RzIGluIHlvdXIgYXBwbGljYXRpb24uXCI7XHJcbiAgfSBlbHNlIGlmIChtYXRjaFNjb3JlID49IDQwKSB7XHJcbiAgICByZWNvbW1lbmRhdGlvbiA9IFwiTW9kZXJhdGUgbWF0Y2guIEZvY3VzIG9uIHRyYW5zZmVyYWJsZSBza2lsbHMgYW5kIGNvbnNpZGVyIHVwc2tpbGxpbmcgaW4gdGhlIG1pc3NpbmcgYXJlYXMuXCI7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJlY29tbWVuZGF0aW9uID0gXCJUaGlzIHJvbGUgbWF5IHJlcXVpcmUgc2tpbGxzIG91dHNpZGUgeW91ciBjdXJyZW50IHByb2ZpbGUuIENvbnNpZGVyIGl0IGFzIGEgc3RyZXRjaCBvcHBvcnR1bml0eS5cIjtcclxuICB9XHJcbiAgXHJcbiAgbG9nZ2VyLmluZm8oJ0FJIGFuYWx5c2lzIGNvbXBsZXRlJywgeyBtYXRjaFNjb3JlLCByZWFzb25zQ291bnQ6IGFpQW5hbHlzaXMucmVhc29ucy5sZW5ndGggfSk7XHJcbiAgXHJcbiAgcmV0dXJuIHtcclxuICAgIHN0YXR1czogMjAwLFxyXG4gICAgYm9keToge1xyXG4gICAgICBqb2IsXHJcbiAgICAgIG1hdGNoQW5hbHlzaXM6IHtcclxuICAgICAgICBzY29yZTogbWF0Y2hTY29yZSxcclxuICAgICAgICBtYXRjaGluZ1NraWxscyxcclxuICAgICAgICBtaXNzaW5nU2tpbGxzLFxyXG4gICAgICAgIHJlY29tbWVuZGF0aW9uXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiQUFDQSxTQUFTLFNBQVM7QUFDbEIsU0FBUyxVQUFVO0FBQ25CLFNBQVMsdUJBQXVCO0FBZ0J6QixNQUFNLFNBQXlCO0FBQUEsRUFDcEMsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsYUFBYTtBQUFBLEVBQ2IsT0FBTyxDQUFDO0FBQUEsRUFDUixPQUFPLENBQUMsb0JBQW9CO0FBQUEsRUFDNUIsZ0JBQWdCO0FBQUEsSUFDZCxLQUFLLEVBQUUsT0FBTztBQUFBLE1BQ1osS0FBSyxFQUFFLE9BQU87QUFBQSxRQUNaLElBQUksRUFBRSxPQUFPO0FBQUEsUUFDYixPQUFPLEVBQUUsT0FBTztBQUFBLFFBQ2hCLFNBQVMsRUFBRSxPQUFPO0FBQUEsUUFDbEIsVUFBVSxFQUFFLE9BQU87QUFBQSxRQUNuQixRQUFRLEVBQUUsUUFBUTtBQUFBLFFBQ2xCLFFBQVEsRUFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLFFBQzVCLGFBQWEsRUFBRSxPQUFPO0FBQUEsUUFDdEIsY0FBYyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUM7QUFBQSxRQUNoQyxVQUFVLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztBQUFBLFFBQzVCLFVBQVUsRUFBRSxPQUFPO0FBQUEsUUFDbkIsVUFBVSxFQUFFLE9BQU87QUFBQSxNQUNyQixDQUFDO0FBQUEsTUFDRCxlQUFlLEVBQUUsT0FBTztBQUFBLFFBQ3RCLE9BQU8sRUFBRSxPQUFPO0FBQUEsUUFDaEIsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztBQUFBLFFBQ2xDLGVBQWUsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDO0FBQUEsUUFDakMsZ0JBQWdCLEVBQUUsT0FBTztBQUFBLE1BQzNCLENBQUM7QUFBQSxJQUNILENBQUM7QUFBQSxJQUNELEtBQUssRUFBRSxPQUFPO0FBQUEsTUFDWixPQUFPLEVBQUUsT0FBTztBQUFBLElBQ2xCLENBQUM7QUFBQSxFQUNIO0FBQ0Y7QUFFTyxNQUFNLFVBQXdDLE9BQU8sS0FBSyxFQUFFLE9BQU8sTUFBTTtBQUM5RSxRQUFNLEVBQUUsTUFBTSxJQUFJLElBQUk7QUFFdEIsUUFBTSxhQUFhLElBQUksUUFBUTtBQUMvQixNQUFJLENBQUMsWUFBWTtBQUNmLFdBQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLE1BQU0sRUFBRSxPQUFPLHlCQUF5QjtBQUFBLElBQzFDO0FBQUEsRUFDRjtBQUVBLFFBQU0sUUFBUSxXQUFXLFFBQVEsV0FBVyxFQUFFO0FBQzlDLFFBQU0sVUFBVSxHQUFHLElBQWEsWUFBWSxLQUFLO0FBQ2pELE1BQUksQ0FBQyxTQUFTO0FBQ1osV0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsTUFBTSxFQUFFLE9BQU8sa0JBQWtCO0FBQUEsSUFDbkM7QUFBQSxFQUNGO0FBRUEsU0FBTyxLQUFLLHdCQUF3QixFQUFFLE9BQU8sUUFBUSxRQUFRLE9BQU8sQ0FBQztBQUdyRSxRQUFNLFVBQVUsR0FBRyxJQUFpQixpQkFBaUIsUUFBUSxNQUFNO0FBQ25FLFFBQU0sYUFBYSxTQUFTLFVBQVUsQ0FBQztBQUl2QyxRQUFNLE1BQU07QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxJQUNULFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU9iLGNBQWM7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxVQUFVO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsVUFBVSxzQ0FBc0MsS0FBSztBQUFBLElBQ3JELFVBQVUsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLElBQUksS0FBUSxFQUFFLFlBQVk7QUFBQSxFQUM1RDtBQUdBLFNBQU8sS0FBSyxzQ0FBc0MsRUFBRSxPQUFPLGlCQUFpQixXQUFXLE9BQU8sQ0FBQztBQUUvRixRQUFNLG9CQUFvQixDQUFDLFVBQVUsY0FBYyxTQUFTLFdBQVcsT0FBTyxZQUFZO0FBQzFGLFFBQU0saUJBQWlCLFdBQVc7QUFBQSxJQUFPLENBQUMsTUFDeEMsa0JBQWtCLEtBQUssUUFBTSxHQUFHLFlBQVksTUFBTSxFQUFFLFlBQVksQ0FBQztBQUFBLEVBQ25FO0FBQ0EsUUFBTSxnQkFBZ0Isa0JBQWtCO0FBQUEsSUFBTyxRQUM3QyxDQUFDLFdBQVcsS0FBSyxDQUFDLE1BQWMsRUFBRSxZQUFZLE1BQU0sR0FBRyxZQUFZLENBQUM7QUFBQSxFQUN0RTtBQUdBLFFBQU0sYUFBYSxNQUFNO0FBQUEsSUFDdkIsSUFBSTtBQUFBLElBQ0o7QUFBQSxJQUNBLFNBQVMsbUJBQW1CO0FBQUEsRUFDOUI7QUFFQSxRQUFNLGFBQWEsV0FBVztBQUU5QixNQUFJO0FBQ0osTUFBSSxXQUFXLFFBQVEsU0FBUyxHQUFHO0FBQ2pDLHFCQUFpQixXQUFXLFFBQVEsS0FBSyxHQUFHO0FBQUEsRUFDOUMsV0FBVyxjQUFjLElBQUk7QUFDM0IscUJBQWlCO0FBQUEsRUFDbkIsV0FBVyxjQUFjLElBQUk7QUFDM0IscUJBQWlCO0FBQUEsRUFDbkIsV0FBVyxjQUFjLElBQUk7QUFDM0IscUJBQWlCO0FBQUEsRUFDbkIsT0FBTztBQUNMLHFCQUFpQjtBQUFBLEVBQ25CO0FBRUEsU0FBTyxLQUFLLHdCQUF3QixFQUFFLFlBQVksY0FBYyxXQUFXLFFBQVEsT0FBTyxDQUFDO0FBRTNGLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLE1BQU07QUFBQSxNQUNKO0FBQUEsTUFDQSxlQUFlO0FBQUEsUUFDYixPQUFPO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
