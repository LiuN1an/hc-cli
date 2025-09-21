import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// 检测环境类型
const isDevelopment = process.env.NODE_ENV !== 'production' && 
                     (process.env.NODE_ENV === 'development' || 
                      !process.env.NODE_ENV || 
                      process.env.CF_PAGES !== '1');

// 仅在开发环境加载本地环境变量
if (isDevelopment) {
  config({ path: '.env.local' });
}

// 基础配置
const baseConfig = {
  schema: "./database/schema.ts",
  out: "./drizzle/migrations", 
  dialect: "sqlite" as const,
};

// 开发环境配置
const developmentConfig = {
  ...baseConfig,
  dbCredentials: {
    // 开发环境：使用本地数据库文件或内存数据库
    url: process.env.DATABASE_URL || ":memory:"
  }
};

// 生产环境配置（不包含 dbCredentials）
const productionConfig = {
  ...baseConfig,
  // 生产环境不需要 dbCredentials，因为使用 Cloudflare D1 绑定
};

// 根据环境返回不同配置
export default defineConfig(isDevelopment ? developmentConfig : productionConfig);
