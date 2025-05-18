import { execSync } from 'child_process';
import path from 'path';

// Define the path to search for SQLite files
const wranglerDir = path.resolve(__dirname, '../.wrangler/state/v3/d1/miniflare-D1DatabaseObject');

try {
	console.log('Finding SQLite database and starting Drizzle Studio...');

	// Execute the command directly using the find command to locate the SQLite file
	// This matches the format from package.json:
	// "db:studio:local": "cross-env DB_LOCAL_PATH=$(find .wrangler/state/v3/d1/miniflare-D1DatabaseObject -type f -name '*.sqlite' -print -quit) drizzle-kit studio"
	execSync(`cross-env NODE_ENV=development LOCAL_DB=$(find "${wranglerDir}" -type f -name '*.sqlite' -print -quit) drizzle-kit studio`, {
		stdio: 'inherit',
		shell: '/bin/bash',
	});
} catch (error) {
	console.error('Error running Drizzle Studio:', error);
	process.exit(1);
}
