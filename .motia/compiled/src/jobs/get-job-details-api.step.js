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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vc3JjL2pvYnMvZ2V0LWpvYi1kZXRhaWxzLWFwaS5zdGVwLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7IEFwaVJvdXRlQ29uZmlnLCBIYW5kbGVycyB9IGZyb20gJ21vdGlhJztcclxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XHJcbmltcG9ydCB7IGRiIH0gZnJvbSAnLi4vdXRpbHMvZGInO1xyXG5pbXBvcnQgeyBhbmFseXplSm9iTWF0Y2ggfSBmcm9tICcuLi91dGlscy9nZW1pbmknO1xyXG5cclxuaW50ZXJmYWNlIFNlc3Npb24ge1xyXG4gIHVzZXJJZDogc3RyaW5nO1xyXG4gIGVtYWlsOiBzdHJpbmc7XHJcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XHJcbiAgZXhwaXJlc0F0OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBVc2VyUHJvZmlsZSB7XHJcbiAgdXNlcklkOiBzdHJpbmc7XHJcbiAgc2tpbGxzOiBzdHJpbmdbXTtcclxuICBleHBlcmllbmNlWWVhcnM6IG51bWJlcjtcclxuICBwcmVmZXJyZWRSb2xlczogc3RyaW5nW107XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWc6IEFwaVJvdXRlQ29uZmlnID0ge1xyXG4gIG5hbWU6ICdHZXRKb2JEZXRhaWxzQVBJJyxcclxuICB0eXBlOiAnYXBpJyxcclxuICBwYXRoOiAnL2pvYnMvOmpvYklkJyxcclxuICBtZXRob2Q6ICdHRVQnLFxyXG4gIGRlc2NyaXB0aW9uOiAnR2V0IGRldGFpbGVkIGpvYiBpbmZvcm1hdGlvbiB3aXRoIEFJIG1hdGNoIGFuYWx5c2lzJyxcclxuICBlbWl0czogW10sXHJcbiAgZmxvd3M6IFsnam9iLWRpc2NvdmVyeS1mbG93J10sXHJcbiAgcmVzcG9uc2VTY2hlbWE6IHtcclxuICAgIDIwMDogei5vYmplY3Qoe1xyXG4gICAgICBqb2I6IHoub2JqZWN0KHtcclxuICAgICAgICBpZDogei5zdHJpbmcoKSxcclxuICAgICAgICB0aXRsZTogei5zdHJpbmcoKSxcclxuICAgICAgICBjb21wYW55OiB6LnN0cmluZygpLFxyXG4gICAgICAgIGxvY2F0aW9uOiB6LnN0cmluZygpLFxyXG4gICAgICAgIHJlbW90ZTogei5ib29sZWFuKCksXHJcbiAgICAgICAgc2FsYXJ5OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXHJcbiAgICAgICAgZGVzY3JpcHRpb246IHouc3RyaW5nKCksXHJcbiAgICAgICAgcmVxdWlyZW1lbnRzOiB6LmFycmF5KHouc3RyaW5nKCkpLFxyXG4gICAgICAgIGJlbmVmaXRzOiB6LmFycmF5KHouc3RyaW5nKCkpLFxyXG4gICAgICAgIGFwcGx5VXJsOiB6LnN0cmluZygpLFxyXG4gICAgICAgIHBvc3RlZEF0OiB6LnN0cmluZygpXHJcbiAgICAgIH0pLFxyXG4gICAgICBtYXRjaEFuYWx5c2lzOiB6Lm9iamVjdCh7XHJcbiAgICAgICAgc2NvcmU6IHoubnVtYmVyKCksXHJcbiAgICAgICAgbWF0Y2hpbmdTa2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSksXHJcbiAgICAgICAgbWlzc2luZ1NraWxsczogei5hcnJheSh6LnN0cmluZygpKSxcclxuICAgICAgICByZWNvbW1lbmRhdGlvbjogei5zdHJpbmcoKVxyXG4gICAgICB9KVxyXG4gICAgfSksXHJcbiAgICA0MDQ6IHoub2JqZWN0KHtcclxuICAgICAgZXJyb3I6IHouc3RyaW5nKClcclxuICAgIH0pXHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXI6IEhhbmRsZXJzWydHZXRKb2JEZXRhaWxzQVBJJ10gPSBhc3luYyAocmVxLCB7IGxvZ2dlciB9KSA9PiB7XHJcbiAgY29uc3QgeyBqb2JJZCB9ID0gcmVxLnBhdGhQYXJhbXM7XHJcbiAgXHJcbiAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb247XHJcbiAgaWYgKCFhdXRoSGVhZGVyKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXM6IDQwNCxcclxuICAgICAgYm9keTogeyBlcnJvcjogJ0F1dGhvcml6YXRpb24gcmVxdWlyZWQnIH1cclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlci5yZXBsYWNlKCdCZWFyZXIgJywgJycpO1xyXG4gIGNvbnN0IHNlc3Npb24gPSBkYi5nZXQ8U2Vzc2lvbj4oJ3Nlc3Npb25zJywgdG9rZW4pO1xyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhdHVzOiA0MDQsXHJcbiAgICAgIGJvZHk6IHsgZXJyb3I6ICdJbnZhbGlkIHNlc3Npb24nIH1cclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIGxvZ2dlci5pbmZvKCdGZXRjaGluZyBqb2IgZGV0YWlscycsIHsgam9iSWQsIHVzZXJJZDogc2Vzc2lvbi51c2VySWQgfSk7XHJcbiAgXHJcbiAgLy8gR2V0IHVzZXIgcHJvZmlsZSBmb3IgbWF0Y2hpbmdcclxuICBjb25zdCBwcm9maWxlID0gZGIuZ2V0PFVzZXJQcm9maWxlPigndXNlcl9wcm9maWxlcycsIHNlc3Npb24udXNlcklkKTtcclxuICBjb25zdCB1c2VyU2tpbGxzID0gcHJvZmlsZT8uc2tpbGxzIHx8IFtdO1xyXG4gIFxyXG4gIC8vIEluIHByb2R1Y3Rpb24sIGZldGNoIGZyb20gZGF0YWJhc2VcclxuICAvLyBNb2NrIGpvYiBkYXRhIGZvciBkZW1vXHJcbiAgY29uc3Qgam9iID0ge1xyXG4gICAgaWQ6IGpvYklkLFxyXG4gICAgdGl0bGU6ICdTZW5pb3IgU29mdHdhcmUgRW5naW5lZXInLFxyXG4gICAgY29tcGFueTogJ1RlY2hDb3JwJyxcclxuICAgIGxvY2F0aW9uOiAnU2FuIEZyYW5jaXNjbywgQ0EnLFxyXG4gICAgcmVtb3RlOiB0cnVlLFxyXG4gICAgc2FsYXJ5OiAnJDE1MGsgLSAkMjAwaycsXHJcbiAgICBkZXNjcmlwdGlvbjogYFdlJ3JlIGxvb2tpbmcgZm9yIGEgU2VuaW9yIFNvZnR3YXJlIEVuZ2luZWVyIHRvIGpvaW4gb3VyIGdyb3dpbmcgdGVhbS4gWW91J2xsIGJlIHdvcmtpbmcgb24gY3V0dGluZy1lZGdlIHByb2plY3RzIHRoYXQgaW1wYWN0IG1pbGxpb25zIG9mIHVzZXJzLlxyXG5cclxuQXMgYSBTZW5pb3IgRW5naW5lZXIsIHlvdSdsbDpcclxuLSBEZXNpZ24gYW5kIGltcGxlbWVudCBzY2FsYWJsZSBiYWNrZW5kIHNlcnZpY2VzXHJcbi0gTWVudG9yIGp1bmlvciBlbmdpbmVlcnNcclxuLSBDb2xsYWJvcmF0ZSB3aXRoIHByb2R1Y3QgYW5kIGRlc2lnbiB0ZWFtc1xyXG4tIENvbnRyaWJ1dGUgdG8gYXJjaGl0ZWN0dXJhbCBkZWNpc2lvbnNgLFxyXG4gICAgcmVxdWlyZW1lbnRzOiBbXHJcbiAgICAgICc1KyB5ZWFycyBvZiBzb2Z0d2FyZSBkZXZlbG9wbWVudCBleHBlcmllbmNlJyxcclxuICAgICAgJ1N0cm9uZyBwcm9maWNpZW5jeSBpbiBQeXRob24gYW5kIEphdmFTY3JpcHQnLFxyXG4gICAgICAnRXhwZXJpZW5jZSB3aXRoIFJlYWN0IGFuZCBOb2RlLmpzJyxcclxuICAgICAgJ0ZhbWlsaWFyaXR5IHdpdGggQVdTIG9yIHNpbWlsYXIgY2xvdWQgcGxhdGZvcm1zJyxcclxuICAgICAgJ1N0cm9uZyBjb21tdW5pY2F0aW9uIHNraWxscycsXHJcbiAgICAgICdFeHBlcmllbmNlIHdpdGggUG9zdGdyZVNRTCBvciBzaW1pbGFyIGRhdGFiYXNlcydcclxuICAgIF0sXHJcbiAgICBiZW5lZml0czogW1xyXG4gICAgICAnQ29tcGV0aXRpdmUgc2FsYXJ5IGFuZCBlcXVpdHknLFxyXG4gICAgICAnSGVhbHRoLCBkZW50YWwsIGFuZCB2aXNpb24gaW5zdXJhbmNlJyxcclxuICAgICAgJ1VubGltaXRlZCBQVE8nLFxyXG4gICAgICAnUmVtb3RlLWZyaWVuZGx5IGN1bHR1cmUnLFxyXG4gICAgICAnNDAxKGspIG1hdGNoaW5nJyxcclxuICAgICAgJ1Byb2Zlc3Npb25hbCBkZXZlbG9wbWVudCBidWRnZXQnXHJcbiAgICBdLFxyXG4gICAgYXBwbHlVcmw6IGBodHRwczovL2NhcmVlcnMudGVjaGNvcnAuY29tL2FwcGx5LyR7am9iSWR9YCxcclxuICAgIHBvc3RlZEF0OiBuZXcgRGF0ZShEYXRlLm5vdygpIC0gMyAqIDg2NDAwMDAwKS50b0lTT1N0cmluZygpXHJcbiAgfTtcclxuICBcclxuICAvLyBBSSBNYXRjaCBBbmFseXNpcyB1c2luZyBHZW1pbmlcclxuICBsb2dnZXIuaW5mbygnQW5hbHl6aW5nIGpvYiBtYXRjaCB3aXRoIEdlbWluaSBBSScsIHsgam9iSWQsIHVzZXJTa2lsbHNDb3VudDogdXNlclNraWxscy5sZW5ndGggfSk7XHJcbiAgXHJcbiAgY29uc3Qgam9iUmVxdWlyZWRTa2lsbHMgPSBbJ1B5dGhvbicsICdKYXZhU2NyaXB0JywgJ1JlYWN0JywgJ05vZGUuanMnLCAnQVdTJywgJ1Bvc3RncmVTUUwnXTtcclxuICBjb25zdCBtYXRjaGluZ1NraWxscyA9IHVzZXJTa2lsbHMuZmlsdGVyKChzOiBzdHJpbmcpID0+IFxyXG4gICAgam9iUmVxdWlyZWRTa2lsbHMuc29tZShqcyA9PiBqcy50b0xvd2VyQ2FzZSgpID09PSBzLnRvTG93ZXJDYXNlKCkpXHJcbiAgKTtcclxuICBjb25zdCBtaXNzaW5nU2tpbGxzID0gam9iUmVxdWlyZWRTa2lsbHMuZmlsdGVyKGpzID0+IFxyXG4gICAgIXVzZXJTa2lsbHMuc29tZSgoczogc3RyaW5nKSA9PiBzLnRvTG93ZXJDYXNlKCkgPT09IGpzLnRvTG93ZXJDYXNlKCkpXHJcbiAgKTtcclxuICBcclxuICAvLyBVc2UgR2VtaW5pIEFJIGZvciBkZWVwZXIgYW5hbHlzaXNcclxuICBjb25zdCBhaUFuYWx5c2lzID0gYXdhaXQgYW5hbHl6ZUpvYk1hdGNoKFxyXG4gICAgam9iLmRlc2NyaXB0aW9uLFxyXG4gICAgdXNlclNraWxscyxcclxuICAgIHByb2ZpbGU/LmV4cGVyaWVuY2VZZWFycyB8fCAwXHJcbiAgKTtcclxuICBcclxuICBjb25zdCBtYXRjaFNjb3JlID0gYWlBbmFseXNpcy5zY29yZTtcclxuICBcclxuICBsZXQgcmVjb21tZW5kYXRpb246IHN0cmluZztcclxuICBpZiAoYWlBbmFseXNpcy5yZWFzb25zLmxlbmd0aCA+IDApIHtcclxuICAgIHJlY29tbWVuZGF0aW9uID0gYWlBbmFseXNpcy5yZWFzb25zLmpvaW4oJyAnKTtcclxuICB9IGVsc2UgaWYgKG1hdGNoU2NvcmUgPj0gODApIHtcclxuICAgIHJlY29tbWVuZGF0aW9uID0gXCJFeGNlbGxlbnQgbWF0Y2ghIFlvdXIgc2tpbGxzIGFsaWduIHZlcnkgd2VsbCB3aXRoIHRoaXMgcG9zaXRpb24uIFdlIHJlY29tbWVuZCBhcHBseWluZy5cIjtcclxuICB9IGVsc2UgaWYgKG1hdGNoU2NvcmUgPj0gNjApIHtcclxuICAgIHJlY29tbWVuZGF0aW9uID0gXCJHb29kIG1hdGNoISBZb3UgaGF2ZSBtb3N0IG9mIHRoZSByZXF1aXJlZCBza2lsbHMuIENvbnNpZGVyIGhpZ2hsaWdodGluZyByZWxldmFudCBwcm9qZWN0cyBpbiB5b3VyIGFwcGxpY2F0aW9uLlwiO1xyXG4gIH0gZWxzZSBpZiAobWF0Y2hTY29yZSA+PSA0MCkge1xyXG4gICAgcmVjb21tZW5kYXRpb24gPSBcIk1vZGVyYXRlIG1hdGNoLiBGb2N1cyBvbiB0cmFuc2ZlcmFibGUgc2tpbGxzIGFuZCBjb25zaWRlciB1cHNraWxsaW5nIGluIHRoZSBtaXNzaW5nIGFyZWFzLlwiO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZWNvbW1lbmRhdGlvbiA9IFwiVGhpcyByb2xlIG1heSByZXF1aXJlIHNraWxscyBvdXRzaWRlIHlvdXIgY3VycmVudCBwcm9maWxlLiBDb25zaWRlciBpdCBhcyBhIHN0cmV0Y2ggb3Bwb3J0dW5pdHkuXCI7XHJcbiAgfVxyXG4gIFxyXG4gIGxvZ2dlci5pbmZvKCdBSSBhbmFseXNpcyBjb21wbGV0ZScsIHsgbWF0Y2hTY29yZSwgcmVhc29uc0NvdW50OiBhaUFuYWx5c2lzLnJlYXNvbnMubGVuZ3RoIH0pO1xyXG4gIFxyXG4gIHJldHVybiB7XHJcbiAgICBzdGF0dXM6IDIwMCxcclxuICAgIGJvZHk6IHtcclxuICAgICAgam9iLFxyXG4gICAgICBtYXRjaEFuYWx5c2lzOiB7XHJcbiAgICAgICAgc2NvcmU6IG1hdGNoU2NvcmUsXHJcbiAgICAgICAgbWF0Y2hpbmdTa2lsbHMsXHJcbiAgICAgICAgbWlzc2luZ1NraWxscyxcclxuICAgICAgICByZWNvbW1lbmRhdGlvblxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIkFBQ0EsU0FBUyxTQUFTO0FBQ2xCLFNBQVMsVUFBVTtBQUNuQixTQUFTLHVCQUF1QjtBQWdCekIsTUFBTSxTQUF5QjtBQUFBLEVBQ3BDLE1BQU07QUFBQSxFQUNOLE1BQU07QUFBQSxFQUNOLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxFQUNSLGFBQWE7QUFBQSxFQUNiLE9BQU8sQ0FBQztBQUFBLEVBQ1IsT0FBTyxDQUFDLG9CQUFvQjtBQUFBLEVBQzVCLGdCQUFnQjtBQUFBLElBQ2QsS0FBSyxFQUFFLE9BQU87QUFBQSxNQUNaLEtBQUssRUFBRSxPQUFPO0FBQUEsUUFDWixJQUFJLEVBQUUsT0FBTztBQUFBLFFBQ2IsT0FBTyxFQUFFLE9BQU87QUFBQSxRQUNoQixTQUFTLEVBQUUsT0FBTztBQUFBLFFBQ2xCLFVBQVUsRUFBRSxPQUFPO0FBQUEsUUFDbkIsUUFBUSxFQUFFLFFBQVE7QUFBQSxRQUNsQixRQUFRLEVBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxRQUM1QixhQUFhLEVBQUUsT0FBTztBQUFBLFFBQ3RCLGNBQWMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDO0FBQUEsUUFDaEMsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUM7QUFBQSxRQUM1QixVQUFVLEVBQUUsT0FBTztBQUFBLFFBQ25CLFVBQVUsRUFBRSxPQUFPO0FBQUEsTUFDckIsQ0FBQztBQUFBLE1BQ0QsZUFBZSxFQUFFLE9BQU87QUFBQSxRQUN0QixPQUFPLEVBQUUsT0FBTztBQUFBLFFBQ2hCLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUM7QUFBQSxRQUNsQyxlQUFlLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztBQUFBLFFBQ2pDLGdCQUFnQixFQUFFLE9BQU87QUFBQSxNQUMzQixDQUFDO0FBQUEsSUFDSCxDQUFDO0FBQUEsSUFDRCxLQUFLLEVBQUUsT0FBTztBQUFBLE1BQ1osT0FBTyxFQUFFLE9BQU87QUFBQSxJQUNsQixDQUFDO0FBQUEsRUFDSDtBQUNGO0FBRU8sTUFBTSxVQUF3QyxPQUFPLEtBQUssRUFBRSxPQUFPLE1BQU07QUFDOUUsUUFBTSxFQUFFLE1BQU0sSUFBSSxJQUFJO0FBRXRCLFFBQU0sYUFBYSxJQUFJLFFBQVE7QUFDL0IsTUFBSSxDQUFDLFlBQVk7QUFDZixXQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixNQUFNLEVBQUUsT0FBTyx5QkFBeUI7QUFBQSxJQUMxQztBQUFBLEVBQ0Y7QUFFQSxRQUFNLFFBQVEsV0FBVyxRQUFRLFdBQVcsRUFBRTtBQUM5QyxRQUFNLFVBQVUsR0FBRyxJQUFhLFlBQVksS0FBSztBQUNqRCxNQUFJLENBQUMsU0FBUztBQUNaLFdBQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLE1BQU0sRUFBRSxPQUFPLGtCQUFrQjtBQUFBLElBQ25DO0FBQUEsRUFDRjtBQUVBLFNBQU8sS0FBSyx3QkFBd0IsRUFBRSxPQUFPLFFBQVEsUUFBUSxPQUFPLENBQUM7QUFHckUsUUFBTSxVQUFVLEdBQUcsSUFBaUIsaUJBQWlCLFFBQVEsTUFBTTtBQUNuRSxRQUFNLGFBQWEsU0FBUyxVQUFVLENBQUM7QUFJdkMsUUFBTSxNQUFNO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFPYixjQUFjO0FBQUEsTUFDWjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsVUFBVTtBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLFVBQVUsc0NBQXNDLEtBQUs7QUFBQSxJQUNyRCxVQUFVLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQVEsRUFBRSxZQUFZO0FBQUEsRUFDNUQ7QUFHQSxTQUFPLEtBQUssc0NBQXNDLEVBQUUsT0FBTyxpQkFBaUIsV0FBVyxPQUFPLENBQUM7QUFFL0YsUUFBTSxvQkFBb0IsQ0FBQyxVQUFVLGNBQWMsU0FBUyxXQUFXLE9BQU8sWUFBWTtBQUMxRixRQUFNLGlCQUFpQixXQUFXO0FBQUEsSUFBTyxDQUFDLE1BQ3hDLGtCQUFrQixLQUFLLFFBQU0sR0FBRyxZQUFZLE1BQU0sRUFBRSxZQUFZLENBQUM7QUFBQSxFQUNuRTtBQUNBLFFBQU0sZ0JBQWdCLGtCQUFrQjtBQUFBLElBQU8sUUFDN0MsQ0FBQyxXQUFXLEtBQUssQ0FBQyxNQUFjLEVBQUUsWUFBWSxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBQUEsRUFDdEU7QUFHQSxRQUFNLGFBQWEsTUFBTTtBQUFBLElBQ3ZCLElBQUk7QUFBQSxJQUNKO0FBQUEsSUFDQSxTQUFTLG1CQUFtQjtBQUFBLEVBQzlCO0FBRUEsUUFBTSxhQUFhLFdBQVc7QUFFOUIsTUFBSTtBQUNKLE1BQUksV0FBVyxRQUFRLFNBQVMsR0FBRztBQUNqQyxxQkFBaUIsV0FBVyxRQUFRLEtBQUssR0FBRztBQUFBLEVBQzlDLFdBQVcsY0FBYyxJQUFJO0FBQzNCLHFCQUFpQjtBQUFBLEVBQ25CLFdBQVcsY0FBYyxJQUFJO0FBQzNCLHFCQUFpQjtBQUFBLEVBQ25CLFdBQVcsY0FBYyxJQUFJO0FBQzNCLHFCQUFpQjtBQUFBLEVBQ25CLE9BQU87QUFDTCxxQkFBaUI7QUFBQSxFQUNuQjtBQUVBLFNBQU8sS0FBSyx3QkFBd0IsRUFBRSxZQUFZLGNBQWMsV0FBVyxRQUFRLE9BQU8sQ0FBQztBQUUzRixTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixNQUFNO0FBQUEsTUFDSjtBQUFBLE1BQ0EsZUFBZTtBQUFBLFFBQ2IsT0FBTztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
