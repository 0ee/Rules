// https:\/\/(api.alipan.com/apps/v1/users/app_list|api.aliyundrive.com/v2/databox/get_personal_info|api.alipan.com/apps/v2/users/home/widgets|member.alipan.com/v1/users/tools|member.aliyundrive.com/v1/users/tools|api.alipan.com/business/v1.0/users/feature/list|api.alipan.com/business/v1.1/users/me/vip/info|api.aliyundrive.com/business/v1.0/users/vip/info|api.alipan.com/business/v1.0/users/vip/info|member.alipan.com/v1/users/me|member.aliyundrive.com/v1/users/me|api.alipan.com/adrive/v1/app/logos|member.alipan.com/v1/users/onboard_list|member.alipan.com/v2/activity/sign_in_info|api.alipan.com/adrive/v2/backup/device_applet_list_summary)
let body = $response.body;
console.log($request.url)
console.log($request.method)
console.log(body)
if ($request.method === 'OPTIONS') {
    $done({});
}else{
    if (!body) $done({});
    console.log($request.url)
    // console.log(body)
    body = JSON.parse(body);
    //  https://api.alipan.com/apps/v1/users/app_list
    if (-1 != $request.url.indexOf('/apps/v1/users/app_list')) {
        blackApps = ["好运瓶","传图识字","通讯录","金山文档","喜阅星球","在线打印"];
    body.result = body.result.filter(i=>{
            if(blackApps.includes(i.name)){
                return false;
            }
            return true;
        });
    }
    //  https://api.aliyundrive.com/v2/databox/get_personal_info?_rx-s=mobile
    if ($request.url.includes("/v2/databox/get_personal_info")) {
        body.personal_rights_info.spu_id = "svip";
    }

    //  https://api.alipan.com/apps/v2/users/home/widgets
    //  https://bizapi.alipan.com/apps/v1/user/home/widgets
    if (-1 != $request.url.indexOf('/apps/v1/user/home/widgets')) {
        body.banners.items = body.banners.items.filter(i=>{
            if(i.code === 'print'){ // 签到
                return false;
            }
            if(i.code === 'svip'){
                return false;
            }
            if(i.code === '590xx'){
                return false;
            }
            return true;
            });
        // coreFeatures
        body.coreFeatures.items = body.coreFeatures.items.filter(i=>{
            if(i.code === 'AI_ASSISTANT'){ // 图搜
                return false;
            }
            return true;
        });
        // delete body.mainBackup;
        body.introduceAlipan = {};
    }
    // https://member.alipan.com/v1/users/tools
    // https://member.aliyundrive.com/v1/users/tools
    if (-1 != $request.url.indexOf('/v1/users/tools')) {
        body.result.commonTools = body.result.commonTools.filter(i=>{
            if(i.id === 'data'){
                return false;
            }
            return true;
        });
        body.result.moreTools = body.result.moreTools.filter(i=>{
            if(i.id === 'darenCenter'){ // 达人中心
                return false;
            } else if(i.id === 'bottles'){ // 好运瓶
                return false;
            } else if(i.id === 'thirdApps'){ // 三方应用
                return false;
            } else if(i.id === 'friendTransferPan'){ // 给云盘好友传文件
                return false;
            } else if(i.id === 'helpAndFeedback'){ // 帮助与反馈
                return false;
            } else if(i.id === 'fileClean'){ // 文件清理
                return false;
            } else if(i.id === 'advertisement'){ // 特惠流量包
                return false;
            } else if(i.id === 'welfare'){ // 福利社
                return false;
            }
            return true;
        });
    }

    //  https://api.alipan.com/business/v1.0/users/feature/list
    if ($request.url.includes("/business/v1.0/users/feature/list")) {
        body.identity = "svip";
        body.features.forEach((element, index, array) => {
            array[index].intercept = false;
            if(array[index].hasOwnProperty('features')){
                array[index].features.forEach((e,i,a)=>{
                    a[i].intercept = false;
                })
            }
        });
    }
    // https://api.alipan.com/v2/file/get_video_preview_play_info
    if ($request.url.includes("/v2/file/get_video_preview_play_info")) {
        body.video_preview_play_info.live_transcoding_task_list = body.video_preview_play_info.live_transcoding_task_list.filter(i=>{
            if(i.url == ''){
                return false;
            }
            return true;
        });
    }
    //  https://api.alipan.com/business/v2/users/me/vip/info
    if ($request.url.includes("/business/v2/users/me/vip/info")) {
        body.result[0].identity = "svip";
        body.result[0].activityText = "";
        body.result[0].activityAction = "";
    }
    //  https://api.aliyundrive.com/business/v1.0/users/vip/info?_rx-s=mobile
    //  https://api.alipan.com/business/v1.0/users/vip/info
    if ($request.url.includes("/business/v1.0/users/vip/info")) {
        body.identity = "svip";
        body.level = "svip";
        // body.icon = "https://gw.alicdn.com/imgextra/i3/O1CN01iPKCuZ1urjDgiry5c_!!6000000006091-2-tps-60-60.png";
        // body.mediumIcon= "https://gw.alicdn.com/imgextra/i4/O1CN01Mk916Y1c99aVBrgxM_!!6000000003557-2-tps-222-60.png";
        // body.vipList.forEach((element, index, array) => {
            // if(element.code === "svip"){ // 20TB超级会员
                // array[index].expire = 1893427200;  
            // }
        // });
    }
    // https://member.alipan.com/v1/users/me
    // https://member.aliyundrive.com/v1/users/me
    if ($request.url.includes("/v1/users/me")) {
        body.membershipIdentity = "svip";
    }
    // https://api.alipan.com/adrive/v1/app/logos
    if ($request.url.includes("/adrive/v1/app/logos")) {
        body.items.forEach((element, index, array) => {
            if(element.labelCode === "not-acquired"){
                array[index].labelCode = "acquired";
                array[index].labelText = "已获得";
            }
        });
    }

    // https://member.alipan.com/v1/users/onboard_list
    if ($request.url.includes("/v1/users/onboard_list")) {
        body.result = [];
    }

    // https://member.alipan.com/v2/activity/sign_in_info
    if ($request.url.includes("/v2/activity/sign_in_info")) {
        body.result.rewards = body.result.rewards.filter(i=>{
            if(i.type === 'dailySignIn'){ // 今日签到
                return true;
            } 
            return false;
        });
    }
    // https://api.alipan.com/adrive/v2/backup/device_applet_list_summary
    if ($request.url.includes("/adrive/v2/backup/device_applet_list_summary")) {
        body.deviceItems = [];
        body.appletItems = [];
    }
    body = JSON.stringify(body);
    $done({body});
}