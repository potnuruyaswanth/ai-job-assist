import { z } from "zod";
const config = {
  name: "HelloAPI",
  type: "api",
  path: "/hello",
  method: "GET",
  description: "Receives hello request and emits event for Python processing",
  emits: ["process-greeting"],
  flows: ["hello-world-flow"],
  responseSchema: {
    200: z.object({
      message: z.string(),
      status: z.string(),
      appName: z.string()
    })
  }
};
const handler = async (_, { emit, logger }) => {
  const appName = process.env.APP_NAME || "Motia App";
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  logger.info("Hello API endpoint called (TypeScript)", { appName, timestamp });
  await emit({
    topic: "process-greeting",
    data: {
      timestamp,
      appName,
      greetingPrefix: process.env.GREETING_PREFIX || "Hello",
      requestId: Math.random().toString(36).substring(7)
    }
  });
  return {
    status: 200,
    body: {
      message: "Hello request received! Processing in Python...",
      status: "processing",
      appName
    }
  };
};
export {
  config,
  handler
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vc3JjL2hlbGxvL2hlbGxvLWFwaS5zdGVwLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdHlwZSB7IEFwaVJvdXRlQ29uZmlnLCBIYW5kbGVycyB9IGZyb20gJ21vdGlhJztcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG5leHBvcnQgY29uc3QgY29uZmlnOiBBcGlSb3V0ZUNvbmZpZyA9IHtcbiAgbmFtZTogJ0hlbGxvQVBJJyxcbiAgdHlwZTogJ2FwaScsXG4gIHBhdGg6ICcvaGVsbG8nLFxuICBtZXRob2Q6ICdHRVQnLFxuICBkZXNjcmlwdGlvbjogJ1JlY2VpdmVzIGhlbGxvIHJlcXVlc3QgYW5kIGVtaXRzIGV2ZW50IGZvciBQeXRob24gcHJvY2Vzc2luZycsXG4gIGVtaXRzOiBbJ3Byb2Nlc3MtZ3JlZXRpbmcnXSxcbiAgZmxvd3M6IFsnaGVsbG8td29ybGQtZmxvdyddLFxuICByZXNwb25zZVNjaGVtYToge1xuICAgIDIwMDogei5vYmplY3Qoe1xuICAgICAgbWVzc2FnZTogei5zdHJpbmcoKSxcbiAgICAgIHN0YXR1czogei5zdHJpbmcoKSxcbiAgICAgIGFwcE5hbWU6IHouc3RyaW5nKClcbiAgICB9KVxuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaGFuZGxlcjogSGFuZGxlcnNbJ0hlbGxvQVBJJ10gPSBhc3luYyAoXywgeyBlbWl0LCBsb2dnZXIgfSkgPT4ge1xuICBjb25zdCBhcHBOYW1lID0gcHJvY2Vzcy5lbnYuQVBQX05BTUUgfHwgJ01vdGlhIEFwcCc7XG4gIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgXG4gIGxvZ2dlci5pbmZvKCdIZWxsbyBBUEkgZW5kcG9pbnQgY2FsbGVkIChUeXBlU2NyaXB0KScsIHsgYXBwTmFtZSwgdGltZXN0YW1wIH0pO1xuICBcbiAgLy8gRW1pdCBldmVudCBmb3IgYmFja2dyb3VuZCBwcm9jZXNzaW5nIGluIFB5dGhvblxuICBhd2FpdCBlbWl0KHtcbiAgICB0b3BpYzogJ3Byb2Nlc3MtZ3JlZXRpbmcnLFxuICAgIGRhdGE6IHtcbiAgICAgIHRpbWVzdGFtcCxcbiAgICAgIGFwcE5hbWUsXG4gICAgICBncmVldGluZ1ByZWZpeDogcHJvY2Vzcy5lbnYuR1JFRVRJTkdfUFJFRklYIHx8ICdIZWxsbycsXG4gICAgICByZXF1ZXN0SWQ6IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KVxuICAgIH1cbiAgfSk7XG4gIFxuICByZXR1cm4ge1xuICAgIHN0YXR1czogMjAwLFxuICAgIGJvZHk6IHtcbiAgICAgIG1lc3NhZ2U6ICdIZWxsbyByZXF1ZXN0IHJlY2VpdmVkISBQcm9jZXNzaW5nIGluIFB5dGhvbi4uLicsXG4gICAgICBzdGF0dXM6ICdwcm9jZXNzaW5nJyxcbiAgICAgIGFwcE5hbWVcbiAgICB9XG4gIH07XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIkFBQ0EsU0FBUyxTQUFTO0FBRVgsTUFBTSxTQUF5QjtBQUFBLEVBQ3BDLE1BQU07QUFBQSxFQUNOLE1BQU07QUFBQSxFQUNOLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxFQUNSLGFBQWE7QUFBQSxFQUNiLE9BQU8sQ0FBQyxrQkFBa0I7QUFBQSxFQUMxQixPQUFPLENBQUMsa0JBQWtCO0FBQUEsRUFDMUIsZ0JBQWdCO0FBQUEsSUFDZCxLQUFLLEVBQUUsT0FBTztBQUFBLE1BQ1osU0FBUyxFQUFFLE9BQU87QUFBQSxNQUNsQixRQUFRLEVBQUUsT0FBTztBQUFBLE1BQ2pCLFNBQVMsRUFBRSxPQUFPO0FBQUEsSUFDcEIsQ0FBQztBQUFBLEVBQ0g7QUFDRjtBQUVPLE1BQU0sVUFBZ0MsT0FBTyxHQUFHLEVBQUUsTUFBTSxPQUFPLE1BQU07QUFDMUUsUUFBTSxVQUFVLFFBQVEsSUFBSSxZQUFZO0FBQ3hDLFFBQU0sYUFBWSxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUV6QyxTQUFPLEtBQUssMENBQTBDLEVBQUUsU0FBUyxVQUFVLENBQUM7QUFHNUUsUUFBTSxLQUFLO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxNQUFNO0FBQUEsTUFDSjtBQUFBLE1BQ0E7QUFBQSxNQUNBLGdCQUFnQixRQUFRLElBQUksbUJBQW1CO0FBQUEsTUFDL0MsV0FBVyxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxVQUFVLENBQUM7QUFBQSxJQUNuRDtBQUFBLEVBQ0YsQ0FBQztBQUVELFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLE1BQU07QUFBQSxNQUNKLFNBQVM7QUFBQSxNQUNULFFBQVE7QUFBQSxNQUNSO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
