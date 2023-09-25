// Endel = type=http-response,pattern=^https?:\/\/api-production.endel.io\/v\d\/call,requires-body=1,script-path=https://raw.githubusercontent.com/0ee/Rules/Surge/Subscription/Endel.js
// api-production.endel.io
let body = JSON.parse($response.body)
if (body.subscription) {
    body.subscription.type = "ACTIVE"
    body.subscription.period = "YEAR"
    body.subscription.store = "APP_STORE"
    body.subscription.time_left = 999999
    body.subscription.valid_until = 1924928348
    $done({body:JSON.stringify(body)})
} else {
    $done({})
}