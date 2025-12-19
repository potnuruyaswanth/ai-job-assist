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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vc3JjL2FwcGxpY2F0aW9ucy91cGRhdGUtYXBwbGljYXRpb24tc3RhdHVzLWFwaS5zdGVwLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7IEFwaVJvdXRlQ29uZmlnLCBIYW5kbGVycyB9IGZyb20gJ21vdGlhJztcclxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XHJcbmltcG9ydCB7IGRiIH0gZnJvbSAnLi4vdXRpbHMvZGInO1xyXG5cclxuaW50ZXJmYWNlIFNlc3Npb24ge1xyXG4gIHVzZXJJZDogc3RyaW5nO1xyXG4gIGVtYWlsOiBzdHJpbmc7XHJcbiAgY3JlYXRlZEF0OiBzdHJpbmc7XHJcbiAgZXhwaXJlc0F0OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBBcHBsaWNhdGlvbiB7XHJcbiAgaWQ6IHN0cmluZztcclxuICB1c2VySWQ6IHN0cmluZztcclxuICBqb2JJZDogc3RyaW5nO1xyXG4gIHN0YXR1czogc3RyaW5nO1xyXG4gIG5vdGVzPzogc3RyaW5nO1xyXG4gIGludGVydmlld0RhdGU/OiBzdHJpbmc7XHJcbiAgYXBwbGllZEF0Pzogc3RyaW5nO1xyXG4gIHVwZGF0ZWRBdDogc3RyaW5nO1xyXG4gIHN0YXR1c0hpc3Rvcnk/OiBBcnJheTx7IHN0YXR1czogc3RyaW5nOyBjaGFuZ2VkQXQ6IHN0cmluZzsgbm90ZXM/OiBzdHJpbmcgfT47XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWc6IEFwaVJvdXRlQ29uZmlnID0ge1xyXG4gIG5hbWU6ICdVcGRhdGVBcHBsaWNhdGlvblN0YXR1c0FQSScsXHJcbiAgdHlwZTogJ2FwaScsXHJcbiAgcGF0aDogJy9hcHBsaWNhdGlvbnMvOmFwcGxpY2F0aW9uSWQvc3RhdHVzJyxcclxuICBtZXRob2Q6ICdQVVQnLFxyXG4gIGRlc2NyaXB0aW9uOiAnVXBkYXRlIGpvYiBhcHBsaWNhdGlvbiBzdGF0dXMnLFxyXG4gIGVtaXRzOiBbXSxcclxuICBmbG93czogWydqb2ItYXBwbGljYXRpb24tZmxvdyddLFxyXG4gIGJvZHlTY2hlbWE6IHoub2JqZWN0KHtcclxuICAgIHN0YXR1czogei5lbnVtKFsnZHJhZnQnLCAnYXBwbGllZCcsICdpbnRlcnZpZXcnLCAnb2ZmZXInLCAncmVqZWN0ZWQnLCAnd2l0aGRyYXduJ10pLFxyXG4gICAgbm90ZXM6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcclxuICAgIGludGVydmlld0RhdGU6IHouc3RyaW5nKCkub3B0aW9uYWwoKVxyXG4gIH0pLFxyXG4gIHJlc3BvbnNlU2NoZW1hOiB7XHJcbiAgICAyMDA6IHoub2JqZWN0KHtcclxuICAgICAgbWVzc2FnZTogei5zdHJpbmcoKSxcclxuICAgICAgYXBwbGljYXRpb246IHoub2JqZWN0KHtcclxuICAgICAgICBpZDogei5zdHJpbmcoKSxcclxuICAgICAgICBzdGF0dXM6IHouc3RyaW5nKCksXHJcbiAgICAgICAgdXBkYXRlZEF0OiB6LnN0cmluZygpXHJcbiAgICAgIH0pXHJcbiAgICB9KSxcclxuICAgIDQwNDogei5vYmplY3Qoe1xyXG4gICAgICBlcnJvcjogei5zdHJpbmcoKVxyXG4gICAgfSlcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlcjogSGFuZGxlcnNbJ1VwZGF0ZUFwcGxpY2F0aW9uU3RhdHVzQVBJJ10gPSBhc3luYyAocmVxLCB7IGxvZ2dlciB9KSA9PiB7XHJcbiAgY29uc3QgeyBhcHBsaWNhdGlvbklkIH0gPSByZXEucGF0aFBhcmFtcztcclxuICBjb25zdCB7IHN0YXR1cywgbm90ZXMsIGludGVydmlld0RhdGUgfSA9IHJlcS5ib2R5O1xyXG4gIFxyXG4gIGNvbnN0IGF1dGhIZWFkZXIgPSByZXEuaGVhZGVycy5hdXRob3JpemF0aW9uO1xyXG4gIGlmICghYXV0aEhlYWRlcikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhdHVzOiA0MDQsXHJcbiAgICAgIGJvZHk6IHsgZXJyb3I6ICdBdXRob3JpemF0aW9uIHJlcXVpcmVkJyB9XHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICBjb25zdCB0b2tlbiA9IGF1dGhIZWFkZXIucmVwbGFjZSgnQmVhcmVyICcsICcnKTtcclxuICBjb25zdCBzZXNzaW9uID0gZGIuZ2V0PFNlc3Npb24+KCdzZXNzaW9ucycsIHRva2VuKTtcclxuICBpZiAoIXNlc3Npb24pIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1czogNDA0LFxyXG4gICAgICBib2R5OiB7IGVycm9yOiAnSW52YWxpZCBzZXNzaW9uJyB9XHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICAvLyBHZXQgZXhpc3RpbmcgYXBwbGljYXRpb25cclxuICBjb25zdCBhcHBsaWNhdGlvbiA9IGRiLmdldDxBcHBsaWNhdGlvbj4oJ2FwcGxpY2F0aW9ucycsIGFwcGxpY2F0aW9uSWQpO1xyXG4gIGlmICghYXBwbGljYXRpb24gfHwgYXBwbGljYXRpb24udXNlcklkICE9PSBzZXNzaW9uLnVzZXJJZCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc3RhdHVzOiA0MDQsXHJcbiAgICAgIGJvZHk6IHsgZXJyb3I6ICdBcHBsaWNhdGlvbiBub3QgZm91bmQnIH1cclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcclxuICBcclxuICBsb2dnZXIuaW5mbygnVXBkYXRpbmcgYXBwbGljYXRpb24gc3RhdHVzJywgeyBcclxuICAgIGFwcGxpY2F0aW9uSWQsIFxyXG4gICAgb2xkU3RhdHVzOiBhcHBsaWNhdGlvbi5zdGF0dXMsIFxyXG4gICAgbmV3U3RhdHVzOiBzdGF0dXMgXHJcbiAgfSk7XHJcbiAgXHJcbiAgLy8gVXBkYXRlIGFwcGxpY2F0aW9uXHJcbiAgY29uc3QgdXBkYXRlZEFwcGxpY2F0aW9uOiBBcHBsaWNhdGlvbiA9IHtcclxuICAgIC4uLmFwcGxpY2F0aW9uLFxyXG4gICAgc3RhdHVzLFxyXG4gICAgbm90ZXM6IG5vdGVzIHx8IGFwcGxpY2F0aW9uLm5vdGVzLFxyXG4gICAgaW50ZXJ2aWV3RGF0ZTogaW50ZXJ2aWV3RGF0ZSB8fCBhcHBsaWNhdGlvbi5pbnRlcnZpZXdEYXRlLFxyXG4gICAgYXBwbGllZEF0OiBzdGF0dXMgPT09ICdhcHBsaWVkJyAmJiAhYXBwbGljYXRpb24uYXBwbGllZEF0ID8gdGltZXN0YW1wIDogYXBwbGljYXRpb24uYXBwbGllZEF0LFxyXG4gICAgdXBkYXRlZEF0OiB0aW1lc3RhbXAsXHJcbiAgICBzdGF0dXNIaXN0b3J5OiBbXHJcbiAgICAgIC4uLihhcHBsaWNhdGlvbi5zdGF0dXNIaXN0b3J5IHx8IFtdKSxcclxuICAgICAgeyBzdGF0dXMsIGNoYW5nZWRBdDogdGltZXN0YW1wLCBub3RlcyB9XHJcbiAgICBdXHJcbiAgfTtcclxuICBcclxuICBkYi5zZXQ8QXBwbGljYXRpb24+KCdhcHBsaWNhdGlvbnMnLCBhcHBsaWNhdGlvbklkLCB1cGRhdGVkQXBwbGljYXRpb24pO1xyXG4gIFxyXG4gIHJldHVybiB7XHJcbiAgICBzdGF0dXM6IDIwMCxcclxuICAgIGJvZHk6IHtcclxuICAgICAgbWVzc2FnZTogJ0FwcGxpY2F0aW9uIHN0YXR1cyB1cGRhdGVkJyxcclxuICAgICAgYXBwbGljYXRpb246IHtcclxuICAgICAgICBpZDogYXBwbGljYXRpb25JZCxcclxuICAgICAgICBzdGF0dXMsXHJcbiAgICAgICAgdXBkYXRlZEF0OiB0aW1lc3RhbXBcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcbiJdLAogICJtYXBwaW5ncyI6ICJBQUNBLFNBQVMsU0FBUztBQUNsQixTQUFTLFVBQVU7QUFxQlosTUFBTSxTQUF5QjtBQUFBLEVBQ3BDLE1BQU07QUFBQSxFQUNOLE1BQU07QUFBQSxFQUNOLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxFQUNSLGFBQWE7QUFBQSxFQUNiLE9BQU8sQ0FBQztBQUFBLEVBQ1IsT0FBTyxDQUFDLHNCQUFzQjtBQUFBLEVBQzlCLFlBQVks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
