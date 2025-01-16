import axios from "axios";
import request from "request";
import util from "util";
import config from "./config.js";
import fetch from "node-fetch";
import fs from "fs";

const token = process.env.token;
const user_phone = process.env.phone;
const index = Number(process.env.index);
let name = "E_TICKET";

const headers = {
  'Host': '65373d6e95c3170001074c57.caiyicloud.com',
  'Connection': 'keep-alive',
  'terminal-src': 'WEIXIN_MINI',
  'content-type': 'application/json',
  'src': 'weixin_mini',
  'ver': '4.21.2',
  'access-token': token,
  'merchant-id': '65373d6e95c3170001074c57',
  'front-trace-id': 'm33wp6bbhmv4flpv0ht',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.53(0x1800352c) NetType/WIFI Language/zh_CN',
  'Referer': 'https://servicewechat.com/wxe3489c9feaf8f361/42/page-frame.html'
};

function getPhone() {
  return fetch(
    "https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/user/buyer/v3/profile",
    {
      headers: {
        ...headers,
      },
      method: "GET",
    }
  )
    .then((res) => res.json())
    .then(
      (res) => {
        console.log("手机号获取成功", res.data.cellphone);
        return res.data.cellphone;
      },
      (err) => {
        throw err;
      }
    )
}

let ip = "";
async function createOrder(
  seat_plan_id,
  price,
  session_id,
  names,
  sessionName
) {
  ip_index++
  const data = {
    'src': 'weixin_mini',
    'merchantId': '65373d6e95c3170001074c57',
    // 'channelId': '663c7e38f127a7e5d51ac811',
    'ver': '4.21.2',
    'appId': 'wxe3489c9feaf8f361',
    locationParam: {
      locationCityId: "1101",
    },
    paymentParam: {
      payAmount: price * config.audience_number + '.00',
      totalAmount: price * config.audience_number + '.00',
    },
    priceItemParam: [
      {
        applyTickets: [],
        priceItemName: "票款总额",
        priceItemVal: price * config.audience_number + '.00',
        priceItemType: "TICKET_FEE",
        priceItemSpecies: "SEAT_PLAN",
        direction: "INCREASE",
        priceDisplay: "￥" + price * config.audience_number,
      },
    ],
    items: [
      {
        sku: {
          skuId: seat_plan_id,
          skuType: "SINGLE",
          ticketPrice: price + '.00',
          qty: config.audience_number,
          ticketItems: generateId,
        },
        spu: {
          showId: config.show_id,
          sessionId: session_id,
          'promotionVersionHash': 'EMPTY_PROMOTION_HASH',
        },
        deliverMethod: name,
      },
    ],
    many2OneAudience: {},
    addressParam: {},
  };
    
  let options = ip
    ? {
      url: "https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/trade/buyer/order/v5/create_order",
      headers: {
        ...headers,
      },
      proxy: util.format(
        "http://%s",
        `${ip[ip_index].ip}:${ip[ip_index].port}`
      ),
      method: "POST",
      json: data,
    }
    : {
      url: "https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/trade/buyer/order/v5/create_order",
      headers: {
        ...headers,
      },
      method: "POST",
      json: data,
    };

    const timer = setInterval(async() => {
      if (Date.now() + 1000 > new Date(config.target_time)) {
        clearInterval(timer)
        return new Promise((resolve, reject) => {
          request(options, async (error, res, body) => {
            if (!error && res.statusCode == 200) {
              const date = new Date();
              fs.appendFileSync("请求日志.txt", `${new Date().toLocaleString()}.${date.getMilliseconds().toFixed(3)}\n${user_phone}下单--${names}${price}--${sessionName}--${JSON.stringify(body.comments)}\n`, (err) => {
                if (err) {
                  console.log(err);
                  return;
                }
              });
              if (body.statusCode === 200) {
                fs.appendFileSync("下单成功.txt", `${user_phone}下单--${names}${price}--${sessionName}--成功\n`, (err) => {
                  if (err) {
                    console.log(err);
                    return;
                  }
                });
                console.log("下单成功", user_phone);
                // notifyDingDing(sessionName);
                getPaySuccess(body.data.unPaidTransactionIds, price, sessionName, names);
                resolve(body);
              } else if (
                body.comments.includes("已购买过") ||
                body.comments.includes("您有待支付订单")
              ) {
                console.log("快去看看订单吧", body.comments);
                resolve(body);
                return true;
              }
              if (ip_index === ip.length - 2) {
                ip_index = -1
                await getIp()
              }
              console.log(body.comments);
              await createOrder(
                seat_plan_id,
                price,
                session_id,
                names,
                sessionName
              )
              // reject("下单失败");
            } else {
              await createOrder(
                seat_plan_id,
                price,
                session_id,
                names,
                sessionName
              )
            }
          });
        });
      } else {
        console.log('等待中～')
        await sleep(100)
      }
    }, 100)
}

