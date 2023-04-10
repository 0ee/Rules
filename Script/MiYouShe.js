let body = $response.body;
console.log($request.url)
console.log(body)
body = JSON.parse(body);

// basic
if (-1 != $request.url.indexOf('game_record/app/genshin/aapi/widget/v2') && 0 === body['retcode']) {
    console.log("修改keep响应");
    if (body['data']['has_signed'] === true){
        body['data']['sign_url'] = "yuanshengame://";
    }
    
}
body = JSON.stringify(body);
$done({body});
