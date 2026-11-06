// 支持 bbs.nga.cn 和 ngabbs.com。
// 更新后，请在同一域名重新操作签到、积分查询和抽奖以捕获请求。

const ACTIONS = {
    genshin_task_get: {
        key: 'nga_genshin_task_get_url',
        name: '任务'
    },
    genshin_get_score: {
        key: 'nga_genshin_score_url',
        name: '积分查询'
    },
    genshin_task_counter_add: {
        key: 'nga_genshin_sign_url',
        name: '签到'
    },
    genshin_luckydraw: {
        key: 'nga_genshin_luckydraw_url',
        name: '抽奖'
    }
};

function parseAddress(url) {
    const match = /^https:\/\/(bbs\.nga\.cn|ngabbs\.com)\/nuke\.php\?([^#]*)/i.exec(url);
    if (!match) throw new Error('不支持的 NGA 活动地址');

    const params = {};
    match[2].split('&').forEach(function (part) {
        const index = part.indexOf('=');
        const key = index < 0 ? part : part.slice(0, index);
        const value = index < 0 ? '' : part.slice(index + 1);
        params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
    });

    return {
        host: match[1].toLowerCase(),
        action: (params.__act || '').replace(/^\d{8}/, '')
    };
}

function readHeaders(key, host) {
    let headers = {};

    // 优先使用该接口对应的请求头。
    const own = $persistentStore.read(key + '_headers');
    if (own) {
        headers = JSON.parse(own);
    } else {
        // 兼容旧缓存，但不把其他域名的身份信息带过来。
        const legacy = $persistentStore.read('nga_genshin_headers');
        if (legacy) {
            const saved = JSON.parse(legacy);
            const hostKey = Object.keys(saved).find(function (name) {
                return name.toLowerCase() === 'host' ||
                    name.toLowerCase() === ':authority';
            });

            if (hostKey && String(saved[hostKey]).toLowerCase() === host) {
                headers = saved;
            } else {
                throw new Error('请在 ' + host + ' 重新捕获活动请求');
            }
        } else {
            throw new Error('请求头未缓存，请重新操作活动页面');
        }
    }

    const cleaned = {};
    Object.keys(headers).forEach(function (name) {
        const lower = name.toLowerCase();

        // 由 HTTP 客户端按实际地址生成 Host 和请求长度。
        if (name.startsWith(':') ||
            ['host', 'content-length', 'connection',
             'origin', 'referer', 'content-type'].includes(lower)) {
            return;
        }

        cleaned[name] = headers[name];
    });

    cleaned.Origin = 'https://' + host;
    cleaned.Referer = 'https://' + host + '/';
    cleaned['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    return cleaned;
}

function capture() {
    try {
        const address = parseAddress($request.url);
        const action = ACTIONS[address.action];

        // is_login 等请求不属于可缓存的执行接口。
        if (!action) return;

        const savedHeaders = $persistentStore.write(
            JSON.stringify($request.headers || {}),
            action.key + '_headers'
        );
        const savedUrl = $persistentStore.write($request.url, action.key);

        if (!savedHeaders || !savedUrl) {
            throw new Error('缓存写入失败');
        }

        $notification.post(
            'NGA原神信息已缓存',
            action.name + '请求已保存',
            '域名：' + address.host
        );
    } catch (error) {
        $notification.post('NGA捕获失败', '', String(error.message || error));
    } finally {
        $done({});
    }
}

function callApi(actionName) {
    return new Promise(function (resolve, reject) {
        const action = ACTIONS[actionName];
        const url = $persistentStore.read(action.key);

        if (!url) {
            reject(new Error(action.name + '地址未缓存，请先手动操作一次'));
            return;
        }

        let headers;
        try {
            const address = parseAddress(url);
            if (address.action !== actionName) {
                throw new Error(action.name + '缓存地址不正确，请重新捕获');
            }
            headers = readHeaders(action.key, address.host);
        } catch (error) {
            reject(error);
            return;
        }

        $httpClient.post({
            url: url,
            headers: headers,
            body: '__output=11',
            timeout: 10
        }, function (error, response, data) {
            if (error) {
                reject(new Error(action.name + '请求失败：' + String(error)));
                return;
            }

            const status = Number(response && (response.status || response.statusCode));
            if (status < 200 || status >= 300 || !status) {
                reject(new Error(action.name + '返回 HTTP ' + (status || '未知状态')));
                return;
            }

            try {
                const result = JSON.parse(data);
                if (!result || typeof result !== 'object') {
                    throw new Error('返回内容格式不正确');
                }

                if (Object.prototype.hasOwnProperty.call(result, 'error')) {
                    throw new Error(readable(result.error));
                }

                resolve(result);
            } catch (error) {
                reject(new Error(action.name + '失败：' + String(error.message || error)));
            }
        });
    });
}

function readable(value) {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(readable).join('；');
    if (value == null) return '接口未返回说明';
    return JSON.stringify(value);
}

function pause(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

async function run() {
    try {
        await callApi('genshin_task_counter_add');
        await pause(1000);

        const result = await callApi('genshin_get_score');
        const rawScore = result.data && result.data[0];

        if (rawScore == null || String(rawScore).trim() === '') {
            throw new Error('签到请求已完成，但积分返回内容为空');
        }

        const score = Number(rawScore);
        if (!Number.isFinite(score) || score < 0) {
            throw new Error('签到请求已完成，但无法识别当前积分');
        }

        if (score < 30) {
            $notification.post('NGA原神签到', '签到成功', '当前积分：' + score);
            return;
        }

        const draw = await callApi('genshin_luckydraw');
        const message = draw.msg != null ? draw.msg :
            draw.message != null ? draw.message : draw.data;

        $notification.post('NGA原神抽奖', '抽奖请求已完成', readable(message));
    } catch (error) {
        $notification.post(
            'NGA原神任务未完成',
            '已停止后续步骤',
            String(error.message || error)
        );
    } finally {
        $done({});
    }
}

if (typeof $request !== 'undefined') {
    capture();
} else {
    run();
}
