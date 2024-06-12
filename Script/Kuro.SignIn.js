// Modified from kayanouriko https://github.com/kayanouriko/quantumultx-mihoyobbs-auto-helper

/** env.js 全局 */
const $ = new Env('库社区小助手')

/** 通知相关 */

// 通知的 option
const msgOpt = {
    cookie: {},
    normal: {},
}
// 文本信息
const msgText = {
    noti: {
        title: '库社区小助手',
        resultsTitle: '脚本执行完成, 长按通知展开报告或者点击通知在应用内查看报告.\n\n',
        resultsEmpty: '脚本执行完成, 不过貌似没有任务执行了Orz',
        resultsEnd: '报告结果结束!'
    },
    // cookie 相关
    cookie: {
        empty: '请先打开该脚本配套重写规则更新后获取 headers, 再重新运行该脚本. 点击该通知将跳转获取 headers 的教程页面.',
    },
    common: {
        user: '获取账号信息有误, 错误信息: {0}.',
        uid: '无法正确获取账号信息关键参数.',
        sign: '获取账号签到信息有误, 错误信息: {0}.',
        today: '无法正确获取账号签到信息关键参数.',
        awards: '获取签到奖励信息有误, 错误信息: {0}.',
        award: '无法正确获取签到奖励信息关键参数.',
        error: '错误信息: {0}.'
    },
    // 米游币相关
    micoin: {
        cookie: 'cookie 已过期, 请重新运行 cookie 获取脚本一次.',
        finished: '今日可以获取的米游币已达上限.',
        empty: '查询可执行的米游币任务出错.',
        state: '获取米游社账号米游币任务完成状态出错, 错误信息: {0}.',
        forumid: '配置中的 sections 出错, 请参照脚本配置说明重新配置.',
        list: '在{0}讨论区执行米游币任务:\n',
        listError: '获取帖子列表有误, 错误信息: {0}.',
        listEmpty: '获取到的帖子列表为空.',
        signError: '讨论区签到任务执行失败, 错误信息: {0}.\n',
        sign: '讨论区签到任务完成(米游币+30).\n',
        post: '浏览 3 个帖子任务完成(米游币+20).\n',
        postFail: '浏览 3 个帖子任务未完成, 只成功浏览了 {0} 个帖子.\n',
        vote: '5 次点赞任务完成(米游币+30).\n',
        voteFail: '5 次点赞任务未完成, 只成功点赞了 {0} 个帖子.\n',
        shared: '分享帖子任务完成(米游币+10).\n',
        sharedFail: '分享帖子任务未完成.\n',
        taskEmpty: '不过貌似没有任何米游币任务执行了Orz\n',
        success: '米游币任务操作完成!\n{0}\n',
        error: '米游币任务操作未完成!\n{0}\n\n'
    },
    // 原神签到相关
    genshin: {
        bind: '请先前往米游社 App 手动签到一次!',
        signed: '旅行者"{0}"今日已领取过奖励.',
        success: '原神签到操作完成!\n旅行者"{0}"领取了奖励({1}x{2}).\n\n',
        error: '原神签到操作未完成!\n{0}\n\n',
        riskCode: '触发了风控验证码, 请前往米游社 app 手动签到.'
    },
    // 崩坏3rd签到相关
    honkai3rd: {
        signed: '舰长"{0}"今日已领取过奖励.',
        success: '崩坏3rd签到操作完成!\n舰长"{0}"领取了奖励({1}x{2}).\n\n',
        error: '崩坏3rd签到操作未完成!\n{0}\n\n'
    },
    // 根据类型获取对应的数据
    getMsg(type, key) {
        return this?.[type]?.[key]
    }
}

/** 米游社 api 相关 */
/** 请求 url 相关 */
const api = {
    // bbs 论坛
    micoin: {
        // 获取用户任务完成状态
        getUserMissionState: 'https://api.kurobbs.com/encourage/level/getTaskProcess',
        // 获取对应版块的帖子列表
        getForumPostList: 'https://api.kurobbs.com/forum/list',
        // 讨论区签到
        postSignIn: 'https://api.kurobbs.com/user/signIn',
        // 浏览帖子
        getPostFull: 'https://api.kurobbs.com/forum/getPostDetail',
        // 点赞
        postUpVotePost: 'https://api.kurobbs.com/forum/like',
        // 分享
        getShareConf: 'https://api.kurobbs.com/encourage/level/shareTask'
    },
    getApi(type) {
        return this[type]
    }
}

/** headers */
// 米游币相关的 headers
const bbsHeadersString = $.getdata('kayanouriko_kurobbs_headers_bbs')
// 签到相关的 headers
const signHeadersString = $.getdata('kayanouriko_kurobbs_headers_sign')

