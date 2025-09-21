#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 格式化文件大小
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 递归获取目录下所有文件的大小
 */
function getDirectorySize(dirPath) {
  let totalSize = 0;
  const files = [];

  function traverse(currentPath) {
    const stats = fs.statSync(currentPath);
    
    if (stats.isDirectory()) {
      const items = fs.readdirSync(currentPath);
      for (const item of items) {
        traverse(path.join(currentPath, item));
      }
    } else {
      const size = stats.size;
      totalSize += size;
      files.push({
        path: path.relative(path.dirname(__dirname), currentPath),
        size: size,
        formattedSize: formatBytes(size)
      });
    }
  }

  if (fs.existsSync(dirPath)) {
    traverse(dirPath);
  }

  return { totalSize, files };
}

/**
 * 分析构建产物
 */
function analyzeBuildSize() {
  const buildDir = path.join(path.dirname(__dirname), 'build');
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ 构建目录不存在，请先运行构建命令');
    return;
  }

  console.log('🔍 分析构建产物体积...\n');

  // 总体积
  const totalResult = getDirectorySize(buildDir);
  console.log(`📦 总体积: ${formatBytes(totalResult.totalSize)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 客户端体积
  const clientDir = path.join(buildDir, 'client');
  if (fs.existsSync(clientDir)) {
    const clientResult = getDirectorySize(clientDir);
    console.log(`\n🌐 客户端 (client): ${formatBytes(clientResult.totalSize)}`);
    
    // 按类型分组统计
    const clientAssets = clientResult.files.filter(f => f.path.includes('client/assets'));
    const jsFiles = clientAssets.filter(f => f.path.endsWith('.js'));
    const cssFiles = clientAssets.filter(f => f.path.endsWith('.css'));
    const otherFiles = clientAssets.filter(f => !f.path.endsWith('.js') && !f.path.endsWith('.css'));

    if (jsFiles.length > 0) {
      const jsSize = jsFiles.reduce((sum, f) => sum + f.size, 0);
      console.log(`   📜 JavaScript: ${formatBytes(jsSize)} (${jsFiles.length} 个文件)`);
      
      // 显示最大的几个 JS 文件
      const largestJs = jsFiles.sort((a, b) => b.size - a.size).slice(0, 3);
      largestJs.forEach(file => {
        console.log(`      • ${path.basename(file.path)}: ${file.formattedSize}`);
      });
    }

    if (cssFiles.length > 0) {
      const cssSize = cssFiles.reduce((sum, f) => sum + f.size, 0);
      console.log(`   🎨 CSS: ${formatBytes(cssSize)} (${cssFiles.length} 个文件)`);
    }

    if (otherFiles.length > 0) {
      const otherSize = otherFiles.reduce((sum, f) => sum + f.size, 0);
      console.log(`   📁 其他资源: ${formatBytes(otherSize)} (${otherFiles.length} 个文件)`);
    }
  }

  // 服务端体积
  const serverDir = path.join(buildDir, 'server');
  if (fs.existsSync(serverDir)) {
    const serverResult = getDirectorySize(serverDir);
    console.log(`\n🖥️  服务端 (server): ${formatBytes(serverResult.totalSize)}`);
    
    // 显示最大的几个服务端文件
    const largestServer = serverResult.files.sort((a, b) => b.size - a.size).slice(0, 3);
    largestServer.forEach(file => {
      console.log(`   • ${path.basename(file.path)}: ${file.formattedSize}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 提示:');
  console.log('   • 客户端文件会被浏览器下载，影响首屏加载速度');
  console.log('   • 服务端文件在 Cloudflare Workers 中运行，有 1MB 限制');
  console.log('   • 可以使用代码分割和懒加载来优化客户端体积');
}

// 执行分析
analyzeBuildSize();
