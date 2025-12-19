import { z } from "zod";
import { db } from "../utils/db.js";
const config = {
  name: "GetProfileAPI",
  type: "api",
  path: "/profile",
  method: "GET",
  description: "Get user profile with parsed resume data",
  emits: [],
  flows: ["profile-flow"],
  responseSchema: {
    200: z.object({
      profile: z.object({
        userId: z.string(),
        name: z.string().optional(),
        email: z.string().optional(),
        skills: z.array(z.string()),
        experienceYears: z.number(),
        preferredRoles: z.array(z.string()),
        education: z.array(z.string()),
        resumeId: z.string().optional()
      })
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
  logger.info("Fetching user profile", { userId: session.userId });
  const profile = db.get("user_profiles", session.userId);
  const user = db.get("users", session.email);
  return {
    status: 200,
    body: {
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
    }
  };
};
export {
  config,
  handler
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vc3JjL3Byb2ZpbGUvZ2V0LXByb2ZpbGUtYXBpLnN0ZXAudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB0eXBlIHsgQXBpUm91dGVDb25maWcsIEhhbmRsZXJzIH0gZnJvbSAnbW90aWEnO1xyXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuaW1wb3J0IHsgZGIgfSBmcm9tICcuLi91dGlscy9kYic7XHJcblxyXG5pbnRlcmZhY2UgU2Vzc2lvbiB7XHJcbiAgdXNlcklkOiBzdHJpbmc7XHJcbiAgZW1haWw6IHN0cmluZztcclxuICBjcmVhdGVkQXQ6IHN0cmluZztcclxuICBleHBpcmVzQXQ6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIFVzZXIge1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgZW1haWw6IHN0cmluZztcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgcGFzc3dvcmRIYXNoOiBzdHJpbmc7XHJcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XHJcbiAgcHJvZmlsZT86IGFueTtcclxufVxyXG5cclxuaW50ZXJmYWNlIFVzZXJQcm9maWxlIHtcclxuICB1c2VySWQ6IHN0cmluZztcclxuICBza2lsbHM6IHN0cmluZ1tdO1xyXG4gIGV4cGVyaWVuY2VZZWFyczogbnVtYmVyO1xyXG4gIHByZWZlcnJlZFJvbGVzOiBzdHJpbmdbXTtcclxuICBlZHVjYXRpb246IHN0cmluZ1tdO1xyXG4gIHJlc3VtZUlkPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29uZmlnOiBBcGlSb3V0ZUNvbmZpZyA9IHtcclxuICBuYW1lOiAnR2V0UHJvZmlsZUFQSScsXHJcbiAgdHlwZTogJ2FwaScsXHJcbiAgcGF0aDogJy9wcm9maWxlJyxcclxuICBtZXRob2Q6ICdHRVQnLFxyXG4gIGRlc2NyaXB0aW9uOiAnR2V0IHVzZXIgcHJvZmlsZSB3aXRoIHBhcnNlZCByZXN1bWUgZGF0YScsXHJcbiAgZW1pdHM6IFtdLFxyXG4gIGZsb3dzOiBbJ3Byb2ZpbGUtZmxvdyddLFxyXG4gIHJlc3BvbnNlU2NoZW1hOiB7XHJcbiAgICAyMDA6IHoub2JqZWN0KHtcclxuICAgICAgcHJvZmlsZTogei5vYmplY3Qoe1xyXG4gICAgICAgIHVzZXJJZDogei5zdHJpbmcoKSxcclxuICAgICAgICBuYW1lOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXHJcbiAgICAgICAgZW1haWw6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcclxuICAgICAgICBza2lsbHM6IHouYXJyYXkoei5zdHJpbmcoKSksXHJcbiAgICAgICAgZXhwZXJpZW5jZVllYXJzOiB6Lm51bWJlcigpLFxyXG4gICAgICAgIHByZWZlcnJlZFJvbGVzOiB6LmFycmF5KHouc3RyaW5nKCkpLFxyXG4gICAgICAgIGVkdWNhdGlvbjogei5hcnJheSh6LnN0cmluZygpKSxcclxuICAgICAgICByZXN1bWVJZDogei5zdHJpbmcoKS5vcHRpb25hbCgpXHJcbiAgICAgIH0pXHJcbiAgICB9KSxcclxuICAgIDQwMTogei5vYmplY3Qoe1xyXG4gICAgICBlcnJvcjogei5zdHJpbmcoKVxyXG4gICAgfSlcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlcjogSGFuZGxlcnNbJ0dldFByb2ZpbGVBUEknXSA9IGFzeW5jIChyZXEsIHsgbG9nZ2VyIH0pID0+IHtcclxuICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbjtcclxuICBpZiAoIWF1dGhIZWFkZXIpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1czogNDAxLFxyXG4gICAgICBib2R5OiB7IGVycm9yOiAnQXV0aG9yaXphdGlvbiByZXF1aXJlZCcgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyLnJlcGxhY2UoJ0JlYXJlciAnLCAnJyk7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGRiLmdldDxTZXNzaW9uPignc2Vzc2lvbnMnLCB0b2tlbik7XHJcbiAgaWYgKCFzZXNzaW9uKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXM6IDQwMSxcclxuICAgICAgYm9keTogeyBlcnJvcjogJ0ludmFsaWQgc2Vzc2lvbicgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgbG9nZ2VyLmluZm8oJ0ZldGNoaW5nIHVzZXIgcHJvZmlsZScsIHsgdXNlcklkOiBzZXNzaW9uLnVzZXJJZCB9KTtcclxuICBcclxuICBjb25zdCBwcm9maWxlID0gZGIuZ2V0PFVzZXJQcm9maWxlPigndXNlcl9wcm9maWxlcycsIHNlc3Npb24udXNlcklkKTtcclxuICBjb25zdCB1c2VyID0gZGIuZ2V0PFVzZXI+KCd1c2VycycsIHNlc3Npb24uZW1haWwpO1xyXG4gIFxyXG4gIHJldHVybiB7XHJcbiAgICBzdGF0dXM6IDIwMCxcclxuICAgIGJvZHk6IHtcclxuICAgICAgcHJvZmlsZToge1xyXG4gICAgICAgIHVzZXJJZDogc2Vzc2lvbi51c2VySWQsXHJcbiAgICAgICAgbmFtZTogdXNlcj8ubmFtZSxcclxuICAgICAgICBlbWFpbDogdXNlcj8uZW1haWwsXHJcbiAgICAgICAgc2tpbGxzOiBwcm9maWxlPy5za2lsbHMgfHwgW10sXHJcbiAgICAgICAgZXhwZXJpZW5jZVllYXJzOiBwcm9maWxlPy5leHBlcmllbmNlWWVhcnMgfHwgMCxcclxuICAgICAgICBwcmVmZXJyZWRSb2xlczogcHJvZmlsZT8ucHJlZmVycmVkUm9sZXMgfHwgW10sXHJcbiAgICAgICAgZWR1Y2F0aW9uOiBwcm9maWxlPy5lZHVjYXRpb24gfHwgW10sXHJcbiAgICAgICAgcmVzdW1lSWQ6IHByb2ZpbGU/LnJlc3VtZUlkXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiQUFDQSxTQUFTLFNBQVM7QUFDbEIsU0FBUyxVQUFVO0FBMkJaLE1BQU0sU0FBeUI7QUFBQSxFQUNwQyxNQUFNO0FBQUEsRUFDTixNQUFNO0FBQUEsRUFDTixNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsRUFDUixhQUFhO0FBQUEsRUFDYixPQUFPLENBQUM7QUFBQSxFQUNSLE9BQU8sQ0FBQyxjQUFjO0FBQUEsRUFDdEIsZ0JBQWdCO0FBQUEsSUFDZCxLQUFLLEVBQUUsT0FBTztBQUFBLE1BQ1osU0FBUyxFQUFFLE9BQU87QUFBQSxRQUNoQixRQUFRLEVBQUUsT0FBTztBQUFBLFFBQ2pCLE1BQU0sRUFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLFFBQzFCLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLFFBQzNCLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDO0FBQUEsUUFDMUIsaUJBQWlCLEVBQUUsT0FBTztBQUFBLFFBQzFCLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUM7QUFBQSxRQUNsQyxXQUFXLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztBQUFBLFFBQzdCLFVBQVUsRUFBRSxPQUFPLEVBQUUsU0FBUztBQUFBLE1BQ2hDLENBQUM7QUFBQSxJQUNILENBQUM7QUFBQSxJQUNELEtBQUssRUFBRSxPQUFPO0FBQUEsTUFDWixPQUFPLEVBQUUsT0FBTztBQUFBLElBQ2xCLENBQUM7QUFBQSxFQUNIO0FBQ0Y7QUFFTyxNQUFNLFVBQXFDLE9BQU8sS0FBSyxFQUFFLE9BQU8sTUFBTTtBQUMzRSxRQUFNLGFBQWEsSUFBSSxRQUFRO0FBQy9CLE1BQUksQ0FBQyxZQUFZO0FBQ2YsV0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsTUFBTSxFQUFFLE9BQU8seUJBQXlCO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBRUEsUUFBTSxRQUFRLFdBQVcsUUFBUSxXQUFXLEVBQUU7QUFDOUMsUUFBTSxVQUFVLEdBQUcsSUFBYSxZQUFZLEtBQUs7QUFDakQsTUFBSSxDQUFDLFNBQVM7QUFDWixXQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixNQUFNLEVBQUUsT0FBTyxrQkFBa0I7QUFBQSxJQUNuQztBQUFBLEVBQ0Y7QUFFQSxTQUFPLEtBQUsseUJBQXlCLEVBQUUsUUFBUSxRQUFRLE9BQU8sQ0FBQztBQUUvRCxRQUFNLFVBQVUsR0FBRyxJQUFpQixpQkFBaUIsUUFBUSxNQUFNO0FBQ25FLFFBQU0sT0FBTyxHQUFHLElBQVUsU0FBUyxRQUFRLEtBQUs7QUFFaEQsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsTUFBTTtBQUFBLE1BQ0osU0FBUztBQUFBLFFBQ1AsUUFBUSxRQUFRO0FBQUEsUUFDaEIsTUFBTSxNQUFNO0FBQUEsUUFDWixPQUFPLE1BQU07QUFBQSxRQUNiLFFBQVEsU0FBUyxVQUFVLENBQUM7QUFBQSxRQUM1QixpQkFBaUIsU0FBUyxtQkFBbUI7QUFBQSxRQUM3QyxnQkFBZ0IsU0FBUyxrQkFBa0IsQ0FBQztBQUFBLFFBQzVDLFdBQVcsU0FBUyxhQUFhLENBQUM7QUFBQSxRQUNsQyxVQUFVLFNBQVM7QUFBQSxNQUNyQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
