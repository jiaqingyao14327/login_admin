import chalk from "chalk";
import { exec } from "node:child_process";
import fs from "fs";
import { userTokens } from './userConfig.js'

function tip(...args) {
  console.log(chalk.yellow(...args));
}

userTokens.filter(Boolean).forEach((token, index) => {
  const childProcess = exec(`token=${token.token} phone=${token.phone} index=${index} node main.js`);
  childProcess.stdout.on("data", async (data) => {
    const date = new Date();
    tip(`${new Date().toLocaleString()}.${date.getMilliseconds().toFixed(3)}`);
    console.log(`[账户${index}]`, data);
    if (data.includes("下单成功")) {
      fs.appendFile("结果.txt", `\n${data}`, (err) => {
        if (err) {
          console.log(err);
          return;
        }
      });
    }
  });
  childProcess.stdout.on("close", (data) => {
    console.log(chalk.cyan(`账户${index}, 退出！！`));
  });
});
