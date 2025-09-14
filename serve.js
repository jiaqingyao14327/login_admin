import { dec_ra, enc_ra } from './utils.js'
import { get_sessionId, w } from './update.js'

import axios from 'axios';
import cors from 'cors'
import express from 'express'
import fetch from "node-fetch";
import fs from 'fs'
import path from 'path'
import qrcode from 'qrcode'

const port = 80;
const app = express();
// 解析JSON请求体
app.use(express.json());
// CORS配置 - 允许特定来源的跨域请求
app.use(cors({
    origin: [
        'http://121.199.162.217:8080',
        'https://121.199.162.217:8080',
        'http://121.199.162.217',
        'https://121.199.162.217',
        'http://localhost:8080',
        'http://127.0.0.1:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 定义POST接口
app.post('/submit', (req, res) => {
    const data = req.body;
    // 处理接收到的数据
    console.log('Received data:', data);
    fs.appendFileSync('data.txt', `${JSON.stringify(data.token)},\n`, 'utf8', function (err) {
        if (err) {
            console.error(err);
            res.end('Error writing file');
        } else {
            res.end('Data received');
        }
    });

    // 返回响应
    res.status(200).send({
        comments: "成功",
        statusCode: 200
    });
});

app.post('/getCode', async (req, res) => {
    const data = req.body;
    try {
        const response = await axios({
            headers: {
                'Host': 'm.piaoxingqiu.com',
                'Connection': 'keep-alive',
                'terminal-src': 'WEIXIN_MINI',
                'content-type': 'application/json',
                'src': 'weixin_mini',
                'ver': '4.30.3',
                'merchant-id': '6267a80eed218542786f1494',
                'front-trace-id': Date.now().toString(36) + Math.random().toString(36).substring(2),
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.52(0x18003422) NetType/WIFI Language/zh_CN',
                'Referer': 'https://servicewechat.com/wxad60dd8123a62329/37/page-frame.html'
            },
            method: 'post',
            url: 'https://m.piaoxingqiu.com/cyy_gatewayapi/user/pub/v5/send_verify_code',
            data: JSON.stringify({
                'src': 'weixin_mini',
                'merchantId': '6267a80eed218542786f1494',
                'ver': '4.30.3',
                'appId': 'wxad60dd8123a62329',
                'verifyCodeUseType': 'USER_LOGIN',
                'messageType': 'MOBILE',
                'cellphone': data.phone,
                'token': data.token
            }),
        })
        res.json(response.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch data from the target server' });
    }
})

app.post('/photo', async (req, res) => {
    const data = req.body;
    try {
        const response = await axios({
            headers: {
                'Host': 'm.piaoxingqiu.com',
                'Connection': 'keep-alive',
                'terminal-src': 'WEIXIN_MINI',
                'content-type': 'application/json',
                'src': 'weixin_mini',
                'ver': '4.30.3',
                'merchant-id': '6267a80eed218542786f1494',
                'front-trace-id': Date.now().toString(36) + Math.random().toString(36).substring(2),
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.52(0x18003422) NetType/WIFI Language/zh_CN',
                'Referer': 'https://servicewechat.com/wxad60dd8123a62329/37/page-frame.html'
            },
            method: 'post',
            url: 'https://m.piaoxingqiu.com/cyy_gatewayapi/user/pub/v3/generate_photo_code',
            data: JSON.stringify({
                'cellphone': data.phone,
                'src': 'weixin_mini',
                'merchantId': '6267a80eed218542786f1494',
                'ver': '4.30.3',
                'appId': 'wxad60dd8123a62329',
                'verifyCodeUseType': 'USER_LOGIN',
                'messageType': 'MOBILE',
            }),
        })
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from the target server' });
    }
})

app.post('/login', async (req, res) => {
    const data = req.body;
    try {
        const response = await axios({
            headers: {
                'Host': 'm.piaoxingqiu.com',
                'Connection': 'keep-alive',
                'terminal-src': 'WEIXIN_MINI',
                'content-type': 'application/json',
                'src': 'weixin_mini',
                'ver': '4.30.3',
                'merchant-id': '6267a80eed218542786f1494',
                'front-trace-id': Date.now().toString(36) + Math.random().toString(36).substring(2),
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.52(0x18003422) NetType/WIFI Language/zh_CN',
                'Referer': 'https://servicewechat.com/wxad60dd8123a62329/37/page-frame.html'
            },
            method: 'post',
            url: 'https://m.piaoxingqiu.com/cyy_gatewayapi/user/pub/v3/wx/mini/cellphone_login_or_register',
            data: JSON.stringify({
                'src': 'weixin_mini',
                'merchantId': '6267a80eed218542786f1494',
                'ver': '4.30.3',
                'appId': 'wxad60dd8123a62329',
                'cellphone': data.phone,
                'verifyCode': data.code,
                'openId': 'oIFIO5Ag1w97uwhq9ayabZQa1RR0'
            }),
        })
        const sessionIdCode = get_sessionId()
        const trackSessionId = get_sessionId()

        const responseId = await axios.get('https://m.piaoxingqiu.com/cyy_gatewayapi/home/pub/v5/citys/current_location', {
            params: {
                'lang': 'zh',
                'src': 'WEB',
                'ver': '4.30.3'
            },
            headers: {
                'sec-ch-ua-platform': '"macOS"',
                'Referer': 'https://m.piaoxingqiu.com/',
                'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
                'sec-ch-ua-mobile': '?0',
                'src': 'WEB',
                'terminal-src': 'WEB',
                'access-token': '',
                'front-trace-id': Date.now().toString(36) + Math.random().toString(36).substring(2),
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                'ver': '4.30.3'
            }
        })

        const prime_privilege = await axios.get('https://m.piaoxingqiu.com/cyy_gatewayapi/user/buyer/v5/prime_privilege', {
            params: {
                'lang': 'zh',
                'src': 'weixin_mini',
                'merchantId': '6267a80eed218542786f1494',
                'ver': '4.30.3',
                'appId': 'wxad60dd8123a62329'
            },
            headers: {
                'Host': 'm.piaoxingqiu.com',
                'Connection': 'keep-alive',
                'terminal-src': 'WEIXIN_MINI',
                'content-type': 'application/json',
                'src': 'weixin_mini',
                'ver': '4.30.3',
                'access-token': response.data.data.accessToken,
                'merchant-id': '6267a80eed218542786f1494',
                'front-trace-id': Date.now().toString(36) + Math.random().toString(36).substring(2),
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x18003831) NetType/WIFI Language/zh_CN',
                'Referer': 'https://servicewechat.com/wxad60dd8123a62329/321/page-frame.html'
            }
        })
        const source = [{
            "event": "login",
            "eventType": "click",
            "cellphone": data.phone,
            "token": data.code,
            "fromPage": "login",
            "loginType": "SMS",
            "loadDuration": 9,
            "pageQuery": `cellphone=${data.phone}&backUrl=`,
            "referrerPage": "package-user/pages/login/login",
            "trackSessionId": trackSessionId,
            "cityId": responseId.data.data.cityId,
            "siteID": responseId.data.data.siteId,
            "userId": response.data.data.bizUserId,
            "terminalSrc": "WEIXIN_MINI",
            "createTime": new Date().getTime(),
            "channelId": "",
            "merchantId": "6267a80eed218542786f1494",
            "sessionId": sessionIdCode,
            "uid": w()
        }]

        const arr = enc_ra(JSON.stringify(source), 's2TMsqrz00ArbPXt')
        const result = await axios.get('https://angryd.caiyicloud.com/ra', {
            params: {
                'Access-Token': response.data.data.accessToken,
                'data': arr,
                'lang': 'zh',
                'Merchant-Id': '6267a80eed218542786f1494',
                'Priority': '100',
                'Terminal-Src': 'WEIXIN_MINI',
                'ver': '4.30.3',
                'Version': 'V1',
                'src': 'weixin_mini',
                'merchantId': '6267a80eed218542786f1494',
                'appId': 'wxad60dd8123a62329'
            },
            headers: {
                'Host': 'angryd.caiyicloud.com',
                'Connection': 'keep-alive',
                'terminal-src': 'WEIXIN_MINI',
                'content-type': 'application/json',
                'src': 'weixin_mini',
                'ver': '4.30.3',
                'access-token': response.data.data.accessToken,
                'merchant-id': '6267a80eed218542786f1494',
                'front-trace-id': Date.now().toString(36) + Math.random().toString(36).substring(2),
                'Angry-dog': 'NjEzNjdkMDc2YzY3NjM4YzQ0N2RhNjhmOTA4ZjJhN2EyNjFmMTU2YjIwMzM2ZjU5MDA1MmI5MDYzZmYxYWU2ZTpkMzFkZGZhMTk2ZjM3Y2VkYTUzODczNTlhMmIxNWY2NTFjNWMwN2FiZWQxOTQyOTIxMjFmNjNmNzE4ODkyMzdlNDExOWNlNzA1YjcxMWE5ZThhMTNiMWNmNDZjMDYwMzE4YzcxNmU1MmQyODU5ZmYxZDg5NjIwNjliNTc5YTVlMTIyMjA3ZjQzNWU1OGU4ZDgxMjczMWJlMGZkYjg3MWQwNGY1YWM4ZDNjODdlYjAwZTVmZWNmMDMxODA3ZGU4ZDg6MTczNzAwNTU2ODk5Ng',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.55(0x1800372c) NetType/4G Language/zh_CN',
                'Referer': 'https://servicewechat.com/wxad60dd8123a62329/315/page-frame.html'
            }
        })
        console.log(result)
        fs.appendFileSync('赵阳.txt', `${JSON.stringify({
            ...response.data.data,
            phone: data.phone,
            code: data.code,
            sessionIdCode: sessionIdCode,
            trackSessionId: trackSessionId,
            date: '2025-04-11',
            price: 1380,
            time: '2025-04-11',
            watchPeople: []
        })},\n`, 'utf8', function (err) {
            if (err) {
                console.error(err);
                res.end('Error writing file');
            } else {
                res.end('Data received');
            }
        });
        res.json(response.data);
        // res.status(200).send('Data received successfully.');
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from the target server' });
    }
})

app.get('/read-file', (req, res) => {
    const filePath = './data.txt'; // 本地文件路径
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send({
                msg: '错误文件'
            });
            return;
        }
        //   const linesArray = data.replace('\n', '');
        res.status(200).send(data);
    });
})

app.get('/clear-file', (req, res) => {
    const filePath = './data.txt'; // 指定文件路径
    fs.truncate(filePath, 0, function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error clearing file contents.');
        } else {
            res.status(200).send({
                comments: "成功",
                statusCode: 200
            });
        }
    });
})

