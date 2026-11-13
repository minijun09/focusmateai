# FocusMate AI

**English** · [한국어](README.ko.md)

A study companion for high school students. Set a small goal, focus, take a break, and reflect—one session at a time.

Built with React, TypeScript, and Vite.

## Features

- **Focus and break timers:** Start, pause, resume, or end a session with adjustable durations.
- **Personalized study plans:** Add subjects, tasks, estimates, and priorities. Generate a plan that includes breaks and reflection within your available time, review it, and send a focus item to the timer.
- **Achievement badges:** Recognize a first completed goal, three completed sessions, studying on three different days, and returning after an interruption. Duplicate session records do not earn duplicate credit.
- **Study pattern insights:** Review the past seven days by subject, session duration, completion rate, and time of day when enough records are available.
- **Study coach:** Get a short suggestion with its reasoning. Accepting a suggestion updates the next timer setup; it never starts a session automatically.
- **Return-to-focus reminders:** During a running focus session, returning after the page has been hidden for at least five seconds can show a gentle reminder. Repeated prompts within 60 seconds are suppressed. Reminders are disabled during breaks and pauses, and can be turned off.

The app detects page visibility changes; it does not detect or block YouTube, Instagram, or other apps. Timer duration represents recorded running time, not a measurement of attention or academic performance.

## Getting started

Use Node.js 24 and pnpm 11.25.0.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite.

```sh
pnpm test       # Timer, planning, rewards, insights, and AI validation tests
pnpm build      # Type checking and production build
pnpm preview    # Preview the production build locally
```

## Optional AI connection

The app works with local, rule-based recommendations without an API key. An optional OpenAI integration is implemented, but live API responses have not yet been verified with a configured account.

1. Copy `.env.example` to `.env.local`.
2. Set `OPENAI_API_KEY` and, optionally, `OPENAI_MODEL` on the server. Do not prefix secret keys with `VITE_`.
3. Restart the development server and enable external AI in the coach section. Consent lasts for the current visit only.

With consent, requests include the question, selected subjects, estimated durations, priorities, and seven-day summary metrics. Task titles and individual study records are excluded. API keys stay on the server. Invalid responses and connection failures fall back to local guidance; plan and record changes require the student's action.

The AI endpoint is available through the local Vite development and preview servers. A static deployment supports the local features and requires a separate backend for external AI. Before using external AI with students, confirm provider data handling and the applicable consent process.

API reference: [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

## Your study data

Plans, records, badges, and coaching history stay in the current browser. They are not automatically shared with other visitors or synced across devices. Clearing browser data removes them. The app also provides a full-record deletion option.

Achievement displays can be turned off. Taking a break or missing a day does not incur a penalty.
