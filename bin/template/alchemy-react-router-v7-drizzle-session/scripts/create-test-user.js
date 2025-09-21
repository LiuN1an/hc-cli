/**
 * 创建测试用户脚本
 */
import { drizzle } from "drizzle-orm/d1";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 导入schema
const { users } = require(join(__dirname, "../database/schema.ts"));

// 导入加密工具
async function hashPassword(password) {
  const { hashPassword } = await import("../app/lib/crypto.ts");
  return hashPassword(password);
}

// 导入数据库工具
async function createUser(db, userData) {
  const { createUser } = await import("../app/lib/db-utils.ts");
  return createUser(db, userData);
}

async function main() {
  console.log("创建测试用户...");
  
  // 模拟D1数据库（这个脚本主要用于文档说明）
  console.log("注意：这个脚本需要在实际的D1环境中运行");
  console.log("您可以通过以下方式创建测试用户：");
  console.log("");
  console.log("1. 使用注册页面 /signup");
  console.log("2. 或者使用以下测试数据：");
  console.log("");
  console.log("邮箱: test@example.com");
  console.log("密码: 123456");
  console.log("姓名: 测试用户");
  console.log("角色: buyer");
  console.log("");
  console.log("管理员账户：");
  console.log("邮箱: admin@example.com");
  console.log("密码: admin123");
  console.log("姓名: 管理员");
  console.log("角色: admin");
  console.log("");
  console.log("卖家账户：");
  console.log("邮箱: vendor@example.com");
  console.log("密码: vendor123");
  console.log("姓名: 商家用户");
  console.log("角色: vendor");
}

main().catch(console.error);