app.post('/phone-fwd', async (req, res) => {
    const data = req.body;
    try {
        const response = await axios.post(
            'https://api.livelab.com.cn/thirdParty/sms/app/captcha',
            new URLSearchParams({
                'phone': data.phone,
                'type': '1'
            }),
            {
                headers: {
                    'user-agent': 'Dart/2.19 (dart:io)',
                    'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                }
            }
        )
        fs.appendFileSync('fwd.txt', `//${data.phone}\n`, 'utf8', function (err) {
            if (err) {
                console.error(err);
                res.end('Error writing file');
            } else {
                res.end('Data received');
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from the target server' });
    }
})

app.get('/read-fwd', (req, res) => {
    const filePath = './fwd.txt'; // 本地文件路径
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send({
                msg: '错误文件'
            });
            return;
        }
        //   const linesArray = data.replace('\n', '');
        res.status(200).send(data);
    });
})

app.post('/login-fwd', async (req, res) => {
    const data = req.body;
    try {
        const response = await axios.post(
            'https://api.livelab.com.cn/auth/app/login/phoneCaptcha',
            `phone=${data.phone}&captcha=${data.code}&sekyCaptcha&deviceId=AC39A967-C95E-4293-9964-585A7503A29E&deviceType=1&blackBox=qIPHa1711861510JpDdaMpOl08`,
            {
                headers: {
                    'user-agent': 'Dart/2.19 (dart:io)',
                    'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                }
            }
        )
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from the target server' });
    }
})

app.post('/submit-fwd', (req, res) => {
    const data = req.body;
    // 处理接收到的数据
    console.log('Received data:', data);
    fs.appendFileSync('fwd.txt', `${JSON.stringify(data.token)},\n`, 'utf8', function (err) {
        if (err) {
            console.error(err);
            res.end('Error writing file');
        } else {
            res.end('Data received');
        }
    });

    // 返回响应
    res.status(200).send({
        comments: "成功",
        statusCode: 200
    });
});

app.get('/qrcode', async (req, res) => {
    const text = req.query.text; // 获取URL参数中的text值
    try {
        const image = await qrcode.toDataURL(text); // 生成二维码
        res.send({ status: 'success', image }); // 返回二维码图片
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message }); // 发生错误时返回
    }
})

