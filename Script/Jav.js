console.log($request.url)
console.log($request.method)
if (typeof $response == "undefined") {
    if (url.includes("/api/v1/movies/") && url.includes("/play?")) {
        header.authorization = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6OTc1NDMwLCJ1c2VybmFtZSI6IndlaWd1YW5naHQifQ.lyfGvtZcz0SjiKNx-k9Aoe_UgcMyxwG4Xqq3lzvbIao";
        $done({ headers: header });
    } else {
      $done({});
    }
} else{
    let body = $response.body;
    if (!body) $done({});
    console.log($request.url)
    console.log(body)
    body = JSON.parse(body);
    if (-1 != $request.url.indexOf('/api/v1/ads')) {
       // 首页banner
       if (body?.data?.ads?.index_top?.length > 0) {
        body.data.ads.index_top = body.data.ads.index_top.filter((i) => /astarte:\/\//g.test(i?.url));
      }
      if (body?.data?.ads?.web_magnets_top?.length > 0) {
        body.data.ads.web_magnets_top = body.data.ads.web_magnets_top.filter((i) => !/https?:\/\//g.test(i?.url));
      }
    }
    if ($request.url.includes("/api/v1/startup")) {
        // 开屏广告
        if (body?.data?.splash_ad) {
            body.data.splash_ad.enabled = false;
            body.data.splash_ad.overtime = 0;
          }
          if (body?.data?.feedback) {
            body.data.feedback = {};
          }
          if (body?.data?.settings?.NOTICE) {
            delete body.data.settings.NOTICE;
          }
          if (body?.data?.user) {
            body.data.user.vip_expired_at = "2090-12-31T23:59:59.000+08:00";
            body.data.user.is_vip = true;
          }
    }

    if (-1 != $request.url.indexOf('/api/v1/users')) {
        // 伪装会员
        if (body?.data?.user) {
            body.data.user.vip_expired_at = "2090-12-31T23:59:59.000+08:00";
            body.data.user.is_vip = true;
        }
    }
    if (-1 != $request.url.indexOf('/api/v4/movies/')) {
        // 详情页banner
        if (body?.data?.show_vip_banner) {
            body.data.show_vip_banner = false;
          }
    }
    body = JSON.stringify(body);
    $done({body});
}