# AI-Assisted Job Application & Social Media Platform

A comprehensive platform built with **Motia** that helps job seekers automate their job search and social media presence using AI.

## 🚀 Features

### Social Media Automation (Phase 3)
- **AI-Powered Post Generation**: Generate engaging content for Twitter, Facebook, Instagram, and LinkedIn
- **Multi-Platform Posting**: Publish to multiple platforms simultaneously
- **Post Scheduling**: Schedule posts for optimal engagement times
- **OAuth Integration**: Securely connect your social media accounts

### Resume Parsing & Profile (Phase 4)
- **Resume Upload**: Support for PDF and DOCX formats
- **AI-Powered Parsing**: Extract skills, experience, education automatically
- **Profile Management**: Build and update your professional profile

### Job Discovery (Phase 5)
- **Automated Job Search**: Discover jobs from multiple sources
- **Smart Filtering**: Filter by location, remote options, salary range
- **Real-Time Updates**: Cron jobs for continuous job discovery

### AI Job Matching (Phase 6)
- **Skill Matching**: Compare your skills with job requirements
- **Match Scores**: Get compatibility scores for each job (0-100%)
- **Recommendations**: AI-powered suggestions for better matches

### Assisted Apply (Phase 7)
- **Cover Letter Generation**: AI-generated cover letters tailored to each job
- **Form Pre-filling**: Auto-fill application forms with your profile data
- **User Control**: You always click the final submit button

### Job Tracking Dashboard (Phase 8)
- **Application Status**: Track Applied, Interview, Offer, Rejected
- **Progress Analytics**: See your application statistics
- **Notes & Reminders**: Keep track of important details

## 🛠️ Tech Stack

- **Backend Framework**: [Motia](https://motia.dev) - Unified backend with Steps
- **Languages**: TypeScript, Python, JavaScript (Polyglot)
- **Queue System**: BullMQ with Redis
- **State Management**: Motia States Plugin
- **AI**: OpenAI GPT-4 / Google Gemini
- **Validation**: Zod (TypeScript), Pydantic (Python)

## 📁 Project Structure

```
src/
├── auth/                    # Authentication & OAuth
├── social/                  # Social Media Automation
├── profile/                 # Profile & Resume Management
├── jobs/                    # Job Discovery & Matching
├── applications/            # Job Applications
├── dashboard/               # User Dashboard
├── system/                  # System & Security
└── hello/                   # Demo endpoints
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Redis (for queues)

### Installation

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your API keys
```

### Development

```bash
# Start development server with Workbench
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the Motia Workbench.

```bash
# Test your first endpoint
curl http://localhost:3000/hello
```

## How It Works

1. **TypeScript API Step** receives the HTTP request at `/hello`
2. It emits a `process-greeting` event with the request data
3. **Python Event Step** picks up the event, processes it, and stores the result in state
4. Python emits a `greeting-processed` event
5. **JavaScript Event Step** logs the completed workflow

## Step Types

Every Step has a `type` that defines how it triggers:

| Type | When it runs | Use case |
|------|--------------|----------|
| **`api`** | HTTP request | REST APIs, webhooks |
| **`event`** | Event emitted | Background jobs, workflows |
| **`cron`** | Schedule | Cleanup, reports, reminders |

## Development Commands

```bash
# Start Workbench and development server
npm run dev
# or
yarn dev
# or
pnpm dev

# Start production server (without hot reload)
npm run start
# or
yarn start
# or
pnpm start

# Generate TypeScript types from Step configs
npm run generate-types
# or
yarn generate-types
# or
pnpm generate-types

# Build project for deployment
npm run build
# or
yarn build
# or
pnpm build
```

## Project Structure

```
steps/                           # Your Step definitions
├── hello/
│   ├── hello-api.step.ts       # TypeScript API endpoint
│   ├── process_greeting_step.py # Python event processor
│   └── log-greeting.step.js    # JavaScript logger
motia.config.ts                  # Motia configuration
requirements.txt                 # Python dependencies
```

Steps are auto-discovered from your `steps/` or `src/` directories - no manual registration required.

## Learn More

- [Documentation](https://motia.dev/docs) - Complete guides and API reference
- [Quick Start Guide](https://motia.dev/docs/getting-started/quick-start) - Detailed getting started tutorial
- [Core Concepts](https://motia.dev/docs/concepts/overview) - Learn about Steps and Motia architecture
- [Discord Community](https://discord.gg/motia) - Get help and connect with other developers