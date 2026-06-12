require('dotenv').config();

const { algoliasearch } = require('algoliasearch');

const REQUIRED_ENV = ['ALGOLIA_APP_ID', 'ALGOLIA_API_KEY', 'ALGOLIA_INDEX_NAME'];
const ITERATIONS = 10;

function getConfig() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(`Missing required environment variable(s): ${missing.join(', ')}.`);
    process.exit(1);
  }
  return {
    appId: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_API_KEY,
    indexName: process.env.ALGOLIA_INDEX_NAME,
  };
}

async function runOnce(client, indexName) {
  const start = Date.now();
  const { taskID } = await client.setSettings({
    indexName,
    indexSettings: { searchableAttributes: ['name', 'description'] },
  });
  await client.waitForTask({ indexName, taskID });
  return { taskID, elapsedMs: Date.now() - start };
}

async function main() {
  const { appId, apiKey, indexName } = getConfig();
  const client = algoliasearch(appId, apiKey);

  console.log(`Running setSettings + waitForTask ${ITERATIONS}x on "${indexName}"...\n`);

  const times = [];
  for (let i = 1; i <= ITERATIONS; i++) {
    const { taskID, elapsedMs } = await runOnce(client, indexName);
    times.push(elapsedMs);
    console.log(`  run ${String(i).padStart(2)}: taskID=${taskID}  ${elapsedMs}ms`);
  }

  const sum = times.reduce((a, b) => a + b, 0);
  const avg = sum / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(
    `\nResults over ${ITERATIONS} runs:\n` +
      `  average: ${avg.toFixed(1)}ms (${(avg / 1000).toFixed(2)}s)\n` +
      `  min:     ${min}ms\n` +
      `  max:     ${max}ms`
  );
}

main().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
