require('dotenv').config();

const { algoliasearch } = require('algoliasearch');

const REQUIRED_ENV = ['ALGOLIA_APP_ID', 'ALGOLIA_API_KEY', 'ALGOLIA_INDEX_NAME'];

function getConfig() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variable(s): ${missing.join(', ')}.\n` +
        `Set them in your shell or a .env file (see .env.example).`
    );
    process.exit(1);
  }

  return {
    appId: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_API_KEY,
    indexName: process.env.ALGOLIA_INDEX_NAME,
  };
}

const DESIRED_SETTINGS = {
  searchableAttributes: ['name', 'description'],
};

// Compare desired settings against current ones; return only the keys that change.
function diffSettings(current, desired) {
  const changes = [];
  for (const [key, nextValue] of Object.entries(desired)) {
    const currentValue = current[key];
    if (JSON.stringify(currentValue) !== JSON.stringify(nextValue)) {
      changes.push({ key, from: currentValue, to: nextValue });
    }
  }
  return changes;
}

function format(value) {
  return value === undefined ? '(not set)' : JSON.stringify(value);
}

async function main() {
  const { appId, apiKey, indexName } = getConfig();

  const client = algoliasearch(appId, apiKey);

  // Fetch current settings and show what would change before applying.
  console.log(`Fetching current settings for index "${indexName}"...`);
  const current = await client.getSettings({ indexName });

  const changes = diffSettings(current, DESIRED_SETTINGS);
  if (changes.length === 0) {
    console.log('No changes — index already matches desired settings. Nothing to do.');
    return;
  }

  console.log('\nThe following settings will change:');
  for (const { key, from, to } of changes) {
    console.log(`  ${key}:`);
    console.log(`    - ${format(from)}`);
    console.log(`    + ${format(to)}`);
  }

  console.log(`\nUpdating settings on index "${indexName}"...`);
  const start = Date.now();

  // setSettings returns { taskID, updatedAt }. The task is queued, not yet applied.
  const { taskID } = await client.setSettings({
    indexName,
    indexSettings: DESIRED_SETTINGS,
  });

  // Block until Algolia has published the task.
  await client.waitForTask({ indexName, taskID });

  const elapsedMs = Date.now() - start;
  console.log(
    `✓ Settings updated. taskID=${taskID}, completed in ${elapsedMs}ms (${(
      elapsedMs / 1000
    ).toFixed(2)}s)`
  );
}

main().catch((err) => {
  console.error('Failed to update settings:', err);
  process.exit(1);
});
