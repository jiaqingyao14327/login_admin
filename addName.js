import fetch from "node-fetch";
import chalk from "chalk";
import { phoneList } from './userConfig.js'

const token = process.env.token;
const userPhone = process.env.phone;

const headers = {
  'Host': '65373d6e95c3170001074c57.caiyicloud.com',
  'Connection': 'keep-alive',
  'terminal-src': 'WEIXIN_MINI',
  'content-type': 'application/json',
  'src': 'weixin_mini',
  'ver': '4.18.1',
  'access-token': token,
  'merchant-id': '65373d6e95c3170001074c57',
  'front-trace-id': 'm1iq9vw173l62hppsvc',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.52(0x18003422) NetType/WIFI Language/zh_CN',
  'Referer': 'https://servicewechat.com/wxe3489c9feaf8f361/37/page-frame.html'
};

async function sleep(second) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, second * 1000);
  });
}

function addName(name, id) {
  return fetch('https://6639d73239137d0001749e04.caiyicloud.com/cyy_gatewayapi/user/buyer/v4/user_audiences', {
    method: 'POST',
    headers: {
      ...headers
    },
    body: JSON.stringify({
      'src': 'weixin_mini',
      'merchantId': '65373d6e95c3170001074c57',
      'ver': '4.18.1',
      'appId': 'wxe3489c9feaf8f361',
      'bizCode': 'FHL_M',
      'name': name,
      'idType': 'ID_CARD',
      'idNo': id
    })
  }).then((res) => res.json())
    .then((res) => {
      if (res.statusCode === 200) {
        console.log(chalk.yellow(res.data.name, '观影人添加成功'))
        return true
      } else {
        console.log(chalk.red(res.comment))
      }
    })
}

function getUser() {
  return fetch('https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/user/buyer/v3/user_audiences?length=500&offset=0&src=weixin_mini&merchantId=65373d6e95c3170001074c57&ver=4.18.1&appId=wxe3489c9feaf8f361', {
    headers: {
      ...headers
    }
  }).then(res => res.json())
    .then(res => {
      return res.data
    })
}


const user = await getUser()
const grabInfo = phoneList.filter(item => item.phone === userPhone)

async function run() {
  if (user.length >= 2) {
    console.log('已经有两个观影人了')
  } else {
    for (let i = 0; i <  grabInfo[0].audiencesList.length; i++) {
      await addName(grabInfo[0].audiencesList[i].name, grabInfo[0].audiencesList[i].id)
      await sleep(1)
    }
  }

}

run();
