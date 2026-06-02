console.log(typeof $request != "undefined")

if (typeof $request != "undefined") {
    if ($request.url.includes('genshin_task_get')) {
        $persistentStore.write($request.url, 'nga_genshin_task_get_url')
        $persistentStore.write(JSON.stringify($request.headers), 'nga_genshin_headers')
        console.log('缓存task_get URL: ' + $request.url)
    } else if ($request.url.includes('genshin_get_score')) {
        $persistentStore.write($request.url, 'nga_genshin_score_url')
        $persistentStore.write(JSON.stringify($request.headers), 'nga_genshin_headers')
        console.log('缓存get_score URL: ' + $request.url)
    } else if ($request.url.includes('genshin_task_counter_add')) {
        $persistentStore.write($request.url, 'nga_genshin_sign_url')
        $persistentStore.write(JSON.stringify($request.headers), 'nga_genshin_headers')
        console.log('缓存task_counter_add URL: ' + $request.url)
    } else if ($request.url.includes('genshin_luckydraw')) {
        $persistentStore.write($request.url, 'nga_genshin_luckydraw_url')
        $persistentStore.write(JSON.stringify($request.headers), 'nga_genshin_headers')
        console.log('缓存luckydraw URL: ' + $request.url)
    }

    $notification.post('NGA原神信息已缓存', '已保存最新的URL和headers', '')
    $done({})
} else {
    console.log('开始执行NGA原神自动签到')
    signTask()
}

function signTask() {
    let signUrl = $persistentStore.read('nga_genshin_sign_url')

    if (!signUrl) {
        console.log('签到URL未缓存，请先手动访问一次')
        $notification.post('NGA签到失败', '未找到缓存的URL', '请手动访问原神签到活动')
        $done({})
        return
    }

    $httpClient.post({
        url: signUrl,
        headers: getHeaders(),
        body: '__output=11',
        timeout: 5
    }, function (error, response, data) {
        if (error) {
            console.log('签到请求失败: ' + error)
            $notification.post('NGA签到失败', '签到请求出错', String(error))
            $done({})
            return
        }

        let decodedData = decodeUnicode(data)
        console.log('签到响应: ' + decodedData)

        setTimeout(() => {
            getScore()
        }, 1000)
    })
}

function getScore() {
    let scoreUrl = $persistentStore.read('nga_genshin_score_url')

    if (!scoreUrl) {
        console.log('积分查询URL未缓存')
        $notification.post('NGA签到完成', '但积分查询失败', '积分查询URL未缓存')
        $done({})
        return
    }

    $httpClient.post({
        url: scoreUrl,
        headers: getHeaders(),
        body: '__output=11',
        timeout: 5
    }, function (error, response, data) {
        if (error) {
            console.log('获取积分失败: ' + error)
            $notification.post('NGA签到完成', '但获取积分失败', String(error))
            $done({})
            return
        }

        let decodedData = decodeUnicode(data)
        console.log('积分响应: ' + decodedData)

        try {
            let result = JSON.parse(data)
            let score = Number(result.data[0])

            console.log('当前积分: ' + score)

            if (score >= 30) {
                console.log('积分充足，执行抽奖')
                luckydraw()
            } else {
                console.log('积分不足，需要 ' + (30 - score) + ' 积分')
                $notification.post('NGA原神签到', '签到成功', '当前积分: ' + score)
                $done({})
            }
        } catch (e) {
            console.log('解析积分失败: ' + e)
            $notification.post('NGA签到完成', '但解析积分失败', String(e))
            $done({})
        }
    })
}

function luckydraw() {
    let luckyUrl = $persistentStore.read('nga_genshin_luckydraw_url')

    if (!luckyUrl) {
        console.log('抽奖URL未缓存')
        $notification.post('NGA原神签到', '积分充足，但抽奖失败', '抽奖URL未缓存')
        $done({})
        return
    }

    $httpClient.post({
        url: luckyUrl,
        headers: getHeaders(),
        body: '__output=11',
        timeout: 5
    }, function (error, response, data) {
        if (error) {
            console.log('抽奖失败: ' + error)
            $notification.post('NGA抽奖失败', '抽奖请求出错', String(error))
            $done({})
            return
        }

        let decodedData = decodeUnicode(data)
        console.log('抽奖响应: ' + decodedData)

        let notifyText = getReadableMsg(decodedData)

        $notification.post('NGA原神抽奖', '抽奖完成', notifyText)
        $done({})
    })
}

function getHeaders() {
    let headerStr = $persistentStore.read('nga_genshin_headers')

    if (!headerStr) {
        return {
            'Host': 'bbs.nga.cn',
            'Accept': '*/*',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://bbs.nga.cn'
        }
    }

    try {
        return JSON.parse(headerStr)
    } catch (e) {
        console.log('headers解析失败，使用默认headers: ' + e)
        return {
            'Host': 'bbs.nga.cn',
            'Accept': '*/*',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://bbs.nga.cn'
        }
    }
}

function decodeUnicode(str) {
    if (typeof str !== 'string') return str

    return str.replace(/\\u([\dA-Fa-f]{4})/g, function (_, code) {
        return String.fromCharCode(parseInt(code, 16))
    })
}

function getReadableMsg(data) {
    try {
        let obj = JSON.parse(data)

        if (obj.msg) return obj.msg
        if (obj.message) return obj.message
        if (obj.error) return obj.error
        if (obj.data) return typeof obj.data === 'string' ? obj.data : JSON.stringify(obj.data)

        return JSON.stringify(obj)
    } catch (e) {
        return data
    }
}