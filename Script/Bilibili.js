const up_blacklist = ['NathanRich火锅大王','大祥哥来了'];
const title_blackwords = ['乔碧萝','鸡你太美'];
const region_blacklist = ['宅舞','三次元舞蹈'];
let body = $response.body;
console.log($request.url)
console.log(body)
body = JSON.parse(body);
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
        return item.id != 38247 && item.id != 51079 && item.id != 536 && item.id != 39 && item.id != 151 && item.id != 165 && item.id != 168 && item.id != 171 && item.id != 136117
    });
    // 游戏中心
    body['data']['top'] = body['data']['top'].filter(function (item) {
        return item.id != 222 && item.id != 176;
    });
    // 去除发布、会员购
    body['data']['bottom'] = body['data']['bottom'].filter(function (item) {
        return item.id != 670 && item.id != 242;
    });
}

// 我的
if (-1 != $request.url.indexOf('/x/v2/account/mine') && 0 == body['code']) {
    body['data']['vip_section'] = {};
    body['data']['vip_section_v2'] = {};
    body['data']['live_tip'] = {};
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