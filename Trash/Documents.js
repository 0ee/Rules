let body = $response.body;
if (!$response.body) $done({});
console.log($request.url)
console.log(body)
body = JSON.parse(body);
if("inAppStates" in body){
  body.inAppStates.forEach((item,index,arr)=>{
    delete item.subscriptionExpirationIntent;
    if(index === 0){
      item.subscriptionAutoRenewStatus = "autoRenewOn";
      item.subscriptionState = "trial";
      item.subscriptionExpirationDate = "10:10 31/12/2030";
    }
  });
}
console.log(body)
body = JSON.stringify(body);
$done({body});
// Documents = type=http-response,pattern=https://license.pdfexpert.com/api/2.0/documents/subscription/check|https://license.pdfexpert.com/api/2.0/documents/subscription/save_user_properties|https://license.pdfexpert.com/api/2.0/documents/subscription/statistics_processed|https://license.pdfexpert.com/api/2.0/documents/subscription/offer|https://license.pdfexpert.com/api/2.0/documents/subscription/refresh,requires-body=1,max-size=-1,debug=1,script-path=https://raw.githubusercontent.com/0ee/Rules/Surge/Subscription/Documents.js
// license.pdfexpert.com
// 需要修改header中的加密key，无法解决