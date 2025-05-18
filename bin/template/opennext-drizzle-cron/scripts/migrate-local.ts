import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get the migrations directory from wrangler.jsonc
const wranglerConfigPath = path.resolve(__dirname, '../wrangler.jsonc');
const wranglerConfig = JSON.parse(fs.readFileSync(wranglerConfigPath, 'utf-8').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ''));

const d1Config = wranglerConfig.d1_databases?.[0];

if (!d1Config) {
	console.error('ERROR: No D1 database configuration found in wrangler.jsonc');
	process.exit(1);
}

const migrationsDir = d1Config.migrations_dir;
const databaseName = d1Config.database_name;

if (!migrationsDir || !databaseName) {
	console.error('ERROR: Missing migrations_dir or database_name in wrangler.jsonc');
	process.exit(1);
}

console.log(`Running D1 migrations from ${migrationsDir}...`);

try {
	// Execute the wrangler command without custom persist-to path, using default location
	execSync(`cross-env NODE_ENV=development wrangler d1 migrations apply ${databaseName} --local`, { stdio: 'inherit' });
	console.log('Migrations applied successfully!');
} catch (error) {
	console.error('Error applying migrations:', error);
	process.exit(1);
}