// const dataFilePath = path.join('./data.json');

// 初始化数据数组
let data = [];

app.get('/get-source', (req, res) => {
    const source = req.query.source;
    const dataFilePath = path.join(`./data-${source}.json`);
    // 从文件加载数据（如果文件存在）
    if (fs.existsSync(dataFilePath)) {
        data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    } else {
        data = []
    }
    res.send(data);
})

app.post('/add-source', (req, res) => {
    const newItem = req.body;
    const dataFilePath = path.join(`./data-${newItem.source}.json`);
    if (fs.existsSync(dataFilePath)) {
        data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    } else {
        data = []
    }
    data.push(newItem);
    saveDataToFile(dataFilePath);
    res.status(200).send(newItem);
})

function saveDataToFile(dataFilePath) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data), 'utf8');
}

app.get('/clear-fwd', (req, res) => {
    const source = req.query.source;
    const filePath = `./data-${source}.json`; // 指定文件路径
    fs.writeFileSync(filePath, JSON.stringify([]), 'utf8');
    const filePaths = './fwd.txt'; // 指定文件路径
    fs.truncate(filePaths, 0, function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error clearing file contents.');
        } else {
            res.status(200).send({
                comments: "成功",
                statusCode: 200
            });
        }
    });
})


// 定义POST接口
app.post('/submit-pxq', (req, res) => {
    const data = req.body;
    // 处理接收到的数据
    console.log('Received data:', data);
    fs.appendFileSync('data.txt', `${JSON.stringify(data.token)},\n`, 'utf8', function (err) {
        if (err) {
            console.error(err);
            res.end('Error writing file');
        } else {
            res.end('Data received');
        }
    });

    // 返回响应
    res.status(200).send({
        comments: "成功",
        statusCode: 200
    });
});

