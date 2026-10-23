// Surge response script: conditional splash filter + diagnostic output.
// Experimental: real Qishui payload fields have not been confirmed.
(function () {
  const PREFIX = "[汽水开屏诊断] ";
  const scopes = /^https:\/\/(beta-luna\.douyin\.com|api\.qishui\.com)(\/luna\/(?:ads|media_ads)(?:\/[^?#]*)?)(?:\?|$)/;
  const markers = new Set(["splash", "splash_ad", "open_screen", "open_screen_ad"]);
  const splashFields = ["splash_ad", "splash_ads", "open_screen_ad", "open_screen_ads"];
  const object = v => v !== null && typeof v === "object" && !Array.isArray(v);
  const log = text => { try { console.log(PREFIX + text); } catch (_) {} };
  let result = {};
  try {
    const match = scopes.exec($request.url || "");
    if (!match) {
      log("脚本执行，但 URL 不在处理范围；原样放行");
    } else {
      log("触发：" + match[1] + match[2].replace(/\b[0-9a-f]{24,}\b/gi, "[ID]") + "；HTTP " + String($response.status || "未知"));
      if (typeof $response.body !== "string" || !$response.body) {
        log("没有可读取的文本正文；原样放行");
      } else {
        let body, parsed = false;
        try { body = JSON.parse($response.body); parsed = true; }
        catch (_) { log("正文不是有效 JSON；原样放行（未记录正文）"); }
        if (parsed) {
          let fields = 0, cards = 0, visited = 0;
          const isSplash = v => object(v) && [v.ad_type, v.ad_format, v.placement_type]
            .some(x => typeof x === "string" && markers.has(x.toLowerCase()));
          function walk(v, depth) {
            if (++visited > 20000 || depth > 100) throw new Error("limit");
            if (Array.isArray(v)) {
              const children = v.map(item => walk(item, depth + 1));
              return children.filter(item => {
                if (isSplash(item)) { cards++; return false; }
                return true;
              });
            }
            if (object(v)) {
              for (const key of Object.keys(v)) v[key] = walk(v[key], depth + 1);
              for (const key of splashFields) {
                if (Object.prototype.hasOwnProperty.call(v, key)) { delete v[key]; fields++; }
              }
            }
            return v;
          }
          const changed = walk(body, 0);
          if (fields || cards) {
            result = { body: JSON.stringify(changed) };
            log("已过滤明确开屏标识：字段 " + fields + " 个，卡片 " + cards + " 个；其他数据保留");
          } else {
            log("已触发，但未找到支持的开屏标识；无修改，原样放行");
          }
        }
      }
    }
  } catch (_) {
    result = {};
    log("处理异常或超过结构限制；原样放行（未记录异常正文）");
  }
  $done(result);
})();
