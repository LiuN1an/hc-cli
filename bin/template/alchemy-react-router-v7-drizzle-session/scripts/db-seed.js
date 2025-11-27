#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sql } from "drizzle-orm";
import * as schema from "../database/schema.ts";

/**
 * 数据库种子脚本
 * 
 * 使用方式:
 *   pnpm db:seed users 10       # 生成 10 个测试用户
 *   pnpm db:seed users:admin 2  # 生成 2 个管理员用户
 *   pnpm db:seed clear          # 清空所有数据
 *   pnpm db:seed clear:users    # 只清空用户数据
 *   pnpm db:seed help           # 显示帮助信息
 * 
 * 环境变量:
 *   SEED_DEFAULT_PASSWORD - 测试账号默认密码（默认: 123456）
 * 
 * 完整流程:
 *   pnpm db:seed users 5 && pnpm db:seed users:admin 1
 */

// ============================================
// 加载环境变量
// ============================================

function loadEnvFile() {
  const envFiles = [".env.local", ".env"];
  
  for (const envFile of envFiles) {
    if (existsSync(envFile)) {
      try {
        const content = readFileSync(envFile, "utf-8");
        content.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            const [key, ...valueParts] = trimmed.split("=");
            const value = valueParts.join("=");
            if (key && value && !process.env[key]) {
              process.env[key] = value;
            }
          }
        });
        console.log(`📄 已加载环境变量: ${envFile}`);
        return;
      } catch (error) {
        // 忽略读取错误
      }
    }
  }
}

// 加载环境变量
loadEnvFile();

// ============================================
// 配置（支持环境变量覆盖）
// ============================================

const SEEDER_CONFIG = {
  users: {
    // 从环境变量读取默认密码，fallback 到 "123456"
    defaultPassword: process.env.SEED_DEFAULT_PASSWORD || "123456",
  },
};

// 用户名称模板库
const USER_TEMPLATES = {
  firstNames: [
    "张", "李", "王", "赵", "刘", "陈", "杨", "黄", "周", "吴",
    "徐", "孙", "马", "朱", "胡", "郭", "林", "何", "高", "罗",
  ],
  lastNames: [
    "伟", "芳", "娜", "敏", "静", "丽", "强", "磊", "军", "洋",
    "勇", "艳", "杰", "涛", "明", "超", "秀英", "华", "平", "刚",
  ],
  emailDomains: [
    "gmail.com", "outlook.com", "qq.com", "163.com", "hotmail.com",
    "yahoo.com", "icloud.com", "foxmail.com", "sina.com", "126.com",
  ],
};

// ============================================
// 工具函数
// ============================================

/**
 * 查找本地 D1 数据库文件
 */
function findLocalD1Database() {
  const d1Dir = "./.alchemy/miniflare/v3/d1/miniflare-D1DatabaseObject/";

  if (!existsSync(d1Dir)) {
    console.log(`⚠️  数据库目录不存在: ${d1Dir}`);
    console.log(`   请先运行: pnpm dev`);
    return null;
  }

  const files = readdirSync(d1Dir);
  const sqliteFile = files.find(
    (file) =>
      file.endsWith(".sqlite") &&
      !file.endsWith(".sqlite-shm") &&
      !file.endsWith(".sqlite-wal")
  );

  if (sqliteFile) {
    const dbPath = resolve(d1Dir, sqliteFile);
    console.log(`🎯 找到数据库: ${sqliteFile}`);
    return dbPath;
  }

  console.log(`⚠️  未找到 SQLite 数据库文件`);
  return null;
}

/**
 * 生成随机整数
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组中随机选择一个元素
 */
function randomChoice(array) {
  return array[randomInt(0, array.length - 1)];
}

/**
 * 生成随机中文名字
 */
function generateChineseName() {
  const firstName = randomChoice(USER_TEMPLATES.firstNames);
  const lastName = randomChoice(USER_TEMPLATES.lastNames);
  return firstName + lastName;
}

/**
 * 生成随机邮箱
 */
function generateEmail(name, index) {
  const domain = randomChoice(USER_TEMPLATES.emailDomains);
  const pinyin = `user${index}_${Date.now().toString(36)}`;
  return `${pinyin}@${domain}`;
}

/**
 * 简单的密码哈希（与 app/lib/crypto.ts 保持一致）
 * 使用 SHA-256 + Base64
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 生成 UUID
 */
function generateUUID() {
  return crypto.randomUUID();
}

// ============================================
// 数据生成器
// ============================================

/**
 * 生成用户数据
 */
