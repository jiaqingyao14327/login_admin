import fs from 'fs'
import express from 'express'
import axios from 'axios';
import cors from 'cors'
import qrcode from 'qrcode'
import path from 'path'
import fetch from 'node-fetch';
import request from "request";
import util from "util";
import httpProxy from 'http-proxy'
import cors from 'cors'

const port = 80;
const app = express();
const proxy = httpProxy.createProxyServer();

app.use(
    cors({
        origin: "http://121.199.162.217:8080", // 允许的来源
        methods: "GET,POST,OPTIONS", // 允许的方法
        allowedHeaders: "Content-Type,Authorization", // 允许的头部
    })
);

// 模拟获取动态代理 IP 的方法
async function getDynamicProxyIp() {
    // 模拟从服务或数据库中获取代理 IP
    // 这里假设返回一个包含 IP 和端口的对象
    const result = await axios({
        // 'http://api2.xkdaili.com/tools/XApi.ashx?apikey=XKFDFED582CB1878F767&qty=50&format=json&split=0&sign=a324f08be26bae56385e6cf2f8fb924f' 17641222767
        // 'http://api2.xkdaili.com/tools/XApi.ashx?apikey=XK9407CE397DDBA50D65&qty=1&format=txt&split=0&sign=bc069e1c951656fe91de50073f8269ed' 19110272767
        url: 'http://api2.xkdaili.com/tools/XApi.ashx?apikey=XK9407CE397DDBA50D65&qty=1&format=json&split=0&sign=bc069e1c951656fe91de50073f8269ed',
        method: "get",
    })
    return {
        host: result.data.data[0].ip, // 示例代理 IP
        port: result.data.data[0].port,             // 示例代理端口
    };
}
// 中间件处理请求，动态挂载代理
app.use(async (req, res, next) => {
    try {
        // 获取动态代理 IP
        const proxyInfo = await getDynamicProxyIp();

        if (!proxyInfo || !proxyInfo.host || !proxyInfo.port) {
            return res.status(500).send("获取代理 IP 失败");
        }

        // 设置代理服务器的目标地址
        const target = `http://${proxyInfo.host}:${proxyInfo.port}`;

        // 使用 http-proxy 转发请求
        proxy.web(req, res, { target }, (err) => {
            if (err) {
                console.error("代理请求失败：", err);
                res.status(500).send("代理请求失败");
            }
        });
    } catch (error) {
        console.error("中间件处理错误：", error);
        res.status(500).send("内部错误");
    }
});

// 解析JSON请求体
app.use(express.json());
app.use(cors());

// let ip = ''

// function getIp() {
//     console.log('获取ip中～')
//     return axios({
//         url: "http://api2.xkdaili.com/tools/XApi.ashx?apikey=XK9407CE397DDBA50D65&qty=1&format=json&split=0&sign=bc069e1c951656fe91de50073f8269ed",
//         method: "get",
//     }).then(async (res) => {
//         ip = res.data.data;
//     }).catch(async (err) => {
//         await getIp()
//     });
// }

