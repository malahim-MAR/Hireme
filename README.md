# HireMe

A MERN hiring workspace connecting verified developers and companies, with a minimal responsive interface, developer profiles, hiring pipelines, and messaging.

## Run locally

Use Node.js 22 or newer and a running MongoDB instance.

1. Run `npm ci --prefix backend` and `npm ci --prefix frontend`.
2. Copy `backend/.env.example` to `backend/.env`, then set your MongoDB URI, session secret, and admin password.
3. Start the API with `npm run dev --prefix backend`.
4. In another terminal, start the frontend with `npm run dev --prefix frontend`.
5. Open the Vite URL, usually `http://localhost:5173`.

The frontend sends requests to `/api`; Vite proxies these to port 5001. For a separately hosted API, set `VITE_API_URL` in `frontend/.env` to the API URL including `/api`, and configure the API's allowed CORS origin.

Create a company or developer account, sign in, then approve it through `/admin` using the configured admin password. Both participants must be verified before messaging.

## Messaging

- Companies contact a developer from Find talent; existing conversations reopen instead of duplicating.
- Messages and hiring stages refresh every 2.5 seconds while the page is visible and immediately when the window regains focus or connectivity.
- Sending supports multiline text, per-conversation drafts, read receipts, unread counts, and a 5,000-character limit.
- Enter sends; Shift + Enter adds a new line.
- A failed send keeps the draft. Retrying the same message reuses its request ID to prevent duplicate delivery.
- Conversation selection is stored in the URL, so it survives reloads and doesn't change when another chat receives a message.
- Companies manage the hiring stage; developers see updates automatically.

## Checks

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
npm test
```

The API tests and browser tests run against isolated temporary MongoDB instances; they do not use your configured database. The first test run downloads a MongoDB binary. Browser tests start their own API on port 5001 and Vite on port 5173, so stop local development servers before running them. Chrome is used by default; to use Playwright Chromium, run `npx playwright install chromium` in `frontend` and set `PLAYWRIGHT_CHANNEL=chromium`.

Tests cover simultaneous sends, duplicate retries, participant access checks, read acknowledgements, hiring stages, two-account browser messaging, mobile navigation, draft preservation, lost responses, and logout. Screenshots and failure traces are written to `frontend/test-results`.

## Production

Build the frontend with `npm run build --prefix frontend`, set `NODE_ENV=production` in `backend/.env`, and run `npm start`. Express serves the built frontend and API together. Set a production MongoDB URI and private session/admin secrets before deploying.
