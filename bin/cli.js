#!/usr/bin/env node

const { program } = require("commander");
const path = require("path");
const inquirer = require("inquirer");
const fs = require("fs");
const os = require("os");

// 模板目录
const TEMPLATE_DIR = path.join(__dirname, "template");

// 配置文件路径
const CONFIG_DIR = path.join(os.homedir(), ".hc-cli");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

// 默认项目目录（按系统区分）
const DEFAULT_PROJECT_DIR = {
  darwin: path.join(os.homedir(), "Projects"),
  win32: path.join(os.homedir(), "Projects"),
  linux: path.join(os.homedir(), "Projects"),
};

// 模板显示名称映射
const TEMPLATE_DISPLAY_NAMES = {
  "alchemy-react-router-v7-drizzle-session":
    "Alchemy + React Router v7 + Drizzle + Session",
  "cloudflare-commerce": "Cloudflare Commerce (Next.js)",
  "electron-react": "Electron + React",
  "monorepo-cf-alchemy-drizzle":
    "Monorepo + React Router 7 + Alchemy + Drizzle",
  "nextjs-prisma": "Next.js + Prisma",
  nextjs: "Next.js + Tailwind",
  "opennext-drizzle-cron": "OpenNext + Drizzle + Cron",
  "react-router-v7": "React Router v7",
  "react-tailwind-chrome-extensions": "Chrome Extension (React + Tailwind)",
  "react-webpack-tailwind": "React + Webpack + Tailwind",
};

// ==================== 配置管理 ====================

/**
 * 读取配置
 */
const loadConfig = () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("读取配置失败:", e.message);
  }
  return {};
};

/**
 * 保存配置
 */
const saveConfig = (config) => {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (e) {
    console.error("保存配置失败:", e.message);
    return false;
  }
};

/**
 * 获取默认项目目录
 */
const getDefaultProjectDir = () => {
  const config = loadConfig();
  if (config.defaultDir) {
    return config.defaultDir;
  }
  return (
    DEFAULT_PROJECT_DIR[process.platform] || path.join(os.homedir(), "Projects")
  );
};

// ==================== 工具函数 ====================

/**
 * 获取所有可用模板
 */
const getAvailableTemplates = () => {
  const templates = fs.readdirSync(TEMPLATE_DIR).filter((name) => {
    const templatePath = path.join(TEMPLATE_DIR, name);
    return fs.statSync(templatePath).isDirectory();
  });

  return templates.map((dir) => ({
    name: TEMPLATE_DISPLAY_NAMES[dir] || dir,
    value: dir,
  }));
};

/**
 * 递归复制文件
 */
const copyFileSync = (source, target) => {
  let targetFile = target;

  if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
    targetFile = path.join(target, path.basename(source));
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
};

/**
 * 递归复制目录
 */
