/*
[Script]
^https:\/\/claritywallpaper\.com\/clarity\/api\/(userInfo|special\/ff|special|user\/appPay|special\/queryByCatalogAll)
[MITM]
hostname = claritywallpaper.com
*/
let body = $response.body;
body = JSON.parse(body);
console.log($request.url)
console.log(body)
if (-1 != $request.url.indexOf('/special/queryByCatalogAll')) {
    for (var i = 0; i < body.data.length; i++) {
        body.data[i].isFree = true;
    }
} else if (-1 != $request.url.indexOf('/special/ff')) {
    if(typeof body.data === 'object'){
        body.data.isFree = true;
        for (var i = 0; i < body.data.pictureList.length; i++) {
            body.data.pictureList[i].isFree = true;
        }
    }
    console.log(typeof body.data)
} else if (-1 != $request.url.indexOf('/user/appPay')) {
    body.data.isPayed = true;
} else if (-1 != $request.url.indexOf('/userInfo')) {
    body.data.level = 3;
    body.data.expireTime = 1623313429;
}
body = JSON.stringify(body);
$done({body});
