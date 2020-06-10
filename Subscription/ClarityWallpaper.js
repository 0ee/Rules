/*
[Script]
http-response ^https:\/\/claritywallpaper\.com\/clarity\/api\/(userInfo|special\/queryByCatalogAll)
[MITM]
hostname = claritywallpaper.com
*/
let body = $response.body;
body = JSON.parse(body);
console.log(body)
if (-1 != $request.url.indexOf('/special/queryByCatalogAll')) {
    for (var i = 0; i < body.data.length; i++) {
        body.data[i].isFree = true;
    }
} else if (-1 != $request.url.indexOf('/userInfo')) {
    body.data.level = 5;
    body.data.expireTime = 4070965662;
}
body = JSON.stringify(body);
$done({body});
