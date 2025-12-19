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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vYXBwbGljYXRpb25zL2dldC1hcHBsaWNhdGlvbnMtYXBpLnN0ZXAudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB0eXBlIHsgQXBpUm91dGVDb25maWcsIEhhbmRsZXJzIH0gZnJvbSAnbW90aWEnO1xyXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuaW1wb3J0IHsgZGIgfSBmcm9tICcuLi91dGlscy9kYic7XHJcblxyXG5pbnRlcmZhY2UgU2Vzc2lvbiB7XHJcbiAgdXNlcklkOiBzdHJpbmc7XHJcbiAgZW1haWw6IHN0cmluZztcclxuICBjcmVhdGVkQXQ6IHN0cmluZztcclxuICBleHBpcmVzQXQ6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEFwcGxpY2F0aW9uSW5kZXgge1xyXG4gIHVzZXJJZDogc3RyaW5nO1xyXG4gIGFwcGxpY2F0aW9uSWRzOiBzdHJpbmdbXTtcclxufVxyXG5cclxuaW50ZXJmYWNlIEFwcGxpY2F0aW9uIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGpvYklkOiBzdHJpbmc7XHJcbiAgam9iVGl0bGU/OiBzdHJpbmc7XHJcbiAgY29tcGFueT86IHN0cmluZztcclxuICBzdGF0dXM6IHN0cmluZztcclxuICBhcHBsaWVkQXQ/OiBzdHJpbmc7XHJcbiAgaW50ZXJ2aWV3RGF0ZT86IHN0cmluZztcclxuICBub3Rlcz86IHN0cmluZztcclxuICBjcmVhdGVkQXQ6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbmZpZzogQXBpUm91dGVDb25maWcgPSB7XHJcbiAgbmFtZTogJ0dldEFwcGxpY2F0aW9uc0FQSScsXHJcbiAgdHlwZTogJ2FwaScsXHJcbiAgcGF0aDogJy9hcHBsaWNhdGlvbnMnLFxyXG4gIG1ldGhvZDogJ0dFVCcsXHJcbiAgZGVzY3JpcHRpb246ICdHZXQgdXNlciBqb2IgYXBwbGljYXRpb25zIHdpdGggc3RhdHVzIHRyYWNraW5nJyxcclxuICBlbWl0czogW10sXHJcbiAgZmxvd3M6IFsnam9iLWFwcGxpY2F0aW9uLWZsb3cnXSxcclxuICByZXNwb25zZVNjaGVtYToge1xyXG4gICAgMjAwOiB6Lm9iamVjdCh7XHJcbiAgICAgIGFwcGxpY2F0aW9uczogei5hcnJheSh6Lm9iamVjdCh7XHJcbiAgICAgICAgaWQ6IHouc3RyaW5nKCksXHJcbiAgICAgICAgam9iSWQ6IHouc3RyaW5nKCksXHJcbiAgICAgICAgam9iVGl0bGU6IHouc3RyaW5nKCksXHJcbiAgICAgICAgY29tcGFueTogei5zdHJpbmcoKSxcclxuICAgICAgICBzdGF0dXM6IHouc3RyaW5nKCksXHJcbiAgICAgICAgYXBwbGllZEF0OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXHJcbiAgICAgICAgaW50ZXJ2aWV3RGF0ZTogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxyXG4gICAgICAgIG5vdGVzOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXHJcbiAgICAgICAgY3JlYXRlZEF0OiB6LnN0cmluZygpXHJcbiAgICAgIH0pKSxcclxuICAgICAgc3RhdHM6IHoub2JqZWN0KHtcclxuICAgICAgICB0b3RhbDogei5udW1iZXIoKSxcclxuICAgICAgICBhcHBsaWVkOiB6Lm51bWJlcigpLFxyXG4gICAgICAgIGludGVydmlldzogei5udW1iZXIoKSxcclxuICAgICAgICBvZmZlcjogei5udW1iZXIoKSxcclxuICAgICAgICByZWplY3RlZDogei5udW1iZXIoKVxyXG4gICAgICB9KVxyXG4gICAgfSksXHJcbiAgICA0MDE6IHoub2JqZWN0KHtcclxuICAgICAgZXJyb3I6IHouc3RyaW5nKClcclxuICAgIH0pXHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXI6IEhhbmRsZXJzWydHZXRBcHBsaWNhdGlvbnNBUEknXSA9IGFzeW5jIChyZXEsIHsgbG9nZ2VyIH0pID0+IHtcclxuICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbjtcclxuICBpZiAoIWF1dGhIZWFkZXIpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1czogNDAxLFxyXG4gICAgICBib2R5OiB7IGVycm9yOiAnQXV0aG9yaXphdGlvbiByZXF1aXJlZCcgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyLnJlcGxhY2UoJ0JlYXJlciAnLCAnJyk7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGRiLmdldDxTZXNzaW9uPignc2Vzc2lvbnMnLCB0b2tlbik7XHJcbiAgaWYgKCFzZXNzaW9uKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXM6IDQwMSxcclxuICAgICAgYm9keTogeyBlcnJvcjogJ0ludmFsaWQgc2Vzc2lvbicgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgeyBzdGF0dXM6IGZpbHRlclN0YXR1cyB9ID0gcmVxLnF1ZXJ5UGFyYW1zO1xyXG4gIFxyXG4gIGxvZ2dlci5pbmZvKCdGZXRjaGluZyBhcHBsaWNhdGlvbnMnLCB7IHVzZXJJZDogc2Vzc2lvbi51c2VySWQsIGZpbHRlclN0YXR1cyB9KTtcclxuICBcclxuICAvLyBHZXQgdXNlcidzIGFwcGxpY2F0aW9uIHRyYWNraW5nIGRhdGFcclxuICBjb25zdCB1c2VyQXBwbGljYXRpb25zID0gZGIuZ2V0PEFwcGxpY2F0aW9uSW5kZXg+KCd1c2VyX2FwcGxpY2F0aW9uc19pbmRleCcsIHNlc3Npb24udXNlcklkKTtcclxuICBjb25zdCBhcHBsaWNhdGlvbklkcyA9IHVzZXJBcHBsaWNhdGlvbnM/LmFwcGxpY2F0aW9uSWRzIHx8IFtdO1xyXG4gIFxyXG4gIC8vIEZldGNoIGFsbCBhcHBsaWNhdGlvbnNcclxuICBjb25zdCBhcHBsaWNhdGlvbnM6IEFycmF5PHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBqb2JJZDogc3RyaW5nO1xyXG4gICAgam9iVGl0bGU6IHN0cmluZztcclxuICAgIGNvbXBhbnk6IHN0cmluZztcclxuICAgIHN0YXR1czogc3RyaW5nO1xyXG4gICAgYXBwbGllZEF0Pzogc3RyaW5nO1xyXG4gICAgaW50ZXJ2aWV3RGF0ZT86IHN0cmluZztcclxuICAgIG5vdGVzPzogc3RyaW5nO1xyXG4gICAgY3JlYXRlZEF0OiBzdHJpbmc7XHJcbiAgfT4gPSBbXTtcclxuICBcclxuICBmb3IgKGNvbnN0IGFwcElkIG9mIGFwcGxpY2F0aW9uSWRzKSB7XHJcbiAgICBjb25zdCBhcHAgPSBkYi5nZXQ8QXBwbGljYXRpb24+KCdhcHBsaWNhdGlvbnMnLCBhcHBJZCk7XHJcbiAgICBpZiAoYXBwICYmICghZmlsdGVyU3RhdHVzIHx8IGFwcC5zdGF0dXMgPT09IGZpbHRlclN0YXR1cykpIHtcclxuICAgICAgYXBwbGljYXRpb25zLnB1c2goe1xyXG4gICAgICAgIGlkOiBhcHAuaWQsXHJcbiAgICAgICAgam9iSWQ6IGFwcC5qb2JJZCxcclxuICAgICAgICBqb2JUaXRsZTogYXBwLmpvYlRpdGxlIHx8ICdVbmtub3duIFBvc2l0aW9uJyxcclxuICAgICAgICBjb21wYW55OiBhcHAuY29tcGFueSB8fCAnVW5rbm93biBDb21wYW55JyxcclxuICAgICAgICBzdGF0dXM6IGFwcC5zdGF0dXMsXHJcbiAgICAgICAgYXBwbGllZEF0OiBhcHAuYXBwbGllZEF0LFxyXG4gICAgICAgIGludGVydmlld0RhdGU6IGFwcC5pbnRlcnZpZXdEYXRlLFxyXG4gICAgICAgIG5vdGVzOiBhcHAubm90ZXMsXHJcbiAgICAgICAgY3JlYXRlZEF0OiBhcHAuY3JlYXRlZEF0XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvLyBTb3J0IGJ5IGNyZWF0aW9uIGRhdGUgKG5ld2VzdCBmaXJzdClcclxuICBhcHBsaWNhdGlvbnMuc29ydCgoYSwgYikgPT4gbmV3IERhdGUoYi5jcmVhdGVkQXQpLmdldFRpbWUoKSAtIG5ldyBEYXRlKGEuY3JlYXRlZEF0KS5nZXRUaW1lKCkpO1xyXG4gIFxyXG4gIC8vIENhbGN1bGF0ZSBzdGF0c1xyXG4gIGNvbnN0IHN0YXRzID0ge1xyXG4gICAgdG90YWw6IGFwcGxpY2F0aW9ucy5sZW5ndGgsXHJcbiAgICBhcHBsaWVkOiBhcHBsaWNhdGlvbnMuZmlsdGVyKGEgPT4gYS5zdGF0dXMgPT09ICdhcHBsaWVkJykubGVuZ3RoLFxyXG4gICAgaW50ZXJ2aWV3OiBhcHBsaWNhdGlvbnMuZmlsdGVyKGEgPT4gYS5zdGF0dXMgPT09ICdpbnRlcnZpZXcnKS5sZW5ndGgsXHJcbiAgICBvZmZlcjogYXBwbGljYXRpb25zLmZpbHRlcihhID0+IGEuc3RhdHVzID09PSAnb2ZmZXInKS5sZW5ndGgsXHJcbiAgICByZWplY3RlZDogYXBwbGljYXRpb25zLmZpbHRlcihhID0+IGEuc3RhdHVzID09PSAncmVqZWN0ZWQnKS5sZW5ndGhcclxuICB9O1xyXG4gIFxyXG4gIHJldHVybiB7XHJcbiAgICBzdGF0dXM6IDIwMCxcclxuICAgIGJvZHk6IHtcclxuICAgICAgYXBwbGljYXRpb25zLFxyXG4gICAgICBzdGF0c1xyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcbiJdLAogICJtYXBwaW5ncyI6ICJBQUNBLFNBQVMsU0FBUztBQUNsQixTQUFTLFVBQVU7QUEwQlosTUFBTSxTQUF5QjtBQUFBLEVBQ3BDLE1BQU07QUFBQSxFQUNOLE1BQU07QUFBQSxFQUNOLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxFQUNSLGFBQWE7QUFBQSxFQUNiLE9BQU8sQ0FBQztBQUFBLEVBQ1IsT0FBTyxDQUFDLHNCQUFzQjtBQUFBLEVBQzlCLGdCQUFnQjtBQUFBLElBQ2QsS0FBSyxFQUFFLE9BQU87QUFBQSxNQUNaLGNBQWMsRUFBRSxNQUFNLEVBQUUsT0FBTztBQUFBLFFBQzdCLElBQUksRUFBRSxPQUFPO0FBQUEsUUFDYixPQUFPLEVBQUUsT0FBTztBQUFBLFFBQ2hCLFVBQVUsRUFBRSxPQUFPO0FBQUEsUUFDbkIsU0FBUyxFQUFFLE9BQU87QUFBQSxRQUNsQixRQUFRLEVBQUUsT0FBTztBQUFBLFFBQ2pCLFdBQVcsRUFBRSxPQUFPLEVB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
