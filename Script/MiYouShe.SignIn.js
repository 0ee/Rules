// Modified from kayanouriko https://github.com/kayanouriko/quantumultx-mihoyobbs-auto-helper

/** env.js 全局 */
const $ = new Env('米游社小助手')

/** 通知相关 */

// 通知的 option
const msgOpt = {
    cookie: {},
    normal: {},
}
// 文本信息
const msgText = {
    noti: {
        title: '米游社小助手',
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

// 米游社的版块
const boards = {
    honkai3rd: {
        forumid: 1,
        key: 'honkai3rd',
        biz: 'bh3_cn',
        actid: 'e202207181446311',
        name: '崩坏3rd',
        url: "https://bbs.mihoyo.com/bh3/",
        getReferer() {
            return `https://webstatic.mihoyo.com/bbs/event/signin/bh3/index.html?bbs_auth_required=true&act_id=${this.actid}&bbs_presentation_style=fullscreen&utm_source=bbs&utm_medium=mys&utm_campaign=icon`
        }
    },
    genshin: {
        forumid: 26,
        key: 'genshin',
        biz: 'hk4e_cn',
        actid: 'e202311201442471',
        name: '原神',
        url: "https://bbs.mihoyo.com/ys/",
        getReferer() {
            return `https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=${this.actid}&utm_source=bbs&utm_medium=mys&utm_campaign=icon`
        }
    },
    honkai2: {
        forumid: 30,
        biz: 'bh2_cn',
        actid: 'e202203291431091',
        name: '崩坏学园2',
        url: "https://bbs.mihoyo.com/bh2/"
    },
    tears: {
        forumid: 37,
        biz: 'nxx_cn',
        name: '未定事件簿',
        url: "https://bbs.mihoyo.com/wd/"
    },
    house: {
        forumid: 34,
        name: '大别野',
        url: "https://bbs.mihoyo.com/dby/"
    },
    honkaisr: {
        forumid: 52,
        name: '崩坏: 星穹铁道',
        actid: 'e202304121516551',
        url: "https://bbs.mihoyo.com/sr/"
    },
    zzz: {
        forumid: 57,
        name: '绝区零',
        url: "https://bbs.mihoyo.com/zzz/"
    }
}
/** 请求 url 相关 */
const api = {
    // 获取用户信息(所有游戏通用, 通过不同的游戏 biz 获取绑定的账号信息)
    getUserInfo: 'https://api-takumi.miyoushe.com/binding/api/getUserGameRolesByStoken?game_biz={0}',
    // bbs 论坛
    micoin: {
        // 获取用户任务完成状态
        getUserMissionState: 'https://bbs-api.miyoushe.com/apihub/sapi/getUserMissionsState',
        // 获取对应版块的帖子列表
        // gids=8 绝区零
        getForumPostList: 'https://bbs-api.miyoushe.com/post/api/feeds/posts?algorithm_type=0&filter=&fresh_action=2&gids=6&is_first_initialize=false&last_id=',
        // 讨论区签到
        postSignIn: 'https://bbs-api.miyoushe.com/apihub/app/api/signIn',
        // 浏览帖子
        getPostFull: 'https://bbs-api.miyoushe.com/post/api/getPostFull?post_id={0}',
        // 点赞
        postUpVotePost: 'https://bbs-api.miyoushe.com/post/api/post/upvote',
        // 分享
        getShareConf: 'https://bbs-api.miyoushe.com/apihub/api/getShareConf?entity_id={0}&entity_type=1'
    },
    // 原神签到
    genshin: {
        // 签到状态
        getSignInfo: 'https://api-takumi.mihoyo.com/event/luna/info?lang=zh-cn&act_id={1}&region={0}&uid={2}',
        // 签到奖励
        getSignAwards: 'https://api-takumi.mihoyo.com/event/luna/home?lang=zh-cn&act_id={0}',
        // 签到操作
        postSign: 'https://api-takumi.mihoyo.com/event/luna/sign'
    },
    // 没绑定号,不测试了
    honkai3rd: {
        // 签到状态
        getSignInfo: 'https://api-takumi.mihoyo.com/event/luna/info?lang=zh-cn&region={0}&act_id={1}&uid={2}',
        // 奖励信息
        getSignAwards: 'https://api-takumi.mihoyo.com/event/luna/home?lang=zh-cn&act_id={0}',
        // 签到操作
        postSign: 'https://api-takumi.mihoyo.com/event/luna/sign'
    },
    getApi(type) {
        return this[type]
    }
}

/** headers */
// 米游币相关的 headers
const bbsHeadersString = $.getdata('kayanouriko_mihoyobbs_headers_bbs')
// 签到相关的 headers
const signHeadersString = $.getdata('kayanouriko_mihoyobbs_headers_sign')

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
    tasks: [1, 2],
    micoin: {
        sections: [34],
        actions: [58, 59, 60, 61]
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
                case 2:
                    await checkSignHeaders()
                    const genshinResult = await genshinSignTask()
                    results += genshinResult
                    break
                case 3:
                    await checkSignHeaders()
                    const honkai3rdResult = await honkai3rdSignTask()
                    results += honkai3rdResult
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
function checkSignHeaders() {
    console.log(signHeadersString)
    if (!signHeadersString) {
        return Promise.reject(msgText.cookie.empty)
    }
}

function checkBBSHeaders() {
    console.log(checkBBSHeaders)
    if (!bbsHeadersString) {
        return Promise.reject(msgText.cookie.empty)
    }
}

//==== 米游币任务 ====
// 这里少请求一个米游社用户信息的接口, 获取不到 cookie 的 nickname, 最后脚本提醒时无法显示用户名字
// 不过无关紧要, 尽量减少请求接口的数量, 这个 todo 消除
async function micoinTask() {
    try {
        // 获取执行任务的 board
        const forumid = config.micoin.sections?.[0] ?? 10000
        console.log(forumid)
        const board = findBoardByID(forumid)
        console.log(board)
        if (board === undefined) {
            return Promise.resolve(String.format(msgText.micoin.error, msgText.micoin.forumid))
        }
        // 获取任务列表
        const tasks = await getUserMissionState()
        console.log('task detail')
        console.log(tasks)
        // 在执行任务之前, 先获取帖子列表
        const lists = await getForumPostList(forumid)
        
        await randomSleepAsync()

        let results = String.format(msgText.micoin.list, board.name)
        // 开始循环执行任务
        for (const task of tasks) {
            // 如果配置内不包含该任务, 则跳过执行
            if (config.micoin.actions.indexOf(task.id) === -1) { continue }
            // 任务已经完成的也跳过
            if (task.isGetAward) { continue }
            // 否则执行任务
            switch (task.id) {
                case 58:
                    //讨论区签到
                    const signResult = await postSignIn(forumid)
                    results += signResult
                    await randomSleepAsync()
                    break
                case 59:
                    // 看帖子
                    let postCount = task.times
                    for (let i = task.times; i < 3; i++) {
                        postCount += await getPostFull(lists?.[i])
                        await randomSleepAsync()
                    }
                    results += postCount === 3 ? msgText.micoin.post : String.format(msgText.micoin.postFail, postCount)
                    break
                case 60:
                    // 帖子点赞
                    let voteCount = task.times
                    for (let i = task.times; i < 5; i++) {
                        voteCount += await postUpVotePost(lists?.[i])
                        await randomSleepAsync()
                    }
                    results += voteCount === 5 ? msgText.micoin.vote : String.format(msgText.micoin.voteFail, voteCount)
                    break
                case 61:
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
        const tasks2 = await getUserMissionState()
        console.log('task detail')
        console.log(tasks2)
        if (results === String.format(msgText.micoin.list, board.name)) {
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
        headers: getBBSHeaders()
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode === -100) {
            // cookie 失效, 需特别处理
            return Promise.reject(msgText.micoin.cookie)
        } else if (retcode === 0) {
            // 今日还能获取的任务米游币
            const getCoinsCount = data?.['can_get_points'] ?? 0
            if (getCoinsCount === 0) {
                // 已经无法通过任务获取米游币
                return Promise.reject(msgText.micoin.finished)
            }
            const states = data?.states ?? []
            let halfTasks = []
            for (const state of states) {
                const id = state?.['mission_id'] ?? 10000
                const times = state?.['happened_times'] ?? 0
                const isGetAward = state?.['is_get_award'] ?? true
                // 小于 62 的均为米游币任务
                if (id < 62) {
                    halfTasks.push({
                        id,
                        times,
                        isGetAward
                    })
                }
            }
            // 创建 task 数组
            const tasks = [58, 59, 60, 61].map(id => {
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
        headers: getBBSHeaders()
    }
    return $.http.get(option).then(res => {
        console.log('post list')
        console.log(res.body)
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) { 
            return Promise.reject(String.format(msgText.micoin.listError, message))
        }
        const lists = data?.list ?? []
        if (lists.length === 0) {
            return Promise.reject(msgText.micoin.listEmpty)
        }
        return lists
    })
}

// 讨论区签到
function postSignIn(forumid) {
    const json = {
        'gids': forumid
    }
    const option = {
        url: api.micoin.postSignIn,
        headers: getBBSHeaders(JSON.stringify(json)),
        body: JSON.stringify(json)
    }
    return $.http.post(option).then(res => {
        console.log('postsign')
        console.log(res.body)
        const { retcode, message } = JSON.parse(res.body)
        if (retcode !== 0) {
            if(retcode == 1034){
                return String.format(msgText.micoin.signError, '触发了风控验证码')    
            }
            // 签到操作未完成, 但是下面的任务还需要继续, 所以返回提示文本
            return String.format(msgText.micoin.signError, message)
        }
        return msgText.micoin.sign
    })
}

// 浏览帖子任务
function getPostFull(post) {
    const postid = post?.post?.['post_id']
    if (!postid) { return 0 }
    const option = {
        url: String.format(api.micoin.getPostFull, postid),
        headers: getBBSHeaders()
    }
    return $.http.get(option).then(res => {
        console.log('post full')
        console.log(res.body)
        const { retcode } = JSON.parse(res.body)
        return retcode === 0 ? 1 : 0
    })
}

// 点赞任务
function postUpVotePost(post) {
    const postid = post?.post?.['post_id']
    if (!postid) { return 0 }
    const json = {
        'post_id': postid,
        'is_cancel': false,
        'upvote_type':1,
    }
    const option = {
        url: api.micoin.postUpVotePost,
        headers: getBBSHeaders(),
        body: JSON.stringify(json)
    }
    return $.http.post(option).then(res => {
        console.log('vote')
        console.log(res.body)
        const { retcode } = JSON.parse(res.body)
        return retcode === 0 ? 1 : 0
    })
}

// 分享任务
function getShareConf(post) {
    const postid = post?.post?.['post_id']
    if (!postid) { 
        return 0
    }
    const option = {
        url: String.format(api.micoin.getShareConf, postid),
        headers: getBBSHeaders()
    }
    return $.http.get(option).then(res => {
        console.log('share')
        console.log(res.body)
        const { retcode } = JSON.parse(res.body)
        return retcode
    })
}


//==== 原神签到 ====

// 主入口
async function genshinSignTask() {
    try {
        // 获取 cookie 所属的账号信息
        const { game_uid, region, nickname } = await getUserInfo(boards.genshin)
        // 获取账号签到信息 (签到次数)
        const total = await getGenshinSignInfo(game_uid, region, nickname)
        // 获取奖励列表信息
        const { name, count } = await getGenshinSignAwards(total)
        // 签到操作
        await postSign(boards.genshin, game_uid, region)
        return Promise.resolve(String.format(msgText.genshin.success, nickname, name, count))
    } catch (error) {
        return Promise.resolve(String.format(msgText.genshin.error, error.message || (error instanceof Object ? JSON.stringify(error) : error)))
    }
}

// 获取账号签到信息
function getGenshinSignInfo(game_uid, region, nickname) {
    const option = {
        url: String.format(api.genshin.getSignInfo, region, boards.genshin.actid, game_uid),
        headers: getHeaders(boards.genshin)
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.sign, message))
        }
        const total_sign_day = data?.['total_sign_day']
        const is_sign = data?.['is_sign']
        if (total_sign_day !== undefined && is_sign !== undefined) {
            // 已签到
            if (is_sign) {
                return Promise.reject(String.format(msgText.genshin.signed, nickname))
            }
            // 返回总签到次数
            return total_sign_day
        } else {
            return Promise.reject(msgText.common.today)
        }
    })
}

// 获取签到奖励信息
function getGenshinSignAwards(total) {
    const option = {
        url: String.format(api.genshin.getSignAwards, boards.genshin.actid),
        headers: getHeaders(boards.genshin)
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.awards, message))
        }
        const name = data?.awards?.[total]?.name
        const cnt = data?.awards?.[total]?.cnt
        if (name && cnt) {
            return {
                name,
                count: cnt
            }
        } else {
            return Promise.reject(msgText.common.award)
        }
    })
}

