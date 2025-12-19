const config = {
  name: "JobDiscoveryCron",
  type: "cron",
  cron: "0 */6 * * *",
  // Every 6 hours
  description: "Periodically discover new jobs from various sources",
  emits: ["jobs-discovered"],
  flows: ["job-discovery-flow"]
};
const JOB_SOURCES = [
  { name: "company-careers", baseUrl: "https://careers.example.com" },
  { name: "remote-jobs", baseUrl: "https://remotejobs.example.com" },
  { name: "startup-jobs", baseUrl: "https://startupjobs.example.com" }
];
async function scrapeJobSource(source) {
  const mockJobs = [
    {
      title: "Senior Backend Engineer",
      company: "TechStartup",
      location: "Remote",
      description: "Build scalable APIs using Node.js and Python",
      requirements: ["Node.js", "Python", "PostgreSQL", "AWS"],
      salary: "$140k - $180k",
      applyUrl: `${source.baseUrl}/jobs/1`,
      source: source.name
    },
    {
      title: "Full Stack Developer",
      company: "InnovateCorp",
      location: "New York, NY",
      description: "Work on web applications using React and Django",
      requirements: ["React", "Django", "TypeScript", "PostgreSQL"],
      salary: "$120k - $160k",
      applyUrl: `${source.baseUrl}/jobs/2`,
      source: source.name
    }
  ];
  return mockJobs;
}
const handler = async (_, { emit, logger, state }) => {
  logger.info("Starting job discovery cron");
  const allJobs = [];
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  for (const source of JOB_SOURCES) {
    try {
      logger.info(`Scraping ${source.name}`);
      const jobs = await scrapeJobSource(source);
      allJobs.push(...jobs);
      logger.info(`Found ${jobs.length} jobs from ${source.name}`);
    } catch (error) {
      logger.error(`Failed to scrape ${source.name}`, { error: String(error) });
    }
  }
  const uniqueJobs = allJobs.map((job, index) => ({
    id: `job_${Date.now()}_${index}`,
    ...job,
    discoveredAt: timestamp
  }));
  for (const job of uniqueJobs) {
    await state.set("jobs", job.id, job);
  }
  await state.set("job_discovery_runs", timestamp, {
    runAt: timestamp,
    jobsFound: uniqueJobs.length,
    sources: JOB_SOURCES.map((s) => s.name)
  });
  await emit({
    topic: "jobs-discovered",
    data: {
      jobs: uniqueJobs,
      count: uniqueJobs.length,
      timestamp
    }
  });
  logger.info("Job discovery completed", { jobsFound: uniqueJobs.length });
};
export {
  config,
  handler
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vc3JjL2pvYnMvam9iLWRpc2NvdmVyeS1jcm9uLnN0ZXAudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB0eXBlIHsgQ3JvbkNvbmZpZywgSGFuZGxlcnMgfSBmcm9tICdtb3RpYSc7XHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNvbmZpZzogQ3JvbkNvbmZpZyA9IHtcclxuICBuYW1lOiAnSm9iRGlzY292ZXJ5Q3JvbicsXHJcbiAgdHlwZTogJ2Nyb24nLFxyXG4gIGNyb246ICcwICovNiAqICogKicsIC8vIEV2ZXJ5IDYgaG91cnNcclxuICBkZXNjcmlwdGlvbjogJ1BlcmlvZGljYWxseSBkaXNjb3ZlciBuZXcgam9icyBmcm9tIHZhcmlvdXMgc291cmNlcycsXHJcbiAgZW1pdHM6IFsnam9icy1kaXNjb3ZlcmVkJ10sXHJcbiAgZmxvd3M6IFsnam9iLWRpc2NvdmVyeS1mbG93J11cclxufTtcclxuXHJcbi8vIE1vY2sgam9iIHNvdXJjZXMgLSBpbiBwcm9kdWN0aW9uLCB1c2UgYWN0dWFsIEFQSXNcclxuY29uc3QgSk9CX1NPVVJDRVMgPSBbXHJcbiAgeyBuYW1lOiAnY29tcGFueS1jYXJlZXJzJywgYmFzZVVybDogJ2h0dHBzOi8vY2FyZWVycy5leGFtcGxlLmNvbScgfSxcclxuICB7IG5hbWU6ICdyZW1vdGUtam9icycsIGJhc2VVcmw6ICdodHRwczovL3JlbW90ZWpvYnMuZXhhbXBsZS5jb20nIH0sXHJcbiAgeyBuYW1lOiAnc3RhcnR1cC1qb2JzJywgYmFzZVVybDogJ2h0dHBzOi8vc3RhcnR1cGpvYnMuZXhhbXBsZS5jb20nIH1cclxuXTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNjcmFwZUpvYlNvdXJjZShzb3VyY2U6IHsgbmFtZTogc3RyaW5nOyBiYXNlVXJsOiBzdHJpbmcgfSk6IFByb21pc2U8YW55W10+IHtcclxuICAvLyBJbiBwcm9kdWN0aW9uLCB1c2UgUGxheXdyaWdodC9QdXBwZXRlZXIgZm9yIHNjcmFwaW5nXHJcbiAgLy8gT3IgY2FsbCBqb2IgYm9hcmQgQVBJc1xyXG4gIFxyXG4gIGNvbnN0IG1vY2tKb2JzID0gW1xyXG4gICAge1xyXG4gICAgICB0aXRsZTogJ1NlbmlvciBCYWNrZW5kIEVuZ2luZWVyJyxcclxuICAgICAgY29tcGFueTogJ1RlY2hTdGFydHVwJyxcclxuICAgICAgbG9jYXRpb246ICdSZW1vdGUnLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ0J1aWxkIHNjYWxhYmxlIEFQSXMgdXNpbmcgTm9kZS5qcyBhbmQgUHl0aG9uJyxcclxuICAgICAgcmVxdWlyZW1lbnRzOiBbJ05vZGUuanMnLCAnUHl0aG9uJywgJ1Bvc3RncmVTUUwnLCAnQVdTJ10sXHJcbiAgICAgIHNhbGFyeTogJyQxNDBrIC0gJDE4MGsnLFxyXG4gICAgICBhcHBseVVybDogYCR7c291cmNlLmJhc2VVcmx9L2pvYnMvMWAsXHJcbiAgICAgIHNvdXJjZTogc291cmNlLm5hbWVcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHRpdGxlOiAnRnVsbCBTdGFjayBEZXZlbG9wZXInLFxyXG4gICAgICBjb21wYW55OiAnSW5ub3ZhdGVDb3JwJyxcclxuICAgICAgbG9jYXRpb246ICdOZXcgWW9yaywgTlknLFxyXG4gICAgICBkZXNjcmlwdGlvbjogJ1dvcmsgb24gd2ViIGFwcGxpY2F0aW9ucyB1c2luZyBSZWFjdCBhbmQgRGphbmdvJyxcclxuICAgICAgcmVxdWlyZW1lbnRzOiBbJ1JlYWN0JywgJ0RqYW5nbycsICdUeXBlU2NyaXB0JywgJ1Bvc3RncmVTUUwnXSxcclxuICAgICAgc2FsYXJ5OiAnJDEyMGsgLSAkMTYwaycsXHJcbiAgICAgIGFwcGx5VXJsOiBgJHtzb3VyY2UuYmFzZVVybH0vam9icy8yYCxcclxuICAgICAgc291cmNlOiBzb3VyY2UubmFtZVxyXG4gICAgfVxyXG4gIF07XHJcbiAgXHJcbiAgcmV0dXJuIG1vY2tKb2JzO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlcjogSGFuZGxlcnNbJ0pvYkRpc2NvdmVyeUNyb24nXSA9IGFzeW5jIChfLCB7IGVtaXQsIGxvZ2dlciwgc3RhdGUgfSkgPT4ge1xyXG4gIGxvZ2dlci5pbmZvKCdTdGFydGluZyBqb2IgZGlzY292ZXJ5IGNyb24nKTtcclxuICBcclxuICBjb25zdCBhbGxKb2JzOiBhbnlbXSA9IFtdO1xyXG4gIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcclxuICBcclxuICAvLyBTY3JhcGUgZWFjaCBzb3VyY2VcclxuICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBKT0JfU09VUkNFUykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgbG9nZ2VyLmluZm8oYFNjcmFwaW5nICR7c291cmNlLm5hbWV9YCk7XHJcbiAgICAgIGNvbnN0IGpvYnMgPSBhd2FpdCBzY3JhcGVKb2JTb3VyY2Uoc291cmNlKTtcclxuICAgICAgYWxsSm9icy5wdXNoKC4uLmpvYnMpO1xyXG4gICAgICBsb2dnZXIuaW5mbyhgRm91bmQgJHtqb2JzLmxlbmd0aH0gam9icyBmcm9tICR7c291cmNlLm5hbWV9YCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBsb2dnZXIuZXJyb3IoYEZhaWxlZCB0byBzY3JhcGUgJHtzb3VyY2UubmFtZX1gLCB7IGVycm9yOiBTdHJpbmcoZXJyb3IpIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvLyBEZWR1cGxpY2F0ZSBqb2JzXHJcbiAgY29uc3QgdW5pcXVlSm9icyA9IGFsbEpvYnMubWFwKChqb2IsIGluZGV4KSA9PiAoe1xyXG4gICAgaWQ6IGBqb2JfJHtEYXRlLm5vdygpfV8ke2luZGV4fWAsXHJcbiAgICAuLi5qb2IsXHJcbiAgICBkaXNjb3ZlcmVkQXQ6IHRpbWVzdGFtcFxyXG4gIH0pKTtcclxuICBcclxuICAvLyBTdG9yZSBqb2JzXHJcbiAgZm9yIChjb25zdCBqb2Igb2YgdW5pcXVlSm9icykge1xyXG4gICAgYXdhaXQgc3RhdGUuc2V0KCdqb2JzJywgam9iLmlkLCBqb2IpO1xyXG4gIH1cclxuICBcclxuICAvLyBTdG9yZSBkaXNjb3Zlcnkgc3VtbWFyeVxyXG4gIGF3YWl0IHN0YXRlLnNldCgnam9iX2Rpc2NvdmVyeV9ydW5zJywgdGltZXN0YW1wLCB7XHJcbiAgICBydW5BdDogdGltZXN0YW1wLFxyXG4gICAgam9ic0ZvdW5kOiB1bmlxdWVKb2JzLmxlbmd0aCxcclxuICAgIHNvdXJjZXM6IEpPQl9TT1VSQ0VTLm1hcChzID0+IHMubmFtZSlcclxuICB9KTtcclxuICBcclxuICAvLyBFbWl0IGZvciB1c2VyIG1hdGNoaW5nXHJcbiAgYXdhaXQgZW1pdCh7XHJcbiAgICB0b3BpYzogJ2pvYnMtZGlzY292ZXJlZCcsXHJcbiAgICBkYXRhOiB7XHJcbiAgICAgIGpvYnM6IHVuaXF1ZUpvYnMsXHJcbiAgICAgIGNvdW50OiB1bmlxdWVKb2JzLmxlbmd0aCxcclxuICAgICAgdGltZXN0YW1wXHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgXHJcbiAgbG9nZ2VyLmluZm8oJ0pvYiBkaXNjb3ZlcnkgY29tcGxldGVkJywgeyBqb2JzRm91bmQ6IHVuaXF1ZUpvYnMubGVuZ3RoIH0pO1xyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiQUFHTyxNQUFNLFNBQXFCO0FBQUEsRUFDaEMsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBO0FBQUEsRUFDTixhQUFhO0FBQUEsRUFDYixPQUFPLENBQUMsaUJBQWlCO0FBQUEsRUFDekIsT0FBTyxDQUFDLG9CQUFvQjtBQUM5QjtBQUdBLE1BQU0sY0FBYztBQUFBLEVBQ2xCLEVBQUUsTUFBTSxtQkFBbUIsU0FBUyw4QkFBOEI7QUFBQSxFQUNsRSxFQUFFLE1BQU0sZUFBZSxTQUFTLGlDQUFpQztBQUFBLEVBQ2pFLEVBQUUsTUFBTSxnQkFBZ0IsU0FBUyxrQ0FBa0M7QUFDckU7QUFFQSxlQUFlLGdCQUFnQixRQUEyRDtBQUl4RixRQUFNLFdBQVc7QUFBQSxJQUNmO0FBQUEsTUFDRSxPQUFPO0FBQUEsTUFDUCxTQUFTO0FBQUEsTUFDVCxVQUFVO0FBQUEsTUFDVixhQUFhO0FBQUEsTUFDYixjQUFjLENBQUMsV0FBVyxVQUFVLGNBQWMsS0FBSztBQUFBLE1BQ3ZELFFBQVE7QUFBQSxNQUNSLFVBQVUsR0FBRyxPQUFPLE9BQU87QUFBQSxNQUMzQixRQUFRLE9BQU87QUFBQSxJQUNqQjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQU87QUFBQSxNQUNQLFNBQVM7QUFBQSxNQUNULFVBQVU7QUFBQSxNQUNWLGFBQWE7QUFBQSxNQUNiLGNBQWMsQ0FBQyxTQUFTLFVBQVUsY0FBYyxZQUFZO0FBQUEsTUFDNUQsUUFBUTtBQUFBLE1BQ1IsVUFBVSxHQUFHLE9BQU8sT0FBTztBQUFBLE1BQzNCLFFBQVEsT0FBTztBQUFBLElBQ2pCO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFDVDtBQUVPLE1BQU0sVUFBd0MsT0FBTyxHQUFHLEVBQUUsTUFBTSxRQUFRLE1BQU0sTUFBTTtBQUN6RixTQUFPLEtBQUssNkJBQTZCO0FBRXpDLFFBQU0sVUFBaUIsQ0FBQztBQUN4QixRQUFNLGFBQVksb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFHekMsYUFBVyxVQUFVLGFBQWE7QUFDaEMsUUFBSTtBQUNGLGFBQU8sS0FBSyxZQUFZLE9BQU8sSUFBSSxFQUFFO0FBQ3JDLFlBQU0sT0FBTyxNQUFNLGdCQUFnQixNQUFNO0FBQ3pDLGNBQVEsS0FBSyxHQUFHLElBQUk7QUFDcEIsYUFBTyxLQUFLLFNBQVMsS0FBSyxNQUFNLGNBQWMsT0FBTyxJQUFJLEVBQUU7QUFBQSxJQUM3RCxTQUFTLE9BQU87QUFDZCxhQUFPLE1BQU0sb0JBQW9CLE9BQU8sSUFBSSxJQUFJLEVBQUUsT0FBTyxPQUFPLEtBQUssRUFBRSxDQUFDO0FBQUEsSUFDMUU7QUFBQSxFQUNGO0FBR0EsUUFBTSxhQUFhLFFBQVEsSUFBSSxDQUFDLEtBQUssV0FBVztBQUFBLElBQzlDLElBQUksT0FBTyxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUs7QUFBQSxJQUM5QixHQUFHO0FBQUEsSUFDSCxjQUFjO0FBQUEsRUFDaEIsRUFBRTtBQUdGLGFBQVcsT0FBTyxZQUFZO0FBQzVCLFVBQU0sTUFBTSxJQUFJLFFBQVEsSUFBSSxJQUFJLEdBQUc7QUFBQSxFQUNyQztBQUdBLFFBQU0sTUFBTSxJQUFJLHNCQUFzQixXQUFXO0FBQUEsSUFDL0MsT0FBTztBQUFBLElBQ1AsV0FBVyxXQUFXO0FBQUEsSUFDdEIsU0FBUyxZQUFZLElBQUksT0FBSyxFQUFFLElBQUk7QUFBQSxFQUN0QyxDQUFDO0FBR0QsUUFBTSxLQUFLO0FBQUEsSUFDVCxPQUFPO0FBQUEsSUFDUCxNQUFNO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixPQUFPLFdBQVc7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFFRCxTQUFPLEtBQUssMkJBQTJCLEVBQUUsV0FBVyxXQUFXLE9BQU8sQ0FBQztBQUN6RTsiLAogICJuYW1lcyI6IFtdCn0K
