if ($request.url.indexOf('mb3admin.com/admin/service/registration/validateDevice') != -1) {
    if ($response.status != 200) {
        $done({
            status: 200,
            headers: $response.headers,
            body: '{"cacheExpirationDays":999,"resultCode":"GOOD","message":"Device Valid"}'
        })
    } else {
        $done({})
    }
} else if ($request.url.indexOf('mb3admin.com/admin/service/registration/validate') != -1) {
    $done({
        status: 200,
        headers: $response.headers,
        body: '{"featId": "","registered": true,"expDate": "2099-01-01","key": ""}'
    })
} else if ($request.url.indexOf('mb3admin.com/admin/service/registration/getStatus') != -1) {
    $done({
        status: 200,
        headers: $response.headers,
        body: '{"planType": "Lifetime", "deviceStatus": 0, "subscriptions": []}'
    })
} else if ($request.url.indexOf('mb3admin.com/admin/service/appstore/register') != -1) {
    $done({
        status: 200,
        headers: $response.headers,
        body: '{"featId": "","registered": true,"expDate": "2099-01-01","key": ""}'
    })
} else if ($request.url.indexOf('mb3admin.com/emby/Plugins/SecurityInfo') != -1) {
    $done({
        status: 200,
        headers: $response.headers,
        body: '{SupporterKey: "", IsMBSupporter: true}'
    })
} else {
    $done({})
}