/**
 * 脚本的配置文件
 * 用户可以自定义配置, 每项设置均有说明, 脚本默认不做修改就能运行.
 * @param {array} tasks 需要自动执行的任务, 填入数组即可 
 *                      1. 米游币任务 2. 原神签到 3. 崩坏 3rd 签到
 *                      默认为 [1, 2, 3], 执行米游币, 原神, 崩坏3rd 3 个任务
 * @param {object} micoin 米游币任务的配置项, 只有 tasks 项存在 1 时, 该配置项的内容才会生效
 * @param {array} scetions 需要执行米游币任务的讨论区, 填入数字数组即可
 *                         1. 崩坏3, 26. 原神 30. 崩坏学园2 37. 未定事件簿 34. 大别野 52. 崩坏：星穹铁道
 *                         默认为 [34], 即在大别野帖子列表执行米游币任务(看帖子, 点赞和分享帖子)
 *                         后续可能会支持自动执行分区的经验任务, 所以这里用数组, 填写多个id也是没问题的(例如: [34, 26]), 但是暂时没什么, 脚本只会使用到数组里面的第一个id
 * @param {array} actions 需要执行的米游币任务, 填入数字数组即可
 *                        58. 讨论区签到 59. 浏览 3 个帖子 60. 完成 5 次点赞 61. 分享帖子
 *                        默认为 [58, 59, 60, 61], 执行米游社的全部任务
 */

const config = {
    tasks: [1],
    micoin: {
        sections: [34],
        actions: ["浏览3篇帖子", "点赞5次", "分享1次帖子", "用户签到"]
        //actions: [ "用户签到"]
    }
}
//==== 主入口 ====
main()

async function main() {
    try {
        // 执行任务流程
        let results = msgText.noti.resultsTitle
        for (const id of config.tasks) {
            switch (id) {
                case 1:
                    await checkBBSHeaders()
                    const micoinResult = await micoinTask()
                    results += micoinResult
                    break
                default:
                    break
            }
            await randomSleepAsync()
        }
        if (results === msgText.noti.resultsTitle) {
            results = msgText.noti.resultsEmpty
        } else {
            results += msgText.noti.resultsEnd
        }
        notify(results, msgOpt.normal)
    } catch (error) {
        const option = error === msgText.cookie.empty ? msgOpt.cookie : msgOpt.normal
        notify(error.message || error, option)
    } finally {
        $.done()
    }
}

//==== headers 检查 ====
function checkBBSHeaders() {
    console.log(checkBBSHeaders)
    if (!bbsHeadersString) {
        return Promise.reject(msgText.cookie.empty)
    }
}

//==== 库洛币任务 ====
async function micoinTask() {
    try {
        // 获取任务列表
        const tasks = await getUserMissionState()
        console.log(tasks)
        // 在执行任务之前, 先获取帖子列表
        const lists = await getForumPostList(9)
        
        await randomSleepAsync()

        let results = String.format(msgText.micoin.list, '库洛')
        // 开始循环执行任务
        for (const task of tasks) {
            console.log(task)
            // 如果配置内不包含该任务, 则跳过执行
            if (config.micoin.actions.indexOf(task.id) === -1) { continue }
                console.log(1111)
            // 任务已经完成的也跳过
            if (task.isGetAward) { continue }
                console.log(2222)
            // 否则执行任务
                // ["浏览3篇帖子", "点赞5次", "分享1次帖子", "用户签到"]
            switch (task.id) {
                case "用户签到":
                    //讨论区签到
                    console.log(33333)
                    const signResult = await postSignIn()
                    results += signResult
                    console.log('这里')
                    await randomSleepAsync()
                    break
                case "浏览3篇帖子":
                    // 看帖子
                    let postCount = task.times
                    for (let i = task.times; i < 3; i++) {
                        postCount += await getPostFull(lists?.[i])
                        await randomSleepAsync()
                    }
                    results += postCount === 3 ? msgText.micoin.post : String.format(msgText.micoin.postFail, postCount)
                    break
                case "点赞5次":
                    // 帖子点赞
                    let voteCount = task.times
                    for (let i = task.times; i < 5; i++) {
                        voteCount += await postUpVotePost(lists?.[i])
                        await randomSleepAsync()
                    }
                    results += voteCount === 5 ? msgText.micoin.vote : String.format(msgText.micoin.voteFail, voteCount)
                    break
                case "分享1次帖子":
                    // 分享
                    const sharedCode = await getShareConf(lists?.[0])
                    const sharedResult = sharedCode === 0 ? msgText.micoin.shared : msgText.micoin.sharedFail
                    results += sharedResult
                    await randomSleepAsync()
                    break
                default:
                    break
            }
        }
        if (results === String.format(msgText.micoin.list, '库洛')) {
            results = msgText.micoin.taskEmpty
        }
        return Promise.resolve(String.format(msgText.micoin.success, results))
    } catch (error) {
        return Promise.resolve(String.format(msgText.micoin.error, error.message || (error instanceof Object ? JSON.stringify(error) : error)))
    }
}

