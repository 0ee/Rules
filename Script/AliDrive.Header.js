const $ = new Env("阿里云盘自动签到");
const headers = $request && $request.headers;
const requestUrl = $request && $request.url;

// 自动签到主逻辑
async function autoSignIn() {
    try {
        console.log("🚀 开始阿里云盘自动签到...");
        
        // 构建请求头 (参考 AliDrive.SignIn.js 中的 getSignHeaders 方法)
        const requestHeaders = {
            "Cookie": headers["cookie"] || "",
            "User-Agent": headers["user-agent"] || "",
            "x-timestamp": headers["x-timestamp"] || "",
            "Referer": "https://aliyundrive.com/",
            "X-Canary": "client=web,app=other,version=v0.1.0",
            "x-sgext": headers["x-sgext"] || "",
            "x-device-id": headers["x-device-id"] || "",
            "Connection": "keep-alive",
            "x-signature": headers["x-signature"] || "",
            "x-sign": headers["x-sign"] || "",
            "x-mini-wua": headers["x-mini-wua"] || "",
            "Authorization": headers["authorization"] || "",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "x-umt": headers["x-umt"] || "",
            "Accept": "*/*",
            "Content-Type": "application/json; charset=UTF-8",
            "x-signature-v2": headers["x-signature-v2"] || "",
            "Accept-Encoding": "gzip, deflate, br",
            "x-nonce": headers["x-nonce"] || ""
        };

        // 1. 查询签到列表
        console.log("📋 查询签到列表...");
        const signInListResponse = await $.http({
            url: "https://member.aliyundrive.com/v2/activity/sign_in_list?_rx-s=mobile",
            method: "POST",
            headers: requestHeaders,
            body: JSON.stringify({})
        });

        if (signInListResponse.status !== 200) {
            throw new Error(`查询签到列表失败: ${signInListResponse.status}`);
        }

        const signInData = JSON.parse(signInListResponse.body);
        console.log("📊 签到数据:", signInData);

        if (signInData.message) {
            throw new Error(`查询签到列表失败: ${signInData.message}`);
        }

        // 2. 分析签到情况，找出需要补签的天数
        const { result } = signInData;
        if (!result) {
            throw new Error("获取签到数据失败");
        }

        const { signInCount, signInInfos } = result;
        const currentDay = new Date().getDate();
        const unSignedDays = [];

        console.log(`📅 当前签到天数: ${signInCount}, 今天是第 ${currentDay} 天`);

        // 检查当月1号到今天哪些天的状态不是 "end" (已失效)，需要补签
        for (let day = 1; day <= currentDay; day++) {
            const dayInfo = signInInfos.find(info => Number(info.day) === day);
            if (dayInfo) {
                console.log(`第 ${day} 天状态: ${dayInfo.status}`);
                // 如果状态不是 "end"，说明该天还可以签到/领取奖励
                if (dayInfo.status !== 'finished') {
                    unSignedDays.push(day);
                    console.log(`📝 第 ${day} 天状态为 "${dayInfo.status}"，需要补签`);
                } else {
                    console.log(`✅ 第 ${day} 天状态为 "end"，已失效`);
                }
            } else {
                console.log(`❌ 第 ${day} 天未找到信息`);
            }
        }

        console.log(`📅 需要补签的日期: ${unSignedDays.join(', ') || '无'}`);

        // 3. 执行补签
        let signedCount = 0;
        for (const day of unSignedDays) {
            try {
                console.log(`📝 正在补签第 ${day} 天...`);
                
                const signInResponse = await $.http({
                    url: "https://member.aliyundrive.com/v1/activity/sign_in_reward?_rx-s=mobile",
                    method: "POST",
                    headers: requestHeaders,
                    body: JSON.stringify({ signInDay: day })
                });

                if (signInResponse.status === 200) {
                    const result = JSON.parse(signInResponse.body);
                    if (result.result) {
                        console.log(`✅ 第 ${day} 天补签成功: ${result.result.description || result.result.name}`);
                        signedCount++;
                    } else if (result.message) {
                        console.log(`❌ 第 ${day} 天补签失败: ${result.message}`);
                    }
                } else {
                    console.log(`❌ 第 ${day} 天补签失败: HTTP ${signInResponse.status}`);
                }

                // 添加延迟避免请求过快
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.log(`❌ 第 ${day} 天补签异常:`, error.message);
            }
        }

        // 4. 显示结果
        const message = unSignedDays.length === 0 
            ? "🎉 本月所有可补签日期都已处理完成！" 
            : `🎉 补签完成！成功补签 ${signedCount}/${unSignedDays.length} 天`;

        $.msg(
            "阿里云盘自动签到",
            "签到完成",
            message
        );

    } catch (error) {
        console.log("❌ 自动签到失败:", error.message);
        $.msg(
            "阿里云盘自动签到",
            "签到失败",
            `错误: ${error.message}`
        );
    }
}

// 启动自动签到
autoSignIn().finally(() => {
    $done({});
});

// Surge 环境适配函数
function Env(name) {
    // 定义 read 方法 (Surge)
    const read = (key) => {
        return $persistentStore.read(key);
    };

    // 定义 write 方法 (Surge)
    const write = (key, value) => {
        return $persistentStore.write(key, value);
    };

    // 定义 getdata 方法
    const getdata = (key) => {
        return read(key);
    };

    // 定义 setdata 方法
    const setdata = (value, key) => {
        return write(value, key);
    };

    // 定义 notify 方法 (Surge)
    const msg = (title = name, subtitle = "", message = "", url = "") => {
        $notification.post(title, subtitle, message, { url });
    };

    // Surge HTTP 请求方法
    const http = (options) => {
        return new Promise((resolve, reject) => {
            const method = options.method ? options.method.toLowerCase() : 'get';
            $httpClient[method](options, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        status: response.status || response.statusCode,
                        body: body,
                        headers: response.headers
                    });
                }
            });
        });
    };

    // 返回包含所有方法的对象
    return {
        name,
        read,
        write,
        getdata,
        setdata,
        msg,
        http,
    };
}
