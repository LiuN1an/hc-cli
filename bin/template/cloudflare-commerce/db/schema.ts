import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm/sql'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export type User = typeof users.$inferSelect
export type Product = typeof products.$inferSelect
export type Recommand = typeof RecommandProducts.$inferSelect
export type Order = typeof orders.$inferSelect

const created_at = integer('created_at', { mode: 'timestamp' })
  .default(sql`(unixepoch())`)
  .notNull()
const updated_at = integer('updated_at', { mode: 'timestamp' })
  .default(sql`(unixepoch())`)
  .notNull()
const id = text('id')
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID())
const relation_id = text('relation_id')

export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  password: text('password'),
  image: text('image'),
  role: text('role', { enum: ['admin', 'user', 'root'] })
    .notNull()
    .default('user'),
  invite_code: text('invite_code').notNull().unique(),
  created_at,
})

export const sessions = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expiresAt').notNull(),
})

export const products = sqliteTable('products', {
  id,
  title: text('title').notNull().unique(),
  index_title: text('index_title').notNull().unique(),
  desc: text('desc'),
  currency: text('currency').notNull(),
  price: real('price').notNull(),
  old_price: real('old_price'),
  created_at,
  updated_at,
})

export const categories = sqliteTable('categories', {
  id,
  title: text('title').notNull(),
  created_at,
  updated_at,
})

export const productOnCategories = sqliteTable('productOnCategories', {
  product_id: text('product_id').references(() => products.id),
  category_id: text('category_id')
    .notNull()
    .references(() => categories.id),
  created_at,
  updated_at,
})

export const blogOnCategories = sqliteTable('blogOnCategories', {
  blog_id: text('blog_id').references(() => blogs.id),
  category_id: text('category_id')
    .notNull()
    .references(() => categories.id),
  created_at,
  updated_at,
})

export const productImages = sqliteTable('productImages', {
  id,
  product_id: relation_id.references(() => products.id),
  images: text('image', { mode: 'json' }).notNull(),
  detail_images: text('detail', { mode: 'json' }).default([]),
})

export const RecommandProducts = sqliteTable('recommandProducts', {
  id,
  from_product_id: text('product_id').references(() => products.id),
  scene: text('scene', { enum: ['home', 'product'] }),
  target_product_id: text('target_product_id')
    .references(() => products.id)
    .notNull(),
  created_at,
  updated_at,
})

export const reviews = sqliteTable('reviews', {
  id,
  user_id: text('user_id').references(() => users.id),
  product_id: text('product_id')
    .references(() => products.id)
    .notNull(),
  anonymous: integer('anonymous', { mode: 'boolean' }).default(false),
  user_name: text('user_name'),
  user_avatar: text('user_avatar'),
  content: text('content', { mode: 'json' }).notNull(),
  status: text('status', { enum: ['pending', 'accept', 'reject'] }).default('pending'),
  created_at,
  updated_at,
})

export const productStars = sqliteTable('productStars', {
  id,
  product_id: text('product_id')
    .references(() => products.id)
    .notNull(),
  stars: real('stars').default(0.0),
  created_at,
})

export const blogs = sqliteTable('blogs', {
  id,
  title: text('title').notNull(),
  head_image: text('head_image'),
  content: text('content', { mode: 'json' }).notNull(),
  status: text('status', { enum: ['draft', 'online'] }).default('draft'),
  created_at,
  updated_at,
})

/**
 * 在签到时会根据每笔有效的消费记录去计算漏掉的打卡天数, 这笔计算会在server完成返回给前端
 */
export const orders = sqliteTable('orders', {
  id,
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  card_id: text('card_id')
    .notNull()
    .references(() => carts.id),
  pay: text('pay', { enum: ['cash', 'score'] }).default('cash'),
  status: text('status', { enum: ['accept', 'pending', 'reject'] })
    .notNull()
    .default('pending'),
  created_at,
  updated_at,
})

export const ordersInfo = sqliteTable('ordersInfo', {
  id,
  order_id: text('order_id')
    .references(() => orders.id)
    .notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  remark: text('remark', { mode: 'json' }), // 使用json来保存多个时间节点的备注
  reply: text('reply', { mode: 'json' }), // 使用json来保存多个时间节点的审核回复
  notes: text('notes'),
  created_at,
  updated_at,
})

export const carts = sqliteTable('carts', {
  id,
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
  product_id: text('product_id')
    .notNull()
    .references(() => products.id),
  number: integer('number').notNull().default(1),
  created_at,
})

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.user_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [orders.product_id],
    references: [products.id],
  }),
  info: one(ordersInfo, {
    fields: [orders.id],
    references: [ordersInfo.order_id],
  }),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  images: one(productImages, {
    fields: [products.id],
    references: [productImages.product_id],
  }),
  orders: many(orders),
  productOnCategories: many(productOnCategories),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  productOnCategories: many(productOnCategories),
  blogOnCategories: many(blogOnCategories),
}))

export const productsOnCategoriesRelations = relations(productOnCategories, ({ one }) => ({
  product: one(products, {
    fields: [productOnCategories.product_id],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productOnCategories.category_id],
    references: [categories.id],
  }),
}))

export const blogsOnCategoriesRelations = relations(blogOnCategories, ({ one }) => ({
  blogs: one(blogs, {
    fields: [blogOnCategories.blog_id],
    references: [blogs.id],
  }),
  category: one(categories, {
    fields: [blogOnCategories.category_id],
    references: [categories.id],
  }),
}))

export const recommandProductsRelations = relations(RecommandProducts, ({ one }) => ({
  product: one(products, {
    fields: [RecommandProducts.target_product_id],
    references: [products.id],
  }),
}))

