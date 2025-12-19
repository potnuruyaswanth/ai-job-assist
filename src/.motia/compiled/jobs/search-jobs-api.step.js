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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vam9icy9zZWFyY2gtam9icy1hcGkuc3RlcC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHR5cGUgeyBBcGlSb3V0ZUNvbmZpZywgSGFuZGxlcnMgfSBmcm9tICdtb3RpYSc7XHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5pbXBvcnQgeyBkYiB9IGZyb20gJy4uL3V0aWxzL2RiJztcclxuaW1wb3J0IHsgYW5hbHl6ZUpvYk1hdGNoIH0gZnJvbSAnLi4vdXRpbHMvZ2VtaW5pJztcclxuXHJcbmludGVyZmFjZSBTZXNzaW9uIHtcclxuICB1c2VySWQ6IHN0cmluZztcclxuICBlbWFpbDogc3RyaW5nO1xyXG4gIGNyZWF0ZWRBdDogc3RyaW5nO1xyXG4gIGV4cGlyZXNBdDogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgVXNlclByb2ZpbGUge1xyXG4gIHVzZXJJZDogc3RyaW5nO1xyXG4gIHNraWxsczogc3RyaW5nW107XHJcbiAgZXhwZXJpZW5jZVllYXJzOiBudW1iZXI7XHJcbiAgcHJlZmVycmVkUm9sZXM6IHN0cmluZ1tdO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29uZmlnOiBBcGlSb3V0ZUNvbmZpZyA9IHtcclxuICBuYW1lOiAnU2VhcmNoSm9ic0FQSScsXHJcbiAgdHlwZTogJ2FwaScsXHJcbiAgcGF0aDogJy9qb2JzL3NlYXJjaCcsXHJcbiAgbWV0aG9kOiAnR0VUJyxcclxuICBkZXNjcmlwdGlvbjogJ1NlYXJjaCBmb3Igam9icyB3aXRoIGZpbHRlcnMnLFxyXG4gIGVtaXRzOiBbXSxcclxuICBmbG93czogWydqb2ItZGlzY292ZXJ5LWZsb3cnXSxcclxuICByZXNwb25zZVNjaGVtYToge1xyXG4gICAgMjAwOiB6Lm9iamVjdCh7XHJcbiAgICAgIGpvYnM6IHouYXJyYXkoei5vYmplY3Qoe1xyXG4gICAgICAgIGlkOiB6LnN0cmluZygpLFxyXG4gICAgICAgIHRpdGxlOiB6LnN0cmluZygpLFxyXG4gICAgICAgIGNvbXBhbnk6IHouc3RyaW5nKCksXHJcbiAgICAgICAgbG9jYXRpb246IHouc3RyaW5nKCksXHJcbiAgICAgICAgcmVtb3RlOiB6LmJvb2xlYW4oKSxcclxuICAgICAgICBzYWxhcnk6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcclxuICAgICAgICBkZXNjcmlwdGlvbjogei5zdHJpbmcoKSxcclxuICAgICAgICBhcHBseVVybDogei5zdHJpbmcoKSxcclxuICAgICAgICBwb3N0ZWRBdDogei5zdHJpbmcoKSxcclxuICAgICAgICBtYXRjaFNjb3JlOiB6Lm51bWJlcigpLm9wdGlvbmFsKClcclxuICAgICAgfSkpLFxyXG4gICAgICB0b3RhbDogei5udW1iZXIoKSxcclxuICAgICAgcGFnZTogei5udW1iZXIoKSxcclxuICAgICAgdG90YWxQYWdlczogei5udW1iZXIoKVxyXG4gICAgfSksXHJcbiAgICA0MDE6IHoub2JqZWN0KHtcclxuICAgICAgZXJyb3I6IHouc3RyaW5nKClcclxuICAgIH0pXHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXI6IEhhbmRsZXJzWydTZWFyY2hKb2JzQVBJJ10gPSBhc3luYyAocmVxLCB7IGxvZ2dlciB9KSA9PiB7XHJcbiAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb247XHJcbiAgaWYgKCFhdXRoSGVhZGVyKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXM6IDQwMSxcclxuICAgICAgYm9keTogeyBlcnJvcjogJ0F1dGhvcml6YXRpb24gcmVxdWlyZWQnIH1cclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlci5yZXBsYWNlKCdCZWFyZXIgJywgJycpO1xyXG4gIGNvbnN0IHNlc3Npb24gPSBkYi5nZXQ8U2Vzc2lvbj4oJ3Nlc3Npb25zJywgdG9rZW4pO1xyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhdHVzOiA0MDEsXHJcbiAgICAgIGJvZHk6IHsgZXJyb3I6ICdJbnZhbGlkIHNlc3Npb24nIH1cclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIGNvbnN0IHsgcXVlcnksIGxvY2F0aW9uLCByZW1vdGUsIG1pblNhbGFyeSwgbWF4U2FsYXJ5LCBwYWdlID0gJzEnLCBsaW1pdCA9ICcyMCcgfSA9IHJlcS5xdWVyeVBhcmFtcztcclxuICBjb25zdCBwYWdlTnVtID0gcGFyc2VJbnQocGFnZSk7XHJcbiAgY29uc3QgbGltaXROdW0gPSBwYXJzZUludChsaW1pdCk7XHJcbiAgXHJcbiAgbG9nZ2VyLmluZm8oJ1NlYXJjaGluZyBqb2JzJywgeyBxdWVyeSwgbG9jYXRpb24sIHJlbW90ZSwgdXNlcklkOiBzZXNzaW9uLnVzZXJJZCB9KTtcclxuICBcclxuICAvLyBHZXQgdXNlciBwcm9maWxlIGZvciBtYXRjaGluZ1xyXG4gIGNvbnN0IHByb2ZpbGUgPSBkYi5nZXQ8VXNlclByb2ZpbGU+KCd1c2VyX3Byb2ZpbGVzJywgc2Vzc2lvbi51c2VySWQpO1xyXG4gIFxyXG4gIC8vIEluIHByb2R1Y3Rpb24sIHRoaXMgd291bGQgcXVlcnkgYSBkYXRhYmFzZSBvciBleHRlcm5hbCBqb2IgQVBJc1xyXG4gIC8vIEZvciBkZW1vLCByZXR1cm4gbW9jayBqb2JzIHdpdGggQUktcG93ZXJlZCBzY29yaW5nXHJcbiAgY29uc3QgbW9ja0pvYnMgPSBhd2FpdCBnZW5lcmF0ZU1vY2tKb2JzKHF1ZXJ5LCBsb2NhdGlvbiwgcmVtb3RlID09PSAndHJ1ZScsIHByb2ZpbGUpO1xyXG4gIFxyXG4gIC8vIFBhZ2luYXRlIHJlc3VsdHNcclxuICBjb25zdCBzdGFydEluZGV4ID0gKHBhZ2VOdW0gLSAxKSAqIGxpbWl0TnVtO1xyXG4gIGNvbnN0IHBhZ2luYXRlZEpvYnMgPSBtb2NrSm9icy5zbGljZShzdGFydEluZGV4LCBzdGFydEluZGV4ICsgbGltaXROdW0pO1xyXG4gIFxyXG4gIHJldHVybiB7XHJcbiAgICBzdGF0dXM6IDIwMCxcclxuICAgIGJvZHk6IHtcclxuICAgICAgam9iczogcGFnaW5hdGVkSm9icyxcclxuICAgICAgdG90YWw6IG1vY2tKb2JzLmxlbmd0aCxcclxuICAgICAgcGFnZTogcGFnZU51bSxcclxuICAgICAgdG90YWxQYWdlczogTWF0aC5jZWlsKG1vY2tKb2JzLmxlbmd0aCAvIGxpbWl0TnVtKVxyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcblxyXG4vLyBBSS1wb3dlcmVkIGpvYiBnZW5lcmF0b3Igd2l0aCBHZW1pbmkgc2NvcmluZ1xyXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZU1vY2tKb2JzKHF1ZXJ5Pzogc3RyaW5nLCBsb2NhdGlvbj86IHN0cmluZywgcmVtb3RlPzogYm9vbGVhbiwgcHJvZmlsZT86IFVzZXJQcm9maWxlIHwgbnVsbCkge1xyXG4gIGNvbnN0IGNvbXBhbmllcyA9IFsnVGVjaENvcnAnLCAnU3RhcnR1cEFJJywgJ0Nsb3VkU29sdXRpb25zJywgJ0RhdGFEcml2ZW4gSW5jJywgJ0lubm92YXRlVGVjaCcsICdGdXR1cmVMYWJzJ107XHJcbiAgY29uc3QgdGl0bGVzID0gW1xyXG4gICAgJ1NlbmlvciBTb2Z0d2FyZSBFbmdpbmVlcicsICdGdWxsIFN0YWNrIERldmVsb3BlcicsICdCYWNrZW5kIEVuZ2luZWVyJyxcclxuICAgICdGcm9udGVuZCBEZXZlbG9wZXInLCAnRGV2T3BzIEVuZ2luZWVyJywgJ0RhdGEgU2NpZW50aXN0JyxcclxuICAgICdNYWNoaW5lIExlYXJuaW5nIEVuZ2luZWVyJywgJ1Byb2R1Y3QgTWFuYWdlcicsICdFbmdpbmVlcmluZyBNYW5hZ2VyJ1xyXG4gIF07XHJcbiAgY29uc3QgbG9jYXRpb25zID0gWydTYW4gRnJhbmNpc2NvLCBDQScsICdOZXcgWW9yaywgTlknLCAnU2VhdHRsZSwgV0EnLCAnQXVzdGluLCBUWCcsICdSZW1vdGUnXTtcclxuICBcclxuICBjb25zdCB1c2VyU2tpbGxzID0gcHJvZmlsZT8uc2tpbGxzIHx8IFtdO1xyXG4gIGNvbnN0IHVzZXJFeHBlcmllbmNlID0gcHJvZmlsZT8uZXhwZXJpZW5jZVllYXJzIHx8IDA7XHJcbiAgXHJcbiAgY29uc3Qgam9icyA9IGF3YWl0IFByb21pc2UuYWxsKHRpdGxlcy5zbGljZSgwLCA2KS5tYXAoYXN5bmMgKHRpdGxlLCBpbmRleCkgPT4ge1xyXG4gICAgY29uc3Qgam9iU2tpbGxzID0gWydQeXRob24nLCAnSmF2YVNjcmlwdCcsICdSZWFjdCcsICdOb2RlLmpzJywgJ0FXUycsICdQb3N0Z3JlU1FMJ107XHJcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGBXZSdyZSBsb29raW5nIGZvciBhICR7dGl0bGV9IHRvIGpvaW4gb3VyIHRlYW0uIFlvdSdsbCB3b3JrIG9uIGV4Y2l0aW5nIHByb2plY3RzIHVzaW5nIG1vZGVybiB0ZWNobm9sb2dpZXMuIFJlcXVpcmVtZW50cyBpbmNsdWRlIGV4cGVyaWVuY2Ugd2l0aCAke2pvYlNraWxscy5zbGljZSgwLCAzKS5qb2luKCcsICcpfS5gO1xyXG4gICAgXHJcbiAgICAvLyBVc2UgR2VtaW5pIEFJIGZvciBtYXRjaCBzY29yaW5nXHJcbiAgICBsZXQgbWF0Y2hTY29yZSA9IDcwICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApO1xyXG4gICAgaWYgKHVzZXJTa2lsbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGFuYWx5c2lzID0gYXdhaXQgYW5hbHl6ZUpvYk1hdGNoKGRlc2NyaXB0aW9uLCB1c2VyU2tpbGxzLCB1c2VyRXhwZXJpZW5jZSk7XHJcbiAgICAgICAgbWF0Y2hTY29yZSA9IGFuYWx5c2lzLnNjb3JlO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIC8vIEZhbGxiYWNrIHRvIGJhc2ljIHNjb3JpbmcgaWYgQUkgZmFpbHNcclxuICAgICAgICBjb25zdCBtYXRjaGluZ1NraWxscyA9IHVzZXJTa2lsbHMuZmlsdGVyKChzOiBzdHJpbmcpID0+IFxyXG4gICAgICAgICAgam9iU2tpbGxzLnNvbWUoanMgPT4ganMudG9Mb3dlckNhc2UoKSA9PT0gcy50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgbWF0Y2hTY29yZSA9IE1hdGgucm91bmQoKG1hdGNoaW5nU2tpbGxzLmxlbmd0aCAvIE1hdGgubWF4KHVzZXJTa2lsbHMubGVuZ3RoLCAxKSkgKiAxMDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlkOiBgam9iXyR7RGF0ZS5ub3coKX1fJHtpbmRleH1gLFxyXG4gICAgICB0aXRsZTogcXVlcnkgPyBgJHt0aXRsZX0gLSAke3F1ZXJ5fWAgOiB0aXRsZSxcclxuICAgICAgY29tcGFueTogY29tcGFuaWVzW2luZGV4ICUgY29tcGFuaWVzLmxlbmd0aF0sXHJcbiAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbiB8fCBsb2NhdGlvbnNbaW5kZXggJSBsb2NhdGlvbnMubGVuZ3RoXSxcclxuICAgICAgcmVtb3RlOiByZW1vdGUgPz8gaW5kZXggJSAyID09PSAwLFxyXG4gICAgICBzYWxhcnk6IGAkJHsxMDAgKyBpbmRleCAqIDIwfWsgLSAkJHsxNTAgKyBpbmRleCAqIDIwfWtgLFxyXG4gICAgICBkZXNjcmlwdGlvbixcclxuICAgICAgYXBwbHlVcmw6IGBodHRwczovL2NhcmVlcnMuZXhhbXBsZS5jb20vam9iLyR7aW5kZXh9YCxcclxuICAgICAgcG9zdGVkQXQ6IG5ldyBEYXRlKERhdGUubm93KCkgLSBpbmRleCAqIDg2NDAwMDAwKS50b0lTT1N0cmluZygpLFxyXG4gICAgICBtYXRjaFNjb3JlXHJcbiAgICB9O1xyXG4gIH0pKTtcclxuICBcclxuICByZXR1cm4gam9icy5maWx0ZXIoam9iID0+ICFwcm9maWxlIHx8IGpvYi5tYXRjaFNjb3JlID49IDUwKTtcclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiQUFDQSxTQUFTLFNBQVM7QUFDbEIsU0FBUyxVQUFVO0FBQ25CLFNBQVMsdUJBQXVCO0FB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YyxRQUFRO0FBRTdGLFFBQU0sYUFBYSxTQUFTLFVBQVUsQ0FBQztBQUN2QyxRQUFNLGlCQUFpQixTQUFTLG1CQUFtQjtBQUVuRCxRQUFNLE9BQU8sTUFBTSxRQUFRLElBQUksT0FBTyxNQUFNLEdBQUcsQ0FBQyxFQUFFLElBQUksT0FBTyxPQUFPLFVBQVU7QUFDNUUsVUFBTSxZQUFZLENBQUMsVUFBVSxjQUFjLFNBQVMsV0FBVyxPQUFPLFlBQVk7QUFDbEYsVUFBTSxjQUFjLHVCQUF1QixLQUFLLHVIQUF1SCxVQUFVLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUM7QUFHdk0sUUFBSSxhQUFhLEtBQUssS0FBSyxNQUFNLEtBQUssT0FBTyxJQUFJLEVBQUU7QUFDbkQsUUFBSSxXQUFXLFNBQVMsR0FBRztBQUN6QixVQUFJO0FBQ0YsY0FBTSxXQUFXLE1BQU0sZ0JBQWdCLGFBQWEsWUFBWSxjQUFjO0FBQzlFLHFCQUFhLFNBQVM7QUFBQSxNQUN4QixTQUFTLE9BQU87QUFFZCxjQUFNLGlCQUFpQixXQUFXO0FBQUEsVUFBTyxDQUFDLE1BQ3hDLFVBQVUsS0FBSyxRQUFNLEdBQUcsWUFBWSxNQUFNLEVBQUUsWUFBWSxDQUFDO0FBQUEsUUFDM0Q7QUFDQSxxQkFBYSxLQUFLLE1BQU8sZUFBZSxTQUFTLEtBQUssSUFBSSxXQUFXLFFBQVEsQ0FBQyxJQUFLLEdBQUc7QUFBQSxNQUN4RjtBQUFBLElBQ0Y7QUFFQSxXQUFPO0FBQUEsTUFDTCxJQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLO0FBQUEsTUFDOUIsT0FBTyxRQUFRLEdBQUcsS0FBSyxNQUFNLEtBQUssS0FBSztBQUFBLE1BQ3ZDLFNBQVMsVUFBVSxRQUFRLFVBQVUsTUFBTTtBQUFBLE1BQzNDLFVBQVUsWUFBWSxVQUFVLFFBQVEsVUFBVSxNQUFNO0FBQUEsTUFDeEQsUUFBUSxVQUFVLFFBQVEsTUFBTTtBQUFBLE1BQ2hDLFFBQVEsSUFBSSxNQUFNLFFBQVEsRUFBRSxRQUFRLE1BQU0sUUFBUSxFQUFFO0FBQUEsTUFDcEQ7QUFBQSxNQUNBLFVBQVUsbUNBQW1DLEtBQUs7QUFBQSxNQUNsRCxVQUFVLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxRQUFRLEtBQVEsRUFBRSxZQUFZO0FBQUEsTUFDOUQ7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDLENBQUM7QUFFRixTQUFPLEtBQUssT0FBTyxTQUFPLENBQUMsV0FBVyxJQUFJLGNBQWMsRUFBRTtBQUM1RDsiLAogICJuYW1lcyI6IFtdCn0K
