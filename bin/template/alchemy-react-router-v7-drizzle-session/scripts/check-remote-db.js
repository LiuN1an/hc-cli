#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";

/**
 * 检查远程数据库连接并统计各表数据量
 * 
 * 环境变量配置（可在 .env 或 .env.local 中设置）:
 *   DB_NAME - Cloudflare D1 数据库名称
 *   DB_ID   - Cloudflare D1 数据库 ID（可选，仅作记录）
 */

// ========================================
// 加载环境变量
// ========================================

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
        return envFile;
      } catch (error) {
        // 忽略读取错误
      }
    }
  }
  return null;
}

// 加载环境变量
const loadedEnvFile = loadEnvFile();

// ========================================
// 配置区域 - 从环境变量读取
// ========================================

const DB_CONFIG = {
  databaseName: process.env.DB_NAME || "",
  databaseId: process.env.DB_ID || "",
};

// ========================================
// 工具函数
// ========================================

/**
 * 执行 wrangler d1 命令
 */
function executeWranglerD1(databaseName, sql) {
  // 使用 bunx 代替 npx 避免权限问题
  const command = `bunx wrangler d1 execute ${databaseName} --remote --yes --json --command="${sql}"`;

  try {
    const output = execSync(command, {
      encoding: "utf-8",
    });

    // 解析 JSON 输出
    try {
      const result = JSON.parse(output);
      // D1 JSON 输出格式：[{results: [...], success: true}]
      if (result && result[0] && result[0].results) {
        return {
          success: true,
          results: result[0].results,
        };
      }
    } catch (parseError) {
      // 如果不是 JSON 格式，返回原始输出
      return {
        success: true,
        rawOutput: output,
      };
    }

    return { success: false, error: "未知输出格式" };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.toString(),
    };
  }
}

/**
 * 获取所有表名
 */
function getAllTables(databaseName) {
  console.log("\n🔍 查询所有表...");

  const result = executeWranglerD1(
    databaseName,
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );

  if (!result.success) {
    console.error(`   ❌ 查询失败: ${result.error}`);
    if (result.stderr) {
      console.error(`   错误信息: ${result.stderr}`);
    }
    return [];
  }

  if (result.results) {
    const tables = result.results.map((row) => row.name);
    console.log(`   ✅ 找到 ${tables.length} 个表`);
    return tables;
  }

  return [];
}

/**
 * 获取表的记录数
 */
function getTableCount(databaseName, tableName) {
  const result = executeWranglerD1(
    databaseName,
    `SELECT COUNT(*) as count FROM ${tableName}`
  );

  if (!result.success) {
    return { success: false, count: 0, error: result.error };
  }

  if (result.results && result.results[0]) {
    return { success: true, count: result.results[0].count };
  }

  return { success: false, count: 0, error: "无法解析结果" };
}

/**
 * 显示表的示例数据
 */
function showTableSample(databaseName, tableName, limit = 3) {
  console.log(`   📄 示例数据（最多 ${limit} 条）:`);

  const result = executeWranglerD1(
    databaseName,
    `SELECT * FROM ${tableName} LIMIT ${limit}`
  );

  if (!result.success) {
    console.log(`      ⚠️  无法获取示例数据: ${result.error}`);
    return;
  }

  if (result.results && result.results.length > 0) {
    result.results.forEach((row, index) => {
      console.log(
        `      记录 ${index + 1}:`,
        JSON.stringify(row, null, 2).split("\n").join("\n      ")
      );
    });
  } else {
    console.log(`      （表为空）`);
  }
}

// ========================================
// 主逻辑
// ========================================

