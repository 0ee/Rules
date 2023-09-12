let body = $response.body;
body = JSON.parse(body);
if (-1 != $request.url.indexOf('/game_record/app/genshin/aapi/widget/v2')) {
    if(!body.data.has_signed){
        $notification.post('今天还没签到~~~','快去签到啊~~~','')
    }
    if(body.data.current_home_coin >= 1200){
        $notification.post('壶快满了，快去收菜啊~~~','快去收菜啊~~~','')
    }
    if(body.data.current_resin >= 80){
        $notification.post('体力快满了~~~','快去合成一下啊~~~','')
    }
    if(body.data.expeditions.some(item => item.status === 'Finished')){
        $notification.post('有探索派遣完成了~~~','快去领一下奖励啊~~~','')
    }
    if(!body.data.is_extra_task_reward_received){
        $notification.post('每日委托奖励没领~~~','快去领一下奖励啊~~~','')   
    }
}
$done({});