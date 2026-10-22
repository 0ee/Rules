// Surge http-response script. Offline candidate, 2026-10-22.
// Only recognized ad components are removed; unknown data passes through.
// No response-body logging, credential access, or persistent-store writes.
(function () {
  const LABEL_TITLES = true; // Add 【图文】 / 【视频】 to nonempty note titles.
  const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const own = (v, key) => Object.prototype.hasOwnProperty.call(v, key);
  let result = {};

  try {
    const url = typeof $request !== "undefined" ? $request.url : "";
    const match = /^https:\/\/(edith|www)\.xiaohongshu\.com(\/[^?#]*)/.exec(url || "");
    const path = match ? match[2] : "";
    const notePaths = [
      "/api/sns/v1/note/imagefeed", "/api/sns/v2/note/feed",
      "/api/sns/v3/note/videofeed", "/api/sns/v4/note/videofeed"
    ];
    const widgetsPath = "/api/sns/v2/note/widgets";
    const splashPath = "/api/sns/v2/system_service/splash_config";
    if (path !== widgetsPath && path !== splashPath && !notePaths.includes(path)) {
      $done(result);
      return;
    }
    if (typeof $response === "undefined" || typeof $response.body !== "string" || !$response.body) {
      $done(result);
      return;
    }
    const obj = JSON.parse($response.body);
    if (!isObject(obj) || obj.success !== true) {
      $done(result);
      return;
    }
    const data = obj.data;
    let changed = false;

    if (path === widgetsPath && isObject(data)) {
      if (isObject(data.generic)) {
        // Explicit advertising CTA, without removing the generic container.
        if (isObject(data.generic.ads_engage_bar)) {
          delete data.generic.ads_engage_bar;
          changed = true;
        }
        const pgy = data.generic.pgy_comment_component;
        // Observed branded search-campaign CTA. Keep brand/creator disclosure.
        if (isObject(pgy) && isObject(pgy.brand_info) && isObject(pgy.component_info) &&
            pgy.component_info.type === 3 && pgy.component_info.sub_type === "NOTE_COMMENT_SEARCH") {
          delete pgy.component_info;
          changed = true;
        }
      }
      if (isObject(data.widgets_nbb) && data.widgets_nbb.biz_type === "nbb_ads_related_search") {
        delete data.widgets_nbb;
        changed = true;
      }
      // Preserve widget_list, widgets_ndb, normal searches, POI, sound and interactions.
    } else if (path === splashPath && isObject(data)) {
      // These arrays contain splash ad inventory. Keep layout and other settings.
      for (const key of ["ads_groups", "bidding_ads"]) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          data[key] = [];
          changed = true;
        }
      }
    } else if (LABEL_TITLES && Array.isArray(data)) {
      const label = (note) => {
        if (!isObject(note) || (own(note, "model_type") && note.model_type !== "note") ||
            typeof note.title !== "string" || !note.title.trim()) return;
        const prefix = note.type === "normal" ? "【图文】" : note.type === "video" ? "【视频】" : "";
        if (prefix && !/^【(?:图文|视频)】/.test(note.title)) {
          note.title = prefix + note.title;
          changed = true;
        }
      };
      for (const item of data) {
        if (!isObject(item)) continue;
        if (Array.isArray(item.note_list)) item.note_list.forEach(label);
        else label(item);
      }
    }
    if (changed) result = { body: JSON.stringify(obj) };
  } catch (_) {
    // Non-JSON or unexpected shapes: preserve the original response.
    result = {};
  }
  $done(result);
})();
