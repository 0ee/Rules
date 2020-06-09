// 爱美剧(https://xmj.app)
let body = $response.body;
body = JSON.parse(body);
// 我的
if(-1 != $request.url.indexOf('/app/ios/user/index') && 0 == body['code']){
    body['data']['user']['viptime'] = "2050-01-01 00:00:00";
    body['data']['user']['cion'] = "5201314";
    body['data']['user']['vip'] = "1";
}
// 看视频
if(-1 != $request.url.indexOf('/app/ios/vod/show')){
    body['data']["looktime"] = -1;
    body['data']["vip"] = "4";
}
// 开屏
if(-1 != $request.url.indexOf('/app/ios/ads/index')){
    body = {};
}
body = JSON.stringify(body);
$done({body});
