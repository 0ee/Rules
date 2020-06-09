let body = $response.body;
console.log($request.url)
console.log(body)
body = JSON.parse(body);

// basic
if (-1 != $request.url.indexOf('config/v2/basic') && true == body['ok']) {
    body['data']['bottomBarControl']['tabs'] = body['data']['bottomBarControl']['tabs'].filter(function (item) {
        console.log(item.name);
        return item.name != '社区'
    });
}
body = JSON.stringify(body);
$done({body});