function getPaySuccess(arr, price, sessionName, names) {
  const data = {
    'src': 'weixin_mini',
    'merchantId': '65373d6e95c3170001074c57',
    // 'channelId': '663c7e38f127a7e5d51ac811',
    'ver': '4.21.2',
    'appId': 'wxe3489c9feaf8f361',
    transactionIds: arr,
    platform: "WEIXIN_MINI",
    browserType: "OTHER",
  };
  return fetch(
    "https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/trade/buyer/v3/payments/cashiers",
    {
      method: "POST",
      headers: {
        ...headers,
      },
      body: JSON.stringify(data),
    }
  )
    .then((res) => res.json())
    .then(
      async (res) => {
        if (res.statusCode === 200) {
          await getAudiences(arr);
          fs.appendFileSync(
            "支付宝支付链接.txt",
            `\n${user_phone}-${names}${price}-${sessionName}-${config.audience_number}张`,
            (err) => {
              if (err) {
                console.log(err);
                return;
              }
            }
          );
          return true
        }
        console.log(res.comments);
        throw Error("获取链接失败");
      },
      (err) => {
        throw err;
      }
    );
}

function getAudiences(arr) {
  const data = {
    'src': 'weixin_mini',
    'merchantId': '65373d6e95c3170001074c57',
    'ver': '4.1.3',
    'appId': 'wx459c905b59f92c86',
    transactionIds: arr,
    openId: "oK6414-SfJzvdM44hejiezW8E_aQ",
    platform: "WEIXIN_MINI",
    paymentProduct: "WEIXIN_MINI_PROGRAM",
    thirdPartyUserId: "oK6414-SfJzvdM44hejiezW8E_aQ",
    isNewCyy: true,
    returnUrl: "",
  };
  return fetch(
    "https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/trade/buyer/v3/payments/pay",
    {
      method: "POST",
      headers: {
        ...headers,
      },
      body: JSON.stringify(data),
    }
  )
    .then((res) => res.json())
    .then(
      (res) => {
        console.log(res);
        return true
      },
      (err) => {
        throw err;
      }
    );
}


function getIp() {
  console.log('获取Ip')
  return axios({
    // 'http://api2.xkdaili.com/tools/XApi.ashx?apikey=XKFDFED582CB1878F767&qty=50&format=json&split=0&sign=a324f08be26bae56385e6cf2f8fb924f' 17641222767
    // 'http://api2.xkdaili.com/tools/XApi.ashx?apikey=XK9407CE397DDBA50D65&qty=1&format=txt&split=0&sign=bc069e1c951656fe91de50073f8269ed' 19110272767
    url: 'http://api2.xkdaili.com/tools/XApi.ashx?apikey=XK9407CE397DDBA50D65&qty=50&format=json&split=0&sign=bc069e1c951656fe91de50073f8269ed',
    method: "get",
  }).then((res) => {
    ip = res.data.data;
  }).catch((err) => {
  });
}