// 获取用户的任务状态
function getUserMissionState() {
    const option = {
        url: api.micoin.getUserMissionState,
        headers: getBBSHeaders(),
        body: "gameId=0"
    }
    return $.http.post(option).then(res => {
        const { code, msg, data } = JSON.parse(res.body)
        if (code === 220) {
            // cookie 失效, 需特别处理
            return Promise.reject(msg)
        } else if (code === 200) {
            // 今日还能获取的任务米游币
            const getCoinsCount = data?.['maxDailyGold'] - data?.['currentDailyGold']
            if (getCoinsCount === 0) {
                // 已经无法通过任务获取米游币
                return Promise.reject(msgText.micoin.finished)
            }
            console.log(data)
            const states = data?.dailyTask ?? []
            let halfTasks = []
            for (const state of states) {
                const id = state?.['remark'] ?? 10000
                const times = state?.['completeTimes'] ?? 0
                const isGetAward = state?.['process'] == 1 ? true : false
                halfTasks.push({
                    id,
                    times,
                    isGetAward
                })
            }
            // 创建 task 数组
            const tasks = ["浏览3篇帖子", "点赞5次", "分享1次帖子", "用户签到"].map(id => {
                let task = halfTasks.find(e => e.id === id)
                if (!task) {
                    task = {
                        id,
                        times: 0,
                        isGetAward: false
                    }
                }
                return task
            })
            return tasks
        } else {
            // 其余情况返回接口的报错信息
            return Promise.reject(String.format(msgText.micoin.state, message))
        }
    })
}

// 获取帖子列表
function getForumPostList(forumid) {
    const option = {
        url: api.micoin.getForumPostList,
        headers: getBBSHeaders(),
        body:"forumId="+forumid+"&gameId=3&pageIndex=1&pageSize=20&searchType=3&timeType=0"
    }
    return $.http.post(option).then(res => {
        const { code, msg, data } = JSON.parse(res.body)
        if (code !== 200) { 
            return Promise.reject(String.format(msgText.micoin.listError, msg))
        }
        const lists = data?.postList ?? []
        if (lists.length === 0) {
            return Promise.reject(msgText.micoin.listEmpty)
        }
        return lists
    })
}

// 讨论区签到
function postSignIn() {
    const option = {
        url: api.micoin.postSignIn,
        headers: getBBSHeaders(),
        body: "gameId=3"
    }
    console.log(555555)
    return $.http.post(option).then(res => {
        const { code, msg } = JSON.parse(res.body)
        if (code !== 200) {
            if(code == 1034){
                return String.format(msgText.micoin.signError, '触发了风控验证码')    
            }
            // 签到操作未完成, 但是下面的任务还需要继续, 所以返回提示文本
            return String.format(msgText.micoin.signError, msg)
        }
        return msgText.micoin.sign
    })
}

// 浏览帖子任务
function getPostFull(post) {
    const postid = post?.['postId']
    if (!postid) { return 0 }
    const option = {
        url: api.micoin.getPostFull,
        headers: getBBSHeaders(),
        body:"isOnlyPublisher=0&postId="+postid+"&showOrderType=2"
    }
    return $.http.post(option).then(res => {
        const { code } = JSON.parse(res.body)
        return code === 200 ? 1 : 0
    })
}

// 点赞任务
function postUpVotePost(post) {
    const postid = post?.['postId']
    const toUserId = post?.['userId']
    const gameId = post?.['gameId']
    const forumId = post?.['gameForumId']
    if (!postid) { return 0 }
    const option = {
        url: api.micoin.postUpVotePost,
        headers: getBBSHeaders(),
        body: "forumId="+forumId+"&gameId="+gameId+"&likeType=1&operateType=1&postCommentId=&postCommentReplyId=&postId="+postid+"&postType=1&toUserId="+toUserId
    }
    return $.http.post(option).then(res => {
        const { code } = JSON.parse(res.body)
        return code === 200 ? 1 : 0
    })
}

// 分享任务
function getShareConf(post) {
    const postid = post?.['postId']
    if (!postid) { 
        return 0
    }
    const option = {
        url: api.micoin.getShareConf,
        headers: getBBSHeaders(),
        body: "gameId=3"
    }
    return $.http.post(option).then(res => {
        const { code } = JSON.parse(res.body)
        return code
    })
}

//============== 辅助函数 ==========================

/** 调用系统通知 */
function notify(message, option) {
    $.msg(msgText.noti.title, '', message, option)
}

/** 随机睡眠 */
async function randomSleepAsync() {
    const s = random(2, 5)
    await sleep(s)
}

/** 休眠 n 秒 */
function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

/** 获取 [n, m] 区间的某个随机数 */
function random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

// 库洛币任务的 headers
function getBBSHeaders(json) {
    let bbsHeaders = Object.assign(JSON.parse(bbsHeadersString), getBaseHeaders())
    return bbsHeaders
}
//============= 类与原型上添加方法 ======================
/** 格式化字符串 */
String.format = function (string, ...args) {
    let formatted = string
    for (let i = 0; i < args.length; i++) {
        formatted = formatted.replace('{' + i + '}', args[i])
    }
    return formatted
}

//============== 第三方辅助函数 =========================
/**
 * Env 各家应用环境适配
 * @see https://github.com/chavyleung/scripts/blob/master/Env.min.js
 */
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
