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