function checkRemoteDatabase() {
  console.log("\n━".repeat(40));
  console.log("🔍 远程数据库连接检查");
  console.log("━".repeat(40));

  // 0. 检查配置
  if (!DB_CONFIG.databaseName) {
    console.error("\n❌ 数据库名称未配置");
    console.log("\n💡 请设置环境变量 DB_NAME:");
    console.log("   方式 1: 在 .env 或 .env.local 文件中添加 DB_NAME=your-database-name");
    console.log("   方式 2: 直接设置环境变量 DB_NAME=your-database-name node scripts/check-remote-db.js");
    process.exit(1);
  }

  // 1. 显示数据库配置
  console.log("\n📦 数据库配置:");
  console.log(`   数据库名称: ${DB_CONFIG.databaseName}`);
  if (DB_CONFIG.databaseId) {
    console.log(`   数据库ID: ${DB_CONFIG.databaseId}`);
  }
  if (loadedEnvFile) {
    console.log(`   配置来源: ${loadedEnvFile}`);
  }

  // 2. 测试连接
  console.log("\n🔌 测试远程数据库连接...");
  const testResult = executeWranglerD1(
    DB_CONFIG.databaseName,
    "SELECT 1 as test"
  );

  if (!testResult.success) {
    console.error("\n❌ 无法连接到远程数据库");
    console.error(`   错误: ${testResult.error}`);
    if (testResult.stderr) {
      console.error(`   详细信息: ${testResult.stderr}`);
    }
    console.log("\n💡 检查清单:");
    console.log("   1. 是否已登录 Cloudflare: wrangler login");
    console.log("   2. 数据库名称是否正确（检查 DB_NAME 环境变量）");
    console.log("   3. 是否有权限访问该数据库");
    process.exit(1);
  }

  console.log("   ✅ 连接成功！");

  // 3. 获取所有表
  const tables = getAllTables(DB_CONFIG.databaseName);

  if (tables.length === 0) {
    console.log("\n⚠️  数据库中没有表");
    return;
  }

  // 4. 统计每个表的记录数
  console.log("\n━".repeat(40));
  console.log("📊 数据库表统计");
  console.log("━".repeat(40));

  const stats = [];
  let totalRecords = 0;

  for (const table of tables) {
    // 跳过系统表
    if (table.startsWith("sqlite_") || table.startsWith("_cf_")) {
      continue;
    }

    const countResult = getTableCount(DB_CONFIG.databaseName, table);

    if (countResult.success) {
      stats.push({
        table,
        count: countResult.count,
      });
      totalRecords += countResult.count;
    } else {
      stats.push({
        table,
        count: 0,
        error: countResult.error,
      });
    }
  }

  // 按记录数排序（从多到少）
  stats.sort((a, b) => (b.count || 0) - (a.count || 0));

  // 显示统计结果
  console.log("\n表名                          记录数      状态");
  console.log("─".repeat(60));

  stats.forEach(({ table, count, error }) => {
    const tableName = table.padEnd(30);
    const countStr = count.toLocaleString().padStart(10);
    const status = error ? `⚠️  ${error}` : "✅";
    console.log(`${tableName}${countStr}      ${status}`);
  });

  console.log("─".repeat(60));
  console.log(
    `总计                          ${totalRecords
      .toLocaleString()
      .padStart(10)}      `
  );

  // 5. 显示详细信息（如果指定了 --detail 参数）
  if (process.argv.includes("--detail")) {
    console.log("\n━".repeat(40));
    console.log("📋 表详细信息");
    console.log("━".repeat(40));

    for (const { table, count } of stats) {
      if (count > 0) {
        console.log(`\n🗂️  ${table} (${count.toLocaleString()} 条记录)`);
        showTableSample(DB_CONFIG.databaseName, table);
      }
    }
  } else {
    console.log("\n💡 提示: 使用 --detail 参数查看每个表的示例数据");
  }

  console.log("\n✅ 检查完成！");
  console.log("\n━".repeat(40));
}

// ========================================
// 命令行参数处理
// ========================================

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
🔍 远程数据库连接检查工具

功能:
  - 验证是否能连接到 Cloudflare D1 远程数据库
  - 列出所有表及其记录数
  - 显示每个表的示例数据（可选）

用法:
  npm run db:check               # 检查连接并统计表数据
  node check-remote-db.js        # 同上
  npm run db:check -- --detail   # 显示每个表的示例数据

环境变量配置（在 .env 或 .env.local 中设置）:
  DB_NAME - Cloudflare D1 数据库名称（必需）
  DB_ID   - Cloudflare D1 数据库 ID（可选，仅作记录）

前置条件:
  1. 已登录 Cloudflare: wrangler login
  2. 已配置 DB_NAME 环境变量
  3. 有权限访问配置的数据库

示例输出:
  表名                          记录数      状态
  ────────────────────────────────────────────────────────────
  orders                        1,234       ✅
  position_records              567         ✅
  analysis_records              890         ✅
  users                         10          ✅
  traders                       5           ✅
  `);
  process.exit(0);
}

// 执行检查
try {
  checkRemoteDatabase();
} catch (error) {
  console.error("\n❌ 执行失败:", error.message);
  process.exit(1);
}
