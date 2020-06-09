let body = $response.body;
body = JSON.parse(body);
if (-1 != $request.url.indexOf('init')) {
    body['adSwitch'] = [];
    body['adUpdateTime'] += 86400 * 365;
    // 弹幕IP
    body['barrageIp'] = "";
}
if (-1 != $request.url.indexOf('ads')) {
    // 1.片头 6.影片推荐部分 7.feed 8.弹出广告
    body['ads'] = body['ads'].filter(
        function (item) {
            if ([1,2,7,8,40,41,42,43,44,45,46].includes(item.adType)) {
                return false;
            }
            if (6 == item.adType){
                if(item.click.indexOf('yyets://')) {
                    return false;
                }
            }
            return true;
        });
}
body = JSON.stringify(body);
$done({body});
