document.addEventListener('DOMContentLoaded',function(){
    if(typeof getCurrentUser!=='function'||!getCurrentUser()){
        alert('请先登录喵');
        return;
    }
    const input=document.getElementById('todoInput');
    const addBtn=document.getElementById('addBtn');
    const list=document.getElementById('todoList');
    const filterBtns=document.querySelectorAll('.filter-btn');
    const countEl=document.getElementById('todoCount');
    let todos=[];
    let currentFilter='all';

    function getStorageKey(){
        var user=getCurrentUser();
        return 'todos_'+user;
    }
    function loadTodos(){
        var key=getStorageKey();
        var stored=localStorage.getItem(key);
        if(stored){
            try{
                todos=JSON.parse(stored);
            }catch(e){
                todos=[];
            }
        }else{
            todos=[];
        }
        render();
    }
    function saveTodos(){
        var key=getStorageKey();
        localStorage.setItem(key,JSON.stringify(todos));
    }
    function addTodo(){
        var text=input.value.trim();
        if(!text){
            alert('请输入待办事项喵');
            return;
        }
        todos.push({
            id:Date.now()+Math.random()*1000,
            text:text,
            completed:false
        });
        input.value='';
        saveTodos();
        render();
        input.focus();
    }
    function toggleTodo(id){
        for(var i=0;i<todos.length;i++){
            if(todos[i].id===id){
                todos[i].completed=!todos[i].completed;
                break;
            }
        }
        saveTodos();
        render();
    }
    function deleteTodo(id){
        if(!confirm('确定要删除这条吗？')) return;
        var newTodos=[];
        for(var i=0;i<todos.length;i++){
            if(todos[i].id!==id){
                newTodos.push(todos[i]);
            }
        }
        todos=newTodos;
        saveTodos();
        render();
    }
    function getFilteredTodos(){
        if(currentFilter==='all') return todos;
        if(currentFilter==='active'){
            var result=[];
            for(var i=0;i<todos.length;i++){
                if(!todos[i].completed) result.push(todos[i]);
            }
            return result;
        }
        if(currentFilter==='completed'){
            var result=[];
            for(var i=0;i<todos.length;i++){
                if(todos[i].completed) result.push(todos[i]);
            }
            return result;
        }
        return todos;
    }
    function render(){
        var filtered=getFilteredTodos();
        var total=todos.length;
        var completed=0;
        for(var i=0;i<todos.length;i++){
            if(todos[i].completed) completed++;
        }
        var active=total-completed;
        var countText='';
        if(currentFilter==='all') countText=total+' 项';
        else if(currentFilter==='active') countText=active+' 项未完成';
        else if(currentFilter==='completed') countText=completed+' 项已完成';
        countEl.textContent=countText;
        list.innerHTML='';
        if(filtered.length===0){
            var empty=document.createElement('li');
            empty.className='todo-empty';
            if(currentFilter==='all'){
                empty.textContent='还没有待办事项，添加一条吧喵';
            }else if(currentFilter==='active'){
                empty.textContent='全部完成，真棒喵！';
            }else{
                empty.textContent='还没有已完成的任务';
            }
            list.appendChild(empty);
            return;
        }
        for(var i=0;i<filtered.length;i++){
            var todo=filtered[i];
            var li=document.createElement('li');
            li.className='todo-item';
            if(todo.completed) li.className+=' completed';
            var checkbox=document.createElement('input');
            checkbox.type='checkbox';
            checkbox.checked=todo.completed;
            (function(id){
                checkbox.addEventListener('change',function(){
                    toggleTodo(id);
                });
            })(todo.id);
            var textSpan=document.createElement('span');
            textSpan.className='todo-text';
            textSpan.textContent=todo.text;
            var delBtn=document.createElement('button');
            delBtn.className='todo-delete';
            delBtn.textContent='×';
            (function(id){
                delBtn.addEventListener('click',function(){
                    deleteTodo(id);
                });
            })(todo.id);
            li.appendChild(checkbox);
            li.appendChild(textSpan);
            li.appendChild(delBtn);
            list.appendChild(li);
        }
    }
    function setFilter(filter){
        currentFilter=filter;
        for(var i=0;i<filterBtns.length;i++){
            var btn=filterBtns[i];
            if(btn.dataset.filter===filter){
                btn.classList.add('active');
            }else{
                btn.classList.remove('active');
            }
        }
        render();
    }
    addBtn.addEventListener('click',addTodo);
    input.addEventListener('keydown',function(e){
        if(e.key==='Enter') addTodo();
    });
    for(var i=0;i<filterBtns.length;i++){
        (function(btn){
            btn.addEventListener('click',function(){
                setFilter(this.dataset.filter);
            });
        })(filterBtns[i]);
    }
    list.addEventListener('click',function(e){
        var item=e.target.closest('.todo-item');
        if(item && e.target.tagName!=='INPUT' && e.target.tagName!=='BUTTON'){
            var checkbox=item.querySelector('input[type="checkbox"]');
            if(checkbox) checkbox.click();
        }
    });
    loadTodos();
});