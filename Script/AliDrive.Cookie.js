/**************************************
脚本名称：阿里云盘 Header 获取脚本 (Surge版)
脚本作者：基于 XiaoMaoALiSignReward.js 改进
更新日期：2024-12-XX

功能说明：
- 专门用于获取阿里云盘签到奖励所需的完整 Header 信息
- 使用 Surge 的 $persistentStore 存储数据
- 与主脚本分离，职责单一，更稳定

Surge配置：
[Script]
阿里云盘Header获取 = type=http-request,pattern=^https:\/\/member\.aliyundrive\.com\/v1\/activity\/sign_in_reward,script-path=AliDrive.Cookie.js

[MITM]
hostname = member.aliyundrive.com
******************************************/

console.log("🔍 阿里云盘Header获取脚本启动");

if (typeof $request != "undefined" && $request.method == 'POST') {
    const headers = $request.headers;
    const requestUrl = $request.url;

    console.log("检测到签到奖励请求，开始获取Header...");

    // 检查是否为重复的 header
    if ($persistentStore.read("aliyun_x-timestamp") == headers["x-timestamp"]) {
        console.log("⚠️ Header未变化，跳过重复获取");
        $done({});
    } else {
        console.log("✅ 检测到新的Header，开始存储...");

        // 存储所有必要的 header 信息
        $persistentStore.write(headers["Cookie"], "aliyun_Cookie");
        $persistentStore.write(headers["x-sgext"], "aliyun_x-sgext");
        $persistentStore.write(headers["x-device-id"], "aliyun_x-device-id");
        $persistentStore.write(headers["x-signature"], "aliyun_x-signature");
        $persistentStore.write(headers["x-sign"], "aliyun_x-sign");
        $persistentStore.write(headers["x-mini-wua"], "aliyun_x-mini-wua");
        $persistentStore.write(headers["Authorization"], "aliyun_Authorization");
        $persistentStore.write(headers["x-umt"], "aliyun_x-umt");
        $persistentStore.write(headers["x-signature-v2"], "aliyun_x-signature-v2");
        $persistentStore.write(headers["x-nonce"], "aliyun_x-nonce");
        $persistentStore.write(headers["x-timestamp"], "aliyun_x-timestamp");

        // 记录获取时间
        $persistentStore.write(new Date().toISOString(), "aliyun_header_time");

        console.log("🎉 Header存储完成！");
        console.log(`📝 存储的Header包括: Cookie, x-timestamp, x-signature, x-sign, x-mini-wua, x-umt, x-signature-v2, x-nonce, x-sgext`);

        $notification.post(
            "阿里云盘Header获取",
            "Header获取成功！",
            "签到相关Header获取成功！现在可以正常使用主脚本进行签到了！"
        );
        $done({});
    }
} else {
    console.log("❌ 未检测到目标请求，请确保在阿里云盘中进行签到奖励操作");
    $done({});
}