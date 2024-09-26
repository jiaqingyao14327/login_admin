import HttpsProxyAgent from "http-proxy-agent";
import { HttpProxyAgent } from "http-proxy-agent";
import axios from "axios";
import request from "request";
import util from "util";
import config from "./config.js";
import fetch from "node-fetch";
import fs from "fs";

// 配置用户名和密码
let username = "d2398362891";
let password = "3j5rklnm";

const token = process.env.token;
const userPhone = process.env.phone;
const index = Number(process.env.index);
let name = "E_TICKET";

const headers = {
  'host': '65373d6e95c3170001074c57.caiyicloud.com',
  'content-type': 'application/json',
  'accept': '*/*',
  'merchant-id': '65373d6e95c3170001074c57',
  'src': 'weixin_mini',
  'accept-language': 'zh-CN,zh-Hans;q=0.9',
  'ver': '4.18.1',
  'access-token': token,
  'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E217 MicroMessenger/6.8.0(0x16080000) NetType/WIFI Language/en Branch/Br_trunk MiniProgramEnv/Mac',
  'referer': 'https://servicewechat.com/wxe3489c9feaf8f361/37/page-frame.html',
  'front-trace-id': 'm1hrbw9zpk8iso3k9jl',
  'terminal-src': 'WEIXIN_MINI',
  'Connection': 'close'
};

