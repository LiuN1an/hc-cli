#!/usr/bin/env bun

/**
 * Database seed script
 * Run with: bun scripts/db-seed.js
 */

import Database from 'better-sqlite3';

const db = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*/db.sqlite');

// Create admin user
const hashedPassword =
  '0123456789abcdef:' + '0'.repeat(128); // Placeholder - replace with actual hashed password

db.exec(`
  INSERT OR IGNORE INTO users (email, password, name, role, created_at, updated_at)
  VALUES ('admin@example.com', '${hashedPassword}', 'Admin', 'admin', datetime('now'), datetime('now'));
`);

console.log('Database seeded successfully!');
