const diceFaces=['⚀','⚁','⚂','⚃','⚄','⚅'];
const diceNumbers=['一','二','三','四','五','六'];
let history=[];
let isRolling=false;
document.addEventListener('DOMContentLoaded',function(){
    if(typeof requireLogin==='function'){
        if(!requireLogin()) return;
    }
    const cube=document.getElementById('diceCube');
    const btn=document.getElementById('rollBtn3D');
    const resultDisplay=document.getElementById('resultDisplay');
    const historyDisplay=document.getElementById('historyDisplay');
    function getRandomRotation() {
        const value=Math.floor(Math.random()*6)+1;
        const rotations=[
            {x:0,y:0,z:0},
            {x:0,y:180,z:0},
            {x:0,y:90,z:0},
            {x:0,y:-90,z:0},
            {x:-90,y:0,z:0},
            {x:90,y:0,z:0}
        ];
        const base=rotations[value-1];
        const extraX=Math.floor(Math.random()*4)*360;
        const extraY=Math.floor(Math.random()*4)*360;
        const extraZ=Math.floor(Math.random()*4)*360;
        const finalX=base.x+extraX;
        const finalY=base.y+extraY;
        const finalZ=base.z+extraZ;
        return {x:finalX,y:finalY,z:finalZ,value:value};
    }
    function rollDice(){
        if(isRolling) return;
        isRolling=true;
        btn.disabled=true;
        const {x,y,z,value}=getRandomRotation();
        cube.style.transition='transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
        cube.style.transform='rotateX('+x+'deg) rotateY('+y+'deg) rotateZ('+z+'deg)';
        setTimeout(function(){
            resultDisplay.textContent='🎲 点数：'+value+' ('+diceNumbers[value-1]+')';
            history.push(value);
            if(history.length>10) history.shift();
            updateHistory();
            isRolling=false;
            btn.disabled=false;
        },1600);
    }
    function updateHistory(){
        if(history.length===0){
            historyDisplay.textContent='还没有投掷记录';
            return;
        }
        var text='';
        for(var i=0;i<history.length;i++){
            text+=diceFaces[history[i]-1]+' ';
        }
        historyDisplay.textContent='最近记录: '+text;
    }

    btn.addEventListener('click', rollDice);
    document.getElementById('diceWrapper').addEventListener('click',rollDice);
    var initValue=Math.floor(Math.random()*6)+1;
    var initRotations=[
        {x:0,y:0,z:0},
        {x:0,y:180,z:0},
        {x:0,y:90,z:0},
        {x:0,y:-90,z:0},
        {x:-90,y:0,z:0},
        {x:90,y:0,z:0}
    ];
    var init=initRotations[initValue-1];
    cube.style.transition='none';
    cube.style.transform='rotateX('+init.x+'deg) rotateY('+init.y+'deg) rotateZ('+init.z+'deg)';
    resultDisplay.textContent='🎲 点数：'+initValue+' ('+diceNumbers[initValue-1]+')';
    history.push(initValue);
    updateHistory();
    setTimeout(function(){
        cube.style.transition='transform 1.5s cubic-bezier(0.2,0.8,0.2,1)';
    },100);
});