#!/usr/bin/env node

const program = require("commander");
const path = require("path");
const inquirer = require("inquirer");
const exec = require("child_process").exec;
const fs = require("fs");

const rootPath = "js-project-template";

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

program
  .command("create")
  .description("hkw cli")
  .action(async () => {
    exec("wmic logicaldisk get caption", async (_, stdout) => {
      const out = stdout.toString().replace(/ /g, "");
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
      const pathRoute = `${dir}:/${rootPath}`;
      if (!fs.existsSync(pathRoute)) {
        fs.mkdirSync(pathRoute);
      }
      const nameList = fs
        .readdirSync(pathRoute)
        .filter((name) => name.startsWith("@test-"))
        .map((name) => name.split("-")[1]);
      let defaultName = "@test-0";
      if (nameList.length > 0) {
        nameList.sort();
        defaultName = `@test-${generateNewName(
          nameList[nameList.length - 1]
        )}`;
      }

      answer = await inquirer.prompt([
        {
          type: "list",
          name: "type",
          message: "请选择模板类型",
          default: "web",
          choices: ["web", "electron"],
        },
      ]);
      const { type } = answer;
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

      copySync(
        path.join(
          __dirname,
          `./template/${
            type === "web" ? " react-webpack-tailwind" : "electron-react"
          }`
        ),
        `${pathRoute}/${project}/`
      );
      console.log(`cd ${pathRoute}/${project}`);
      console.log("npm install");
    });
  });

program.version("1.0.0").parse(process.argv);
