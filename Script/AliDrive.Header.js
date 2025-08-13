const $ = new Env("阿里云盘Header获取");
const headers = $request && $request.headers;
const requestUrl = $request && $request.url;

// Header 获取和存储逻辑


console.log("✅ 检测到新的Header，开始存储...");

// 存储所有必要的 header 信息
$.setdata(headers["Cookie"], "aliyun_Cookie");
$.setdata(headers["x-sgext"], "aliyun_x-sgext");
$.setdata(headers["x-device-id"], "aliyun_x-device-id");
$.setdata(headers["x-signature"], "aliyun_x-signature");
$.setdata(headers["x-sign"], "aliyun_x-sign");
$.setdata(headers["x-mini-wua"], "aliyun_x-mini-wua");
$.setdata(headers["Authorization"], "aliyun_Authorization");
$.setdata(headers["x-umt"], "aliyun_x-umt");
$.setdata(headers["x-signature-v2"], "aliyun_x-signature-v2");
$.setdata(headers["x-nonce"], "aliyun_x-nonce");
$.setdata(headers["x-timestamp"], "aliyun_x-timestamp");

// 记录获取时间
$.setdata(new Date().toISOString(), "aliyun_header_time");

console.log("🎉 Header存储完成！");
console.log(`📝 存储的Header包括: Cookie, x-timestamp, x-signature, x-sign, x-mini-wua, x-umt, x-signature-v2, x-nonce, x-sgext`);

$.msg(
    "阿里云盘Header获取",
    "Header获取成功！",
    "签到相关Header获取成功！现在可以正常使用主脚本进行签到了！"
);
$done({});



// 环境适配函数
function Env(name) {
    // 判断当前环境
    const isLoon = typeof $loon !== "undefined";
    const isSurge = typeof $httpClient !== "undefined" && !isLoon;
    const isQX = typeof $task !== "undefined";

    // 定义 read 方法
    const read = (key) => {
        if (isLoon || isSurge) return $persistentStore.read(key);
        if (isQX) return $prefs.valueForKey(key);
    };

    // 定义 write 方法
    const write = (key, value) => {
        if (isLoon || isSurge) return $persistentStore.write(key, value);
        if (isQX) return $prefs.setValueForKey(key, value);
    };

    // 定义 getdata 方法
    const getdata = (key) => {
        return read(key);
    };

    // 定义 setdata 方法
    const setdata = (value, key) => {
        return write(value, key);
    };

    // 定义 notify 方法
    const msg = (title = name, subtitle = "", message = "", url = "") => {
        if (isLoon) $notification.post(title, subtitle, message, url);
        if (isSurge) $notification.post(title, subtitle, message, { url });
        if (isQX) $notify(title, subtitle, message, { "open-url": url });
    };

    // 返回包含所有方法的对象
    return {
        name,
        read,
        write,
        getdata,
        setdata,
        msg,
    };
}
