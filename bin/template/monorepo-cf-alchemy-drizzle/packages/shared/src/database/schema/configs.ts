import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Configs table for system configuration
export const configs = sqliteTable('configs', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
});

// Zod schemas
export const insertConfigSchema = createInsertSchema(configs);
export const selectConfigSchema = createSelectSchema(configs);

// Types
export type Config = typeof configs.$inferSelect;
export type NewConfig = typeof configs.$inferInsert;
