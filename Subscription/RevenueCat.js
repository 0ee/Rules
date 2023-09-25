const res = {};
const parsedData = JSON.parse(typeof $response != "undefined" && $response.body || null);
console.log(parsedData);
if (typeof $response == "undefined") {
    delete $request.headers["x-revenuecat-etag"];
    delete $request.headers["X-RevenueCat-ETag"];
    res.headers = $request.headers;
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
    var UA = $request.headers['user-agent'];
    const app = 'gd';
    const UAMappings = {
        'totowallet': {name: 'all', id: 'com.ziheng.totowallet.onetimepurchase'},
        'LUTCamera': {name: 'ProVersionLifeTime', id: 'com.uzero.funforcam.lifetimepurchase'},
        // 目标地图
        '%E7%9B%AE%E6%A0%87%E5%9C%B0%E5%9B%BE':{ name: 'pro', id: 'com.happydogteam.relax.lifetimePro'},
        // 极简日记
        'MinimalDiary':{ name: 'pro', id: 'com.mad.MinimalDiary.lifetime'},
        'Spark': {name: 'premium', id: 'spark_b_4199_1y_1w0'},

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
            break;
        }
    }
    res.body = JSON.stringify(parsedData);
}
console.log(res);
$done(res);