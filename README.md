# FocusMate AI

**English** · [한국어](README.ko.md)

A study companion for high school students. Set a small goal, focus, take a break, and reflect—one session at a time.

Built with React, TypeScript, and Vite. This README is available in English and Korean; the app interface currently uses Korean.

## What you can do

| Feature | Current behavior |
| --- | --- |
| Focus and break timers | Adjust durations, start, pause, resume, or end a session. Pauses and breaks are excluded from recorded focus time. |
| Session reflection | Save a goal as completed, partially completed, or incomplete, with an optional difficulty rating. |
| Personalized study plans | Add subjects, tasks, estimated durations, and priorities. Generate an editable draft that includes breaks and two minutes of reflection within the available time, then confirm it. |
| Achievement badges | Recognize a first completed goal, three completed sessions, records on three different days, and returning after an interruption on the same day. Duplicate session IDs do not earn duplicate credit. |
| Study pattern insights | Review seven days of recorded time, subject totals, average session duration, and session goal completion rate. Time-of-day suggestions require at least three records in that period. |
| Study coach | Choose a concern or enter a question. Get a short suggestion with its reasoning, then accept it or skip it. |
| Return-to-focus reminders | Returning after a running focus page has been hidden for at least five seconds can show a reminder. Prompts within 60 seconds of the previous reminder are suppressed. |

Study setup appears before the timer on mobile and to its left on wider screens. Selecting a plan item or accepting a coaching suggestion prepares the next timer; the student starts it manually. Timer setup and plan confirmation are locked while a session is running, paused, awaiting recovery, or awaiting reflection.

Plans do not advance automatically through focus, break, and reflection items. Use the timer controls to start each session or break. Tasks remain in the task list, and completed focus items are marked from their saved session results.

## How recommendations and insights work

Without external AI, recommendations use local rules. With fewer than three records, the selected focus length is retained. Among the latest five records, two or more difficult ratings or two or more interruptions can shorten the suggested focus length to at most 15 minutes. Local coaching uses preset strategies for starting, tiredness, planning, and reviewing records; it is not an unrestricted conversational model.

The seven-day goal completion rate is **completed sessions ÷ recorded sessions**. Partial and incomplete results remain in the denominator. This differs from the completion count shown for a confirmed plan. Daily totals use the session's end date and the browser's local time zone; a session crossing midnight is not split between dates.

Timers record running time, not actual attention or academic performance. Page visibility changes do not identify or block YouTube, Instagram, or other apps. Return reminders do not automatically pause the timer or mark a session as failed, and they are suppressed during breaks, pauses, and completed sessions.

## Getting started

Use Node.js 24 and pnpm 11.25.0, matching the project configuration.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173/`.

```sh
pnpm test       # Timer, study logic, and AI request/response validation
pnpm build      # Type checking and production build
pnpm preview    # Preview the production build locally
```

The AI tests use mocked responses; passing them does not verify a live model connection.

## Optional external AI

The app works with local, rule-based recommendations without an API key. Server-side integration is implemented for plan suggestions, coaching, and pattern commentary; using a live model requires a configured key and consent in the app.

1. Copy `.env.example` to `.env.local`.
2. Set `OPENAI_API_KEY` and, optionally, `OPENAI_MODEL`. The configured fallback model is `gpt-4.1-mini`.
3. Restart the local server and enable external AI in the coach section. Consent lasts for the current visit only.

Requests include the question or selected concern, preferred focus length, available time, subjects, task duration estimates and priorities, and seven-day aggregate metrics. Task titles and individual study records are excluded. API keys stay on the server; do not use a `VITE_` prefix for secret keys.

The server requests structured advice, validates the returned text and focus length, and limits requests to five per minute with one active request at a time and a 20-second timeout. Connection failures and invalid outputs fall back to local guidance. Withdrawing consent cancels the pending request and prevents its response from being applied.

The endpoint runs through the local Vite development and preview servers. Static builds support local features; external AI requires a separately hosted backend. Confirm provider data handling and the appropriate consent process before using external AI with students.

## Data and recovery

Plans, tasks, session records, coaching history, and preferences are stored in the current browser. They are not automatically synced across devices, browsers, or site addresses. Clearing browser data removes them.

- On app load, session records outside the latest 90 days are filtered out and the retained records are saved back. This is not a background deletion service.
- Badges are recalculated from the retained records. They are not a separate permanent award history. Badge visibility can be turned off.
- Coaching history retains up to ten exchanges. Unconfirmed plan drafts are not saved, and confirmed plans are restored only for the current local date.
- If a running timer is found after reload, choose whether to include the time since it was last saved. Recovery leaves it paused until you resume.
- Full-record deletion clears the study records, timer state, saved study tools, and pending AI work. Storage failures display an in-app message.

Taking a break or missing a day does not incur a penalty.

## Source layout

- `src/main.tsx`: timer, session reflection, recovery, and app layout.
- `src/timer.ts`: elapsed time, pause behavior, and return-reminder rules.
- `src/StudyHub.tsx`: planning, badges, insights, coaching, and saved study-tool state.
- `src/study.ts`: planning rules, recommendations, statistics, and badge calculation.
- `server/ai.mjs`: local AI middleware and input/output validation.
- `src/*.test.ts`, `server/*.test.mjs`: automated checks.
- `docs/`: product plans and design notes in Korean. These describe intended scope; the behavior above reflects the current implementation.

## License

[MIT License](LICENSE) · Copyright (c) 2026 minijun09.

Third-party dependencies retain their own licenses.