function notifyDingDing(sessionName) {
  fetch(
    "https://sea.pri.ibanyu.com/qtapi/base/alertmanager/dingtalk/person/content/send",
    {
      method: "POST",
      headers: {
        Authorization:
          "prn=prn:pf-cn:api:hz::/qtapi/base/alertmanager/dingtalk/person/content/send,action=POST,token=eyJhbGciOiJIUzI1NiIsImtpZCI6MTYwNjEzODA3MCwidHlwIjoiSldUIn0.eyJpc3MiOiJJQU0iLCJzdWIiOiJncm91cCBzOS9zb1pzMGpFUFlQWVRTYVJCcWx3PT0ifQ.kySjkOTlsN7tHvH7zHqkiO-8TGlX_yeO1fP4I-vZDdE",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `${phone}----${sessionName}硬核喜剧下单成功啦，快去付款吧`,
        content_type: 1,
        namespace: "你有一笔意外之财的通知",
        receiver_list: ["jiaqingyao14327"],
        title: "成功~",
      }),
    }
  );
}

function getAudienceList() {
  return fetch(
    "https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/user/buyer/v3/user_audiences?idTypes=ID_CARD,PASSPORT,MAINLAND_TRAVEL_PERMIT_TAIWAN,MAINLAND_TRAVEL_PERMIT_HK_MC&length=50&offset=0&src=weixin_mini&merchantId=65373d6e95c3170001074c57&ver=3.15.1&appId=wx459c905b59f92c86",
    {
      headers: {
        ...headers,
      },
    }
  )
    .then((res) => res.json())
    .then(
      (res) => {
        if (res.statusCode === 200) {
          const audiencesInfo = res.data.slice(0, config.audience_number);
          if (audiencesInfo.length !== config.audience_number) {
            throw Error("观影人信息错误");
          }
          audiencesInfo.forEach((user) => {
            console.log(`观影人:${user.name}`);
          });
          return audiencesInfo;
        } else {
          console.log("观影人信息获取失败:");
          console.log(`code:${res.statusCode}, message: ${res.comments}`);
          throw Error("观影人信息获取失败");
        }
      },
      (err) => {
        throw err;
      }
    );
}

console.log("正在获取观影人信息");
const audiences = await getAudienceList();
const generateId = audiences.map((item) => ({
  id: parseInt(new Date().getTime() / 1000).toString() + (new Date().getTime() % 1000).toString() + '1000000' + (Math.floor(Math.random() * 25 + 1)).toString().padStart(2, '0'),
  audienceId: item.id,
}))

let venueId = "";

function getSessions() {
  return fetch(`https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/show/pub/v3/show/${config.show_id}/sessions_from_marketing_countdown?src=weixin_mini&merchantId=65373d6e95c3170001074c57&ver=4.18.1&appId=wxe3489c9feaf8f361`, {
    headers: {
      ...headers
    }
  }).then((res) => res.json()).then(
    (res) => {
      if (res.statusCode === 200) {
        return res.data.sessionVOs;
      }
      console.log(res)
      throw Error("获取方式失败");
    },
    (err) => {
      throw err;
    }
  );
}

async function poll(session_id, seatPlan_id, price, names, sessionName) {
  (async function repeat() {
    try {
      console.log("创建订单");
      await createOrder(
        seatPlan_id,
        price,
        session_id,
        names,
        sessionName
      );
      return true;
    } catch (err) {
      repeat();
    }
  })();
}

async function sleep(second) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, second * 1000);
  });
}


function getSeatPlans(session) {
  return fetch(`https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/show/pub/v3/show/${config.show_id}/show_session/${session}/seat_plans_from_marketing_countdown?src=weixin_mini&merchantId=65373d6e95c3170001074c57&ver=4.18.1&appId=wxe3489c9feaf8f361`, {
    headers: {
      ...headers
    }
  }).then((res) => res.json())
    .then(
      (res) => {
        if (res.statusCode === 200) {
          return res.data.seatPlans;
        }
        throw Error("获取方式失败");
      },
      (err) => {
        throw err;
      }
    )
}

