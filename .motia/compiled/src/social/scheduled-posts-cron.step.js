const config = {
  name: "ScheduledPostsCron",
  type: "cron",
  cron: "*/5 * * * *",
  // Every 5 minutes
  description: "Process scheduled social media posts",
  emits: ["post-publish-queued"],
  flows: ["social-media-flow"]
};
const handler = async (_, { emit, logger, state }) => {
  logger.info("Checking for scheduled posts");
  const now = /* @__PURE__ */ new Date();
  const timestamp = now.toISOString();
  const scheduledIndex = await state.get("scheduled_posts_index", "all") || { postIds: [] };
  let processedCount = 0;
  for (const publishId of scheduledIndex.postIds) {
    const publishRequest = await state.get("publish_requests", publishId);
    if (!publishRequest) continue;
    if (publishRequest.status !== "scheduled") continue;
    const scheduledTime = new Date(publishRequest.scheduledAt);
    if (scheduledTime <= now) {
      logger.info("Publishing scheduled post", { publishId });
      await state.set("publish_requests", publishId, {
        ...publishRequest,
        status: "pending"
      });
      await emit({
        topic: "post-publish-queued",
        data: {
          publishId,
          userId: publishRequest.userId,
          platforms: publishRequest.platforms,
          content: publishRequest.content,
          imageUrl: publishRequest.imageUrl,
          scheduledAt: null,
          // No longer scheduled
          timestamp
        }
      });
      processedCount++;
    }
  }
  if (processedCount > 0) {
    logger.info("Processed scheduled posts", { count: processedCount });
  }
};
export {
  config,
  handler
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vc3JjL3NvY2lhbC9zY2hlZHVsZWQtcG9zdHMtY3Jvbi5zdGVwLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7IENyb25Db25maWcsIEhhbmRsZXJzIH0gZnJvbSAnbW90aWEnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNvbmZpZzogQ3JvbkNvbmZpZyA9IHtcclxuICBuYW1lOiAnU2NoZWR1bGVkUG9zdHNDcm9uJyxcclxuICB0eXBlOiAnY3JvbicsXHJcbiAgY3JvbjogJyovNSAqICogKiAqJywgLy8gRXZlcnkgNSBtaW51dGVzXHJcbiAgZGVzY3JpcHRpb246ICdQcm9jZXNzIHNjaGVkdWxlZCBzb2NpYWwgbWVkaWEgcG9zdHMnLFxyXG4gIGVtaXRzOiBbJ3Bvc3QtcHVibGlzaC1xdWV1ZWQnXSxcclxuICBmbG93czogWydzb2NpYWwtbWVkaWEtZmxvdyddXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlcjogSGFuZGxlcnNbJ1NjaGVkdWxlZFBvc3RzQ3JvbiddID0gYXN5bmMgKF8sIHsgZW1pdCwgbG9nZ2VyLCBzdGF0ZSB9KSA9PiB7XHJcbiAgbG9nZ2VyLmluZm8oJ0NoZWNraW5nIGZvciBzY2hlZHVsZWQgcG9zdHMnKTtcclxuICBcclxuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gIGNvbnN0IHRpbWVzdGFtcCA9IG5vdy50b0lTT1N0cmluZygpO1xyXG4gIFxyXG4gIC8vIEluIHByb2R1Y3Rpb24sIHF1ZXJ5IGRhdGFiYXNlIGZvciBzY2hlZHVsZWQgcG9zdHNcclxuICAvLyBGb3IgZGVtbywgd2Ugc2NhbiBzdGF0ZSAobm90IGVmZmljaWVudCBmb3IgcHJvZHVjdGlvbilcclxuICBcclxuICAvLyBHZXQgc2NoZWR1bGVkIHBvc3RzIGluZGV4XHJcbiAgY29uc3Qgc2NoZWR1bGVkSW5kZXggPSBhd2FpdCBzdGF0ZS5nZXQoJ3NjaGVkdWxlZF9wb3N0c19pbmRleCcsICdhbGwnKSB8fCB7IHBvc3RJZHM6IFtdIH07XHJcbiAgXHJcbiAgbGV0IHByb2Nlc3NlZENvdW50ID0gMDtcclxuICBcclxuICBmb3IgKGNvbnN0IHB1Ymxpc2hJZCBvZiBzY2hlZHVsZWRJbmRleC5wb3N0SWRzKSB7XHJcbiAgICBjb25zdCBwdWJsaXNoUmVxdWVzdCA9IGF3YWl0IHN0YXRlLmdldCgncHVibGlzaF9yZXF1ZXN0cycsIHB1Ymxpc2hJZCk7XHJcbiAgICBcclxuICAgIGlmICghcHVibGlzaFJlcXVlc3QpIGNvbnRpbnVlO1xyXG4gICAgaWYgKHB1Ymxpc2hSZXF1ZXN0LnN0YXR1cyAhPT0gJ3NjaGVkdWxlZCcpIGNvbnRpbnVlO1xyXG4gICAgXHJcbiAgICBjb25zdCBzY2hlZHVsZWRUaW1lID0gbmV3IERhdGUocHVibGlzaFJlcXVlc3Quc2NoZWR1bGVkQXQpO1xyXG4gICAgXHJcbiAgICAvLyBDaGVjayBpZiBpdCdzIHRpbWUgdG8gcHVibGlzaFxyXG4gICAgaWYgKHNjaGVkdWxlZFRpbWUgPD0gbm93KSB7XHJcbiAgICAgIGxvZ2dlci5pbmZvKCdQdWJsaXNoaW5nIHNjaGVkdWxlZCBwb3N0JywgeyBwdWJsaXNoSWQgfSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBVcGRhdGUgc3RhdHVzXHJcbiAgICAgIGF3YWl0IHN0YXRlLnNldCgncHVibGlzaF9yZXF1ZXN0cycsIHB1Ymxpc2hJZCwge1xyXG4gICAgICAgIC4uLnB1Ymxpc2hSZXF1ZXN0LFxyXG4gICAgICAgIHN0YXR1czogJ3BlbmRpbmcnXHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgLy8gUXVldWUgZm9yIHB1Ymxpc2hpbmdcclxuICAgICAgYXdhaXQgZW1pdCh7XHJcbiAgICAgICAgdG9waWM6ICdwb3N0LXB1Ymxpc2gtcXVldWVkJyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICBwdWJsaXNoSWQsXHJcbiAgICAgICAgICB1c2VySWQ6IHB1Ymxpc2hSZXF1ZXN0LnVzZXJJZCxcclxuICAgICAgICAgIHBsYXRmb3JtczogcHVibGlzaFJlcXVlc3QucGxhdGZvcm1zLFxyXG4gICAgICAgICAgY29udGVudDogcHVibGlzaFJlcXVlc3QuY29udGVudCxcclxuICAgICAgICAgIGltYWdlVXJsOiBwdWJsaXNoUmVxdWVzdC5pbWFnZVVybCxcclxuICAgICAgICAgIHNjaGVkdWxlZEF0OiBudWxsLCAvLyBObyBsb25nZXIgc2NoZWR1bGVkXHJcbiAgICAgICAgICB0aW1lc3RhbXBcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgcHJvY2Vzc2VkQ291bnQrKztcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgaWYgKHByb2Nlc3NlZENvdW50ID4gMCkge1xyXG4gICAgbG9nZ2VyLmluZm8oJ1Byb2Nlc3NlZCBzY2hlZHVsZWQgcG9zdHMnLCB7IGNvdW50OiBwcm9jZXNzZWRDb3VudCB9KTtcclxuICB9XHJcbn07XHJcbiJdLAogICJtYXBwaW5ncyI6ICJBQUVPLE1BQU0sU0FBcUI7QUFBQSxFQUNoQyxNQUFNO0FBQUEsRUFDTixNQUFNO0FBQUEsRUFDTixNQUFNO0FBQUE7QUFBQSxFQUNOLGFBQWE7QUFBQSxFQUNiLE9BQU8sQ0FBQyxxQkFBcUI7QUFBQSxFQUM3QixPQUFPLENBQUMsbUJBQW1CO0FBQzdCO0FBRU8sTUFBTSxVQUEwQyxPQUFPLEdBQUcsRUFBRSxNQUFNLFFBQVEsTUFBTSxNQUFNO0FBQzNGLFNBQU8sS0FBSyw4QkFBOEI7QUFFMUMsUUFBTSxNQUFNLG9CQUFJLEtBQUs7QUFDckIsUUFBTSxZQUFZLElBQUksWUFBWTtBQU1sQyxRQUFNLGlCQUFpQixNQUFNLE1BQU0sSUFBSSx5QkFBeUIsS0FBSyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUU7QUFFeEYsTUFBSSxpQkFBaUI7QUFFckIsYUFBVyxhQUFhLGVBQWUsU0FBUztBQUM5QyxVQUFNLGlCQUFpQixNQUFNLE1BQU0sSUFBSSxvQkFBb0IsU0FBUztBQUVwRSxRQUFJLENBQUMsZUFBZ0I7QUFDckIsUUFBSSxlQUFlLFdBQVcsWUFBYTtBQUUzQyxVQUFNLGdCQUFnQixJQUFJLEtBQUssZUFBZSxXQUFXO0FBR3pELFFBQUksaUJBQWlCLEtBQUs7QUFDeEIsYUFBTyxLQUFLLDZCQUE2QixFQUFFLFVBQVUsQ0FBQztBQUd0RCxZQUFNLE1BQU0sSUFBSSxvQkFBb0IsV0FBVztBQUFBLFFBQzdDLEdBQUc7QUFBQSxRQUNILFFBQVE7QUFBQSxNQUNWLENBQUM7QUFHRCxZQUFNLEtBQUs7QUFBQSxRQUNULE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxVQUNKO0FBQUEsVUFDQSxRQUFRLGVBQWU7QUFBQSxVQUN2QixXQUFXLGVBQWU7QUFBQSxVQUMxQixTQUFTLGVBQWU7QUFBQSxVQUN4QixVQUFVLGVBQWU7QUFBQSxVQUN6QixhQUFhO0FBQUE7QUFBQSxVQUNiO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUVEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxNQUFJLGlCQUFpQixHQUFHO0FBQ3RCLFdBQU8sS0FBSyw2QkFBNkIsRUFBRSxPQUFPLGVBQWUsQ0FBQztBQUFBLEVBQ3BFO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
