document.addEventListener('DOMContentLoaded',function(){
    if(typeof getCurrentUser!=='function'||!getCurrentUser()){
        alert('请先登录喵');
        window.location.href='../index.html';
        return;
    }
    const canvas=document.getElementById('drawCanvas');
    const ctx=canvas.getContext('2d');
    let isDrawing=false;
    let lastX=0;
    let lastY=0;
    let currentColor='#000000';
    let brushSize=3;
    const colorBtns=document.querySelectorAll('.color-btn');
    const sizeSlider=document.getElementById('brushSize');
    const sizeDisplay=document.getElementById('sizeDisplay');
    const clearBtn=document.getElementById('clearCanvas');
    const saveBtn=document.getElementById('saveCanvas');
    function initCanvas(){
        ctx.fillStyle='#ffffff';
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }
    initCanvas();
    function startDrawing(e){
        isDrawing=true;
        const rect=canvas.getBoundingClientRect();
        const scaleX=canvas.width/rect.width;
        const scaleY=canvas.height/rect.height;
        var clientX,clientY;
        if(e.touches){
            clientX=e.touches[0].clientX;
            clientY=e.touches[0].clientY;
        }else{
            clientX=e.clientX;
            clientY=e.clientY;
        }
        lastX=(clientX-rect.left)*scaleX;
        lastY=(clientY-rect.top)*scaleY;
        ctx.beginPath();
        ctx.arc(lastX,lastY,brushSize/2,0,Math.PI*2);
        ctx.fillStyle=currentColor;
        ctx.fill();
    }
    function draw(e){
        if(!isDrawing) return;
        e.preventDefault();
        const rect=canvas.getBoundingClientRect();
        const scaleX=canvas.width/rect.width;
        const scaleY=canvas.height/rect.height;
        var clientX,clientY;
        if(e.touches){
            clientX=e.touches[0].clientX;
            clientY=e.touches[0].clientY;
        }else{
            clientX=e.clientX;
            clientY=e.clientY;
        }
        var currentX=(clientX-rect.left)*scaleX;
        var currentY=(clientY-rect.top)*scaleY;
        ctx.beginPath();
        ctx.moveTo(lastX,lastY);
        ctx.lineTo(currentX,currentY);
        ctx.strokeStyle=currentColor;
        ctx.lineWidth=brushSize;
        ctx.lineCap='round';
        ctx.lineJoin='round';
        ctx.stroke();
        lastX=currentX;
        lastY=currentY;
    }
    function stopDrawing(){
        isDrawing=false;
    }
    canvas.addEventListener('mousedown',startDrawing);
    canvas.addEventListener('mousemove',draw);
    canvas.addEventListener('mouseup',stopDrawing);
    canvas.addEventListener('mouseleave',stopDrawing);
    canvas.addEventListener('touchstart',function(e){
        e.preventDefault();
        startDrawing(e);
    });
    canvas.addEventListener('touchmove',function(e){
        e.preventDefault();
        draw(e);
    });
    canvas.addEventListener('touchend',stopDrawing);
    colorBtns.forEach(function(btn){
        btn.addEventListener('click',function(){
            for(var i=0;i<colorBtns.length;i++){
                colorBtns[i].classList.remove('active');
            }
            this.classList.add('active');
            currentColor=this.dataset.color;
        });
    });
    sizeSlider.addEventListener('input',function(){
        brushSize=parseInt(this.value);
        sizeDisplay.textContent=brushSize;
    });
    clearBtn.addEventListener('click',function(){
        if(confirm('确定要清空画布吗？')){
            initCanvas();
        }
    });
    saveBtn.addEventListener('click',function(){
        var link=document.createElement('a');
        link.download='画板_'+new Date().toISOString().slice(0,10)+'.png';
        link.href=canvas.toDataURL('image/png');
        link.click();
    });
    function resizeCanvas(){
        var wrapper=canvas.parentElement;
        var wrapperWidth=wrapper.clientWidth;
        var targetWidth=Math.min(wrapperWidth,800);
        var targetHeight=targetWidth*(500/800);
        canvas.style.width=targetWidth+'px';
        canvas.style.height=targetHeight+'px';
    }
    window.addEventListener('resize',resizeCanvas);
    resizeCanvas();
});