function incrementLastTwoDigits(str) {
  // 使用正则表达式匹配字符串中的最后两位数字
  const match = str.match(/\d{2}$/);
  if (match) {
    // 将匹配到的数字字符串转换为数字，加1，然后转换回字符串
    const newNumber = (parseInt(match[0], 10) + 1).toString().padStart(2, '0');
    // 使用replace将原字符串中的最后两位数字替换为新的数字
    return str.replace(/\d{2}$/, newNumber);
  }
  // 如果没有匹配到数字，则直接返回原字符串
  return str;
}

function generate_code(seatPlanId, priceName, stdSeatPlanId, price, sessionsInfo, arr) {
  const arr1 = [{
    id: config.show_id,
    'type': 'purchaseShowLimiter',
    limitation: sessionsInfo.showLimit,
    limiterId: config.show_id
  }, {
    id: sessionsInfo.bizShowSessionId,
    'type': 'purchaseShowLimiter',
    limitation: 6,
    limiterId: sessionsInfo.bizShowSessionId
  }]
  arr.map((item) => {
    arr1.push({
      id: item.seatPlanId,
      'type': 'purchaseShowLimiter',
      limitation: item.canBuyCount,
      limiterId: item.seatPlanId
    })
  })
  return fetch('https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/home/pub/v3/wxapps/short_codes/generate_code', {
    method: 'POST',
    headers: {
      ...headers
    },
    body: JSON.stringify({
      'src': 'weixin_mini',
      'merchantId': '65373d6e95c3170001074c57',
      'ver': '4.1.3',
      'appId': 'wx459c905b59f92c86',
      'scene': {
        'saleAssistantJson': {
          'deliverFee': -1,
          'deliverPriceItemId': '',
          'shoppingCart': {
            'isOpen': true,
            'currentSnapshotId': null,
            '_shows': [
              {
                'showId': config.show_id,
                'stdShowId': sessionsInfo.stdShowId,
                'showName': sessionsInfo.showName,
                'seatPickType': info.seatPickType
              }
            ],
            '_sessions': [
              {
                'bizShowSessionId': sessionsInfo.bizShowSessionId,
                'stdShowSessionId': sessionsInfo.stdShowSessionId,
                'sessionName': sessionsInfo.sessionName,
                'supportSeatPicking': false,
                'ctSession': false,
                'ctTag': ''
              }
            ],
            '_combos': [],
            '_seatPlans': [
              {
                'seatPlanId': seatPlanId,
                'seatPlanName': priceName,
                'stdSeatPlanId': stdSeatPlanId,
                'originalPrice': price
              }
            ],
            'tickets': generateId.map((item) => {
              return {
                generateId: item.id,
                seatPlanId: seatPlanId,
                show: {
                  showId: config.show_id
                },
                session: {
                  bizShowSessionId: sessionsInfo.bizShowSessionId
                }
              }
            }),
            'operations': generateId.map((item) => {
              return {
                id: incrementLastTwoDigits(item.id),
                ticketGenerateId: item.id,
                'snapshotId': null
              }
            }),
            'productSKUs': []
          },
          'selectedShow': {
            'showId': config.show_id,
            'stdShowId': sessionsInfo.stdShowId,
            'showName': sessionsInfo.sessionName,
            'seatPickType': info.seatPickType
          },
          'selectedSession': {
            'bizShowSessionId': sessionsInfo.bizShowSessionId,
            'stdShowSessionId': sessionsInfo.stdShowSessionId,
            'sessionName': sessionsInfo.sessionName,
            'supportSeatPicking': false,
            'ctSession': false,
            'ctTag': ''
          },
          'discounts': [
            {
              'id': 'comboDiscount',
              'level': 1,
              'type': 'comboDiscount'
            }
          ],
          'filters': arr1
        }
      },
      'bizCode': 'FHL_M'
    })
  }).then((res) => res.json())
    .then(
      (res) => {
        console.log(priceName, '------------', res.data.wxaCode)
        if (res.statusCode === 200) {
          return res.data.wxaCode;
        }
        throw Error("获取方式失败");
      },
      (err) => {
        throw err;
      }
    ).catch((err) => {
      console.log(err)
    })
}

