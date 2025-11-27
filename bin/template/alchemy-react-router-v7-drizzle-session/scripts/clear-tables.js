#!/usr/bin/env node

import { execSync } from "child_process";

/**
 * 清空交易系统数据表（保留traders表）
 * 清空顺序：orders → position_records → analysis_records → users
 *
 * 表关系分析：
 * - orders 引用 traders.id (onDelete: cascade)
 * - position_records 引用 traders.id (onDelete: restrict)
 * - analysis_records 引用 traders.id (onDelete: restrict)
 * - users 无外键依赖
 * - traders 保留不清空（基础数据）
 *
 * 因此需要先清空引用traders的子表，最后清空独立表
 */

// ========================================
// 配置区域 - 修改这里的值来匹配你的数据库
// ========================================
const DB_CONFIG = {
  databaseName: "xxx",
  databaseId: "xxx",

  // 要清空的表（按顺序）- 不包括traders表
  tables: [
    "orders", // 1. 先清空订单表（引用traders）
    "position_records", // 2. 再清空持仓记录表（引用traders）
    "analysis_records", // 3. 再清空分析记录表（引用traders）
    "users", // 4. 最后清空用户表（独立表）
  ],
};

// ========================================
// 清空逻辑
// ========================================

/**
 * 执行SQL命令
 */
function executeSql(sql) {
  const { databaseName } = DB_CONFIG;
  // 添加 --yes 标志自动确认，--json 标志获取结构化输出
  // 使用 bunx 代替 npx 避免权限问题
  const command = `bunx wrangler d1 execute ${databaseName} --remote --yes --json --command="${sql}"`;

  try {
    const output = execSync(command, {
      encoding: "utf-8",
    });

    // 解析 JSON 输出验证执行结果
    try {
      const result = JSON.parse(output);
      return true;
    } catch (parseError) {
      // 如果不是 JSON 格式，只要没抛异常就认为成功
      return true;
    }
  } catch (error) {
    console.error(`   ❌ 执行失败: ${error.message}`);
    if (error.stdout) {
      console.error(`   输出: ${error.stdout.toString()}`);
    }
    if (error.stderr) {
      console.error(`   错误: ${error.stderr.toString()}`);
    }
    return false;
  }
}

/**
 * 获取表的记录数
 */
