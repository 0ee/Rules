let body = $response.body;
body = JSON.parse(body);
console.log($request.url)
console.log(body)
if (-1 != $request.url.indexOf('/api/maotai/me')) {
    body.data.is_vip = 1;
    body.data.vip_end_at = "2022-12-30 11:45:00";
}
body = JSON.stringify(body);
$done({body});