function getPhone() {
  return fetch(
    "https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/user/buyer/v3/profile?src=H5&ver=3.3.5",
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
  const data = {
    'src': 'weixin_mini',
    'merchantId': '65373d6e95c3170001074c57',
    // 'channelId': '663c7e38f127a7e5d51ac811',
    'ver': '4.18.1',
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

  await getIp()
  
  let options = ip
    ? {
      url: "https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/trade/buyer/order/v5/create_order",
      headers: {
        ...headers,
      },
      proxy: util.format(
        "http://%s",
        ip
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

  return new Promise((resolve, reject) => {
    request(options, async (error, res, body) => {
      if (!error && res.statusCode == 200) {
        fs.appendFileSync("请求日志.txt", `${userPhone}下单--${names}${price}--${sessionName}--${JSON.stringify(body.comments)}\n`, (err) => {
          if (err) {
            console.log(err);
            return;
          }
        });
        if (body.statusCode === 200) {
          fs.appendFileSync("下单成功.txt", `${userPhone}下单--${names}${price}--${sessionName}--成功\n`, (err) => {
            if (err) {
              console.log(err);
              return;
            }
          });
          console.log("下单成功", userPhone);
          notifyDingDing(sessionName);
          getPaySuccess(body.data.unPaidTransactionIds, price, sessionName, names);
          resolve(body);
        } else if (
          body.comments.includes("已购买过") ||
          body.comments.includes("您有待支付订单")
        ) {
          console.log("快去看看订单吧", body.comments);
          resolve(body);
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
}

function getPaySuccess(arr, price, sessionName, names) {
  const data = {
    'src': 'weixin_mini',
    'merchantId': '65373d6e95c3170001074c57',
    'channelId': '663c7e38f127a7e5d51ac811',
    'ver': '4.18.1',
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
            `\n${userPhone}-${names}${price}-${sessionName}-${config.audience_number}张`,
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
  return axios({
    url: "http://api2.xkdaili.com/tools/XApi.ashx?apikey=XK9407CE397DDBA50D65&qty=1&format=txt&split=0&sign=bc069e1c951656fe91de50073f8269ed",
    method: "get",
  }).then((res) => {
    ip = res.data.replace('\n', '');
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
        content: `${userPhone}----${sessionName}硬核喜剧下单成功啦，快去付款吧`,
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

let express_fee = "";


let venueId = "";
function getName(session_id, seat_plan_id, price, result) {
  const data = {
    'src': 'weixin_mini',
    'merchantId': '65373d6e95c3170001074c57',
    'ver': '4.1.3',
    'appId': 'wx459c905b59f92c86',
    'priorityId': '',
    'items': [
      {
        'sku': {
          'skuId': seat_plan_id,
          'skuType': 'SINGLE',
          'ticketPrice': price,
          'qty': config.audience_number,
          ticketItems: result.saleAssistantJson.shoppingCart.operations.map((i) => ({
            id: i.ticketGenerateId,
          }))
        },
        'spu': {
          'showId': config.show_id,
          'sessionId': session_id
        }
      }
    ],
  };

  return fetch(
    "https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/trade/buyer/order/v5/pre_order",
    {
      headers: {
        ...headers,
      },
      body: JSON.stringify(data),
      method: "POST",
    }
  )
    .then((res) => res.json())
    .then(
      (res) => {
        if (res.statusCode === 200) {
          name = res.data.supportDeliveries[0].name;
          venueId = res.data.shows[0].venue.venueId;
          return true;
        } else {
          console.log(res.comments)
          return getName(session_id, seat_plan_id, price, result)
        }
        // throw Error("获取方式失败");
      },
      (err) => {
        console.log(err)
        throw err;
      }
    )
}

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

function showBuyer() {
  return fetch(
    `https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/show/buyer/v3/shows/${config.show_id}/seat_plan_age_limit_list?src=weixin_mini&merchantId=6267a80eed218542786f1494&ver=3.15.1&appId=wxad60dd8123a62329&showId=${config.show_id}`,
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
          return true;
        }
        throw Error("获取方式失败");
      },
      (err) => {
        throw err;
      }
    );
}

function privileges(session_id, seat_plan_id) {
  return fetch(
    "https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/user/buyer/order/v3/privileges",
    {
      method: "POST",
      headers: {
        ...headers,
      },
      body: JSON.stringify({
        'src': 'weixin_mini',
        'merchantId': '65373d6e95c3170001074c57',
        'ver': '4.1.3',
        'appId': 'wx459c905b59f92c86',
        itemList: [
          {
            showId: config.show_id,
            sessionId: session_id,
            seatPlanId: seat_plan_id,
            showType: "TalkShow",
          },
        ],
      }),
    }
  )
    .then((res) => res.json())
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

function getPreOrder(sessionId, seatPlanIds, price, result) {
  return fetch(
    "https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/show/buyer/v5/coupons/pre_order",
    {
      method: "POST",
      headers: {
        ...headers,
      },
      body: JSON.stringify({
        'src': 'weixin_mini',
        'merchantId': '65373d6e95c3170001074c57',
        'ver': '4.1.3',
        'appId': 'wx459c905b59f92c86',
        preOrderCouponPackageRequests: [
          {
            showId: config.show_id,
            showType: "TalkShow",
            venueId: venueId,
            preOrderSessions: [
              {
                sessionId: sessionId,
                seatPlanIds: [seatPlanIds],
              },
            ],
          },
        ],
        preOrderCouponRequest: {
          items: [
            {
              skus: [
                {
                  seatPlanId: seatPlanIds,
                  sessionId: sessionId,
                  showId: config.show_id,
                  skuId: seatPlanIds,
                  skuType: "SINGLE",
                  ticketPrice: price,
                  qty: config.audience_number,
                  deliverMethod: name,
                  ticketItems: result.saleAssistantJson.shoppingCart.operations.map((i) => ({
                    id: i.ticketGenerateId,
                  }))
                },
              ],
              spu: {
                id: config.show_id,
                spuType: "SINGLE",
              },
            },
          ],
          price: price + ".00",
          onlySearchCanUse: false,
          src: 'H5'
        },
      }),
    }
  )
    .then((res) => res.json())
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
    )
}


async function poll(session_id, seatPlan_id, price, names, sessionName) {
  let MaxCount = config.max_count;
  (async function repeat() {
    if (MaxCount === 0) {
      return true;
    }
    const beginTime = new Date(config.target_time);
    if (Date.now() + 100 < beginTime) {
      await sleep(0.1);
    }

    MaxCount--;
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


function getSearch(seatPlan_id) {
  return fetch(`https://65373d6e95c3170001074c57.caiyicloud.com/cyy_gatewayapi/trade/buyer/v3/spus/tied_sale_search?src=weixin_mini&merchantId=65373d6e95c3170001074c57&ver=4.1.3&appId=wx459c905b59f92c86&length=1000&offset=0&bizShowIdList=${config.show_id}&bizSeatPlanIds=${seatPlan_id}`, {
    headers: {
      ...headers
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

// console.log("获取手机号");
// const phone = await getPhone();

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

async function run() {
  if (Date.now() + 1000 > new Date(config.target_time)) {
    for (let i = 0; i < sessions.length; i++) {
      const arr = listMap.get(i)
      // const two = arr.filter((item) => item.originalPrice === 220)
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
