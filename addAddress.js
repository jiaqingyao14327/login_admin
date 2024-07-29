import fetch from "node-fetch";
import chalk from "chalk";
const token = process.env.token;
const phone = process.env.phone;

const headers = {
  'Accept': '*/*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
  'Connection': 'keep-alive',
  'Content-Type': 'application/json',
  'Cookie': 'sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22667cd313f817630001030497%22%2C%22first_id%22%3A%221904d4eb67114df-0289604a2a8fb28-19525637-1930176-1904d4eb6721fb5%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTkwNGQ0ZWI2NzExNGRmLTAyODk2MDRhMmE4ZmIyOC0xOTUyNTYzNy0xOTMwMTc2LTE5MDRkNGViNjcyMWZiNSIsIiRpZGVudGl0eV9sb2dpbl9pZCI6IjY2N2NkMzEzZjgxNzYzMDAwMTAzMDQ5NyJ9%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%22667cd313f817630001030497%22%7D%2C%22%24device_id%22%3A%221904d4eb67114df-0289604a2a8fb28-19525637-1930176-1904d4eb6721fb5%22%7D; acw_tc=76b20fe817205117865188797e74f9b94880ac58d2ccf320ed1f4743ad9b67; ssxmod_itna=iqGxBD9Dy7i=0Q3itDXKG7AHPiKbM8dxE2G4hLS4GXLK3DZDiqAPGhDC++z0GGRqvK5Wj8Bq=1Qn3W2=CF8ixhaNF/qxPD=xYQDwxYoDUxGtDpxG==VDeetD5xGoDPxDeDA0KDCSrkKDdcgIC9EpOm2P8cxGWIoKDmOKDR=oDSYYs/avFHW5DiooDXPYDaoKDuEvOzxi8D7KLIZ71D7cmvR8A+xi3LlFAh40O8tIHDB4zMcvOMb2qWZQPVDPiaPhiqWGeVAiq3e2KqEhxHii5HjD58YZSeBOgOe4iCYD; ssxmod_itna2=iqGxBD9Dy7i=0Q3itDXKG7AHPiKbM8dxE2G4hT4A=aU5oD/KmDFhLw/+jwqKAPtgRcuyqhh/1hKhCHG2mobA9zld7Wv/WK6HnINHILSWEnnIwDjLqaktBpzKx/a/MzqCTNsQg3XQDKptM+n94=0+4iIKnoR3QQ4rldxZLrYM4bvQjQUmmT8QYIEiD0ubejxLRAtq2jKIexHNmqqQqt2Ggx3=4EKW06HhqKYCMy7b0cGwEhHdSyKGrhsdf97009yffxllEFhVa505YPoTqA83BdGzZxj/rH8zGH+BioNWX97rfkkWsuxGIEWy895zzTFQYkl2L0w0BvyQy6U0lbbWCvF04/iwSQb0Y+rBaFluHYwp7+diapb+67u+lqZRwqgFq=HjlxB/AO87F4+N9g3vuexSk+7QLROKWDPerTo=WiTdqwGfo2pdL3dwfbePF2nOQ0Wh3r9eaVm0QnqKG3D07pGDYYi9kK2u6Axie3zVxWC7vN0D3A36bHB2DM6oZBUzYYet5PAi9wD3/=7YivCqgi4cGFdDU90RHDuAEiQhe9DxQxG5GumIqIIKb0UQgxYYFAZaU7Rxz92qG=ExD7=DYFwUiqmG5GKxWDn4xGZMT9kG9Qx3iQY/HV0TyG+9lsWmX4nyoiYRtCSRycrHz0RsiS=GDD==; tfstk=fcixcQVanLBxz4YicxToIND-nP9kMmHqUjkCj5Vc5bh8pR5fcZsbNgwaCG1bfrMSFRyOlNw_57ZTwfJqnZ006dhSpc46gomtwAltmoYqmGn-KAu0IoZgX1EqqqjgiIrtCXq9tBxHxxk4DlOHtiXEjzZQQN_1sSw5VKjz15tHxxkXADdLKHvwQqQ_65Z_lr67V7yhflab5u98CRff5iGsFLeaN-w_GSw5VRy1Gff5A79b1G3OuDlamHdNmim8FCymHTIQ3m2AjWH7wBOK2MzYOxNRfBjle9V7p0ONi5o-FmwnN3jYXYwt9ogJNihth2ladjtRG-3jpv4-bBsTU4G4r-3JCaNjdSMQmcfWH5omMcUqABjzG4nrXo0kMMVa54m48mA5DkgEno0sNds_64w14CinvpxOtuNVlLpR7NzbE2jV-4YrrMH7eWvAON7arTy8tLLV7NzbU8FHEfQN7zXP.',
  'Origin': 'https://6639d73239137d0001749e04.caiyicloud.com',
  'Referer': 'https://6639d73239137d0001749e04.caiyicloud.com/package-user/pages/audience-modification/audience-modification?watcherReplacer=%E8%A7%82%E6%BC%94',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'access-token': token,
  'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'src': 'WEB',
  'terminal-src': 'WEB',
  'ver': '4.10.1'
};

function generateRandomChineseChars(count) {
    let result = '';
    for (let i = 0; i < count; i++) {
        const randomUnicode = Math.floor(Math.random() * (40869 - 19968 + 1)) + 19968;
        result += String.fromCharCode(randomUnicode);
    }
    return result;
}

async function addAddress() {
    const name = await generateRandomChineseChars(4);
    const stree = await generateRandomChineseChars(6);
    return fetch('https://6639d73239137d0001749e04.caiyicloud.com/cyy_gatewayapi/user/buyer/v3/user/addresses', {
        method: 'POST',
        headers: {
            ...headers
        },
        body: JSON.stringify({
            'src': 'WEB',
            'ver': '4.10.1',
            'username': name,
            'cellphone': phone,
            'locationId': '110101',
            'detailAddress': stree,
            'isDefault': true
        })
    }).then((res) => res.json())
        .then((res) => {
            console.log(phone + '添加收货地址成功')
            // return getAddress()
        })
}

function getAddress() {
    return fetch('https://6639d73239137d0001749e04.caiyicloud.com/cyy_gatewayapi/user/buyer/v3/user/addresses?src=WEB&ver=4.10.1', {
        headers: {
        ...headers
        }
    }).then(res => res.json())
        .then(res => {
            return res.data
        }).catch(async err => {
            console.log('获取地址')
            return await getAddress()
        })
}


async function sleep(second) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, second * 1000);
    });
  }
console.log('获取收货地址')
const address = await getAddress()

async function run() {
    if (address.length === 0) {
        await addAddress()
        await sleep(3)
    } else {
        console.log(`${phone}已经有收货地址了`)
        return true
    }
}

run();