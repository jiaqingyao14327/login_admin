import chalk from "chalk";
import { exec } from "node:child_process";
import fs from "fs";

function tip(...args) {
  console.log(chalk.yellow(...args));
}

const usertokens = [
  "eyJ0eXAiOiJKV1QiLCJjdHkiOiJKV1QiLCJ6aXAiOiJERUYiLCJhbGciOiJSUzUxMiJ9.eNp8kE1Lw0AQhv_LnHPY748cK4pCi1DswZNskgkNJLtlsxG19L-7S1r15GmY4X3eeWfOENySjk--D1D7ZRwrWGaMa3-GZvi6Cx1CDQ-P27cdVDAvzeZnqLjmVnNJiNCEEkKoVIpxl3WZ3IexiDaH1_t9nkypPRTrroDCdC3lmshO96yAzDZG8BX8lUnjnDKyy8WaIus11ZzApQL8OA0RX4YJb8Ez-XzC6FL4j2Z9XtJGdOkKU00JZ1YboZnKB37OCaf1wNV3wtgenU9_n5S3X0murBEVvGOch-ChLh7lhd7dkl2-AQAA__8.Y9KxsAUR-WQJeIKyj3O5hFvAUb83-J_Uo2LF9_7L89yrM699yM6lzQxJMPIj6A90CRSWFLZwO214QASGtJUvslinm1CdyjNqddSc2aqvNdoVbs3xY72MmEFExe8uhyGSeiFKFlNtcJwt4gW7iuaW8CyvvghlF3GuKUqJIhpZYpI",
  "eyJ0eXAiOiJKV1QiLCJjdHkiOiJKV1QiLCJ6aXAiOiJERUYiLCJhbGciOiJSUzUxMiJ9.eNp8kM1OwzAQhN9lzzn4306PRSCQQEgVPXBCdrJRIyV25TgIqPru2HILnDjuaL7dmT1BsGs6PPghwMav09TAumCs8wnc-HUTeoQN3N0_vj1BA8vqtj-i4pq3mktChCaUEEKlUozb7MvkLkzFtN2_3u6yMqduX1b3BRS6b5VhEpmTooCOczfoCv7apDGiG4ix0rak2KjqueJwbgA_jmPEl3HGa_BMPh8x2hT-pVk-0kW06QJTTQlnbQ5jqM4FP5eEcy1Y984Yu4P16e-T8vULyTVhsoF3jMsYfBZFfaG312TnbwAAAP__.FtH_qQqb-PlBJLwpQpHZ7pstYUav3Ny0fF8mA2d1MhEmgIbw4zlL3c6_yV3rrcdPsayWtv2-7OqJrEvwzUQWFPBl9dO4nuRZniW8pWhuHbzfHMHr0NIqoqYDKs0b95-GNqE9Do_MZ8XW3_WyLnTorSHvLpcOMa9VAapc-kYi768",
  "eyJ0eXAiOiJKV1QiLCJjdHkiOiJKV1QiLCJ6aXAiOiJERUYiLCJhbGciOiJSUzUxMiJ9.eNp8kE9rwzAMxb-LzjnYcWwnOXZsbLAxKO1hp-HYMg0kdnGc0T_0u8-Zl9HTQBeJ93t60hW8muPhxVkPrZuHoYB5wpD7K3T95cEbhBaenl8_36CAae42f0PBJGsk44RUklBCCOVClEwlXSK3flhEm_3H4zZNxqj3i7VZQK5kbawRSihWL6BFa7XJ4J3MVJKXje5qKn9kdUcEF3ArAE_HPuCuH3ENnsj3IwYV_b80T0t0QBV_YSopYSxVWTUkHXieIo75wOw7YtAH5eL9k9L2lZSclQV8YZh676CV-YNOrcFu3wAAAP__.CcuLmzJiZuXXPz0NTeH2aUHJfr203HpYPVfWtjAuBD69UUuYqfVTYvkZjNUAUE_dHEkmHZ3ceSNsSMjLMmJt39v8WSiEu0SbWcTjeTfgwCDWttE9B9oO29pyLs1tNWk2XgAR97vEIYfGpEGmwUenvR3LzeS64ti4outwp-llFHE",
];
usertokens.filter(Boolean).forEach((token, index) => {
  const childProcess = exec(`token=${token} node main.js`);
  childProcess.stdout.on("data", async (data) => {
    const date = new Date();
    tip(`${new Date().toLocaleString()}.${date.getMilliseconds().toFixed(3)}`);
    console.log(`[账户${index}]`, data);
    // if (data.includes("下单成功")) {
    //   fs.appendFile("结果.txt", `\n${data}`, (err) => {
    //     if (err) {
    //       console.log(err);
    //       return;
    //     }
    //   });
    // }
  });
  childProcess.stdout.on("close", (data) => {
    console.log(chalk.cyan(`账户${index}, 退出！！`));
  });
});