//==== 崩坏 3rd 签到 ====

// 主入口
async function honkai3rdSignTask() {
    try {
        // 获取账号信息
        const { game_uid, region, nickname } = await getUserInfo(boards.honkai3rd)
        // 获取签到信息
        const total = await getHonkai3rdSignInfo(game_uid, region, nickname)
        // 获取奖励信息
        const { name, count } = await getHonkai3rdSignAwards(total)
        // 签到操作
        await postSign(boards.honkai3rd, game_uid, region)
        return Promise.resolve(String.format(msgText.honkai3rd.success, nickname, name, count))
    } catch (error) {
        return Promise.resolve(String.format(msgText.honkai3rd.error, error.message || (error instanceof Object ? JSON.stringify(error) : error)))
    }
}

// 获取签到状态
function getHonkai3rdSignInfo(game_uid, region, nickname) {
    const option = {
        url: String.format(api.honkai3rd.getSignInfo, region, boards.honkai3rd.actid, game_uid),
        headers: getHeaders(boards.honkai3rd)
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.sign, message))
        }
        const isSign = data?.['is_sign'] ?? false
        if (isSign) {
            // 已经签到完成
            return Promise.reject(String.format(msgText.honkai3rd.signed, nickname))
        }
        const total = data?.['total_sign_day']
        if (total !== undefined) {
            return total
        } else {
            return Promise.reject(msgText.common.today)
        }
    })
}

