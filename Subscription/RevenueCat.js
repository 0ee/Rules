const res = {};
const parsedData = JSON.parse(typeof $response != "undefined" && $response.body || null);
let flag = false;
// 添加版本检查函数
function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1Part = v1parts[i] || 0;
      const v2Part = v2parts[i] || 0;

      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
  }
  return 0;
}
// 获取 RevenueCat 版本和 UA
const rcVersion = $request.headers['x-version'] || $request.headers['X-Version'] || 'unknown';
const UA = $request.headers['user-agent'] || $request.headers['User-Agent'] || 'unknown';
const appName = UA.split('/')[0] || 'unknown';
const nonce = $request.headers['x-nonce'] || $request.headers['X-Nonce'];
const signature = $request.headers['x-signature'] || $request.headers['X-Signature'];
// if (nonce && nonce.trim() !== '') {
    // console.log(`x-nonce detected: ${nonce}`);
    // $notification.post(`${appName} 版本号: ${rcVersion}`, `📴`)
    // $done({});
// }
// if (signature && signature != ''){
    // $notification.post(`${appName} 版本号: ${rcVersion}`, `📴响应签名验证`)
    // $done({});
// }
// 检查 Trusted Entitlements 支持和默认状态
if (rcVersion !== 'unknown') {
    if (compareVersions(rcVersion, '4.25.0') < 0) {
        console.log(`版本号: ${rcVersion}, UA: ${UA}, Trusted Entitlements: no support`);
        if (typeof $response != 'undefined'){
           $notification.post(`${appName} 版本号: ${rcVersion}`, `✅Trusted Entitlements: no support`)
        }
    } else if (compareVersions(rcVersion, '5.15.0') < 0) {
        console.log(`版本号: ${rcVersion}, UA: ${UA}, Trusted Entitlements: supported (默认禁用)`);
        if (typeof $response != 'undefined'){
            $notification.post(`${appName} 版本号: ${rcVersion}`, `☑️Trusted Entitlements: supported (默认禁用)`)
        }
    } else {
        console.log(`版本号: ${rcVersion}, UA: ${UA}, Trusted Entitlements: supported (可配置)`);
        if (typeof $response != 'undefined'){
            $notification.post(`${appName} 版本号: ${rcVersion}`, `❌Trusted Entitlements: supported (可配置)`)
        }
    }
}
if (typeof $response == "undefined") {
    delete $request.headers["x-revenuecat-etag"];
    delete $request.headers["X-RevenueCat-ETag"];
    res.headers = $request.headers;
    flag = true;
} else if (parsedData && parsedData.subscriber) {
    parsedData.subscriber.subscriptions = parsedData.subscriber.subscriptions || {};
    parsedData.subscriber.entitlements = parsedData.subscriber.entitlements || {};
    var headers = {};
    for (var key in $request.headers) {
        const reg = /^[a-z]+$/;
        if (key === "User-Agent" && !reg.test(key)) {
            var lowerkey = key.toLowerCase();
            $request.headers[lowerkey] = $request.headers[key];
            delete $request.headers[key];
        }
    }
    const app = 'gd';
    const UAMappings = {
        'apollo': {name: 'all', id: 'com'},
        'dtdvibe': {name: 'pro', id: 'com.dtd.aroundu.year'},
        'LUTCamera': {name: 'ProVersionLifeTime', id: 'com.uzero.funforcam.lifetimepurchase'},
        // 目标地图
        '%E7%9B%AE%E6%A0%87%E5%9C%B0%E5%9B%BE':{ name: 'pro', id: 'com.happydogteam.relax.lifetimePro'},
        'Spark%20Desktop': {name: 'premium', id: 'spark_b_4199_1y_1w0'},
        'Spark': {name: 'premium', id: 'spark_b_4199_1y_1w0'},
        // PureLibro
        // 'Reader':{name:'pro', id: 'reader.lifetime.pro'},
        'Percento':{name:'premium',id:'com'},
        'AudioPlayer':{name:'Pro', id:'com'},
        // 花样文字
        'UTC': {name:'Entitlement.Pro', id:'com'},
        'VSCO': {name: 'pro', id: 'vscopro_global_5999_annual_AutoFreeTrial'},
        'GoodThing':{ name: 'pro', id: 'goodhappens_basic_forever'},
    };
    const data = {
        "expires_date": "2030-12-31T05:06:53Z",
        "original_purchase_date": "2023-06-06T06:06:06Z",
        "purchase_date": "2023-06-06T06:06:06Z",
        "ownership_type": "PURCHASED",
        "store": "app_store"
    };
    for (const i in UAMappings) {
        if (new RegExp(`^${i}`, 'i').test(UA)) {
            const {name, id} = UAMappings[i];
            parsedData.subscriber.subscriptions = {};
            parsedData.subscriber.subscriptions[id] = data;
            parsedData.subscriber.entitlements[name] = JSON.parse(JSON.stringify(data));
            parsedData.subscriber.entitlements[name].product_identifier = id;
            flag = true;
            break;
        }
    }
    res.body = JSON.stringify(parsedData);
}
console.log($request.headers['user-agent']);
if(flag){
    console.log(res);
    $done(res);    
}else{
    console.log('不改动');
    $done({});
}

