import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './users';

// Review status enum
export const reviewStatuses = ['pending', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

// Reviews table for content moderation workflow
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Content reference (can be user_id, post_id, etc.)
  contentType: text('content_type').notNull(), // e.g., 'user', 'post', 'comment'
  contentId: integer('content_id').notNull(),
  // Review details
  status: text('status', { enum: reviewStatuses }).notNull().default('pending'),
  reviewerId: integer('reviewer_id').references(() => users.id),
  notes: text('notes'),
  // Timestamps
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  reviewedAt: text('reviewed_at')
});

// Zod schemas
export const insertReviewSchema = createInsertSchema(reviews, {
  contentType: z.string().min(1),
  contentId: z.number().positive(),
  status: z.enum(reviewStatuses).default('pending')
});

export const selectReviewSchema = createSelectSchema(reviews);

// Types
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
