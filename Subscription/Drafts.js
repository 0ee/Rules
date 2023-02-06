/*
[Script]
http-response https://backend.getdrafts.com/api/v1/verification/account_status requires-body=true,script-path=https://raw.githubusercontent.com/0ee/Rules/Surge/Subscription/Drafts.js
[MITM]
hostname = backend.getdrafts.com
*/
if ( - 1 != $request.url.indexOf('/api/v1/verification/account_status')) {
    let body = {};
    if ($response.status != 200) {
        body = {};
    } else {
        body = $response.body;
    }
    body["is_subscription_active"] = true;
    body["active_expires_at"] = "2030-12-31T05:06:53Z";
    body["active_subscription_type"] = "year"; //none
    body["is_blocked"] = false;
    body["has_had_free_trial"] = false;
    body = JSON.stringify(body);
    status = 200;
    $done({
        body,
        status
    });
} else {
    $done({});
}
