// 汽水音乐接口诊断：只记录，所有响应原样放行。
(function () {
  const PREFIX = "[汽水接口诊断] ";
  const log = message => console.log(PREFIX + message);

  // 仅显示字段名、类型和数组长度，不输出字段值。
  function shape(value, depth) {
    if (value === null) return "null";

    if (Array.isArray(value)) {
      return {
        type: "array",
        length: value.length,
        sample: depth > 0 && value.length
          ? shape(value[0], depth - 1)
          : undefined
      };
    }

    if (typeof value === "object") {
      const keys = Object.keys(value);

      if (depth <= 0) return "object";

      const fields = {};
      keys.slice(0, 20).forEach(key => {
        // 跳过可能包含动态 ID 的键。
        if (/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(key)) {
          fields[key] = shape(value[key], depth - 1);
        }
      });

      return {
        type: "object",
        fields: fields,
        omitted: Math.max(0, keys.length - 20)
      };
    }

    return typeof value;
  }

  try {
    const match = /^https:\/\/(api(?:3|5)-lf\.qishui\.com)(\/[^?#]*)/i
      .exec($request.url || "");

    if (!match) return;

    // 去掉查询参数，并隐藏路径中常见的数字 ID、长标识。
    const path = match[2]
      .split("/")
      .map(part => (
        /^\d+$/.test(part) ||
        /^[a-f0-9-]{24,}$/i.test(part) ||
        part.length > 64
      ) ? ":id" : part)
      .join("/")
      .slice(0, 300);

    log(
      ($request.method || "UNKNOWN") + " " +
      match[1] + path +
      " | HTTP " + $response.status
    );

    const body = $response.body;
    if (typeof body !== "string" || !body.length) {
      log("无文本响应体，原样放行");
      return;
    }

    log("响应字符数：" + body.length);

    let data;
    try {
      data = JSON.parse(body);
    } catch (_) {
      log("非 JSON 响应，不输出正文，原样放行");
      return;
    }

    const summary = JSON.stringify(shape(data, 4));
    log("JSON结构：" + summary.slice(0, 6000));
    log("仅记录，未修改响应");
  } catch (_) {
    log("诊断异常，原样放行");
  } finally {
    $done({});
  }
})();
