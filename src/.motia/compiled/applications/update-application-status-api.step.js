import { z } from "zod";
import { db } from "../utils/db.js";
const config = {
  name: "UpdateApplicationStatusAPI",
  type: "api",
  path: "/applications/:applicationId/status",
  method: "PUT",
  description: "Update job application status",
  emits: [],
  flows: ["job-application-flow"],
  bodySchema: z.object({
    status: z.enum(["draft", "applied", "interview", "offer", "rejected", "withdrawn"]),
    notes: z.string().optional(),
    interviewDate: z.string().optional()
  }),
  responseSchema: {
    200: z.object({
      message: z.string(),
      application: z.object({
        id: z.string(),
        status: z.string(),
        updatedAt: z.string()
      })
    }),
    404: z.object({
      error: z.string()
    })
  }
};
const handler = async (req, { logger }) => {
  const { applicationId } = req.pathParams;
  const { status, notes, interviewDate } = req.body;
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
  const application = db.get("applications", applicationId);
  if (!application || application.userId !== session.userId) {
    return {
      status: 404,
      body: { error: "Application not found" }
    };
  }
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  logger.info("Updating application status", {
    applicationId,
    oldStatus: application.status,
    newStatus: status
  });
  const updatedApplication = {
    ...application,
    status,
    notes: notes || application.notes,
    interviewDate: interviewDate || application.interviewDate,
    appliedAt: status === "applied" && !application.appliedAt ? timestamp : application.appliedAt,
    updatedAt: timestamp,
    statusHistory: [
      ...application.statusHistory || [],
      { status, changedAt: timestamp, notes }
    ]
  };
  db.set("applications", applicationId, updatedApplication);
  return {
    status: 200,
    body: {
      message: "Application status updated",
      application: {
        id: applicationId,
        status,
        updatedAt: timestamp
      }
    }
  };
};
export {
  config,
  handler
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vYXBwbGljYXRpb25zL3VwZGF0ZS1hcHBsaWNhdGlvbi1zdGF0dXMtYXBpLnN0ZXAudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB0eXBlIHsgQXBpUm91dGVDb25maWcsIEhhbmRsZXJzIH0gZnJvbSAnbW90aWEnO1xyXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuaW1wb3J0IHsgZGIgfSBmcm9tICcuLi91dGlscy9kYic7XHJcblxyXG5pbnRlcmZhY2UgU2Vzc2lvbiB7XHJcbiAgdXNlcklkOiBzdHJpbmc7XHJcbiAgZW1haWw6IHN0cmluZztcclxuICBjcmVhdGVkQXQ6IHN0cmluZztcclxuICBleHBpcmVzQXQ6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEFwcGxpY2F0aW9uIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIHVzZXJJZDogc3RyaW5nO1xyXG4gIGpvYklkOiBzdHJpbmc7XHJcbiAgc3RhdHVzOiBzdHJpbmc7XHJcbiAgbm90ZXM/OiBzdHJpbmc7XHJcbiAgaW50ZXJ2aWV3RGF0ZT86IHN0cmluZztcclxuICBhcHBsaWVkQXQ/OiBzdHJpbmc7XHJcbiAgdXBkYXRlZEF0OiBzdHJpbmc7XHJcbiAgc3RhdHVzSGlzdG9yeT86IEFycmF5PHsgc3RhdHVzOiBzdHJpbmc7IGNoYW5nZWRBdDogc3RyaW5nOyBub3Rlcz86IHN0cmluZyB9PjtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbmZpZzogQXBpUm91dGVDb25maWcgPSB7XHJcbiAgbmFtZTogJ1VwZGF0ZUFwcGxpY2F0aW9uU3RhdHVzQVBJJyxcclxuICB0eXBlOiAnYXBpJyxcclxuICBwYXRoOiAnL2FwcGxpY2F0aW9ucy86YXBwbGljYXRpb25JZC9zdGF0dXMnLFxyXG4gIG1ldGhvZDogJ1BVVCcsXHJcbiAgZGVzY3JpcHRpb246ICdVcGRhdGUgam9iIGFwcGxpY2F0aW9uIHN0YXR1cycsXHJcbiAgZW1pdHM6IFtdLFxyXG4gIGZsb3dzOiBbJ2pvYi1hcHBsaWNhdGlvbi1mbG93J10sXHJcbiAgYm9keVNjaGVtYTogei5vYmplY3Qoe1xyXG4gICAgc3RhdHVzOiB6LmVudW0oWydkcmFmdCcsICdhcHBsaWVkJywgJ2ludGVydmlldycsICdvZmZlcicsICdyZWplY3RlZCcsICd3aXRoZHJhd24nXSksXHJcbiAgICBub3Rlczogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxyXG4gICAgaW50ZXJ2aWV3RGF0ZTogei5zdHJpbmcoKS5vcHRpb25hbCgpXHJcbiAgfSksXHJcbiAgcmVzcG9uc2VTY2hlbWE6IHtcclxuICAgIDIwMDogei5vYmplY3Qoe1xyXG4gICAgICBtZXNzYWdlOiB6LnN0cmluZygpLFxyXG4gICAgICBhcHBsaWNhdGlvbjogei5vYmplY3Qoe1xyXG4gICAgICAgIGlkOiB6LnN0cmluZygpLFxyXG4gICAgICAgIHN0YXR1czogei5zdHJpbmcoKSxcclxuICAgICAgICB1cGRhdGVkQXQ6IHouc3RyaW5nKClcclxuICAgICAgfSlcclxuICAgIH0pLFxyXG4gICAgNDA0OiB6Lm9iamVjdCh7XHJcbiAgICAgIGVycm9yOiB6LnN0cmluZygpXHJcbiAgICB9KVxyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyOiBIYW5kbGVyc1snVXBkYXRlQXBwbGljYXRpb25TdGF0dXNBUEknXSA9IGFzeW5jIChyZXEsIHsgbG9nZ2VyIH0pID0+IHtcclxuICBjb25zdCB7IGFwcGxpY2F0aW9uSWQgfSA9IHJlcS5wYXRoUGFyYW1zO1xyXG4gIGNvbnN0IHsgc3RhdHVzLCBub3RlcywgaW50ZXJ2aWV3RGF0ZSB9ID0gcmVxLmJvZHk7XHJcbiAgXHJcbiAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb247XHJcbiAgaWYgKCFhdXRoSGVhZGVyKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXM6IDQwNCxcclxuICAgICAgYm9keTogeyBlcnJvcjogJ0F1dGhvcml6YXRpb24gcmVxdWlyZWQnIH1cclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlci5yZXBsYWNlKCdCZWFyZXIgJywgJycpO1xyXG4gIGNvbnN0IHNlc3Npb24gPSBkYi5nZXQ8U2Vzc2lvbj4oJ3Nlc3Npb25zJywgdG9rZW4pO1xyXG4gIGlmICghc2Vzc2lvbikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhdHVzOiA0MDQsXHJcbiAgICAgIGJvZHk6IHsgZXJyb3I6ICdJbnZhbGlkIHNlc3Npb24nIH1cclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIC8vIEdldCBleGlzdGluZyBhcHBsaWNhdGlvblxyXG4gIGNvbnN0IGFwcGxpY2F0aW9uID0gZGIuZ2V0PEFwcGxpY2F0aW9uPignYXBwbGljYXRpb25zJywgYXBwbGljYXRpb25JZCk7XHJcbiAgaWYgKCFhcHBsaWNhdGlvbiB8fCBhcHBsaWNhdGlvbi51c2VySWQgIT09IHNlc3Npb24udXNlcklkKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXM6IDQwNCxcclxuICAgICAgYm9keTogeyBlcnJvcjogJ0FwcGxpY2F0aW9uIG5vdCBmb3VuZCcgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xyXG4gIFxyXG4gIGxvZ2dlci5pbmZvKCdVcGRhdGluZyBhcHBsaWNhdGlvbiBzdGF0dXMnLCB7IFxyXG4gICAgYXBwbGljYXRpb25JZCwgXHJcbiAgICBvbGRTdGF0dXM6IGFwcGxpY2F0aW9uLnN0YXR1cywgXHJcbiAgICBuZXdTdGF0dXM6IHN0YXR1cyBcclxuICB9KTtcclxuICBcclxuICAvLyBVcGRhdGUgYXBwbGljYXRpb25cclxuICBjb25zdCB1cGRhdGVkQXBwbGljYXRpb246IEFwcGxpY2F0aW9uID0ge1xyXG4gICAgLi4uYXBwbGljYXRpb24sXHJcbiAgICBzdGF0dXMsXHJcbiAgICBub3Rlczogbm90ZXMgfHwgYXBwbGljYXRpb24ubm90ZXMsXHJcbiAgICBpbnRlcnZpZXdEYXRlOiBpbnRlcnZpZXdEYXRlIHx8IGFwcGxpY2F0aW9uLmludGVydmlld0RhdGUsXHJcbiAgICBhcHBsaWVkQXQ6IHN0YXR1cyA9PT0gJ2FwcGxpZWQnICYmICFhcHBsaWNhdGlvbi5hcHBsaWVkQXQgPyB0aW1lc3RhbXAgOiBhcHBsaWNhdGlvbi5hcHBsaWVkQXQsXHJcbiAgICB1cGRhdGVkQXQ6IHRpbWVzdGFtcCxcclxuICAgIHN0YXR1c0hpc3Rvcnk6IFtcclxuICAgICAgLi4uKGFwcGxpY2F0aW9uLnN0YXR1c0hpc3RvcnkgfHwgW10pLFxyXG4gICAgICB7IHN0YXR1cywgY2hhbmdlZEF0OiB0aW1lc3RhbXAsIG5vdGVzIH1cclxuICAgIF1cclxuICB9O1xyXG4gIFxyXG4gIGRiLnNldDxBcHBsaWNhdGlvbj4oJ2FwcGxpY2F0aW9ucycsIGFwcGxpY2F0aW9uSWQsIHVwZGF0ZWRBcHBsaWNhdGlvbik7XHJcbiAgXHJcbiAgcmV0dXJuIHtcclxuICAgIHN0YXR1czogMjAwLFxyXG4gICAgYm9keToge1xyXG4gICAgICBtZXNzYWdlOiAnQXBwbGljYXRpb24gc3RhdHVzIHVwZGF0ZWQnLFxyXG4gICAgICBhcHBsaWNhdGlvbjoge1xyXG4gICAgICAgIGlkOiBhcHBsaWNhdGlvbklkLFxyXG4gICAgICAgIHN0YXR1cyxcclxuICAgICAgICB1cGRhdGVkQXQ6IHRpbWVzdGFtcFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIkFBQ0EsU0FBUyxTQUFTO0FBQ2xCLFNBQVMsVUFBVTtBQXFCWixNQUFNLFNBQXlCO0FBQUEsRUFDcEMsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsYUFBYTtBQUFBLEVBQ2IsT0FBTyxDQUFDO0FBQUEsRUFDUixPQUFPLENBQUMsc0JBQXNCO0FBQUEsRUFDOUIsWUFBWSxFQUFFLE9B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
