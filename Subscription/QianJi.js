/*
[Script]
[MITM]
hostname = api.qianjiapp.com
*/
var body = JSON.parse($response.body);
body.data.config.userinfo.viptype = 100;
body.data.config.userinfo.vipstart = 1729483103;
body.data.config.userinfo.vipend = 1735592813;// "2024-12-31T05:06:53Z"
body = JSON.stringify(body);
$done({
    body
});