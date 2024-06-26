let body = $response.body;
if ($request.method === 'OPTIONS') {
    $done({});
}else{
    if (!body) $done({});
    body = body.replace(/false/g, 'true');
    body = JSON.parse(body);
    if (-1 != $request.url.indexOf('/app/user/init')) {
        body.data.expiredDay = 999999;
        body.data.newMessage = true;
        body.data.isProActive = true;
        body.data.subscribe = true;
        body.data.userProStatStatusEnum = 'VALID';
        body.data.expireDate = '2030-12-31 05:06:53';
        body.data.expiredTime = '2030-12-31 05:06:53';
        body.data.userProInfoVO.subscribeExpiresDate = '2030-12-31 05:06:53';
        body.data.userProInfoVO.expiredDay = 999;
        body.data.userProInfoVO.expiredTime = 999;
        body.data.userProInfoVO.placeholderVip = true;
    }
    //  https://newdrugs.dxy.cn/app/user/pro/stat
    if ($request.url.includes("/app/user/pro/stat")) {
        body.data.userProStatStatusEnum = 'VALID';
        body.data.activeType = 3;
        body.data.userProInfoVO.placeholderVip = true;
        body.data.expiredDay = 999;
        body.data.expireDate = '2030-12-31 05:06:53';
        body.data.expiredTime = '2030-12-31 05:06:53';
        body.data.userProInfoVO.expiredTime = '2030-12-31 05:06:53';
        body.data.userProInfoVO.expiredDay = 999;
        body.data.svipUserProInfo.expiredDay = 999;
        body.data.userProInfoVO.subscribeExpiresDate = '2030-12-31 05:06:53';
        body.data.userProInfoVO.activeType = 2;
        body.data.svipUserProInfo.placeholderVip = true;
        body.data.svipUserProInfo.activeType = 2;
    }
    body = JSON.stringify(body);
    $done({body});
}