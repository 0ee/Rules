/*
[Script]
http-response ^https:\/\/license\.pdfexpert\.com\/api\/.*\/.*\/subscription\/(refresh$|check$) requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/0ee/Rules/master/Surge/Script/Documents.js
[MITM]
hostname = license.pdfexpert.com
*/
let body = $response.body;
console.log($request.url)
console.log(body)
body = JSON.parse(body);

body["isInGracePeriod"] = false;
body["isEligibleForIntroPeriod"] = false;
body["originalTransactionId"] = "20000000000000";
body["subscriptionState"] = "active";
body["subscriptionExpirationDate"] = "13:14 31/12/2022";
body["subscriptionAutoRenewStatus"] = "autoRenewOff";
body["subscriptionReceiptId"] = "1500000000000";

body = JSON.stringify(body);
$done({body});
