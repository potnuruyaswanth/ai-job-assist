import { z } from "zod";
const config = {
  name: "PublishPostAPI",
  type: "api",
  path: "/social/publish",
  method: "POST",
  description: "Publish or schedule social media post",
  emits: ["post-publish-queued"],
  flows: ["social-media-flow"],
  bodySchema: z.object({
    requestId: z.string(),
    platforms: z.array(z.enum(["twitter", "facebook", "instagram", "linkedin"])),
    content: z.object({}).passthrough(),
    imageUrl: z.string().optional(),
    scheduledAt: z.string().optional()
    // ISO date string for scheduling
  }),
  responseSchema: {
    200: z.object({
      message: z.string(),
      publishId: z.string(),
      scheduled: z.boolean(),
      scheduledAt: z.string().optional()
    }),
    400: z.object({
      error: z.string()
    })
  }
};
const handler = async (req, { emit, logger, state }) => {
  const { requestId, platforms, content, imageUrl, scheduledAt } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return {
      status: 400,
      body: { error: "Authorization required" }
    };
  }
  const token = authHeader.replace("Bearer ", "");
  const session = await state.get("sessions", token);
  if (!session) {
    return {
      status: 400,
      body: { error: "Invalid session" }
    };
  }
  const publishId = `pub_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const isScheduled = !!scheduledAt && new Date(scheduledAt) > /* @__PURE__ */ new Date();
  logger.info("Post publish requested", { publishId, platforms, isScheduled });
  await state.set("publish_requests", publishId, {
    publishId,
    requestId,
    userId: session.userId,
    platforms,
    content,
    imageUrl,
    status: isScheduled ? "scheduled" : "pending",
    scheduledAt: isScheduled ? scheduledAt : null,
    createdAt: timestamp
  });
  await emit({
    topic: "post-publish-queued",
    data: {
      publishId,
      userId: session.userId,
      platforms,
      content,
      imageUrl,
      scheduledAt: isScheduled ? scheduledAt : null,
      timestamp
    }
  });
  return {
    status: 200,
    body: {
      message: isScheduled ? "Post scheduled successfully" : "Post queued for publishing",
      publishId,
      scheduled: isScheduled,
      scheduledAt: isScheduled ? scheduledAt : void 0
    }
  };
};
export {
  config,
  handler
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vc3JjL3NvY2lhbC9wdWJsaXNoLXBvc3QtYXBpLnN0ZXAudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB0eXBlIHsgQXBpUm91dGVDb25maWcsIEhhbmRsZXJzIH0gZnJvbSAnbW90aWEnO1xyXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWc6IEFwaVJvdXRlQ29uZmlnID0ge1xyXG4gIG5hbWU6ICdQdWJsaXNoUG9zdEFQSScsXHJcbiAgdHlwZTogJ2FwaScsXHJcbiAgcGF0aDogJy9zb2NpYWwvcHVibGlzaCcsXHJcbiAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgZGVzY3JpcHRpb246ICdQdWJsaXNoIG9yIHNjaGVkdWxlIHNvY2lhbCBtZWRpYSBwb3N0JyxcclxuICBlbWl0czogWydwb3N0LXB1Ymxpc2gtcXVldWVkJ10sXHJcbiAgZmxvd3M6IFsnc29jaWFsLW1lZGlhLWZsb3cnXSxcclxuICBib2R5U2NoZW1hOiB6Lm9iamVjdCh7XHJcbiAgICByZXF1ZXN0SWQ6IHouc3RyaW5nKCksXHJcbiAgICBwbGF0Zm9ybXM6IHouYXJyYXkoei5lbnVtKFsndHdpdHRlcicsICdmYWNlYm9vaycsICdpbnN0YWdyYW0nLCAnbGlua2VkaW4nXSkpLFxyXG4gICAgY29udGVudDogei5vYmplY3Qoe30pLnBhc3N0aHJvdWdoKCksXHJcbiAgICBpbWFnZVVybDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxyXG4gICAgc2NoZWR1bGVkQXQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKSAvLyBJU08gZGF0ZSBzdHJpbmcgZm9yIHNjaGVkdWxpbmdcclxuICB9KSxcclxuICByZXNwb25zZVNjaGVtYToge1xyXG4gICAgMjAwOiB6Lm9iamVjdCh7XHJcbiAgICAgIG1lc3NhZ2U6IHouc3RyaW5nKCksXHJcbiAgICAgIHB1Ymxpc2hJZDogei5zdHJpbmcoKSxcclxuICAgICAgc2NoZWR1bGVkOiB6LmJvb2xlYW4oKSxcclxuICAgICAgc2NoZWR1bGVkQXQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKVxyXG4gICAgfSksXHJcbiAgICA0MDA6IHoub2JqZWN0KHtcclxuICAgICAgZXJyb3I6IHouc3RyaW5nKClcclxuICAgIH0pXHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGhhbmRsZXI6IEhhbmRsZXJzWydQdWJsaXNoUG9zdEFQSSddID0gYXN5bmMgKHJlcSwgeyBlbWl0LCBsb2dnZXIsIHN0YXRlIH0pID0+IHtcclxuICBjb25zdCB7IHJlcXVlc3RJZCwgcGxhdGZvcm1zLCBjb250ZW50LCBpbWFnZVVybCwgc2NoZWR1bGVkQXQgfSA9IHJlcS5ib2R5O1xyXG4gIFxyXG4gIC8vIEdldCB1c2VyIGZyb20gYXV0aCBoZWFkZXJcclxuICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbjtcclxuICBpZiAoIWF1dGhIZWFkZXIpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1czogNDAwLFxyXG4gICAgICBib2R5OiB7IGVycm9yOiAnQXV0aG9yaXphdGlvbiByZXF1aXJlZCcgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyLnJlcGxhY2UoJ0JlYXJlciAnLCAnJyk7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IHN0YXRlLmdldCgnc2Vzc2lvbnMnLCB0b2tlbik7XHJcbiAgaWYgKCFzZXNzaW9uKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXM6IDQwMCxcclxuICAgICAgYm9keTogeyBlcnJvcjogJ0ludmFsaWQgc2Vzc2lvbicgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgcHVibGlzaElkID0gYHB1Yl8ke0RhdGUubm93KCl9XyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpfWA7XHJcbiAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xyXG4gIGNvbnN0IGlzU2NoZWR1bGVkID0gISFzY2hlZHVsZWRBdCAmJiBuZXcgRGF0ZShzY2hlZHVsZWRBdCkgPiBuZXcgRGF0ZSgpO1xyXG4gIFxyXG4gIGxvZ2dlci5pbmZvKCdQb3N0IHB1Ymxpc2ggcmVxdWVzdGVkJywgeyBwdWJsaXNoSWQsIHBsYXRmb3JtcywgaXNTY2hlZHVsZWQgfSk7XHJcbiAgXHJcbiAgLy8gU3RvcmUgcHVibGlzaCByZXF1ZXN0XHJcbiAgYXdhaXQgc3RhdGUuc2V0KCdwdWJsaXNoX3JlcXVlc3RzJywgcHVibGlzaElkLCB7XHJcbiAgICBwdWJsaXNoSWQsXHJcbiAgICByZXF1ZXN0SWQsXHJcbiAgICB1c2VySWQ6IHNlc3Npb24udXNlcklkLFxyXG4gICAgcGxhdGZvcm1zLFxyXG4gICAgY29udGVudCxcclxuICAgIGltYWdlVXJsLFxyXG4gICAgc3RhdHVzOiBpc1NjaGVkdWxlZCA/ICdzY2hlZHVsZWQnIDogJ3BlbmRpbmcnLFxyXG4gICAgc2NoZWR1bGVkQXQ6IGlzU2NoZWR1bGVkID8gc2NoZWR1bGVkQXQgOiBudWxsLFxyXG4gICAgY3JlYXRlZEF0OiB0aW1lc3RhbXBcclxuICB9KTtcclxuICBcclxuICAvLyBRdWV1ZSBmb3IgcHVibGlzaGluZ1xyXG4gIGF3YWl0IGVtaXQoe1xyXG4gICAgdG9waWM6ICdwb3N0LXB1Ymxpc2gtcXVldWVkJyxcclxuICAgIGRhdGE6IHtcclxuICAgICAgcHVibGlzaElkLFxyXG4gICAgICB1c2VySWQ6IHNlc3Npb24udXNlcklkLFxyXG4gICAgICBwbGF0Zm9ybXMsXHJcbiAgICAgIGNvbnRlbnQsXHJcbiAgICAgIGltYWdlVXJsLFxyXG4gICAgICBzY2hlZHVsZWRBdDogaXNTY2hlZHVsZWQgPyBzY2hlZHVsZWRBdCA6IG51bGwsXHJcbiAgICAgIHRpbWVzdGFtcFxyXG4gICAgfVxyXG4gIH0pO1xyXG4gIFxyXG4gIHJldHVybiB7XHJcbiAgICBzdGF0dXM6IDIwMCxcclxuICAgIGJvZHk6IHtcclxuICAgICAgbWVzc2FnZTogaXNTY2hlZHVsZWQgPyAnUG9zdCBzY2hlZHVsZWQgc3VjY2Vzc2Z1bGx5JyA6ICdQb3N0IHF1ZXVlZCBmb3IgcHVibGlzaGluZycsXHJcbiAgICAgIHB1Ymxpc2hJZCxcclxuICAgICAgc2NoZWR1bGVkOiBpc1NjaGVkdWxlZCxcclxuICAgICAgc2NoZWR1bGVkQXQ6IGlzU2NoZWR1bGVkID8gc2NoZWR1bGVkQXQgOiB1bmRlZmluZWRcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiQUFDQSxTQUFTLFNBQVM7QUFFWCxNQUFNLFNBQXlCO0FBQUEsRUFDcEMsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsYUFBYTtBQUFBLEVBQ2IsT0FBTyxDQUFDLHFCQUFxQjtBQUFBLEVBQzdCLE9BQU8sQ0FBQyxtQkFBbUI7QUFBQSxFQUMzQixZQUFZLEVBQUUsT0FBTztBQUFBLElBQ25CLFdBQVcsRUFBRSxPQUFPO0FBQUEsSUFDcEIsV0FBVyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsV0FBVyxZQUFZLGFBQWEsVUFBVSxDQUFDLENBQUM7QUFBQSxJQUMzRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxZQUFZO0FBQUEsSUFDbEMsVUFBVSxFQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUEsSUFDOUIsYUFBYSxFQUFFLE9BQU8sRUFBRSxTQUFTO0FBQUE7QUFBQSxFQUNuQyxDQUFDO0FBQUEsRUFDRCxnQkFBZ0I7QUFBQSxJQUNkLEtBQUssRUFBRSxPQUFPO0FBQUEsTUFDWixTQUFTLEVBQUUsT0FBTztBQUFBLE1BQ2xCLFdBQVcsRUFBRSxPQUFPO0FBQUEsTUFDcEIsV0FBVyxFQUFFLFFBQVE7QUFBQSxNQUNyQixhQUFhLEVBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxJQUNuQyxDQUFDO0FBQUEsSUFDRCxLQUFLLEVBQUUsT0FBTztBQUFBLE1BQ1osT0FBTyxFQUFFLE9BQU87QUFBQSxJQUNsQixDQUFDO0FBQUEsRUFDSDtBQUNGO0FBRU8sTUFBTSxVQUFzQyxPQUFPLEtBQUssRUFBRSxNQUFNLFFBQVEsTUFBTSxNQUFNO0FBQ3pGLFFBQU0sRUFBRSxXQUFXLFdBQVcsU0FBUyxVQUFVLFlBQVksSUFBSSxJQUFJO0FBR3JFLFFBQU0sYUFBYSxJQUFJLFFBQVE7QUFDL0IsTUFBSSxDQUFDLFlBQVk7QUFDZixXQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixNQUFNLEVBQUUsT0FBTyx5QkFBeUI7QUFBQSxJQUMxQztBQUFBLEVBQ0Y7QUFFQSxRQUFNLFFBQVEsV0FBVyxRQUFRLFdBQVcsRUFBRTtBQUM5QyxRQUFNLFVBQVUsTUFBTSxNQUFNLElBQUksWUFBWSxLQUFLO0FBQ2pELE1BQUksQ0FBQyxTQUFTO0FBQ1osV0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsTUFBTSxFQUFFLE9BQU8sa0JBQWtCO0FBQUEsSUFDbkM7QUFBQSxFQUNGO0FBRUEsUUFBTSxZQUFZLE9BQU8sS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM5RSxRQUFNLGFBQVksb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFDekMsUUFBTSxjQUFjLENBQUMsQ0FBQyxlQUFlLElBQUksS0FBSyxXQUFXLElBQUksb0JBQUksS0FBSztBQUV0RSxTQUFPLEtBQUssMEJBQTBCLEVBQUUsV0FBVyxXQUFXLFlBQVksQ0FBQztBQUczRSxRQUFNLE1BQU0sSUFBSSxvQkFBb0IsV0FBVztBQUFBLElBQzdDO0FBQUEsSUFDQTtBQUFBLElBQ0EsUUFBUSxRQUFRO0FBQUEsSUFDaEI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsUUFBUSxjQUFjLGNBQWM7QUFBQSxJQUNwQyxhQUFhLGNBQWMsY0FBYztBQUFBLElBQ3pDLFdBQVc7QUFBQSxFQUNiLENBQUM7QUFHRCxRQUFNLEtBQUs7QUFBQSxJQUNULE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKO0FBQUEsTUFDQSxRQUFRLFFBQVE7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxhQUFhLGNBQWMsY0FBYztBQUFBLE1BQ3pDO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUVELFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLE1BQU07QUFBQSxNQUNKLFNBQVMsY0FBYyxnQ0FBZ0M7QUFBQSxNQUN2RDtBQUFBLE1BQ0EsV0FBVztBQUFBLE1BQ1gsYUFBYSxjQUFjLGNBQWM7QUFBQSxJQUMzQztBQUFBLEVBQ0Y7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
