#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const inquirer = require("inquirer");
const exec = require("child_process").exec;
const fs = require("fs");

const rootPath = "js-project-template";
const templatePrefix = "hcTest";

let opsys = process.platform;
if (opsys == "darwin") {
  opsys = "MacOS";
} else if (opsys == "win32" || opsys == "win64") {
  opsys = "Windows";
} else if (opsys == "linux") {
  opsys = "Linux";
}

const generateNewName = (oldName) => {
  return Number(oldName) + 1 + "";
};

const copyFileSync = (source, target) => {
  var targetFile = target;

  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
};

const copySync = (source, target, depth = 1) => {
  var files = [];

  var targetFolder =
    depth !== 1 ? path.join(target, path.basename(source)) : target;
  if (!fs.existsSync(targetFolder) && depth !== 1) {
    fs.mkdirSync(targetFolder);
  }

  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copySync(curSource, targetFolder, depth + 1);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
};

const updatePackageJson = (path, cb) => {
  const file = `${path}/package.json`;
  try {
    const packageJson = fs.readFileSync(file);
    const package = JSON.parse(packageJson);
    const result = JSON.stringify(cb(package));
    fs.writeFileSync(file, result);
  } catch (e) {
    console.error("update package.json error -> ", e);
  }
};

program
  .command("create")
  .description("hkw cli")
  .action(async () => {
    exec("wmic logicaldisk get caption", async (_, stdout) => {
      const out = stdout.toString().replace(/ /g, "");
      let pathRoute = "";
      if (opsys === "Windows") {
        let answer = await inquirer.prompt([
          {
            type: "list",
            name: "dir",
            message: "请选择盘符",
            default: "E",
            choices: out
              .split(/[\r\n]+/)
              .filter((str) => str)
              .map((str) => str.slice(0, str.length - 1))
              .slice(1),
          },
        ]);
        const { dir } = answer;
        pathRoute = `${dir}:/${rootPath}`;
      } else {
        const os = require("os");
        pathRoute = os.homedir();
      }
      console.log(pathRoute);

      if (!fs.existsSync(pathRoute)) {
        fs.mkdirSync(pathRoute);
      }
      const nameList = fs
        .readdirSync(pathRoute)
        .filter((name) => name.startsWith(`${templatePrefix}-`))
        .map((name) => name.split("-")[1]);
      let defaultName = `${templatePrefix}-0`;
      if (nameList.length > 0) {
        nameList.sort();
        defaultName = `${templatePrefix}-${generateNewName(
          nameList[nameList.length - 1]
        )}`;
      }

      answer = await inquirer.prompt([
        {
          type: "list",
          name: "choose_template",
          message: "请选择模板类型",
          default: "web",
          choices: [
            "web",
            "electron",
            "chrome-extension",
            "nextjs",
            "commerce",
          ],
        },
      ]);
      const { choose_template } = answer;
      let project;
      while (true) {
        answer = await inquirer.prompt([
          {
            type: "input",
            name: "project",
            message: "请输入项目别名",
            default: defaultName,
          },
        ]);
        const { project: p } = answer;
        project = p;
        if (fs.existsSync(`${pathRoute}/${project}`)) {
          console.log("重名，请重新输入");
          continue;
        } else {
          break;
        }
      }
      fs.mkdirSync(`${pathRoute}/${project}`);

      let templates = "";

      switch (choose_template) {
        case "web":
          templates = "react-webpack-tailwind";
          break;
        case "electron":
          templates = "electron-react";
          break;
        case "chrome-extension":
          templates = "react-tailwind-chrome-extensions";
          break;
        case "nextjs":
          templates = "nextjs-tailwind";
          break;
        case "commerce":
          templates = "cloudflare-commerce";
          break;
      }

      const source = path.join(__dirname, `./template/${templates}`);
      const target = `${pathRoute}/${project}/`;

      copySync(source, target);

      updatePackageJson(`${pathRoute}/${project}`, (json) => {
        json["name"] = project;
        return json;
      });
      console.log(`cd ${pathRoute}/${project}`);
      console.log("npm install");
    });
  });

program.version("1.0.0").parse(process.argv);
