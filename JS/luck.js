document.addEventListener('DOMContentLoaded',function(){
    if(typeof requireLogin==='function'){
        if(!requireLogin()) return;
    }
    var user=getCurrentUser();
    if(!user){
        alert('请先登录喵');
        return;
    }
    var resultDiv=document.getElementById('luckResult');
    var todayStr=getTodayStr();
    var storageKey='luck_result_'+user;
    var storedData=localStorage.getItem(storageKey);
    var hasDrawnToday=false;
    var savedData=null;
    if(storedData){
        try{
            var parsed=JSON.parse(storedData);
            if(parsed.date===todayStr){
                hasDrawnToday=true;
                savedData=parsed.data;
            }
        }catch(e){
        	
        }
    }
    var days=getCheckinDays();
    if(hasDrawnToday && savedData){
        renderResult(savedData,days);
    }else{
        showDrawButton(days);
    }
    function getTodayStr(){
        var d=new Date();
        var year=d.getFullYear();
        var month=String(d.getMonth()+1).padStart(2,'0');
        var day=String(d.getDate()).padStart(2,'0');
        return year+'-'+month+'-'+day;
    }
    function getCheckinDays(){
        var lastDate=localStorage.getItem('luck_last_date');
        var days=parseInt(localStorage.getItem('luck_days')||'0');
        var today=new Date().toDateString();
        if(lastDate===today){
            return days;
        }else{
            var yesterday=new Date();
            yesterday.setDate(yesterday.getDate()-1);
            var yesterdayStr=yesterday.toDateString();
            if(lastDate===yesterdayStr){
                days+=1;
            }else{
                days=1;
            }
            localStorage.setItem('luck_last_date',today);
            localStorage.setItem('luck_days',String(days));
            return days;
        }
    }
    var levels=[
        {name:'大吉', weight:5, color:'#FF2C76', type:'good'},
        {name:'小吉', weight:25, color:'#FF2C76', type:'good'},
        {name:'中平', weight:40, color:'#2DCE89', type:'medium'},
        {name:'凶', weight:25, color:'#5c5c5c', type:'bad'},
        {name:'大凶', weight:5, color:'#5c5c5c', type:'bad'}
    ];
    var yiList=[
        '发朋友圈','抢最优解','摸鱼','睡觉','吃零食','听歌','跑步','看书',
        '喝水','深呼吸','发呆','散步','晒太阳','撸猫','撸狗','打游戏',
        '学习','写代码','画画','做饭','打扫','购物','聊天','拍照'
    ];
    var jiList=[
        '贴贴','祭祀','熬夜','暴食','冲动','拖延','赖床','刷短视频',
        '抱怨','生气','借钱','赌博','开车分心','高空抛物','闯红灯','喝冷水',
        '空腹喝咖啡','久坐不动','过度用眼','听悲伤的歌','翻旧账','自我否定','比较'
    ];
    var yiDesc={
        '发朋友圈':'分享是种美德',
        '抢最优解':'一发就是最优解',
        '摸鱼':'劳逸结合效率更高',
        '睡觉':'养精蓄锐',
        '吃零食':'补充能量',
        '听歌':'旋律治愈心灵',
        '跑步':'挥洒汗水，释放压力',
        '看书':'书中自有黄金屋',
        '喝水':'多喝热水准没错',
        '深呼吸':'心平气和',
        '发呆':'放空大脑，重启自己',
        '散步':'慢慢走，欣赏啊',
        '晒太阳':'补钙，顺便补点阳光',
        '撸猫':'吸猫大法好',
        '撸狗':'狗狗是人类最好的朋友',
        '打游戏':'适度游戏益脑',
        '学习':'知识就是力量',
        '写代码':'代码改变世界',
        '画画':'艺术源于生活',
        '做饭':'自己动手，丰衣足食',
        '打扫':'一屋不扫何以扫天下',
        '购物':'开心就好',
        '聊天':'交流产生火花',
        '拍照':'定格美好瞬间'
    };
    var jiDesc={
        '贴贴':'一定会被拒绝',
        '祭祀':'未能得到祖宗保佑',
        '熬夜':'头发会离家出走',
        '暴食':'体重秤会生气',
        '冲动':'冲动是魔鬼',
        '拖延':'DDL是第一生产力?不',
        '赖床':'被窝是青春的坟墓',
        '刷短视频':'时间都去哪儿了',
        '抱怨':'负能量会传染',
        '生气':'伤肝又伤心',
        '借钱':'友谊的小船说翻就翻',
        '赌博':'十赌九输',
        '开车分心':'安全第一',
        '高空抛物':'禁止高空抛物',
        '闯红灯':'生命只有一次',
        '喝冷水':'胃会抗议的',
        '空腹喝咖啡':'伤胃又心悸',
        '久坐不动':'小心腰间盘突出',
        '过度用眼':'眼睛需要休息',
        '听悲伤的歌':'情绪会低落',
        '翻旧账':'往事不要再提',
        '自我否定':'你比自己想象的更棒',
        '比较':'人比人气死人'
    };
    function getRandomItem(arr){
        return arr[Math.floor(Math.random()*arr.length)];
    }
    function getTwoRandomItems(arr){
        var items=[];
        var tempArr=arr.slice();
        for(var i=0;i<2;i++){
            if(tempArr.length===0) break;
            var idx=Math.floor(Math.random()*tempArr.length);
            items.push(tempArr[idx]);
            tempArr.splice(idx,1);
        }
        while(items.length<2){
            items.push(items[0]);
        }
        return items;
    }
    function drawLuck(){
        var totalWeight=0;
        for(var i=0;i<levels.length;i++){
            totalWeight+=levels[i].weight;
        }
        var rand=Math.random()*totalWeight;
        var cumulative=0;
        for(var i=0;i<levels.length;i++){
            cumulative+=levels[i].weight;
            if(rand<cumulative){
                return levels[i];
            }
        }
        return levels[0];
    }
    function generateLuckData(){
        var luck=drawLuck();
        var yiItems=[];
        var jiItems=[];
        if(luck.type==='good'){
            var tempYi=getTwoRandomItems(yiList);
            for(var i=0;i<tempYi.length;i++){
                yiItems.push({text:'宜：'+tempYi[i], sub:yiDesc[tempYi[i]]||''});
            }
            if(luck.name==='大吉'){
                jiItems=[{text:'万事皆宜！', sub:''}];
            }else{
                var tempJi=getTwoRandomItems(jiList);
                for(var j=0;j<tempJi.length;j++){
                    jiItems.push({text:'忌：'+tempJi[j], sub:jiDesc[tempJi[j]]||''});
                }
            }
        }else if(luck.type==='bad'){
            var tempJi=getTwoRandomItems(jiList);
            for(var j=0;j<tempJi.length;j++){
                jiItems.push({text:'忌：'+tempJi[j], sub:jiDesc[tempJi[j]]||''});
            }
            if(luck.name==='大凶'){
                yiItems=[{text:'事事不顺', sub:''}];
            }else{
                var tempYi=getTwoRandomItems(yiList);
                for(var i=0;i<tempYi.length;i++){
                    yiItems.push({text:'宜：'+tempYi[i], sub:yiDesc[tempYi[i]]||''});
                }
            }
        }else{
            var tempYi=getTwoRandomItems(yiList);
            for(var i=0;i<tempYi.length;i++){
                yiItems.push({text:'宜：'+tempYi[i], sub:yiDesc[tempYi[i]]||''});
            }
            var tempJi=getTwoRandomItems(jiList);
            for(var j=0;j<tempJi.length;j++){
                jiItems.push({text:'忌：'+tempJi[j], sub:jiDesc[tempJi[j]]||''});
            }
        }
        return {
            level:luck.name,
            color:luck.color,
            yiItems:yiItems,
            jiItems:jiItems
        };
    }
    function renderResult(data,days){
        var html='<div class="luck-card">';
        html+='<div class="luck-user">'+user+' 的运势</div>';
        html+='<div class="luck-level" style="color:'+data.color+';">§ '+data.level+' §</div>';
        for(var i=0;i<data.yiItems.length;i++){
            html+='<div class="luck-yi">'+data.yiItems[i].text+'</div>';
            if(data.yiItems[i].sub){
                html+='<div class="luck-sub">'+data.yiItems[i].sub+'</div>';
            }
        }
        for(var j=0;j<data.jiItems.length;j++){
            html+='<div class="luck-ji">'+data.jiItems[j].text+'</div>';
            if(data.jiItems[j].sub){
                html+='<div class="luck-sub">'+data.jiItems[j].sub+'</div>';
            }
        }
        html+='<div class="luck-days">你已经在喵站连续打卡了 '+days+' 天</div>';
        html+='</div>';
        resultDiv.innerHTML=html;
    }
    function showDrawButton(days){
        var html='<div class="luck-card">';
        html+='<div class="luck-user">'+user+' 的运势</div>';
        html+='<p style="color:#9a8e86;margin:20px 0;">今天还没有抽签喵，点击下方按钮看看运势吧</p>';
        html+='<button id="drawLuckBtn" class="luck-draw-btn">抽签</button>';
        html+='</div>';
        resultDiv.innerHTML=html;
        document.getElementById('drawLuckBtn').addEventListener('click',function(){
            var data=generateLuckData();
            var storeData={
                date:todayStr,
                data:data
            };
            localStorage.setItem(storageKey,JSON.stringify(storeData));
            renderResult(data,days);
        });
    }
});