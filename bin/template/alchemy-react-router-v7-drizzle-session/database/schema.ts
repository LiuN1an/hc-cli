import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  foreignKey,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { OrderCartItem, BannerImage } from "./types";

// All types moved to database/types.ts

export const contact = sqliteTable("contact", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(), // tg, ins, whatsapp
  value: text("value"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 用户表
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "user"] })
    .notNull()
    .default("user"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 用户表关系
export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
  orders: many(orders),
}));

export const sessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: text("expires_at").notNull(),
});

// 商品表
export const products = sqliteTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  originalPrice: real("original_price").notNull(),
  stock: integer("stock").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isOnline: integer("is_online", { mode: "boolean" }).notNull().default(false),
  isDeleted: integer("is_deleted", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 商品类目表
export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 商品-类目关联表
export const productCategories = sqliteTable("product_categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 商品表关系
export const productsRelations = relations(products, ({ many, one }) => ({
  images: many(productImages),
  cartItems: many(cartItems),
  categories: many(productCategories),
  skus: many(skus),
}));

// 类目表关系
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(productCategories),
}));

// 商品-类目关联表关系
export const productCategoriesRelations = relations(
  productCategories,
  ({ one }) => ({
    product: one(products, {
      fields: [productCategories.productId],
      references: [products.id],
    }),
    category: one(categories, {
      fields: [productCategories.categoryId],
      references: [categories.id],
    }),
  })
);

// 层级分类表
export const hierarchicalCategories = sqliteTable(
  "hierarchical_categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    description: text("description"),
    slug: text("slug"), // URL友好标识符，可选
    parentId: text("parent_id"),
    level: integer("level").notNull().default(0), // 0-3 对应四级分类
    path: text("path").notNull().default(""), // 如："/root_id/parent_id/current_id"
    displayOrder: integer("display_order").notNull().default(0), // 同级排序
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true), // 是否激活
    totalProductCount: integer("total_product_count").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "hierarchical_categories_parent_fk",
    }),
  ]
);

// 商品-层级分类关联表
export const productHierarchicalCategories = sqliteTable(
  "product_hierarchical_categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    hierarchicalCategoryId: text("hierarchical_category_id")
      .notNull()
      .references(() => hierarchicalCategories.id),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  }
);

// 层级分类表关系
export const hierarchicalCategoriesRelations = relations(
  hierarchicalCategories,
  ({ one, many }) => ({
    parent: one(hierarchicalCategories, {
      fields: [hierarchicalCategories.parentId],
      references: [hierarchicalCategories.id],
      relationName: "parent_child",
    }),
    children: many(hierarchicalCategories, {
      relationName: "parent_child",
    }),
    products: many(productHierarchicalCategories),
  })
);

// 商品-层级分类关联表关系
export const productHierarchicalCategoriesRelations = relations(
  productHierarchicalCategories,
  ({ one }) => ({
    product: one(products, {
      fields: [productHierarchicalCategories.productId],
      references: [products.id],
    }),
    hierarchicalCategory: one(hierarchicalCategories, {
      fields: [productHierarchicalCategories.hierarchicalCategoryId],
      references: [hierarchicalCategories.id],
    }),
  })
);

// 商品图片表
export const productImages = sqliteTable("product_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  url: text("url").notNull(),
  description: text("description"),
  type: text("type").notNull().default("image"),
  cover: text("cover"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 商品图片表关系
export const productImagesRelations = relations(
  productImages,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productImages.productId],
      references: [products.id],
    }),
    skuImages: many(skuImages),
  })
);

// 购物车表
export const cartItems = sqliteTable("cart_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  productId: text("product_id")
    .references(() => products.id)
    .notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// 购物车表关系
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// 订单状态类型定义 (移动到types.ts)
// SQLite不支持enum，使用text约束

// 类型定义已移动到types.ts

// 订单表
export const orders = sqliteTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  cartItems: text("cart_items", { mode: "json" })
    .$type<OrderCartItem[]>()
    .notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 订单表关系
export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

// 分销码表
export const referralCodes = sqliteTable("referral_codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  description: text("description"),
  discount: real("discount").notNull(), // 折扣比例，例如：0.80 表示8折
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 横幅图片类型已移动到types.ts

// 横幅表
export const banners = sqliteTable("banners", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  images: text("images", { mode: "json" }).$type<BannerImage[]>().notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// SKU表
export const skus = sqliteTable("skus", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
  isOnline: integer("is_online", { mode: "boolean" }).notNull().default(false),
  isDeleted: integer("is_deleted", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// SKU-图片映射表
export const skuImages = sqliteTable("sku_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  skuId: text("sku_id")
    .notNull()
    .references(() => skus.id),
  productImageId: text("product_image_id")
    .notNull()
    .references(() => productImages.id),
  isPrimary: integer("is_primary", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// SKU表关系
export const skusRelations = relations(skus, ({ one, many }) => ({
  product: one(products, {
    fields: [skus.productId],
    references: [products.id],
  }),
  images: many(skuImages),
}));

// SKU图片映射表关系
export const skuImagesRelations = relations(skuImages, ({ one }) => ({
  sku: one(skus, {
    fields: [skuImages.skuId],
    references: [skus.id],
  }),
  productImage: one(productImages, {
    fields: [skuImages.productImageId],
    references: [productImages.id],
  }),
}));

// 导出 Zod schemas 用于验证
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export const insertProductImageSchema = createInsertSchema(productImages);
export const selectProductImageSchema = createSelectSchema(productImages);

export const insertCartItemSchema = createInsertSchema(cartItems);
export const selectCartItemSchema = createSelectSchema(cartItems);

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

export const insertReferralCodeSchema = createInsertSchema(referralCodes);
export const selectReferralCodeSchema = createSelectSchema(referralCodes);

export const insertSkuSchema = createInsertSchema(skus);
export const selectSkuSchema = createSelectSchema(skus);

export const insertSkuImageSchema = createInsertSchema(skuImages);
export const selectSkuImageSchema = createSelectSchema(skuImages);

export const insertHierarchicalCategorySchema = createInsertSchema(
  hierarchicalCategories
);
export const selectHierarchicalCategorySchema = createSelectSchema(
  hierarchicalCategories
);

export const insertProductHierarchicalCategorySchema = createInsertSchema(
  productHierarchicalCategories
);
export const selectProductHierarchicalCategorySchema = createSelectSchema(
  productHierarchicalCategories
);

export const insertBannerSchema = createInsertSchema(banners);
export const selectBannerSchema = createSelectSchema(banners);