app.post('/getCode-pxq', async (req, res) => {
    const data = req.body;
    try {
        const response = await axios({
            headers: {
                'Host': '67ad56d8f1a6bc0001b3b757.caiyicloud.com',
                'Connection': 'keep-alive',
                'terminal-src': 'WEIXIN_MINI',
                'content-type': 'application/json',
                'src': 'weixin_mini',
                'ver': '4.28.6',
                'merchant-id': '67ad56d8f1a6bc0001b3b757',
                'front-trace-id': 'm8fj9vdo7x493ecwarl',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x1800383a) NetType/4G Language/zh_CN',
                'Referer': 'https://servicewechat.com/wx1ec0d0abe05e659d/13/page-frame.html'
            },
            method: 'post',
            url: 'https://67ad56d8f1a6bc0001b3b757.caiyicloud.com/cyy_gatewayapi/user/pub/v3/send_verify_code',
            data: JSON.stringify({
                'src': 'weixin_mini',
                'merchantId': '67ad56d8f1a6bc0001b3b757',
                'ver': '4.28.6',
                'appId': 'wx1ec0d0abe05e659d',
                'verifyCodeUseType': 'USER_LOGIN',
                'cellphone': data.phone,
                'messageType': 'MOBILE',
                'token': data.token
            }),
        })
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from the target server' });
    }
})

