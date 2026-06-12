# algolia-settings-script

A small Node.js script that updates an Algolia index's `searchableAttributes` using the [Algolia JavaScript client v5](https://www.algolia.com/doc/libraries/javascript/v5/). Before applying, it fetches the current settings and prints a diff of what will change, then waits for the task to finish and reports how long it took.

## Requirements

- Node.js 18+
- An Algolia app with an index and an **Admin API key** (needs write access for `setSettings`)

## Setup

```bash
git clone https://github.com/agdavid/algolia-settings-script.git
cd algolia-settings-script
npm install
cp .env.example .env   # then fill in your credentials
```

Edit `.env`:

```
ALGOLIA_APP_ID=your_app_id
ALGOLIA_API_KEY=your_admin_api_key
ALGOLIA_INDEX_NAME=your_index_name
```

## Run

```bash
npm start
```

This fetches current settings, shows a diff, sets `searchableAttributes` to `["name", "description"]`, and waits for the change to apply:

```
Fetching current settings for index "your_index"...

The following settings will change:
  searchableAttributes:
    - ["name"]
    + ["name","description"]

Updating settings on index "your_index"...
✓ Settings updated. taskID=..., completed in ...ms
```

If the index already matches, it prints `No changes` and exits without writing.

## Benchmark (optional)

Run the `setSettings` + `waitForTask` cycle 10 times and report the average duration:

```bash
node benchmark.js
```

> **Note:** `.env` is gitignored — never commit real credentials.