// 获取奖励信息
function getHonkai3rdSignAwards(total) {
    const option = {
        url: String.format(api.honkai3rd.getSignAwards, boards.honkai3rd.actid),
        headers: getHeaders(boards.honkai3rd)
    }
    return $.http.get(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.awards, message))
        }
        const name = data?.awards?.[total]?.name
        const cnt = data?.awards?.[total]?.cnt
        if (name && cnt) {
            return {
                name,
                count: cnt
            }
        } else {
            return Promise.reject(msgText.common.award)
        }
    })
}

//==== 签到任务 ====
// @todo 签到任务大概率是接口通用的, 只是部分参数不一样, 可以构造通用方法, 方便后续整合崩2, 事件簿, 铁道等

// 获取账号信息 通用
function getUserInfo(board) {
    const option = {
        url: String.format(api.getUserInfo, board.biz),
        headers: getMiYouSheHeaders(board)
    }
    return $.http.get(option).then(res => {
        console.log(res.body)
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.user, message))
        }
        const game_uid = data?.list?.[0]?.game_uid
        const region = data?.list?.[0]?.region
        const nickname = data?.list?.[0]?.nickname
        // 取出必要数据
        if (game_uid && region && nickname) {
            return {
                game_uid,
                region,
                nickname
            }
        } else {
            // 无法获取到正确的 uid, region, nickname
            return Promise.reject(msgText.common.uid)
        }
    })
}
// 游戏签到操作 逻辑通用, 根据传入的 board 构建不同的参数
function postSign(board, game_uid, region) {
    const body = {
        act_id: board.actid,
        region,
        uid: game_uid
    }
    const option = {
        url: api.getApi(board.key).postSign,
        headers: getHeaders(board),
        body: JSON.stringify(body)
    }
    return $.http.post(option).then(res => {
        const { retcode, message, data } = JSON.parse(res.body)
        if (retcode !== 0) {
            return Promise.reject(String.format(msgText.common.error, message))
        }
        if (board.forumid === 26) {
            // 原神游戏签到需要进一步的判断是否触发风险验证码
            const riskCode = data?.['risk_code'] ?? 0
            if (riskCode !== 0) {
                return Promise.reject(msgText.genshin.riskCode)
            }
        }
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

// 通过 id 获取对应的 board
function findBoardByID(forumid) {
    for (const key in boards) {
        if (Object.prototype.hasOwnProperty.call(boards, key)) {
            const board = boards[key]
            if (board.forumid === forumid) {
                return board
            }
        }
    }
}

/** 米游社 api headers */
// https://github.com/Womsxd/MihoyoBBSTools/blob/master/setting.py#L103
// 随版本更新
// 通用参数
const headers = {
    // 论坛米游币相关参数
    clientType: '2',// 1为ios 2为安卓
    salt: 'yajbb9O8TgQYOW7JVZYfUJhXN7mAeZPE',// mihoyobbs_salt
    saltV2: 't0qEgfub6cvueAPgR5m9aQWWVciEer7v',// mihoyobbs_salt_x6
    // 游戏签到相关, 内嵌 webview, 所以用的是 web 相关参数
    clientTypeWeb: '5',// 4为pc web 5为mobile web
    saltWeb: 'LyD1rXqMv2GJhnwdvCBjFOKGiKuLY3aO',// mihoyobbs_salt_web
    // 通用参数
    appVersion: '2.67.1'
}

function getBaseHeaders() {
    return {
        // DS可能和版本有关，不替换
        'x-rpc-app_version': headers.appVersion
    }
}

// 游戏签到的 headers, 用的是 webview , 所以用的是 web 相关的参数
function getHeaders(board) {
    let signHeaders = Object.assign(JSON.parse(signHeadersString), getBaseHeaders())
    signHeaders['Referer'] = board.getReferer()
    signHeaders['DS'] = getDS(headers.saltWeb)
    signHeaders['x-rpc-client_type'] = headers.clientTypeWeb
    return signHeaders
}

// 米游币任务的 headers
function getBBSHeaders(json) {
    let bbsHeaders = Object.assign(JSON.parse(bbsHeadersString), getBaseHeaders())
    bbsHeaders['DS'] = json ? getDSV2(headers.saltV2, '', json) : getDS(headers.salt)
    bbsHeaders['x-rpc-client_type'] = headers.clientType
    bbsHeaders['Host'] = 'bbs-api.miyoushe.com'
    return bbsHeaders
}

// 获取用户信息的域名是 api-takumi.miyoushe.com
function getMiYouSheHeaders(board)
{
    // 得用米游币的
    let miYouSheHeaders = Object.assign(JSON.parse(bbsHeadersString), getBaseHeaders())
    miYouSheHeaders['x-rpc-csm_source'] = 'home'
    miYouSheHeaders['Host'] = 'api-takumi.miyoushe.com'
    miYouSheHeaders['Referer'] = 'https://app.mihoyo.com'
    miYouSheHeaders['DS'] = getDS(headers.saltWeb)
    miYouSheHeaders['x-rpc-client_type'] = headers.clientTypeWeb
    return miYouSheHeaders
}

/** ds 获取 */
// 备注1: x-rpc-client_type 参数: 游戏签到是内嵌 webview 所以用 5 为 web mobile, 米游币为 api 请求 所以用 2 为 安卓
// 备注2: salt 与 x-rpc-app_version 和 x-rpc-client_type 都是联动的
function getDS(n) {
    const i = Math.floor(new Date().getTime() / 1000) + ''
    const r = getRandomString(6)
    const c = md5(`salt=${n}&t=${i}&r=${r}`)
    return `${i},${r},${c}`
}

// ds 的 v2 版本, 目前只有米游币任务签到接口用
// n: salt
// q: 目前暂时不清楚作用, 传空字符串
// b: body 的 json 字符串
function getDSV2(n, q, b) {
    const i = Math.floor(new Date().getTime() / 1000) + ''
    const r = `${getRandomInt(100001, 200000)}`
    const c = md5(`salt=${n}&t=${i}&r=${r}&b=${b}&q=${q}`)
    return `${i},${r},${c}`
}

/** 随机字符串获取 */
function getRandomString(count) {
    const d = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    const t = d.length
    let n = ''
    for (var i = 0; i < count; i++) n += d.charAt(Math.floor(Math.random() * t))
    return n
}

/** 生成 [n, m] 的随机整数 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
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
 * 从 NobyDa 脚本里面获取到的原生 md5 函数
 * @see https://github.com/blueimp/JavaScript-MD5
 */
function md5(string){function RotateLeft(lValue,iShiftBits){return(lValue<<iShiftBits)|(lValue>>>(32-iShiftBits))}function AddUnsigned(lX,lY){var lX4,lY4,lX8,lY8,lResult;lX8=(lX&0x80000000);lY8=(lY&0x80000000);lX4=(lX&0x40000000);lY4=(lY&0x40000000);lResult=(lX&0x3FFFFFFF)+(lY&0x3FFFFFFF);if(lX4&lY4){return(lResult^0x80000000^lX8^lY8)}if(lX4|lY4){if(lResult&0x40000000){return(lResult^0xC0000000^lX8^lY8)}else{return(lResult^0x40000000^lX8^lY8)}}else{return(lResult^lX8^lY8)}}function F(x,y,z){return(x&y)|((~x)&z)}function G(x,y,z){return(x&z)|(y&(~z))}function H(x,y,z){return(x^y^z)}function I(x,y,z){return(y^(x|(~z)))}function FF(a,b,c,d,x,s,ac){a=AddUnsigned(a,AddUnsigned(AddUnsigned(F(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)};function GG(a,b,c,d,x,s,ac){a=AddUnsigned(a,AddUnsigned(AddUnsigned(G(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)};function HH(a,b,c,d,x,s,ac){a=AddUnsigned(a,AddUnsigned(AddUnsigned(H(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)};function II(a,b,c,d,x,s,ac){a=AddUnsigned(a,AddUnsigned(AddUnsigned(I(b,c,d),x),ac));return AddUnsigned(RotateLeft(a,s),b)};function ConvertToWordArray(string){var lWordCount;var lMessageLength=string.length;var lNumberOfWords_temp1=lMessageLength+8;var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1%64))/64;var lNumberOfWords=(lNumberOfWords_temp2+1)*16;var lWordArray=Array(lNumberOfWords-1);var lBytePosition=0;var lByteCount=0;while(lByteCount<lMessageLength){lWordCount=(lByteCount-(lByteCount%4))/4;lBytePosition=(lByteCount%4)*8;lWordArray[lWordCount]=(lWordArray[lWordCount]|(string.charCodeAt(lByteCount)<<lBytePosition));lByteCount++}lWordCount=(lByteCount-(lByteCount%4))/4;lBytePosition=(lByteCount%4)*8;lWordArray[lWordCount]=lWordArray[lWordCount]|(0x80<<lBytePosition);lWordArray[lNumberOfWords-2]=lMessageLength<<3;lWordArray[lNumberOfWords-1]=lMessageLength>>>29;return lWordArray};function WordToHex(lValue){var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;for(lCount=0;lCount<=3;lCount++){lByte=(lValue>>>(lCount*8))&255;WordToHexValue_temp="0"+lByte.toString(16);WordToHexValue=WordToHexValue+WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2)}return WordToHexValue};function Utf8Encode(string){string=string.replace(/\r\n/g,"\n");var utftext="";for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){utftext+=String.fromCharCode(c)}else if((c>127)&&(c<2048)){utftext+=String.fromCharCode((c>>6)|192);utftext+=String.fromCharCode((c&63)|128)}else{utftext+=String.fromCharCode((c>>12)|224);utftext+=String.fromCharCode(((c>>6)&63)|128);utftext+=String.fromCharCode((c&63)|128)}}return utftext};var x=Array();var k,AA,BB,CC,DD,a,b,c,d;var S11=7,S12=12,S13=17,S14=22;var S21=5,S22=9,S23=14,S24=20;var S31=4,S32=11,S33=16,S34=23;var S41=6,S42=10,S43=15,S44=21;string=Utf8Encode(string);x=ConvertToWordArray(string);a=0x67452301;b=0xEFCDAB89;c=0x98BADCFE;d=0x10325476;for(k=0;k<x.length;k+=16){AA=a;BB=b;CC=c;DD=d;a=FF(a,b,c,d,x[k+0],S11,0xD76AA478);d=FF(d,a,b,c,x[k+1],S12,0xE8C7B756);c=FF(c,d,a,b,x[k+2],S13,0x242070DB);b=FF(b,c,d,a,x[k+3],S14,0xC1BDCEEE);a=FF(a,b,c,d,x[k+4],S11,0xF57C0FAF);d=FF(d,a,b,c,x[k+5],S12,0x4787C62A);c=FF(c,d,a,b,x[k+6],S13,0xA8304613);b=FF(b,c,d,a,x[k+7],S14,0xFD469501);a=FF(a,b,c,d,x[k+8],S11,0x698098D8);d=FF(d,a,b,c,x[k+9],S12,0x8B44F7AF);c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);a=FF(a,b,c,d,x[k+12],S11,0x6B901122);d=FF(d,a,b,c,x[k+13],S12,0xFD987193);c=FF(c,d,a,b,x[k+14],S13,0xA679438E);b=FF(b,c,d,a,x[k+15],S14,0x49B40821);a=GG(a,b,c,d,x[k+1],S21,0xF61E2562);d=GG(d,a,b,c,x[k+6],S22,0xC040B340);c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);b=GG(b,c,d,a,x[k+0],S24,0xE9B6C7AA);a=GG(a,b,c,d,x[k+5],S21,0xD62F105D);d=GG(d,a,b,c,x[k+10],S22,0x2441453);c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);b=GG(b,c,d,a,x[k+4],S24,0xE7D3FBC8);a=GG(a,b,c,d,x[k+9],S21,0x21E1CDE6);d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);c=GG(c,d,a,b,x[k+3],S23,0xF4D50D87);b=GG(b,c,d,a,x[k+8],S24,0x455A14ED);a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);d=GG(d,a,b,c,x[k+2],S22,0xFCEFA3F8);c=GG(c,d,a,b,x[k+7],S23,0x676F02D9);b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);a=HH(a,b,c,d,x[k+5],S31,0xFFFA3942);d=HH(d,a,b,c,x[k+8],S32,0x8771F681);c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);a=HH(a,b,c,d,x[k+1],S31,0xA4BEEA44);d=HH(d,a,b,c,x[k+4],S32,0x4BDECFA9);c=HH(c,d,a,b,x[k+7],S33,0xF6BB4B60);b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);d=HH(d,a,b,c,x[k+0],S32,0xEAA127FA);c=HH(c,d,a,b,x[k+3],S33,0xD4EF3085);b=HH(b,c,d,a,x[k+6],S34,0x4881D05);a=HH(a,b,c,d,x[k+9],S31,0xD9D4D039);d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);b=HH(b,c,d,a,x[k+2],S34,0xC4AC5665);a=II(a,b,c,d,x[k+0],S41,0xF4292244);d=II(d,a,b,c,x[k+7],S42,0x432AFF97);c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);b=II(b,c,d,a,x[k+5],S44,0xFC93A039);a=II(a,b,c,d,x[k+12],S41,0x655B59C3);d=II(d,a,b,c,x[k+3],S42,0x8F0CCC92);c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);b=II(b,c,d,a,x[k+1],S44,0x85845DD1);a=II(a,b,c,d,x[k+8],S41,0x6FA87E4F);d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);c=II(c,d,a,b,x[k+6],S43,0xA3014314);b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);a=II(a,b,c,d,x[k+4],S41,0xF7537E82);d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);c=II(c,d,a,b,x[k+2],S43,0x2AD7D2BB);b=II(b,c,d,a,x[k+9],S44,0xEB86D391);a=AddUnsigned(a,AA);b=AddUnsigned(b,BB);c=AddUnsigned(c,CC);d=AddUnsigned(d,DD)}var temp=WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);return temp.toLowerCase()}

/**
 * Env 各家应用环境适配
 * @see https://github.com/chavyleung/scripts/blob/master/Env.min.js
 */
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}