app.post('/photo-pxq', async (req, res) => {
    const data = req.body;
    try {
        const response = await axios({
            headers: {
                'Host': '67ad56d8f1a6bc0001b3b757.caiyicloud.com',
                'Connection': 'keep-alive',
                'terminal-src': 'WEIXIN_MINI',
                'content-type': 'application/json',
                'src': 'weixin_mini',
                'ver': '4.28.6',
                'merchant-id': '67ad56d8f1a6bc0001b3b757',
                'front-trace-id': 'm8fj9vn5h66vdm9fqtm',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x1800383a) NetType/4G Language/zh_CN',
                'Referer': 'https://servicewechat.com/wx1ec0d0abe05e659d/13/page-frame.html'
            },
            method: 'post',
            url: 'https://67ad56d8f1a6bc0001b3b757.caiyicloud.com/cyy_gatewayapi/user/pub/v3/generate_photo_code',
            data: JSON.stringify({
                'src': 'weixin_mini',
                'merchantId': '67ad56d8f1a6bc0001b3b757',
                'ver': '4.28.6',
                'appId': 'wx1ec0d0abe05e659d',
                'cellphone': data.phone,
                'countryCode': '86',
                'verifyCodeUseType': 'USER_LOGIN',
                'messageType': 'MOBILE'
            }),
        })
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from the target server' });
    }
})

app.post('/login-pxq', async (req, res) => {
    const data = req.body;
    try {
        const response = await axios({
            headers: {
                'Host': '67ad56d8f1a6bc0001b3b757.caiyicloud.com',
                'Connection': 'keep-alive',
                'terminal-src': 'WEIXIN_MINI',
                'content-type': 'application/json',
                'src': 'weixin_mini',
                'ver': '4.28.6',
                'merchant-id': '67ad56d8f1a6bc0001b3b757',
                'front-trace-id': 'm8fjgw8req1q09xwfgr',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.56(0x1800383a) NetType/4G Language/zh_CN',
                'Referer': 'https://servicewechat.com/wx1ec0d0abe05e659d/13/page-frame.html'
            },
            method: 'post',
            url: 'https://67ad56d8f1a6bc0001b3b757.caiyicloud.com/cyy_gatewayapi/user/pub/v3/login_or_register',
            data: JSON.stringify({
                'src': 'weixin_mini',
                'merchantId': '67ad56d8f1a6bc0001b3b757',
                'ver': '4.28.6',
                'appId': 'wx1ec0d0abe05e659d',
                'cellphone': data.phone,
                'verifyCode': data.code,
                'countryCode': '86',
                'openId': 'oU4JI5CXrMgKJA_FRsrO2Znlh2CY'
            }),
        })
        fs.appendFileSync('赵阳.txt', `${JSON.stringify({
            ...response.data.data,
            phone: data.phone,
            code: data.code,
            date: '2025-04-11',
            price: 1380,
            time: '2025-04-11',
            watchPeople: []
        })},\n`, 'utf8', function (err) {
            if (err) {
                console.error(err);
                res.end('Error writing file');
            } else {
                res.end('Data received');
            }
        });
        res.json(response.data);
        // res.status(200).send('Data received successfully.');
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from the target server' });
    }
})