// setInterval(async () => {
//     await getIp()
// }, 1000 *60 * 2)

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
                'ver': '4.24.7',
                'merchant-id': '6267a80eed218542786f1494',
                'front-trace-id': 'm1ipraf6538bwbr1dmg',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.52(0x18003422) NetType/WIFI Language/zh_CN',
                'Referer': 'https://servicewechat.com/wxad60dd8123a62329/37/page-frame.html'
            },
            method: 'post',
            url: 'https://m.piaoxingqiu.com/cyy_gatewayapi/user/pub/v5/send_verify_code',
            data: JSON.stringify({
                'src': 'weixin_mini',
                'merchantId': '6267a80eed218542786f1494',
                'ver': '4.24.7',
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
                'ver': '4.24.7',
                'merchant-id': '6267a80eed218542786f1494',
                'front-trace-id': 'm1ipramx5wjfshwql4s',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.52(0x18003422) NetType/WIFI Language/zh_CN',
                'Referer': 'https://servicewechat.com/wxad60dd8123a62329/37/page-frame.html'
            },
            method: 'post',
            url: 'https://m.piaoxingqiu.com/cyy_gatewayapi/user/pub/v3/generate_photo_code',
            data: JSON.stringify({
                'cellphone': data.phone,
                'src': 'weixin_mini',
                'merchantId': '6267a80eed218542786f1494',
                'ver': '4.24.7',
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
                'ver': '4.24.7',
                'merchant-id': '6267a80eed218542786f1494',
                'front-trace-id': 'm1iprhrfauuqtt8p9uv',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.52(0x18003422) NetType/WIFI Language/zh_CN',
                'Referer': 'https://servicewechat.com/wxad60dd8123a62329/37/page-frame.html'
            },
            method: 'post',
            url: 'https://m.piaoxingqiu.com/cyy_gatewayapi/user/pub/v3/wx/mini/cellphone_login_or_register',
            data: JSON.stringify({
                'src': 'weixin_mini',
                'merchantId': '6267a80eed218542786f1494',
                'ver': '4.24.7',
                'appId': 'wxad60dd8123a62329',
                'cellphone': data.phone,
                'verifyCode': data.code,
                'openId': 'oIFIO5Ag1w97uwhq9ayabZQa1RR0'
            }),
        })
        fs.appendFileSync('赵阳.txt', `${JSON.stringify({
            ...response.data.data,
            phone: data.phone,
            code: data.code
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
                'terminal-src': 'ZIJIE_MINI',
                'src': 'zijie_mini',
                'merchant-id': '6374b05d0047010001566388',
                'ver': '4.2.5',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 11; KB2000 Build/RP1A.201005.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/117.0.0.0 Mobile Safari/537.36 aweme/29.4.0 ToutiaoMicroApp/3.21.0 PluginVersion/29409006',
                'referer': 'https://tmaservice.developer.toutiao.com/?appid=tt95f9e3440ac6759401&version=4.2.5',
                'x-metasec-bypass-ttnet-features': '1',
                'x-tt-bypass-dp': '1',
                'bypass-boe': '1',
                'X-Neptune': '-8|50:51:59:00:09:20:21:30:40:47:49:39:22:29',
                'Content-Type': 'application/json',
                'Host': '6374b05d0047010001566388.caiyicloud.com',
                'Cookie': 'acw_tc=76b20fee17137079971111731e3072b20ddabb1c2b68a3e42b5b5329b80fdc'
            },
            method: 'post',
            url: 'https://6374b05d0047010001566388.caiyicloud.com/cyy_gatewayapi/user/pub/v3/send_verify_code',
            data: JSON.stringify({
                'src': 'zijie_mini',
                'merchantId': '6374b05d0047010001566388',
                'ver': '4.2.5',
                'appId': 'tt95f9e3440ac6759401',
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
                'terminal-src': 'ZIJIE_MINI',
                'src': 'zijie_mini',
                'merchant-id': '6374b05d0047010001566388',
                'ver': '4.2.5',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 11; KB2000 Build/RP1A.201005.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/117.0.0.0 Mobile Safari/537.36 aweme/29.4.0 ToutiaoMicroApp/3.21.0 PluginVersion/29409006',
                'referer': 'https://tmaservice.developer.toutiao.com/?appid=tt95f9e3440ac6759401&version=4.2.5',
                'x-metasec-bypass-ttnet-features': '1',
                'x-tt-bypass-dp': '1',
                'bypass-boe': '1',
                'X-Neptune': '-8|50:51:59:00:09:20:21:30:40:47:49:39:22:29',
                'Content-Type': 'application/json',
                'Host': '6374b05d0047010001566388.caiyicloud.com',
                'Cookie': 'acw_tc=76b20fee17137079971111731e3072b20ddabb1c2b68a3e42b5b5329b80fdc'
            },
            method: 'post',
            url: 'https://63739735004701000156623a.caiyicloud.com/cyy_gatewayapi/user/pub/v3/generate_photo_code',
            data: JSON.stringify({
                'src': 'zijie_mini',
                'merchantId': '6374b05d0047010001566388',
                'ver': '4.2.5',
                'appId': 'tt95f9e3440ac6759401',
                'cellphone': data.phone,
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
                'terminal-src': 'ZIJIE_MINI',
                'src': 'zijie_mini',
                'merchant-id': '6374b05d0047010001566388',
                'ver': '4.2.5',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 11; KB2000 Build/RP1A.201005.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/117.0.0.0 Mobile Safari/537.36 aweme/29.4.0 ToutiaoMicroApp/3.21.0 PluginVersion/29409006',
                'referer': 'https://tmaservice.developer.toutiao.com/?appid=tt95f9e3440ac6759401&version=4.2.5',
                'x-metasec-bypass-ttnet-features': '1',
                'x-tt-bypass-dp': '1',
                'bypass-boe': '1',
                'X-Neptune': '-8|50:51:59:00:09:20:21:30:40:47:49:39:22:29',
                'Content-Type': 'application/json',
                'Host': '6374b05d0047010001566388.caiyicloud.com',
                'Cookie': 'acw_tc=76b20fee17137079971111731e3072b20ddabb1c2b68a3e42b5b5329b80fdc'
            },
            method: 'post',
            url: 'https://63739735004701000156623a.caiyicloud.com/cyy_gatewayapi/user/pub/v3/login_or_register',
            data: JSON.stringify({
                'src': 'zijie_mini',
                'merchantId': '6374b05d0047010001566388',
                'ver': '4.2.5',
                'appId': 'tt95f9e3440ac6759401',
                'cellphone': data.phone,
                'verifyCode': data.code,
                'unionId': '1697c9fc-0d4a-578c-bd03-64dde50fada7',
                'openId': '_000_tfwUv0kvGw_6_QQBp4u0F3RDtOT9_s5'
            }),
        })
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


// 启动服务器
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});