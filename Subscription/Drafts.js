/*
[Script]
http-response https://backend.getdrafts.com/api/v1/verification/account_status requires-body=true,script-path=https://raw.githubusercontent.com/0ee/Rules/Surge/Subscription/Drafts.js
[MITM]
hostname = backend.getdrafts.com
*/
let body = $response.body;
body = JSON.parse(body);
console.log(body)
if (-1 != $request.url.indexOf('/api/v1/verification/account_status')) {
    body["is_subscription_active"] = true;
    body["active_expires_at"] = "2022-12-31T05:06:53Z";
    body["active_subscription_type"] = "year";//none
    body["is_blocked"] = false;
}
body = JSON.stringify(body);
$done({body});
