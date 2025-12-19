import { z } from "zod";
import { db } from "../utils/db.js";
const config = {
  name: "GetApplicationsAPI",
  type: "api",
  path: "/applications",
  method: "GET",
  description: "Get user job applications with status tracking",
  emits: [],
  flows: ["job-application-flow"],
  responseSchema: {
    200: z.object({
      applications: z.array(z.object({
        id: z.string(),
        jobId: z.string(),
        jobTitle: z.string(),
        company: z.string(),
        status: z.string(),
        appliedAt: z.string().optional(),
        interviewDate: z.string().optional(),
        notes: z.string().optional(),
        createdAt: z.string()
      })),
      stats: z.object({
        total: z.number(),
        applied: z.number(),
        interview: z.number(),
        offer: z.number(),
        rejected: z.number()
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
  const { status: filterStatus } = req.queryParams;
  logger.info("Fetching applications", { userId: session.userId, filterStatus });
  const userApplications = db.get("user_applications_index", session.userId);
  const applicationIds = userApplications?.applicationIds || [];
  const applications = [];
  for (const appId of applicationIds) {
    const app = db.get("applications", appId);
    if (app && (!filterStatus || app.status === filterStatus)) {
      applications.push({
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.jobTitle || "Unknown Position",
        company: app.company || "Unknown Company",
        status: app.status,
        appliedAt: app.appliedAt,
        interviewDate: app.interviewDate,
        notes: app.notes,
        createdAt: app.createdAt
      });
    }
  }
  applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    interview: applications.filter((a) => a.status === "interview").length,
    offer: applications.filter((a) => a.status === "offer").length,
    rejected: applications.filter((a) => a.status === "rejected").length
  };
  return {
    status: 200,
    body: {
      applications,
      stats
    }
  };
};
export {
  config,
  handler
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vc3JjL2FwcGxpY2F0aW9ucy9nZXQtYXBwbGljYXRpb25zLWFwaS5zdGVwLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7IEFwaVJvdXRlQ29uZmlnLCBIYW5kbGVycyB9IGZyb20gJ21vdGlhJztcclxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XHJcbmltcG9ydCB7IGRiIH0gZnJvbSAnLi4vdXRpbHMvZGInO1xyXG5cclxuaW50ZXJmYWNlIFNlc3Npb24ge1xyXG4gIHVzZXJJZDogc3RyaW5nO1xyXG4gIGVtYWlsOiBzdHJpbmc7XHJcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XHJcbiAgZXhwaXJlc0F0OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBBcHBsaWNhdGlvbkluZGV4IHtcclxuICB1c2VySWQ6IHN0cmluZztcclxuICBhcHBsaWNhdGlvbklkczogc3RyaW5nW107XHJcbn1cclxuXHJcbmludGVyZmFjZSBBcHBsaWNhdGlvbiB7XHJcbiAgaWQ6IHN0cmluZztcclxuICBqb2JJZDogc3RyaW5nO1xyXG4gIGpvYlRpdGxlPzogc3RyaW5nO1xyXG4gIGNvbXBhbnk/OiBzdHJpbmc7XHJcbiAgc3RhdHVzOiBzdHJpbmc7XHJcbiAgYXBwbGllZEF0Pzogc3RyaW5nO1xyXG4gIGludGVydmlld0RhdGU/OiBzdHJpbmc7XHJcbiAgbm90ZXM/OiBzdHJpbmc7XHJcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWc6IEFwaVJvdXRlQ29uZmlnID0ge1xyXG4gIG5hbWU6ICdHZXRBcHBsaWNhdGlvbnNBUEknLFxyXG4gIHR5cGU6ICdhcGknLFxyXG4gIHBhdGg6ICcvYXBwbGljYXRpb25zJyxcclxuICBtZXRob2Q6ICdHRVQnLFxyXG4gIGRlc2NyaXB0aW9uOiAnR2V0IHVzZXIgam9iIGFwcGxpY2F0aW9ucyB3aXRoIHN0YXR1cyB0cmFja2luZycsXHJcbiAgZW1pdHM6IFtdLFxyXG4gIGZsb3dzOiBbJ2pvYi1hcHBsaWNhdGlvbi1mbG93J10sXHJcbiAgcmVzcG9uc2VTY2hlbWE6IHtcclxuICAgIDIwMDogei5vYmplY3Qoe1xyXG4gICAgICBhcHBsaWNhdGlvbnM6IHouYXJyYXkoei5vYmplY3Qoe1xyXG4gICAgICAgIGlkOiB6LnN0cmluZygpLFxyXG4gICAgICAgIGpvYklkOiB6LnN0cmluZygpLFxyXG4gICAgICAgIGpvYlRpdGxlOiB6LnN0cmluZygpLFxyXG4gICAgICAgIGNvbXBhbnk6IHouc3RyaW5nKCksXHJcbiAgICAgICAgc3RhdHVzOiB6LnN0cmluZygpLFxyXG4gICAgICAgIGFwcGxpZWRBdDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxyXG4gICAgICAgIGludGVydmlld0RhdGU6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcclxuICAgICAgICBub3Rlczogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxyXG4gICAgICAgIGNyZWF0ZWRBdDogei5zdHJpbmcoKVxyXG4gICAgICB9KSksXHJcbiAgICAgIHN0YXRzOiB6Lm9iamVjdCh7XHJcbiAgICAgICAgdG90YWw6IHoubnVtYmVyKCksXHJcbiAgICAgICAgYXBwbGllZDogei5udW1iZXIoKSxcclxuICAgICAgICBpbnRlcnZpZXc6IHoubnVtYmVyKCksXHJcbiAgICAgICAgb2ZmZXI6IHoubnVtYmVyKCksXHJcbiAgICAgICAgcmVqZWN0ZWQ6IHoubnVtYmVyKClcclxuICAgICAgfSlcclxuICAgIH0pLFxyXG4gICAgNDAxOiB6Lm9iamVjdCh7XHJcbiAgICAgIGVycm9yOiB6LnN0cmluZygpXHJcbiAgICB9KVxyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyOiBIYW5kbGVyc1snR2V0QXBwbGljYXRpb25zQVBJJ10gPSBhc3luYyAocmVxLCB7IGxvZ2dlciB9KSA9PiB7XHJcbiAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb247XHJcbiAgaWYgKCFhdXRoSGVhZGVyKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXM6IDQwMSxcclxuICAgICAgYm9keTogeyBlcnJvcjogJ0F1dGhvcml6YXRpb24gcmVxdWlyZWQnIH1cclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlci5yZXBsYWNlKCdCZWFyZXIgJywgJycpO1xyXG4gIGNvbnN0IHNlc3Npb24gPSBkYi5nZXQ8U2Vzc2lvbj4oJ3Nlc3Npb25zJywgdG9rZW4pO1xyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhdHVzOiA0MDEsXHJcbiAgICAgIGJvZHk6IHsgZXJyb3I6ICdJbnZhbGlkIHNlc3Npb24nIH1cclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIGNvbnN0IHsgc3RhdHVzOiBmaWx0ZXJTdGF0dXMgfSA9IHJlcS5xdWVyeVBhcmFtcztcclxuICBcclxuICBsb2dnZXIuaW5mbygnRmV0Y2hpbmcgYXBwbGljYXRpb25zJywgeyB1c2VySWQ6IHNlc3Npb24udXNlcklkLCBmaWx0ZXJTdGF0dXMgfSk7XHJcbiAgXHJcbiAgLy8gR2V0IHVzZXIncyBhcHBsaWNhdGlvbiB0cmFja2luZyBkYXRhXHJcbiAgY29uc3QgdXNlckFwcGxpY2F0aW9ucyA9IGRiLmdldDxBcHBsaWNhdGlvbkluZGV4PigndXNlcl9hcHBsaWNhdGlvbnNfaW5kZXgnLCBzZXNzaW9uLnVzZXJJZCk7XHJcbiAgY29uc3QgYXBwbGljYXRpb25JZHMgPSB1c2VyQXBwbGljYXRpb25zPy5hcHBsaWNhdGlvbklkcyB8fCBbXTtcclxuICBcclxuICAvLyBGZXRjaCBhbGwgYXBwbGljYXRpb25zXHJcbiAgY29uc3QgYXBwbGljYXRpb25zOiBBcnJheTx7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgam9iSWQ6IHN0cmluZztcclxuICAgIGpvYlRpdGxlOiBzdHJpbmc7XHJcbiAgICBjb21wYW55OiBzdHJpbmc7XHJcbiAgICBzdGF0dXM6IHN0cmluZztcclxuICAgIGFwcGxpZWRBdD86IHN0cmluZztcclxuICAgIGludGVydmlld0RhdGU/OiBzdHJpbmc7XHJcbiAgICBub3Rlcz86IHN0cmluZztcclxuICAgIGNyZWF0ZWRBdDogc3RyaW5nO1xyXG4gIH0+ID0gW107XHJcbiAgXHJcbiAgZm9yIChjb25zdCBhcHBJZCBvZiBhcHBsaWNhdGlvbklkcykge1xyXG4gICAgY29uc3QgYXBwID0gZGIuZ2V0PEFwcGxpY2F0aW9uPignYXBwbGljYXRpb25zJywgYXBwSWQpO1xyXG4gICAgaWYgKGFwcCAmJiAoIWZpbHRlclN0YXR1cyB8fCBhcHAuc3RhdHVzID09PSBmaWx0ZXJTdGF0dXMpKSB7XHJcbiAgICAgIGFwcGxpY2F0aW9ucy5wdXNoKHtcclxuICAgICAgICBpZDogYXBwLmlkLFxyXG4gICAgICAgIGpvYklkOiBhcHAuam9iSWQsXHJcbiAgICAgICAgam9iVGl0bGU6IGFwcC5qb2JUaXRsZSB8fCAnVW5rbm93biBQb3NpdGlvbicsXHJcbiAgICAgICAgY29tcGFueTogYXBwLmNvbXBhbnkgfHwgJ1Vua25vd24gQ29tcGFueScsXHJcbiAgICAgICAgc3RhdHVzOiBhcHAuc3RhdHVzLFxyXG4gICAgICAgIGFwcGxpZWRBdDogYXBwLmFwcGxpZWRBdCxcclxuICAgICAgICBpbnRlcnZpZXdEYXRlOiBhcHAuaW50ZXJ2aWV3RGF0ZSxcclxuICAgICAgICBub3RlczogYXBwLm5vdGVzLFxyXG4gICAgICAgIGNyZWF0ZWRBdDogYXBwLmNyZWF0ZWRBdFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgLy8gU29ydCBieSBjcmVhdGlvbiBkYXRlIChuZXdlc3QgZmlyc3QpXHJcbiAgYXBwbGljYXRpb25zLnNvcnQoKGEsIGIpID0+IG5ldyBEYXRlKGIuY3JlYXRlZEF0KS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShhLmNyZWF0ZWRBdCkuZ2V0VGltZSgpKTtcclxuICBcclxuICAvLyBDYWxjdWxhdGUgc3RhdHNcclxuICBjb25zdCBzdGF0cyA9IHtcclxuICAgIHRvdGFsOiBhcHBsaWNhdGlvbnMubGVuZ3RoLFxyXG4gICAgYXBwbGllZDogYXBwbGljYXRpb25zLmZpbHRlcihhID0+IGEuc3RhdHVzID09PSAnYXBwbGllZCcpLmxlbmd0aCxcclxuICAgIGludGVydmlldzogYXBwbGljYXRpb25zLmZpbHRlcihhID0+IGEuc3RhdHVzID09PSAnaW50ZXJ2aWV3JykubGVuZ3RoLFxyXG4gICAgb2ZmZXI6IGFwcGxpY2F0aW9ucy5maWx0ZXIoYSA9PiBhLnN0YXR1cyA9PT0gJ29mZmVyJykubGVuZ3RoLFxyXG4gICAgcmVqZWN0ZWQ6IGFwcGxpY2F0aW9ucy5maWx0ZXIoYSA9PiBhLnN0YXR1cyA9PT0gJ3JlamVjdGVkJykubGVuZ3RoXHJcbiAgfTtcclxuICBcclxuICByZXR1cm4ge1xyXG4gICAgc3RhdHVzOiAyMDAsXHJcbiAgICBib2R5OiB7XHJcbiAgICAgIGFwcGxpY2F0aW9ucyxcclxuICAgICAgc3RhdHNcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiQUFDQSxTQUFTLFNBQVM7QUFDbEIsU0FBUyxVQUFVO0FBMEJaLE1BQU0sU0FBeUI7QUFBQSxFQUNwQyxNQUFNO0FBQUEsRUFDTixNQUFNO0FBQUEsRUFDTixNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsRUFDUixhQUFhO0FBQUEsRUFDYixPQUFPLENBQUM7QUFBQSxFQUNSLE9BQU8sQ0FBQyxzQkFBc0I7QUFBQSxFQUM5QixnQkFBZ0I7QUFBQSxJQUNkLEtBQUssRUFBRSxPQUFPO0FBQUEsTUFDWixjQUFjLEVBQUUsTUFBTSxFQUFFLE9BQU87QUFBQSxRQUM3QixJQUFJLEVBQUUsT0FBTztBQUFBLFFBQ2IsT0FBTyxFQUFFLE9BQU87QUFBQSxRQUNoQixVQUFVLEVBQUUsT0FBTztBQUFBLFFBQ25CLFNBQVMsRUFBRSxPQUFPO0FBQUEsUUFDbEIsUUFBUSxFQUFFLE9BQU87QUFBQSxRQUNqQixXQUFXLEVBQUUs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
