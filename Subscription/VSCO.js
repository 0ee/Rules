let body = $response.body;
body = JSON.parse(body);
console.log($request.url)
console.log(body)
if (-1 != $request.url.indexOf('/api/subscriptions/2.1/user-subscriptions')) {
    body['user_subscription'] = {"expires_on_sec":1735614816,"is_intro_period":false,"expired":false,"payment_type":2,"user_id":54624336,"source":1,"is_trial_period":true,"starts_on_sec":1565759207,"intro_offer_consumed":true,"is_active":true,"canceled_at_sec":null,"auto_renew":false,"is_in_grace_period":false,"last_verified_sec":1565759207,"invalid_reason":null,"subscription_code":"VSCOANNUAL"};
}
body = JSON.stringify(body);
$done({body});
