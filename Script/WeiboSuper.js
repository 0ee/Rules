console.log(typeof $request != "undefined")
if (typeof $request != "undefined" && $request.method == 'GET') {
    $persistentStore.write($request.url,'weibosuper_ys_signurl')
    $persistentStore.write(JSON.stringify($request.headers),'weibosuper_ys_signheader')
    console.log('获取原神cookie成功')
    $notification.post('获取原神cookie成功', '获取原神cookie成功', '获取原神cookie成功')
    $done({})
}else{
    console.log('这里');
    console.log($persistentStore.read('weibosuper_ys_signurl'));
    console.log(getHeaders());
    $httpClient.get({
        url: $persistentStore.read('weibosuper_ys_signurl'),
        headers: getHeaders(),
        timeout: 5
    }, function (error, response, data) {
        console.log(data)
        $notification.post('原神超话签到', data, data)
        $done({});
    });
    // {"errno":382004,"errmsg":"今天已签到","msg":"今天已签到","errcode":382004,"ignore_code":1}
}
function getHeaders() {
    // return JSON.parse(.assign({}, )
    return Object.assign({}, $persistentStore.read('weibosuper_ys_signheader'), {"HTTP_VERSION":'HTTP/1.1'});
}