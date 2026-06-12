# CLAUDE.md

Guidance for Claude Code when working in this repository. (This repo has no `AGENTS.md`; this file is the single source of project guidance.)

## Project

`algolia-settings-script` — a Node.js script that updates Algolia index settings using the **Algolia JavaScript client v5** (`algoliasearch` v5.x).

- Module system: CommonJS (`"type": "commonjs"` in `package.json`).
- Entry point: `index.js`. Run with `npm start` (i.e. `node index.js`).
- Import the client with: `const { algoliasearch } = require('algoliasearch');`

## Configuration

Credentials are loaded from environment variables via a `.env` file (using `dotenv`):

| Variable | Purpose |
| --- | --- |
| `ALGOLIA_APP_ID` | Algolia application ID |
| `ALGOLIA_API_KEY` | Admin API key (needs write access for `setSettings`) |
| `ALGOLIA_INDEX_NAME` | Target index name |

- Copy `.env.example` → `.env` and fill in values. `.env` is gitignored — never commit real credentials.
- The script validates that all three vars are present and exits with code 1 if any are missing.

## What the script does

1. Loads and validates env vars.
2. Connects: `algoliasearch(appId, apiKey)`.
3. Calls `client.setSettings({ indexName, indexSettings: { searchableAttributes: ['name', 'description'] } })` — returns `{ taskID, updatedAt }`.
4. Captures `taskID`, then calls `client.waitForTask({ indexName, taskID })` to block until the task is published.
5. Logs the `taskID` and total elapsed time.

## v5 API notes

- v5 methods take a single options object with `indexName` (there is no `initIndex` like in v4).
- `setSettings` returns `{ taskID, updatedAt }`; use `taskID` with `waitForTask({ indexName, taskID })`.
- Settings changes are asynchronous — they are queued and applied after the call returns, which is why `waitForTask` is used to confirm completion.

## Guidance

<!-- Paste your guidance below. -->
