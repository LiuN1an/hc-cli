#!/usr/bin/env node

import { writeFileSync, existsSync, readdirSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 环境检测
function checkEnvironment() {
  const isDevelopment = process.env.NODE_ENV !== 'production' && 
                       (process.env.NODE_ENV === 'development' || 
                        !process.env.NODE_ENV || 
                        process.env.CF_PAGES !== '1');
  
  if (!isDevelopment) {
    console.log(`⚠️  当前环境不是开发环境，数据库工具仅在开发环境使用`);
    console.log(`   NODE_ENV = ${process.env.NODE_ENV || 'undefined'}`);
    process.exit(1);
  }
}

function findLocalD1Database() {
  const d1Dir = "./.alchemy/miniflare/v3/d1/miniflare-D1DatabaseObject/";
  
  if (!existsSync(d1Dir)) {
    console.log(`⚠️  数据库目录不存在: ${d1Dir}`);
    console.log(`   请先运行测试创建数据库：npm run test`);
    return null;
  }
  
  const files = readdirSync(d1Dir);
  const sqliteFile = files.find(file => 
    file.endsWith('.sqlite') && 
    !file.endsWith('.sqlite-shm') && 
    !file.endsWith('.sqlite-wal')
  );
  
  if (sqliteFile) {
    const dbPath = resolve(d1Dir, sqliteFile);
    console.log(`🎯 找到本地数据库文件: ${sqliteFile}`);
    return dbPath;
  }
  
  return null;
}

function updateEnvFile(dbPath) {
  const envFile = '.env.local';
  
  if (!dbPath) {
    console.log(`❌ 未找到数据库文件，无法更新 ${envFile}`);
    return false;
  }
  
  let envContent = '';
  
  // 如果环境文件存在，读取现有内容
  if (existsSync(envFile)) {
    envContent = readFileSync(envFile, 'utf8');
  }
  
  // 更新或添加 DATABASE_URL
  const dbUrlLine = `DATABASE_URL=${dbPath}`;
  
  if (envContent.includes('DATABASE_URL=')) {
    // 替换现有的 DATABASE_URL
    envContent = envContent.replace(/DATABASE_URL=.*$/m, dbUrlLine);
  } else {  
    // 添加新的 DATABASE_URL
    envContent += envContent ? `\n${dbUrlLine}\n` : `${dbUrlLine}\n`;
  }
  
  writeFileSync(envFile, envContent);
  console.log(`✅ 已更新 ${envFile}`);
  return true;
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { 
      stdio: 'inherit'
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    proc.on('error', reject);
  });
}

async function runSqlCommand(dbPath, sql) {
  try {
    const command = `sqlite3 "${dbPath}" "${sql}"`;
    const { stdout } = await execAsync(command);
    console.log(stdout);
  } catch (error) {
    console.error(`❌ SQL执行失败:`, error.message);
  }
}

async function main() {
  const action = process.argv[2] || 'set-path';
  
  // 对于关键操作检查环境
  if (['studio', 'studio-open', 'inspect', 'query', 'clear'].includes(action)) {
    checkEnvironment();
  }
  
  const dbPath = findLocalD1Database();
  
  switch (action) {
    case 'set-path':
      updateEnvFile(dbPath);
      break;
      
    case 'studio':
      if (updateEnvFile(dbPath)) {
        console.log(`🚀 启动 Drizzle Studio (开发环境)...`);
        console.log(`   访问地址: http://localhost:4983`);
        await runCommand('drizzle-kit', ['studio']);
      }
      break;
      
    case 'studio-open':
      if (updateEnvFile(dbPath)) {
        console.log(`🚀 启动 Drizzle Studio (开放访问)...`);
        console.log(`   本地访问: http://localhost:4983`);
        console.log(`   网络访问: http://0.0.0.0:4983`);
        await runCommand('drizzle-kit', ['studio', '--host', '0.0.0.0']);
      }
      break;
      
    case 'inspect':
      if (dbPath) {
        console.log(`🔍 检查数据库表结构:`);
        await runSqlCommand(dbPath, '.tables');
        console.log(`\n📊 数据库记录统计:`);
        await runSqlCommand(dbPath, 'SELECT COUNT(*) as total FROM tracking_events;');
        console.log(`\n🔍 最近5条记录:`);
        await runSqlCommand(dbPath, 'SELECT * FROM tracking_events ORDER BY created_at DESC LIMIT 5;');
      }
      break;
      
    case 'query':
      if (dbPath) {
        const query = process.argv[3] || 'SELECT * FROM tracking_events LIMIT 5;';
        console.log(`🔍 执行查询: ${query}`);
        await runSqlCommand(dbPath, query);
      }
      break;  
      
    case 'clear':
      if (dbPath) {
        console.log(`🗑️  清空测试数据...`);
        await runSqlCommand(dbPath, 'DELETE FROM tracking_events;');
        console.log(`✅ 数据已清空`);
      }
      break;
      
    default:
      console.log(`💡 数据库开发工具 (仅限开发环境)：
  npm run db:studio      # 🚀 启动 Drizzle Studio（本地访问）
  npm run db:studio:open # 🌐 启动 Drizzle Studio（开放访问）
  npm run db:set-path    # 📁 设置数据库路径到环境变量
  npm run db:inspect     # 🔍 检查数据库结构和数据
  npm run db:query       # 📊 执行 SQL 查询
  npm run db:clear       # 🗑️ 清空测试数据
      `);
  }
}

main().catch(console.error); 