function getTableCount(tableName) {
  const { databaseName } = DB_CONFIG;
  // 使用 bunx 代替 npx 避免权限问题
  const command = `bunx wrangler d1 execute ${databaseName} --remote --json --command="SELECT COUNT(*) as count FROM ${tableName}"`;

  try {
    const output = execSync(command, {
      encoding: "utf-8",
    });

    // 解析 JSON 输出
    try {
      const result = JSON.parse(output);
      // D1 JSON 输出格式：[{results: [{count: 123}]}]
      if (result && result[0] && result[0].results && result[0].results[0]) {
        return result[0].results[0].count || 0;
      }
    } catch (parseError) {
      // 如果 JSON 解析失败，尝试旧的表格解析方式
      const match = output.match(/│\s*(\d+)\s*│/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return 0;
  } catch (error) {
    console.error(`   ⚠️  无法获取记录数: ${error.message}`);
    return 0;
  }
}

/**
 * 清空单个表
 */
function clearTable(tableName) {
  console.log(`\n📋 清空表: ${tableName}`);

  // 获取清空前的记录数
  const beforeCount = getTableCount(tableName);
  console.log(`   清空前记录数: ${beforeCount}`);

  if (beforeCount === 0) {
    console.log(`   ℹ️  表已为空，跳过清空操作`);
    return true;
  }

  // 执行清空操作
  console.log(`   🔄 正在清空...`);
  const success = executeSql(`DELETE FROM ${tableName}`);

  if (success) {
    // 获取清空后的记录数验证
    const afterCount = getTableCount(tableName);
    if (afterCount === 0) {
      console.log(`   ✅ 清空成功！删除了 ${beforeCount} 条记录`);
      return true;
    } else {
      console.log(`   ⚠️  清空可能不完整，剩余 ${afterCount} 条记录`);
      return false;
    }
  }

  return false;
}

/**
 * 清空所有表（保留traders表）
 */
function clearAllTables() {
  const { tables, databaseName } = DB_CONFIG;

  console.log("\n━".repeat(30));
  console.log("🗑️  清空交易系统数据表");
  console.log("━".repeat(30));
  console.log(`\n📦 数据库名称: ${databaseName}`);
  console.log(`📋 清空顺序: ${tables.join(" → ")}`);
  console.log(`✅ 保留表: traders（不会被清空）`);
  console.log(`\n⚠️  警告: 此操作将永久删除以下表的所有数据:`);
  tables.forEach((table) => {
    console.log(`   - ${table}`);
  });

  // 等待5秒，给用户反悔的机会
  console.log(`\n⏰ 5秒后开始执行清空操作... (Ctrl+C 取消)`);

  // 倒计时
  for (let i = 5; i > 0; i--) {
    process.stdout.write(`   ${i}...`);
    execSync("sleep 1");
  }
  console.log("\n");

  console.log("🚀 开始清空操作...\n");

  const results = {
    success: [],
    failed: [],
  };

  // 按顺序清空每个表
  for (const table of tables) {
    const success = clearTable(table);
    if (success) {
      results.success.push(table);
    } else {
      results.failed.push(table);
      console.error(`\n❌ 清空 ${table} 失败，停止后续操作`);
      break;
    }
  }

  // 输出总结
  console.log("\n━".repeat(30));
  console.log("📊 清空结果总结");
  console.log("━".repeat(30));

  if (results.success.length > 0) {
    console.log(`\n✅ 成功清空的表 (${results.success.length}):`);
    results.success.forEach((table) => {
      console.log(`   ✓ ${table}`);
    });
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ 清空失败的表 (${results.failed.length}):`);
    results.failed.forEach((table) => {
      console.log(`   ✗ ${table}`);
    });
  }

  if (results.failed.length === 0) {
    console.log("\n🎉 所有表清空完成！");
    return true;
  } else {
    console.log("\n⚠️  部分表清空失败，请检查错误信息");
    return false;
  }
}

// ========================================
// 命令行参数解析
// ========================================

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
🗑️  清空交易系统数据表工具

功能:
  清空 orders、position_records、analysis_records、users 四个表
  保留 traders 表（基础数据）
  按照外键依赖顺序清空，避免约束错误

用法:
  npm run clear           # 清空所有数据表（保留traders）
  node clear-tables.js    # 同上

清空顺序:
  1. orders (订单表 - 引用 traders)
  2. position_records (持仓记录表 - 引用 traders)
  3. analysis_records (分析记录表 - 引用 traders)
  4. users (用户表 - 独立表)

表关系说明:
  orders 引用: traders.id (onDelete: cascade)
  position_records 引用: traders.id (onDelete: restrict)
  analysis_records 引用: traders.id (onDelete: restrict)
  users: 独立表，无外键依赖
  traders: 保留不清空（基础数据表）
  
  因此必须先清空子表（orders, position_records, analysis_records），再清空独立表（users）

配置:
  在 clear-tables.js 文件的 DB_CONFIG 对象中修改数据库配置
  - databaseName: 数据库名称
  - databaseId: 数据库ID（仅作配置记录）
  - tables: 要清空的表列表（按外键依赖顺序）

安全措施:
  - 执行前会显示5秒倒计时，可按 Ctrl+C 取消
  - 显示清空前的记录数
  - 验证清空后的记录数
  - 如有失败会立即停止后续操作

示例:
  npm run clear                    # 清空所有数据表（保留traders）

注意:
  ⚠️  此操作不可逆！请确保已备份重要数据
  ⚠️  traders 表数据会被保留，其他所有表数据将被清空
  `);
  process.exit(0);
}

// 执行清空
const success = clearAllTables();
process.exit(success ? 0 : 1);
