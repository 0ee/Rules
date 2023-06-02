# Keep.js = requires-body=1,script-path=https://raw.githubusercontent.com/0ee/Rules/Surge/Script/Keep.js,type=http-response,pattern=https://(app|api).gotokeep.com/config/v3,max-size=-1,script-update-interval=0
let body = $response.body;
console.log($request.url)
console.log(body)
body = JSON.parse(body);

// basic
if (-1 != $request.url.indexOf('config/v3/basic') && true == body['ok']) {
    console.log("修改keep响应");
    body['data']['bottomBarControl']['tabs'] = body['data']['bottomBarControl']['tabs'].filter(function (item) {
        console.log(item.name);
        return item.name != '商城'
    });
}
body = JSON.stringify(body);
$done({body});