function getCodeInfo(code) {
  return fetch(`https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/home/pub/v3/wxapps/short_codes/code/${code}?src=weixin_mini&merchantId=65373d6e95c3170001074c57&ver=4.1.3&appId=wx459c905b59f92c86`, {
    headers: {
      ...headers
    }
  }).then((res) => res.json())
    .then(
      (res) => {
        if (res.statusCode === 200) {
          return JSON.parse(res.data.param);
        }
        throw Error("获取方式失败");
      },
      (err) => {
        throw err;
      }
    );
}

function getCodeList(info) {
  return fetch(`https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/home/pub/v5/shop/configs?src=weixin_mini&ver=4.1.3&cityId=3101&miniAppType=WEIXIN_PUBLIC`, {
    headers: {
      ...headers,
      'Referer': `https://65373d6e95c3170001074c57.caiyicloud.com/order/confirm?cpId=${info}`,
    }
  }).then((res) => res.json())
    .then(
      (res) => {
        if (res.statusCode === 200) {
          return true;
        }
        throw Error("获取方式失败");
      },
      (err) => {
        throw err;
      }
    );
}

function getShowUser() {
  return fetch(`https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/show/buyer/v5/show/${config.show_id}/show_user?src=weixin_mini&merchantId=65373d6e95c3170001074c57&channelId=663c7e38f127a7e5d51ac811&ver=4.1.3&appId=wx459c905b59f92c86`, {
    headers: {
      ...headers
    }
  }).then((res) => res.json())
    .then(
      (res) => {
        if (res.statusCode === 200) {
          return true;
        }
        console.log(res.comments)
        throw Error("获取方式失败");
      },
      (err) => {
        throw err;
      }
    );
}

function getDynamic() {
  return fetch(`https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/show/pub/v5/show/${config.show_id}/dynamic?src=weixin_mini&merchantId=65373d6e95c3170001074c57&ver=4.18.1&appId=wxe3489c9feaf8f361`, {
    headers: {
      ...headers
    }
  }).then((res) => res.json())
    .then((res) => {
      return res.data
    });
}

console.log("获取手机号");
const phone = await getPhone();

console.log('获取seesion')
let sessions = await getSessions()

console.log('动态获取')
const info = await getDynamic()

// sessions = sessions.filter((item) => item.sessionName !== '2024-05-02 周四 19:30~21:00')

console.log(`一共${sessions.length}个场次`)

const listMap = new Map()

for (let i = 0; i < sessions.length; i++) {
  console.log(`获取第${i + 1}场次信息`);
  const arr = await getSeatPlans(sessions[i].bizShowSessionId);
  listMap.set(i, arr)
}

let ip_index = -1


const timer = setInterval(async () => {
  if (Date.now() + 20000 > new Date(config.target_time)) {
    getIp()
    clearInterval(timer)
  }
}, 100)

async function run() {
  if (Date.now() + 4000 > new Date(config.target_time)) {
    for (let i = 0; i < sessions.length; i++) {
      const list = listMap.get(i)
      const arr = list.filter((item) => item.originalPrice > 380)
      for (let k = 0; k < arr.length; k++) {
        poll(sessions[i].bizShowSessionId, arr[k].seatPlanId, arr[k].originalPrice, arr[k].seatPlanName, sessions[i].sessionName);
      }
      // 如果需要指定 就这么写
      // const price = arr.filter((item) => item.originalPrice === 300)
      // const two = arr.filter((item) => item.originalPrice === 220)
      // if (price.length > 0) {
      // poll(sessions[i].bizShowSessionId, price[0].seatPlanId, price[0].originalPrice, price[0].seatPlanName, sessions[i].sessionName);
      // } else {
      //   console.log('下错订单啦')
      // }
      // if (two.length > 0) {
      //   poll(sessions[i].bizShowSessionId, two[0].seatPlanId, two[0].originalPrice, two[0].seatPlanName, sessions[i].sessionName);
      // } else {
      //   console.log('下错订单啦')
      // }
    }
  } else {
    console.log("时间未开始");
    setTimeout(() => {
      run();
    }, 100);
  }
}

run();
