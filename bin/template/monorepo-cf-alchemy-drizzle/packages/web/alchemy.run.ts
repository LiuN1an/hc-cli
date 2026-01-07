import alchemy from 'alchemy';
import { D1Database, KVNamespace, R2Bucket, Website } from 'alchemy/cloudflare';

const app = await alchemy('template-web', {
  phase: process.argv.includes('--destroy') ? 'destroy' : 'up'
});

// Database
export const db = await D1Database('template-db', {
  adopt: true
});

// Session storage
export const sessionKV = await KVNamespace('template-session-kv', {
  adopt: true
});

// Media storage (optional)
export const mediaBucket = await R2Bucket('template-media-bucket', {
  adopt: true
});

// Website deployment
export const website = await Website('template-web', {
  command: 'pnpm build',
  main: './workers/app.ts',
  compatibilityFlags: ['nodejs_compat'],
  bindings: {
    DB: db,
    SESSION_KV: sessionKV,
    MEDIA_BUCKET: mediaBucket,
    // Environment variables
    SESSION_EXPIRY: alchemy.secret(process.env.SESSION_EXPIRY ?? '604800'),
    AUTH_TOKEN_KEY: alchemy.secret(process.env.AUTH_TOKEN_KEY ?? 'x-admin-token'),
    AUTH_TOKEN_VALUE: alchemy.secret(process.env.AUTH_TOKEN_VALUE ?? 'your-secret-token'),
    R2_CUSTOM_DOMAIN: alchemy.secret(process.env.R2_CUSTOM_DOMAIN ?? '')
  }
});

console.log({
  url: website.url
});

await app.finalize();