async function generateUsers(db, count, role = "user") {
  console.log(`\n📝 开始生成 ${count} 个${role === "admin" ? "管理员" : "普通"}用户...`);

  const hashedPassword = await hashPassword(SEEDER_CONFIG.users.defaultPassword);
  const users = [];

  for (let i = 0; i < count; i++) {
    const name = generateChineseName();
    const email = generateEmail(name, i);

    users.push({
      id: generateUUID(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // 批量插入
  const batchSize = 50;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await db.insert(schema.users).values(batch);
    console.log(`   ✓ 已插入 ${Math.min(i + batchSize, users.length)}/${users.length} 条用户记录`);
  }

  console.log(`✅ 用户生成完成！`);
  console.log(`   默认密码: ${SEEDER_CONFIG.users.defaultPassword}`);
  
  // 显示示例账号
  if (users.length > 0) {
    console.log(`\n📋 示例账号:`);
    users.slice(0, 3).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} / ${SEEDER_CONFIG.users.defaultPassword}`);
    });
  }

  return users;
}

/**
 * 清空用户数据
 */
async function clearUsers(db) {
  console.log(`\n🗑️  清空用户数据...`);
  await db.delete(schema.users);
  console.log(`✅ 用户数据已清空`);
}

/**
 * 清空所有数据
 */
async function clearAllData(db) {
  console.log(`\n🗑️  清空所有数据...`);
  
  // 按依赖顺序清空表
  const tables = ["sessions", "users"];
  
  for (const table of tables) {
    try {
      await db.run(sql.raw(`DELETE FROM ${table}`));
      console.log(`   ✓ 已清空表: ${table}`);
    } catch (error) {
      console.log(`   ⚠️  表 ${table} 不存在或已清空`);
    }
  }
  
  console.log(`✅ 所有数据已清空`);
}

/**
 * 显示数据库统计
 */
async function showStats(db) {
  console.log(`\n📊 数据库统计:`);
  
  try {
    const userCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(schema.users);
    console.log(`   用户总数: ${userCount[0]?.count || 0}`);
    
    const adminCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(schema.users)
      .where(sql`role = 'admin'`);
    console.log(`   管理员数: ${adminCount[0]?.count || 0}`);
  } catch (error) {
    console.log(`   ⚠️  无法获取统计信息: ${error.message}`);
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
📖 数据库种子脚本使用说明

命令格式: pnpm db:seed <command> [count]

可用命令:
  users <count>        生成指定数量的普通用户 (默认角色: user)
  users:admin <count>  生成指定数量的管理员用户 (角色: admin)
  clear                清空所有数据
  clear:users          只清空用户数据
  stats                显示数据库统计信息
  help                 显示此帮助信息

示例:
  pnpm db:seed users 10        # 生成 10 个普通用户
  pnpm db:seed users:admin 2   # 生成 2 个管理员
  pnpm db:seed clear           # 清空所有数据
  pnpm db:seed stats           # 查看统计

环境变量:
  SEED_DEFAULT_PASSWORD        测试账号默认密码（当前: ${SEEDER_CONFIG.users.defaultPassword}）

⚠️  注意: 
   - 此脚本仅用于开发环境
   - 请先运行 pnpm dev 确保数据库已初始化
   - 可通过 .env.local 或 .env 文件配置环境变量
  `);
}

// ============================================
// 主程序
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  const countArg = parseInt(args[1]) || 5;

  // 对于 help 命令直接显示帮助
  if (command === "help") {
    showHelp();
    return;
  }

  // 查找数据库
  const dbPath = findLocalD1Database();
  if (!dbPath) {
    console.log(`\n💡 请先运行 pnpm dev 启动开发服务器以初始化数据库`);
    process.exit(1);
  }

  // 连接数据库
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });

  console.log(`\n🔗 已连接到本地数据库`);

  try {
    switch (command) {
      case "users":
        await generateUsers(db, countArg, "user");
        break;

      case "users:admin":
        await generateUsers(db, countArg, "admin");
        break;

      case "clear":
        await clearAllData(db);
        break;

      case "clear:users":
        await clearUsers(db);
        break;

      case "stats":
        await showStats(db);
        break;

      default:
        console.log(`❌ 未知命令: ${command}`);
        showHelp();
        process.exit(1);
    }

    // 显示最终统计
    await showStats(db);
    
  } catch (error) {
    console.error(`\n❌ 执行失败:`, error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    sqlite.close();
  }

  console.log(`\n✨ 操作完成！`);
}

main().catch(console.error);
