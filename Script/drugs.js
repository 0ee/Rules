// https:\/\/(api.alipan.com/apps/v1/users/app_list|api.aliyundrive.com/v2/databox/get_personal_info|api.alipan.com/apps/v2/users/home/widgets|member.alipan.com/v1/users/tools|member.aliyundrive.com/v1/users/tools|api.alipan.com/business/v1.0/users/feature/list|api.alipan.com/business/v1.1/users/me/vip/info|api.aliyundrive.com/business/v1.0/users/vip/info|api.alipan.com/business/v1.0/users/vip/info|member.alipan.com/v1/users/me|member.aliyundrive.com/v1/users/me|api.alipan.com/adrive/v1/app/logos|member.alipan.com/v1/users/onboard_list|member.alipan.com/v2/activity/sign_in_info|api.alipan.com/adrive/v2/backup/device_applet_list_summary)
let body = $response.body;
console.log($request.url)
console.log($request.method)
console.log(body)
if ($request.method === 'OPTIONS') {
    $done({});
}else{
    if (!body) $done({});
    console.log($request.url)
    // console.log(body)
    body = JSON.parse(body);
    //  https://api.alipan.com/apps/v1/users/app_list
    if (-1 != $request.url.indexOf('/app/user/init')) {
    //     blackApps = ["好运瓶","传图识字","通讯录","金山文档","喜阅星球"];
    // body.result = body.result.filter(i=>{
    //         if(blackApps.includes(i.name)){
    //             return false;
    //         }
    //         return true;
    //     });
        {
  "code": "success",
  "message": "成功",
  "data": {
    "activeMessageLinked": null,
    "username": "瞅啥瞅",
    "tid": null,
    "userProInfoVO": {
      "androidWithhold": null,
      "subscribeType": null,
      "userProStatStatusEnum": null,
      "subscribeButtonText": null,
      "nowPrice": null,
      "appendDays": null,
      "placeholderVip": true,
      "needReadSelectionCount": null,
      "orderType": null,
      "productId": null,
      "activeType": 0,
      "subscribeProductTypeId": null,
      "havingReadSelectionCount": null,
      "expiredTime": "2099-07-30 23:50:35;",
      "nowPayDesc": null,
      "originPrice": null,
      "subscribe": null,
      "subscribeExpiresDate": "2099-07-30 23:50:35;",
      "rightsNum": 12,
      "expiredDay": 999,
      "upgradeSvipCount": null,
      "purchaseTotalValue": 494
    },
    "uname": "dxy_10rosan5",
    "nickname": "瞅啥瞅",
    "userProStatStatusEnum": "VALID",
    "dataNum": null,
    "identify": false,
    "version": null,
    "iapPurchaseVO": null,
    "isProActive": true,
    "uid": null,
    "memberDiscount": false,
    "newMessage": true,
    "versionUpdate": false,
    "expiredTime": "2099-07-30 23:50:35;",
    "subscribe": true,
    "userProDiscountType": 12,
    "avatar": "https:\/\/gimg2.baidu.com\/image_search\/src=http%3A%2F%2Fimg10.360buyimg.com%2Fn0%2Fjfs%2Ft1%2F66253%2F38%2F12315%2F158714%2F5d9caed4Ef32b47b9%2F33d8d07a8489788a.jpg&refer=http%3A%2F%2Fimg10.360buyimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1661201310&t=651564aec8b189f326a483d97de6af5b",
    "versionMessage": null,
    "expireDate": "2099-07-30 23:50:35;",
    "expiredDay": 999999,
    "proActiveMessage": null,
    "dataUpdate": null
  },
  "false": true
}
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
    }
    //  https://newdrugs.dxy.cn/app/user/pro/stat
    if ($request.url.includes("/app/user/pro/stat")) {
        body.data.expiredDay = 999999;
        body.data.newMessage = true;
        body.data.isProActive = true;
        body.data.activeType = 'svipUserProInfo';
        body.data.svipUserProInfo.upgradeExpire = 3;
        body.data.userProStatStatusEnum = 'VALID';
        body.data.expireDate = '2030-12-31 05:06:53';
        body.data.expiredTime = '2030-12-31 05:06:53';
        body.data.userProInfoVO.subscribeExpiresDate = '2030-12-31 05:06:53';
        body.data.userProInfoVO.expiredDay = 999;
        body.data.userProInfoVO.activeType = 2;
        body.data.userProInfoVO.upgradeExpire = 2;
        body.data.userProInfoVO.expiredTime = 999;
        body.isVip = true;
    }
    body = JSON.stringify(body);
    $done({body});
}