app.post('/search-pxq', async (req, res) => {
    const data = req.body;
    console.log(data)
    try {
        const response = await axios.get('https://6374b05d0047010001566388.caiyicloud.com/cyy_gatewayapi/home/pub/v3/show/search/associate', {
            params: {
                'cityId': '1101',
                'keyword': data.keyword,
                'src': 'zijie_mini',
                'merchantId': '6374b05d0047010001566388',
                'ver': '4.2.5',
                'appId': 'tt95f9e3440ac6759401'
            },
            headers: {
                'terminal-src': 'ZIJIE_MINI',
                'src': 'zijie_mini',
                'merchant-id': '6374b05d0047010001566388',
                'ver': '4.2.5',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 11; KB2000 Build/RP1A.201005.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/117.0.0.0 Mobile Safari/537.36 aweme/29.4.0 ToutiaoMicroApp/3.21.0 PluginVersion/29409006',
                'referer': 'https://tmaservice.developer.toutiao.com/?appid=tt95f9e3440ac6759401&version=4.2.5',
                'x-metasec-bypass-ttnet-features': '1',
                'x-tt-bypass-dp': '1',
                'bypass-boe': '1',
                'Content-Type': 'application/json',
                'X-Neptune': '-8|50:51:59:00:09:20:21:30:40:47:49:39:22:29',
                'Host': '6374b05d0047010001566388.caiyicloud.com',
                'Cookie': 'acw_tc=76b20fee17137079971111731e3072b20ddabb1c2b68a3e42b5b5329b80fdc'
            }
        })
        res.json(response.data);
        // res.status(200).send('Data received successfully.');
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from the target server' });
    }
})

app.post('/zhejiang-qrcode', async (req, res) => {
    try {
        const response = await axios.post(
            'https://xcx.zjyyjt.com.cn/ucenter/getCaptchaId.xhtml',
            new URLSearchParams({
                'appId': 'wx316bc5861b6fa32f'
            }),
            {
                headers: {
                    'Host': 'xcx.zjyyjt.com.cn',
                    'Connection': 'keep-alive',
                    'ksmpid': 'zjyy99',
                    'ksclient': 'KL21129679',
                    'ksversion': '508cd4202503261459',
                    'version': '1.0.12',
                    'cmpappkey': 'zlpwtheatre',
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.57(0x1800392c) NetType/WIFI Language/zh_CN',
                    'Referer': 'https://servicewechat.com/wx316bc5861b6fa32f/52/page-frame.html'
                }
            }
        )
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from the target server' });
    }
})

app.get('/get-qrcode', async (req, res) => {
    const text = req.query.text; // 获取URL参数中的text值
    try {
        fetch(`https://xcx.zjyyjt.com.cn/ucenter/captcha.xhtml?captchaId=${text}&r=${Date.now()}`, {
            headers: {
                'host': 'xcx.zjyyjt.com.cn',
                'accept': 'image/webp,image/avif,image/jxl,image/heic,image/heic-sequence,video/*;q=0.8,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
                'sec-fetch-site': 'cross-site',
                'sec-fetch-dest': 'image',
                'accept-language': 'zh-CN,zh-Hans;q=0.9',
                'sec-fetch-mode': 'no-cors',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.57(0x1800392c) NetType/WIFI Language/zh_CN MiniProgramEnv/iOS',
                'referer': 'https://servicewechat.com/'
            }
        }).then(res => res.arrayBuffer())
            .then(response => {
                // 将 ArrayBuffer 转为 base64 字符串
                const base64Image = Buffer.from(response, 'binary').toString('base64');

                // 你可以根据实际图片类型（jpeg/png/webp等）拼接前缀
                const dataUri = `data:image/jpeg;base64,${base64Image}`;

                // console.log('Base64 Image URI:\n', dataUri);
                res.send({ status: 'success', dataUri }); // 返回二维码图片
                // const base64String = res.toString('base64');
                // console.log(`data:${res.headers.get('content-type')};base64,${base64String}`)
            }).catch(err => {
                console.log(err)
            })
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message }); // 发生错误时返回
    }
})

// 启动服务器
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});