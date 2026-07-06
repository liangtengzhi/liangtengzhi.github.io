var datatable=null;
var db=null;
var DB_NAME='MyData';
var STORE_NAME='MsgData';
var DB_VERSION=1;
var currentUserName=null;
var isAdminMode=false;
function init(){
    if(typeof getCurrentUser==='function'){
        currentUserName=getCurrentUser();
        if(!currentUserName){
            alert('请先登录');
        }else if(currentUserName==='Admin'){
            isAdminMode=true;
        }
    }
    datatable=document.getElementById('datatable');
    datatable.addEventListener('click', function(e){
        var target=e.target;
        if (target.classList && target.classList.contains('del-btn')) {
            var id=parseInt(target.getAttribute('data-id'));
            if (!isNaN(id)) {
                deleteData(id);
            }
        }
    });
    var request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=function(event){
        var db=event.target.result;
        if(!db.objectStoreNames.contains(STORE_NAME)){
            var objectStore=db.createObjectStore(STORE_NAME,{keyPath:'id',autoIncrement:true});
            objectStore.createIndex('time','time',{unique:false});
        }
    };
    request.onsuccess=function(event){
        db=event.target.result;
        showAllData();
    };
    request.onerror=function(event){
        alert('数据库打开失败：'+event.target.error.message);
    };
}
function removeAllData(){
    while(datatable.firstChild){
        datatable.removeChild(datatable.firstChild);
    }
    var tr=document.createElement('tr');
    var th1=document.createElement('th');
    var th2=document.createElement('th');
    var th3=document.createElement('th');
    th1.innerHTML='用户名';
    th2.innerHTML='留言';
    th3.innerHTML='时间';
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    datatable.appendChild(tr);
}
function showAllData(){
    if(!db){
        alert('数据库未连接');
        return;
    }
    var transaction=db.transaction(STORE_NAME,'readonly');
    var objectStore=transaction.objectStore(STORE_NAME);
    var request=objectStore.getAll();
    request.onsuccess=function(event){
        var data=event.target.result;
        data.sort(function(a, b){
            return b.time-a.time;
        });
        removeAllData();
        for(var i=0;i<data.length;i++){
            showData(data[i]);
        }
    };
    request.onerror=function(event){
        alert('读取数据失败：'+event.target.error.message);
    };
}
function showData(row){
    var tr=document.createElement('tr');
    var td1=document.createElement('td');
    td1.innerHTML=row.name;
    var td2=document.createElement('td');
    if(isAdminMode||(currentUserName&&row.name===currentUserName)){
        td2.innerHTML=row.message+' <span class="del-btn" style="cursor:pointer;color:red;font-weight:bold;margin-left:5px;" data-id="'+row.id+'">×</span>';
    }else{
        td2.innerHTML=row.message;
    }
    var td3=document.createElement('td');
    var t=new Date(row.time);
    td3.innerHTML=t.toLocaleDateString()+' '+t.toLocaleTimeString();
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    datatable.appendChild(tr);
}
function addData(name,message,time){
    if(!db){
        alert('数据库未连接');
        return;
    }
    var transaction=db.transaction(STORE_NAME,'readwrite');
    var objectStore=transaction.objectStore(STORE_NAME);
    var newRecord={name:name,message:message,time:time};
    var request=objectStore.add(newRecord);
    request.onsuccess=function(){
        alert('提交成功！');
        showAllData();
    };
    request.onerror=function(event){
        alert('添加数据失败：'+event.target.error.message);
    };
}
function deleteData(id){
    if(!db){
        alert('数据库未连接');
        return;
    }
    if(!confirm('确定要删除该留言吗？')){
        return;
    }
    var transaction=db.transaction(STORE_NAME,'readwrite');
    var objectStore=transaction.objectStore(STORE_NAME);
    var request=objectStore.delete(id);
    request.onsuccess=function(){
        alert('删除成功！');
        showAllData();
    };
    request.onerror=function(event){
        alert('删除失败：'+event.target.error.message);
    };
}
function saveData(){
    var memo=document.getElementById('memo').value;
    if(!memo){
        alert('留言不能为空！');
        return;
    }
    var name=currentUserName||'匿名';
    var time=new Date().getTime();
    addData(name,memo,time);
}