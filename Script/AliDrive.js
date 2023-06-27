// https:\/\/(?:api\.aliyundrive\.com\/apps\/v1\/users\/home\/widgets|member\.aliyundrive\.com\/v1\/users\/tools|api.aliyundrive.com/apps/v1/users/apps/welcome|api.aliyundrive.com/apps/v1/users/app_list|api.aliyundrive.com/business/v1.0/users/feature/list|api.aliyundrive.com/business/v1.0/users/vip/info|api.aliyundrive.com/business/v1/users/me/vip/info|member.aliyundrive.com/v1/users/me|api.aliyundrive.com/v2/databox/get_personal_info)
let body = $response.body;
console.log($request.url)
// console.log(body)
body = JSON.parse(body);
// https://api.aliyundrive.com/apps/v1/users/app_list
if (-1 != $request.url.indexOf('/apps/v1/users/app_list')) {
    blackApps = ["好运瓶","传图识字","通讯录","金山文档","喜阅星球"];
   body.result = body.result.filter(i=>{
        if(blackApps.includes(i.name)){
            return false;
        }
        console.log(i)
        return true;
    });
}
// https://api.aliyundrive.com/v2/databox/get_personal_info
if ($request.url.includes("/v2/databox/get_personal_info")) {
    body.personal_rights_info.spu_id = "svip";
}

// https://api.aliyundrive.com/apps/v1/users/home/widgets
if (-1 != $request.url.indexOf('apps/v1/users/home/widgets')) {
    // recentSaved
    // recentUsed
    // activities
    body.activities.items = body.activities.items.filter(i=>{
        console.log(i)
        if(i.code === 'riqianhuodong'){ // 签到
            return false;
        }
    if(i.code === 'lianxubaoyue'){return false;}
        return true;
    });
    // signIn
    if(body.signIn.isSignIn){
        delete body.signIn;
    }
    // myBackup
    body.myBackup.deviceBackupChannel = [];
    body.myBackup.device.albumBackupSetting.accessAuthority = false;
    body.myBackup.device.albumBackupSetting.autoStatus = false;
    body.myBackup.device.albumBackupSetting.leftFileTotal = 0;
    body.myBackup.device.albumBackupSetting.leftFileTotalSize = 0;
  delete body.myBackup;
    // coreFeatures
    body.coreFeatures.items = body.coreFeatures.items.filter(i=>{
        console.log(i)
        if(i.code === 'AI_ASSISTANT'){ // 图搜
            return false;
        }
        return true;
    });
}
// https://member.aliyundrive.com/v1/users/tools
if (-1 != $request.url.indexOf('/v1/users/tools')) {
   body.result.commonTools = body.result.commonTools.filter(i=>{
   if(i.id === 'data'){return false;}
   return true;
  })
    body.result.moreTools = body.result.moreTools.filter(i=>{
        
        if(i.id === 'darenCenter'){ // 达人中心
            return false;
        } else if(i.id === 'bottles'){ // 好运瓶
            return false;
        } else if(i.id === 'friendTransferPan'){ // 给云盘好友传文件
       return false;
    } else if(i.id === 'helpAndFeedback'){ // 帮助与反馈
     return false;}
     console.log(i)
        return true;
    });
}

// https://api.aliyundrive.com/apps/v1/users/apps/welcome
if (-1 != $request.url.indexOf('/v1/users/apps/welcome')) {
   body.description = '☄️'
}

// https://api.aliyundrive.com/business/v1.0/users/feature/list
if ($request.url.includes("/business/v1.0/users/feature/list")) {
    body.identity = "svip";
    body.features.forEach((element, index, array) => {
          array[index].intercept = false;
    });
}
// https://api.aliyundrive.com/business/v1/users/me/vip/info
if ($request.url.includes("/business/v1/users/me/vip/info")) {
    body.identity = "svip";
}
// https://api.aliyundrive.com/business/v1.0/users/vip/info
if ($request.url.includes("/business/v1.0/users/vip/info")) {
    body.identity = "svip";
    body.level = "svip";
    body.vipList.forEach((element, index, array) => {
        if(element.code === "svip"){ // 20TB超级会员
            array[index].expire = 1893427200;  
        }
    });
}
// https://member.aliyundrive.com/v1/users/me
if ($request.url.includes("/v1/users/me")) {
    body.membershipIdentity = "svip";
}

body = JSON.stringify(body);
$done({body});