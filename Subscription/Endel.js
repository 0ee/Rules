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