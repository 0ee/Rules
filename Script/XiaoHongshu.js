// Diagnostic wrapper: logs bounded response structure, not response headers or text.
(function (finish) {
  const changes = { titleFields: 0, feedAds: 0, widgetAds: 0, marketTabs: 0, marketMetadata: 0, splashArrays: 0 };
  const match = /^https:\/\/(edith|www|rec)\.xiaohongshu\.com(\/[^?#]*)/.exec($request.url || "");
  const path = match ? match[2] : "";
  const enums = new Set(["model_type", "biz_type", "card_type", "item_type", "ad_type", "ads_type", "type", "tab_id", "tab_name", "enable_show", "priority", "is_ads", "is_ad", "has_ads", "sponsored", "zh_cn"]);
  function snapshot(root) {
    let budget = 1000;
    function walk(v, key, depth) {
      if (--budget < 0 || depth > 8) return "[limit]";
      if (v === null) return null;
      if (Array.isArray(v)) {
        // Sample ordinary cards plus explicitly marked ad-shaped cards later in the list.
        const selected = v.map((x, i) => i).filter(i => i < 8 ||
          (v[i] && typeof v[i] === "object" && Object.keys(v[i]).some(k => /^(ads?_info|ads?_id|is_ads?|sponsored)$/.test(k)))).slice(0, 24);
        return { length: v.length, samples: selected.map(i => ({ index: i, shape: walk(v[i], "", depth + 1) })) };
      }
      if (typeof v === "object") {
        const out = {};
        for (const k of Object.keys(v).slice(0, 100)) {
          const name = /^[a-f0-9]{24,}$/i.test(k) ? "[dynamic-key]" : k;
          if (/token|session|cookie|authorization|password|device_id|user_id/i.test(k)) out[name] = "[redacted]";
          else out[name] = walk(v[k], k, depth + 1);
          if (budget < 0) break;
        }
        return out;
      }
      if (typeof v === "boolean") return v;
      if (enums.has(key) && typeof v === "number") return v;
      if (enums.has(key) && typeof v === "string") return v.slice(0, 100);
      return typeof v;
    }
    return walk(root, "", 0);
  }
  function navigationSummary(body) {
    const root = JSON.parse(body);
    const data = root && root.data;
    if (!data || typeof data !== "object") return {};
    const knownMarket = tab => tab && typeof tab === "object" && (
      [tab.tab_id, tab.type_2tab].some(v => typeof v === "string" && ["market", "mall"].includes(v.toLowerCase())) ||
      [tab.title, tab.tab_name, tab.zh_cn_name, tab.zh_tw_name, tab.en_name].some(v => ["市集", "购买", "購買", "商城", "Market"].includes(v))
    );
    const output = {};
    if (data.tabbar && Array.isArray(data.tabbar.tabs)) {
      output.bottomTabs = { count: data.tabbar.tabs.length, marketIndices: data.tabbar.tabs.map((v, i) => knownMarket(v) ? i : -1).filter(i => i >= 0) };
    }
    output.marketMetadataPresent = Object.prototype.hasOwnProperty.call(data, "name_2tab_config");
    if (output.marketMetadataPresent) output.marketMetadataRecognized = !!knownMarket(data.name_2tab_config);
    if (Array.isArray(data.categories)) {
      output.categories = { count: data.categories.length, recognized: data.categories.map((v, i) => ({ index: i, kind: v && ["homefeed.shop", "homefeed.sketch", "homefeed.live"].includes(v.oid) ? v.oid : "other" })) };
    }
    if (data.configs && typeof data.configs === "object" && !Array.isArray(data.configs)) {
      output.configKeys = Object.keys(data.configs).filter(k => /tab|market|mall|navig|mainframe/i.test(k)).slice(0, 80);
    }
    return output;
  }
  let completed = false;
  const $done = function (result) {
    if (completed) return;
    completed = true;
    try {
      const event = { version: "XHS-MARKET-TRACE-20261026", host: match ? match[1] : "unknown", path,
        modified: !!(result && result.body), action: result && result.body ? "modified" : "passthrough", changes };
      try {
        event.navigationBefore = navigationSummary($response.body);
        event.navigationAfter = navigationSummary(result && result.body ? result.body : $response.body);
        event.shape = snapshot(JSON.parse($response.body));
      }
      catch (_) { event.shape = "[no JSON body]"; }
      console.log("[XHS-DIAG] " + JSON.stringify(event));
    } catch (_) {}
    finish(result);
  };
  // Conservative response edits; changes records counts only, never title text.

// Surge http-response script. Local candidate, 2026-10-26.
// Only recognized ad components are removed; unknown data passes through.
// No response-body logging, credential access, or persistent-store writes.
(function () {
  const LABEL_TITLES = true; // Prefix both existing title and display_title fields.
  const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const own = (v, key) => Object.prototype.hasOwnProperty.call(v, key);
  let result = {};

  try {
    const url = typeof $request !== "undefined" ? $request.url : "";
    const match = /^https:\/\/(edith|www|rec)\.xiaohongshu\.com(\/[^?#]*)/.exec(url || "");
    const path = match ? match[2] : "";
    const notePaths = [
      "/api/sns/v1/note/imagefeed", "/api/sns/v2/note/feed",
      "/api/sns/v3/note/videofeed", "/api/sns/v4/note/videofeed"
    ];
    const feedPaths = ["/api/sns/v6/homefeed", "/api/sns/v1/localfeed"];
    const widgetsPath = "/api/sns/v2/note/widgets";
    const splashPath = "/api/sns/v2/system_service/splash_config";
    const navigationPaths = ["/api/sns/v1/system_service/config", "/api/sns/v1/localfeed/tab_config"];
    if (path !== widgetsPath && path !== splashPath && !navigationPaths.includes(path) && !notePaths.includes(path) && !feedPaths.includes(path)) {
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

    if (navigationPaths.includes(path) && isObject(data)) {
      // Explicit user preference: hide market navigation, not search goods or POI.
      const marketNames = new Set(["市集", "购买", "購買", "商城", "Market"]);
      const marketIds = new Set(["market", "mall"]);
      const isMarket = (tab) => {
        if (!isObject(tab)) return false;
        return [tab.tab_id, tab.type_2tab].some(v => typeof v === "string" && marketIds.has(v.toLowerCase())) ||
          [tab.title, tab.tab_name, tab.zh_cn_name, tab.zh_tw_name, tab.en_name].some(v => marketNames.has(v));
      };
      const prune = (container, key) => {
        if (!isObject(container) || !Array.isArray(container[key])) return;
        const tabs = container[key];
        const kept = tabs.filter(tab => !isMarket(tab));
        // Do not empty an unfamiliar navigation container completely.
        if (kept.length && kept.length !== tabs.length) {
          container[key] = kept;
          changes.marketTabs += tabs.length - kept.length;
          changed = true;
        }
      };
      if (path === "/api/sns/v1/system_service/config") {
        prune(data.tabbar, "tabs");
        if (isMarket(data.name_2tab_config)) {
          delete data.name_2tab_config;
          changes.marketMetadata++;
          changed = true;
        }
      } else {
        // Unseen response body: only recognize explicit navigation arrays.
        for (const key of ["tabs", "tab_list", "tab_config"]) prune(data, key);
      }
    } else if (path === widgetsPath && isObject(data)) {
      if (isObject(data.generic)) {
        // Explicit advertising CTA, without removing the generic container.
        if (isObject(data.generic.ads_engage_bar)) {
          delete data.generic.ads_engage_bar;
          changes.widgetAds++;
          changed = true;
        }
        const pgy = data.generic.pgy_comment_component;
        // Observed branded search-campaign CTA. Keep brand/creator disclosure.
        if (isObject(pgy) && isObject(pgy.brand_info) && isObject(pgy.component_info) &&
            pgy.component_info.type === 3 && pgy.component_info.sub_type === "NOTE_COMMENT_SEARCH") {
          delete pgy.component_info;
          changes.widgetAds++;
          changed = true;
        }
      }
      if (isObject(data.widgets_nbb) && data.widgets_nbb.biz_type === "nbb_ads_related_search") {
        delete data.widgets_nbb;
        changes.widgetAds++;
        changed = true;
      }
      if (isObject(data.widgets_ncb) && data.widgets_ncb.biz_type === "ncb_ads_note_bar") {
        delete data.widgets_ncb;
        changes.widgetAds++;
        changed = true;
      }
      // Preserve widget_list, widgets_ndb, normal searches, POI, sound and interactions.
    } else if (path === splashPath && isObject(data)) {
      // These arrays contain splash ad inventory. Keep layout and other settings.
      for (const key of ["ads_groups", "bidding_ads"]) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          data[key] = [];
          changes.splashArrays++;
          changed = true;
        }
      }
    } else if (Array.isArray(data)) {
      // Only the observed homefeed ad shape is removed. Unknown cards pass through.
      let items = data;
      if (path === "/api/sns/v6/homefeed") {
        items = data.filter(item => !(isObject(item) && item.is_ads === true && isObject(item.ads_info)));
        if (items.length !== data.length) {
          changes.feedAds += data.length - items.length;
          obj.data = items;
          changed = true;
        }
      }
      const label = (note) => {
        if (!LABEL_TITLES || !isObject(note) ||
            (own(note, "model_type") && note.model_type !== "note") ||
            note.is_ads === true || isObject(note.ads_info)) return;
        const prefix = note.type === "normal" ? "【图文】" : note.type === "video" ? "【视频】" : "";
        if (!prefix) return;
        for (const key of ["title", "display_title"]) {
          if (typeof note[key] !== "string" || !note[key].trim() || /^【(?:图文|视频)】/.test(note[key])) continue;
          note[key] = prefix + note[key];
          changes.titleFields++;
          changed = true;
        }
      };
      for (const item of items) {
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

})($done);
