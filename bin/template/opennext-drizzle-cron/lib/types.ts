import { BatchItem } from "drizzle-orm/batch";

export type BatchItems = [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]];
