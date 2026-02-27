console.log(typeof $request != "undefined")
  if (typeof $request != "undefined") {
      // 捕获所有相关请求，保存完整 URL
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
      // 定时任务：执行签到
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
              $notification.post('NGA签到失败', '签到请求出错', error)
              $done({})
              return
          }
          console.log('签到响应: ' + data)

          // 延迟1秒后获取积分
          setTimeout(() => {
              getScore()
          }, 1000)
      })
  }

  function getScore() {
      let scoreUrl = $persistentStore.read('nga_genshin_score_url')
      if (!scoreUrl) {
          console.log('积分查询URL未缓存')
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
              return
          }
          console.log('积分响应: ' + data)

          try {
              let result = JSON.parse(data)
              let score = result.data[0]
              console.log('当前积分: ' + score)

              // 如果积分 >= 30，执行抽奖
              if (score >= 30) {
                  console.log('积分充足，执行抽奖')
                  luckydraw()
              } else {
                  console.log('积分不足，需要 ' + (30 - score) + ' 积分')
                  $notification.post('NGA原神签到', '签到成功', '当前积分: ' + score)
              }
          } catch (e) {
              console.log('解析积分失败: ' + e)
          }
      })
  }

  function luckydraw() {
      let luckyUrl = $persistentStore.read('nga_genshin_luckydraw_url')
      if (!luckyUrl) {
          console.log('抽奖URL未缓存')
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
              $notification.post('NGA抽奖失败', '抽奖请求出错', error)
              return
          }
          console.log('抽奖响应: ' + data)
          $notification.post('NGA原神抽奖', '抽奖成功', data)
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
      return JSON.parse(headerStr)
  }