const copySync = (source, target, isRoot = true) => {
  const targetFolder = isRoot
    ? target
    : path.join(target, path.basename(source));

  if (!isRoot && !fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach((file) => {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copySync(curSource, targetFolder, false);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
};

/**
 * 更新 package.json
 */
const updatePackageJson = (projectPath, updateFn) => {
  const filePath = path.join(projectPath, "package.json");
  try {
    const packageJson = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const updated = updateFn(packageJson);
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
  } catch (e) {
    console.error("更新 package.json 失败:", e.message);
  }
};

/**
 * 生成项目名
 */
const generateProjectName = (basePath, prefix = "project") => {
  if (!fs.existsSync(basePath)) return `${prefix}-1`;

  const existing = fs
    .readdirSync(basePath)
    .filter((name) => name.startsWith(`${prefix}-`))
    .map((name) => parseInt(name.split("-")[1], 10))
    .filter((num) => !isNaN(num));

  const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}-${nextNum}`;
};

// ==================== 命令定义 ====================

// set 命令组
const setCmd = program.command("set").description("配置管理");

// hc set default <path> - 设置默认目录
setCmd
  .command("default [path]")
  .description("设置默认项目创建目录")
  .action((inputPath) => {
    const config = loadConfig();

    if (!inputPath) {
      // 没有参数，显示当前配置
      const currentDefault = config.defaultDir || getDefaultProjectDir();
      console.log(`\n当前默认目录: ${currentDefault}`);
      console.log(`配置文件: ${CONFIG_FILE}\n`);
      return;
    }

    const targetPath = path.resolve(inputPath);

    // 创建目录（如果不存在）
    if (!fs.existsSync(targetPath)) {
      try {
        fs.mkdirSync(targetPath, { recursive: true });
        console.log(`已创建目录: ${targetPath}`);
      } catch (e) {
        console.error(`创建目录失败: ${e.message}`);
        process.exit(1);
      }
    }

    config.defaultDir = targetPath;
    if (saveConfig(config)) {
      console.log(`\n✅ 默认目录已设置为: ${targetPath}\n`);
    }
  });

// hc set current - 把当前目录设为默认
setCmd
  .command("current")
  .description("将当前目录设为默认项目创建目录")
  .action(() => {
    const currentDir = process.cwd();
    const config = loadConfig();

    config.defaultDir = currentDir;
    if (saveConfig(config)) {
      console.log(`\n✅ 默认目录已设置为当前目录: ${currentDir}\n`);
    }
  });

// hc config - 查看所有配置
program
  .command("config")
  .description("查看当前配置")
  .action(() => {
    const config = loadConfig();
    const defaultDir = getDefaultProjectDir();

    console.log("\n当前配置:");
    console.log("─".repeat(40));
    console.log(`默认项目目录: ${defaultDir}`);
    console.log(`配置文件位置: ${CONFIG_FILE}`);
    console.log(`系统平台: ${process.platform}`);
    console.log("─".repeat(40));

    if (Object.keys(config).length > 0) {
      console.log("\n配置详情:");
      console.log(JSON.stringify(config, null, 2));
    }
    console.log("");
  });

// hc create - 创建项目
program
  .command("create")
  .description("创建新项目")
  .option("-d, --dir <directory>", "项目创建目录（不指定则使用默认目录）")
  .action(async (options) => {
    // 确定目标目录
    const targetDir = options.dir
      ? path.resolve(options.dir)
      : getDefaultProjectDir();

    // 确保目标目录存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`已创建目录: ${targetDir}`);
    }

    console.log(`\n项目将创建在: ${targetDir}\n`);

    // 获取可用模板
    const templates = getAvailableTemplates();
    if (templates.length === 0) {
      console.error("没有找到可用模板");
      process.exit(1);
    }

    // 选择模板
    const { template } = await inquirer.prompt([
      {
        type: "list",
        name: "template",
        message: "选择项目模板",
        choices: templates,
      },
    ]);

    // 输入项目名
    const defaultName = generateProjectName(targetDir);
    let projectName;

    while (true) {
      const { name } = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "项目名称",
          default: defaultName,
          validate: (input) => {
            if (!input.trim()) return "项目名称不能为空";
            if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
              return "项目名称只能包含字母、数字、下划线和连字符";
            }
            return true;
          },
        },
      ]);

      projectName = name.trim();
      const projectPath = path.join(targetDir, projectName);

      if (fs.existsSync(projectPath)) {
        console.log(`目录 ${projectName} 已存在，请重新输入`);
        continue;
      }
      break;
    }

    // 创建项目
    const projectPath = path.join(targetDir, projectName);
    const templatePath = path.join(TEMPLATE_DIR, template);

    console.log(`\n正在创建项目 ${projectName}...`);

    fs.mkdirSync(projectPath, { recursive: true });
    copySync(templatePath, projectPath);

    // 更新 package.json
    updatePackageJson(projectPath, (pkg) => {
      pkg.name = projectName;
      return pkg;
    });

    // 输出后续步骤
    console.log("\n✅ 项目创建成功！\n");
    console.log("后续步骤:");
    console.log(`  cd ${projectPath}`);
    console.log("  pnpm install  # 或 npm install / yarn");
    console.log("");
  });

// hc list - 列出模板
program
  .command("list")
  .description("列出所有可用模板")
  .action(() => {
    const templates = getAvailableTemplates();
    console.log("\n可用模板:\n");
    templates.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name}`);
      console.log(`     目录: ${t.value}\n`);
    });
  });

program.version("1.0.0").parse(process.argv);
