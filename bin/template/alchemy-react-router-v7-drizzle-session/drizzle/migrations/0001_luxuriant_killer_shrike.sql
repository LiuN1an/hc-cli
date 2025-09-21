PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_hierarchical_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`slug` text,
	`parent_id` text,
	`level` integer DEFAULT 0 NOT NULL,
	`path` text DEFAULT '' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`total_product_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `hierarchical_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_hierarchical_categories`("id", "name", "description", "slug", "parent_id", "level", "path", "display_order", "is_active", "total_product_count", "created_at", "updated_at") SELECT "id", "name", "description", "slug", "parent_id", "level", "path", "display_order", "is_active", "total_product_count", "created_at", "updated_at" FROM `hierarchical_categories`;--> statement-breakpoint
DROP TABLE `hierarchical_categories`;--> statement-breakpoint
ALTER TABLE `__new_hierarchical_categories` RENAME TO `hierarchical_categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;