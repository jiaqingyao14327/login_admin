import chalk from "chalk";
import { exec } from "node:child_process";
import { userTokens } from './userConfig.js'

function tip(...args) {
  console.log(chalk.yellow(...args));
}

userTokens.filter(Boolean).forEach((token, index) => {
  const childProcess = exec(`token=${token.token} phone=${token.phone} node addName.js`);
  childProcess.stdout.on("data", async (data) => {
    const date = new Date();
    tip(`${new Date().toLocaleString()}.${date.getMilliseconds().toFixed(3)}`);
    console.log(`[账户${index}]`, data);
  });
  childProcess.stdout.on("close", (data) => {
    console.log(chalk.cyan(`账户${index}, 退出！！`));
  });
});
