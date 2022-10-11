function fixPos(arr) {
    for (let i = 0; i < arr.length; i++) {
        // 修复pos
        arr[i].pos = i + 1;
    }
}
function resetTabPos(arr) {
    for (let i = 0; i < arr.length; i++) {
        if(arr[i].name == '热门'){
            arr[i].pos = 1;
            arr[i].default_selected = 1;
            continue;
        }
        // 修复pos
        arr[i].pos = i + 2;
        delete arr[i].default_selected;
    }
    arr.sort(function(a,b){
        return a.pos - b.pos
    });
}
const up_blacklist = [];
const title_blackwords = ['代肝'];
const region_blacklist = [];
let body = $response.body;
notifyTitle = 'bilibili-json';
console.log($request.url)
console.log($request.method)
console.log(body)
const url = $request.url;
if (!$response.body) {
    // 有undefined的情况
    console.log(`$response.body为undefined:${url}`);
    $done({});
}
if ($request.method !== "GET") {
    $notification.post(notifyTitle, "method错误:", method);
}
body = JSON.parse(body);
if (!body.data) {
    $notification.post(notifyTitle, url, "data字段错误");
}
// 开屏页面
if (-1 != $request.url.indexOf('x/v2/splash') && 0 == body['code']) {
    console.log('开屏页' + ($request.url.indexOf("splash/show") !== -1 ? 'show' : 'list'));
    if (body.data.hasOwnProperty('show')) {
            delete body.data.show;
    }
}


// 观看页面
if (-1 != $request.url.indexOf('/x/v2/view\?a') && 0 == body['code']) {
    body['data']['relates'] = body['data']['relates'].filter(function (item) {
        if (item.hasOwnProperty('is_ad')) {
            return false;
        }
        return true;
    });
}

// 排行榜
if (-1 != $request.url.indexOf('/x/v2/rank') && 0 == body['code']) {
    body['data'] = body['data'].filter(function (item) {
        if (up_blacklist.includes(item.name)) {
            return false;
        }
        return true;
    });
}

// feed
if (-1 != $request.url.indexOf('/x/v2/feed') && 0 == body['code']) {
    if (!body.data.items?.length) {
            $notification.post(notifyTitle, '推荐页', "items字段错误");
    }else{
        body['data']['items'] = body['data']['items'].filter(function (item) {
        // search_subscribe 人气UP主推荐
        if (['ad_web_s', 'ad_av', 'ad_web', 'live', 'banner', 'search_subscribe','ad_web_gif','ad_player', 'ad_inline_3d', 'game', 'ad_inline_av'].includes(item.card_goto)) {
            return false;
        }
        if (item.hasOwnProperty('ad_info')) {
            return false;
        }
        if (up_blacklist.includes(item.args.up_name)) {
            return false;
        }
        if (region_blacklist.includes(item.args.rname)) {
            return false;
        }
        for( let word of title_blackwords){
            if(-1 != item.title.indexOf(word)){
                return false;
            }
        }
        return true;
    });
    }

}

// 搜索页Banner
if(-1 != $request.url.indexOf('search/resource') && 0 == body['code']){
    body['data'] = [];
}

// 评论页面notice
if (-1 != $request.url.indexOf('/x/v2/reply/main') && 0 == body['code']) {
    body['data']['notice'] = {};
}

// tab
if (-1 != $request.url.indexOf('resource/show/tab/v2?') && 0 == body['code']) {
    // 70 39 直播 151 影视 136117 新征程
    body['data']['tab'] = body['data']['tab'].filter(function (item) {
        return item.id != 38247 && item.id != 51079 && item.id != 536 && item.name != '直播' && item.id != 151 && item.id != 165 && item.id != 168 && item.id != 171 && item.id != 136117 && item.name != '追番'
    });
    resetTabPos(body['data']['tab']);
    // 游戏中心
    body['data']['top'] = body['data']['top'].filter(function (item) {
        return item.id != 222 && item.id != 176;
    });
    // 去除发布、会员购
    body['data']['bottom'] = body['data']['bottom'].filter(function (item) {
        return item.id != 670 && item.id != 242;
    });
    fixPos(body['data']['bottom']);
    body['data']['top_left'] = {};
}

// 我的
if (-1 != $request.url.indexOf('/x/v2/account/mine') && 0 == body['code']) {
    body['data']['vip_section'] = {};
    body['data']['vip_section_v2'] = {};
    body['data']['vip_section_right'] = {};
    body['data']['live_tip'] = {};
    body['data']['vip'] = {};
    body['data']['enable_bili_link'] = false;
    body['data']['sections_v2'] = body['data']['sections_v2'].filter(
        function (item, index) {
            if ('创作中心' == item.title || '推荐服务' == item.title) {
                return false;
            }
            item.items = item.items.filter(function (section_items) {
                console.log(section_items.title);
                if ((['我的关注', '我的钱包', '会员购中心', '直播中心', '青少年模式', '看视频免流量', 'BW 成就', '听视频', '青少年守护', '限流推送详细解读'].includes(section_items.title))) {
                    return false;
                }
                return true;
            });
            return true;
        });
}
body = JSON.stringify(body);
$done({body});