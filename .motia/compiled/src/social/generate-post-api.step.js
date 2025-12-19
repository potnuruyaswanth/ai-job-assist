import { z } from "zod";
const config = {
  name: "GeneratePostAPI",
  type: "api",
  path: "/social/generate-post",
  method: "POST",
  description: "Generate AI-powered social media post content",
  emits: ["post-generation-started"],
  flows: ["social-media-flow"],
  bodySchema: z.object({
    topic: z.string().min(3),
    tone: z.enum(["professional", "casual", "engaging", "funny", "inspirational"]),
    platforms: z.array(z.enum(["twitter", "facebook", "instagram", "linkedin"])),
    imageUrl: z.string().optional(),
    includeHashtags: z.boolean().default(true),
    hashtagCount: z.number().min(1).max(10).default(3)
  }),
  responseSchema: {
    200: z.object({
      requestId: z.string(),
      status: z.string(),
      message: z.string()
    }),
    400: z.object({
      error: z.string()
    })
  }
};
const handler = async (req, { emit, logger, state }) => {
  const { topic, tone, platforms, imageUrl, includeHashtags, hashtagCount } = req.body;
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
  const requestId = `post_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  logger.info("Post generation requested", { requestId, topic, platforms });
  await state.set("post_requests", requestId, {
    requestId,
    userId: session.userId,
    topic,
    tone,
    platforms,
    imageUrl,
    includeHashtags,
    hashtagCount,
    status: "pending",
    createdAt: timestamp
  });
  await emit({
    topic: "post-generation-started",
    data: {
      requestId,
      userId: session.userId,
      topic,
      tone,
      platforms,
      imageUrl,
      includeHashtags,
      hashtagCount,
      timestamp
    }
  });
  return {
    status: 200,
    body: {
      requestId,
      status: "processing",
      message: "Post generation started. Poll /social/post-status/:requestId for results."
    }
  };
};
export {
  config,
  handler
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vc3JjL3NvY2lhbC9nZW5lcmF0ZS1wb3N0LWFwaS5zdGVwLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7IEFwaVJvdXRlQ29uZmlnLCBIYW5kbGVycyB9IGZyb20gJ21vdGlhJztcclxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XHJcblxyXG5leHBvcnQgY29uc3QgY29uZmlnOiBBcGlSb3V0ZUNvbmZpZyA9IHtcclxuICBuYW1lOiAnR2VuZXJhdGVQb3N0QVBJJyxcclxuICB0eXBlOiAnYXBpJyxcclxuICBwYXRoOiAnL3NvY2lhbC9nZW5lcmF0ZS1wb3N0JyxcclxuICBtZXRob2Q6ICdQT1NUJyxcclxuICBkZXNjcmlwdGlvbjogJ0dlbmVyYXRlIEFJLXBvd2VyZWQgc29jaWFsIG1lZGlhIHBvc3QgY29udGVudCcsXHJcbiAgZW1pdHM6IFsncG9zdC1nZW5lcmF0aW9uLXN0YXJ0ZWQnXSxcclxuICBmbG93czogWydzb2NpYWwtbWVkaWEtZmxvdyddLFxyXG4gIGJvZHlTY2hlbWE6IHoub2JqZWN0KHtcclxuICAgIHRvcGljOiB6LnN0cmluZygpLm1pbigzKSxcclxuICAgIHRvbmU6IHouZW51bShbJ3Byb2Zlc3Npb25hbCcsICdjYXN1YWwnLCAnZW5nYWdpbmcnLCAnZnVubnknLCAnaW5zcGlyYXRpb25hbCddKSxcclxuICAgIHBsYXRmb3Jtczogei5hcnJheSh6LmVudW0oWyd0d2l0dGVyJywgJ2ZhY2Vib29rJywgJ2luc3RhZ3JhbScsICdsaW5rZWRpbiddKSksXHJcbiAgICBpbWFnZVVybDogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxyXG4gICAgaW5jbHVkZUhhc2h0YWdzOiB6LmJvb2xlYW4oKS5kZWZhdWx0KHRydWUpLFxyXG4gICAgaGFzaHRhZ0NvdW50OiB6Lm51bWJlcigpLm1pbigxKS5tYXgoMTApLmRlZmF1bHQoMylcclxuICB9KSxcclxuICByZXNwb25zZVNjaGVtYToge1xyXG4gICAgMjAwOiB6Lm9iamVjdCh7XHJcbiAgICAgIHJlcXVlc3RJZDogei5zdHJpbmcoKSxcclxuICAgICAgc3RhdHVzOiB6LnN0cmluZygpLFxyXG4gICAgICBtZXNzYWdlOiB6LnN0cmluZygpXHJcbiAgICB9KSxcclxuICAgIDQwMDogei5vYmplY3Qoe1xyXG4gICAgICBlcnJvcjogei5zdHJpbmcoKVxyXG4gICAgfSlcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlcjogSGFuZGxlcnNbJ0dlbmVyYXRlUG9zdEFQSSddID0gYXN5bmMgKHJlcSwgeyBlbWl0LCBsb2dnZXIsIHN0YXRlIH0pID0+IHtcclxuICBjb25zdCB7IHRvcGljLCB0b25lLCBwbGF0Zm9ybXMsIGltYWdlVXJsLCBpbmNsdWRlSGFzaHRhZ3MsIGhhc2h0YWdDb3VudCB9ID0gcmVxLmJvZHk7XHJcbiAgXHJcbiAgLy8gR2V0IHVzZXIgZnJvbSBhdXRoIGhlYWRlciAoc2ltcGxpZmllZClcclxuICBjb25zdCBhdXRoSGVhZGVyID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbjtcclxuICBpZiAoIWF1dGhIZWFkZXIpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0YXR1czogNDAwLFxyXG4gICAgICBib2R5OiB7IGVycm9yOiAnQXV0aG9yaXphdGlvbiByZXF1aXJlZCcgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyLnJlcGxhY2UoJ0JlYXJlciAnLCAnJyk7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IHN0YXRlLmdldCgnc2Vzc2lvbnMnLCB0b2tlbik7XHJcbiAgaWYgKCFzZXNzaW9uKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzdGF0dXM6IDQwMCxcclxuICAgICAgYm9keTogeyBlcnJvcjogJ0ludmFsaWQgc2Vzc2lvbicgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgY29uc3QgcmVxdWVzdElkID0gYHBvc3RfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KX1gO1xyXG4gIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcclxuICBcclxuICBsb2dnZXIuaW5mbygnUG9zdCBnZW5lcmF0aW9uIHJlcXVlc3RlZCcsIHsgcmVxdWVzdElkLCB0b3BpYywgcGxhdGZvcm1zIH0pO1xyXG4gIFxyXG4gIC8vIFN0b3JlIHJlcXVlc3QgaW4gc3RhdGVcclxuICBhd2FpdCBzdGF0ZS5zZXQoJ3Bvc3RfcmVxdWVzdHMnLCByZXF1ZXN0SWQsIHtcclxuICAgIHJlcXVlc3RJZCxcclxuICAgIHVzZXJJZDogc2Vzc2lvbi51c2VySWQsXHJcbiAgICB0b3BpYyxcclxuICAgIHRvbmUsXHJcbiAgICBwbGF0Zm9ybXMsXHJcbiAgICBpbWFnZVVybCxcclxuICAgIGluY2x1ZGVIYXNodGFncyxcclxuICAgIGhhc2h0YWdDb3VudCxcclxuICAgIHN0YXR1czogJ3BlbmRpbmcnLFxyXG4gICAgY3JlYXRlZEF0OiB0aW1lc3RhbXBcclxuICB9KTtcclxuICBcclxuICAvLyBFbWl0IGV2ZW50IHRvIHN0YXJ0IEFJIGdlbmVyYXRpb25cclxuICBhd2FpdCBlbWl0KHtcclxuICAgIHRvcGljOiAncG9zdC1nZW5lcmF0aW9uLXN0YXJ0ZWQnLFxyXG4gICAgZGF0YToge1xyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHVzZXJJZDogc2Vzc2lvbi51c2VySWQsXHJcbiAgICAgIHRvcGljLFxyXG4gICAgICB0b25lLFxyXG4gICAgICBwbGF0Zm9ybXMsXHJcbiAgICAgIGltYWdlVXJsLFxyXG4gICAgICBpbmNsdWRlSGFzaHRhZ3MsXHJcbiAgICAgIGhhc2h0YWdDb3VudCxcclxuICAgICAgdGltZXN0YW1wXHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgcmV0dXJuIHtcclxuICAgIHN0YXR1czogMjAwLFxyXG4gICAgYm9keToge1xyXG4gICAgICByZXF1ZXN0SWQsXHJcbiAgICAgIHN0YXR1czogJ3Byb2Nlc3NpbmcnLFxyXG4gICAgICBtZXNzYWdlOiAnUG9zdCBnZW5lcmF0aW9uIHN0YXJ0ZWQuIFBvbGwgL3NvY2lhbC9wb3N0LXN0YXR1cy86cmVxdWVzdElkIGZvciByZXN1bHRzLidcclxuICAgIH1cclxuICB9O1xyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiQUFDQSxTQUFTLFNBQVM7QUFFWCxNQUFNLFNBQXlCO0FBQUEsRUFDcEMsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsYUFBYTtBQUFBLEVBQ2IsT0FBTyxDQUFDLHlCQUF5QjtBQUFBLEVBQ2pDLE9BQU8sQ0FBQyxtQkFBbUI7QUFBQSxFQUMzQixZQUFZLEVBQUUsT0FBTztBQUFBLElBQ25CLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDO0FBQUEsSUFDdkIsTUFBTSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsVUFBVSxZQUFZLFNBQVMsZUFBZSxDQUFDO0FBQUEsSUFDN0UsV0FBVyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsV0FBVyxZQUFZLGFBQWEsVUFBVSxDQUFDLENBQUM7QUFBQSxJQUMzRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFNBQVM7QUFBQSxJQUM5QixpQkFBaUIsRUFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJO0FBQUEsSUFDekMsY0FBYyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxRQUFRLENBQUM7QUFBQSxFQUNuRCxDQUFDO0FBQUEsRUFDRCxnQkFBZ0I7QUFBQSxJQUNkLEtBQUssRUFBRSxPQUFPO0FBQUEsTUFDWixXQUFXLEVBQUUsT0FBTztBQUFBLE1BQ3BCLFFBQVEsRUFBRSxPQUFPO0FBQUEsTUFDakIsU0FBUyxFQUFFLE9BQU87QUFBQSxJQUNwQixDQUFDO0FBQUEsSUFDRCxLQUFLLEVBQUUsT0FBTztBQUFBLE1BQ1osT0FBTyxFQUFFLE9BQU87QUFBQSxJQUNsQixDQUFDO0FBQUEsRUFDSDtBQUNGO0FBRU8sTUFBTSxVQUF1QyxPQUFPLEtBQUssRUFBRSxNQUFNLFFBQVEsTUFBTSxNQUFNO0FBQzFGLFFBQU0sRUFBRSxPQUFPLE1BQU0sV0FBVyxVQUFVLGlCQUFpQixhQUFhLElBQUksSUFBSTtBQUdoRixRQUFNLGFBQWEsSUFBSSxRQUFRO0FBQy9CLE1BQUksQ0FBQyxZQUFZO0FBQ2YsV0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsTUFBTSxFQUFFLE9BQU8seUJBQXlCO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBRUEsUUFBTSxRQUFRLFdBQVcsUUFBUSxXQUFXLEVBQUU7QUFDOUMsUUFBTSxVQUFVLE1BQU0sTUFBTSxJQUFJLFlBQVksS0FBSztBQUNqRCxNQUFJLENBQUMsU0FBUztBQUNaLFdBQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLE1BQU0sRUFBRSxPQUFPLGtCQUFrQjtBQUFBLElBQ25DO0FBQUEsRUFDRjtBQUVBLFFBQU0sWUFBWSxRQUFRLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDL0UsUUFBTSxhQUFZLG9CQUFJLEtBQUssR0FBRSxZQUFZO0FBRXpDLFNBQU8sS0FBSyw2QkFBNkIsRUFBRSxXQUFXLE9BQU8sVUFBVSxDQUFDO0FBR3hFLFFBQU0sTUFBTSxJQUFJLGlCQUFpQixXQUFXO0FBQUEsSUFDMUM7QUFBQSxJQUNBLFFBQVEsUUFBUTtBQUFBLElBQ2hCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxFQUNiLENBQUM7QUFHRCxRQUFNLEtBQUs7QUFBQSxJQUNULE9BQU87QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKO0FBQUEsTUFDQSxRQUFRLFFBQVE7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFFRCxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixNQUFNO0FBQUEsTUFDSjtBQUFBLE1BQ0EsUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
