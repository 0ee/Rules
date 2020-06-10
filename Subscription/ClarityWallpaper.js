/*
[Script]
^https:\/\/claritywallpaper\.com\/clarity\/api\/(userInfo|special\/ff|special|user\/appPay)
[MITM]
hostname = claritywallpaper.com
*/
let body = $response.body;
body = JSON.parse(body);
console.log(body)
if (-1 != $request.url.indexOf('/special/ff')) {
    if (data.hasProperty('isFree')) {
        body.data.isFree = true;
    }
    if (data.hasProperty('pictureList')) {
        for (var i = 0; i < body.data.pictureList.length; i++) {
            body.data.pictureList[i].isFree = true;
        }
    } else {
        for (var i = 0; i < body.data.length; i++) {
            body.data[i].isFree = true;
        }
    }

} else if (-1 != $request.url.indexOf('/user/appPay')) {
    body.data.isPayed = true;
} else if (-1 != $request.url.indexOf('/userInfo')) {
    body.data.level = 5;
    body.data.expireTime = 4070965662;
}
body = JSON.stringify(body);
$done({body});
