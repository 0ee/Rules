/*
[Script]
http-response ^https:\/\/lanfanapp.com\/api\/v1\/user\/(prime.json|page_detail.json)
[MITM]
hostname = lanfanapp.com
*/
let body = $response.body;
body = JSON.parse(body);
console.log(body)
if (-1 != $request.url.indexOf('prime.json')) {
    body["content"]["user"]["prime"]["is_prime"] = true;
    body["content"]["user"]["prime"]["expires_time"] = "2022-01-01 00:00:00";
    body["content"]["user"]["prime_contract"] = "automatic_renewal";
    body["content"]["user"]["is_prime"] = true;
}else if(-1 != $request.url.indexOf('page_detail.json')) {
    body["content"]["user"]["is_prime"] = true;
}
body = JSON.stringify(body);
$done({body});
