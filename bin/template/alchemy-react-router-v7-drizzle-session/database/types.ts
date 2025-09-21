import type { 
  users, 
  orders, 
  skus, 
  products,
  categories,
  hierarchicalCategories,
  productCategories,
  productHierarchicalCategories,
  productImages,
  cartItems,
  sessions,
  contact,
  referralCodes,
  banners,
  skuImages
} from "./schema";

// 基础类型定义
export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Sku = typeof skus.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type HierarchicalCategory = typeof hierarchicalCategories.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
export type ProductHierarchicalCategory = typeof productHierarchicalCategories.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Contact = typeof contact.$inferSelect;
export type ReferralCode = typeof referralCodes.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type SkuImage = typeof skuImages.$inferSelect;

// 公开用户信息（不包含密码）
export type PublicUser = Omit<User, 'password'>;

// 订单状态类型定义
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

// 订单中的购物车项目类型
export type OrderCartItem = {
  id: string;
  productId: string;
  price: number;
  quantity: number;
  productName: string;
};

// 横幅图片类型定义
export type BannerImage = {
  id: string;
  originalUrl: string;
  croppedUrl: string;
  cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
  };
  alt?: string;
};
