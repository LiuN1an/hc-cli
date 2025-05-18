import 'dotenv/config';
import { Config, defineConfig } from 'drizzle-kit';

const dev = {
	schema: './db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.LOCAL_DB,
	},
} satisfies Config;

const prod = {
	out: './drizzle',
	schema: './db/schema.ts',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
		token: process.env.CLOUDFLARE_D1_TOKEN!,
	},
} satisfies Config;

export default defineConfig(process.env.NODE_ENV === 'development' ? dev : prod);
