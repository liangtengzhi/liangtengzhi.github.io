document.addEventListener('DOMContentLoaded',function(){
    const userDisplay=document.getElementById('userDisplay');
    const loginBtn=document.getElementById('loginBtn');
    const logoutBtn=document.getElementById('logoutBtn');
    const modal=document.getElementById('authModal');
    const closeModal=document.getElementById('closeModal');
    const authTitle=document.getElementById('authTitle');
    const authSubmit=document.getElementById('authSubmit');
    const authSwitch=document.getElementById('authSwitch');
    const authSwitchText=document.getElementById('authSwitchText');
    const authMessage=document.getElementById('authMessage');
    const authForm=document.getElementById('authForm');
    const usernameInput=document.getElementById('authUsername');
    const passwordInput=document.getElementById('authPassword');
    const userPanel=document.getElementById('userPanel');
    const adminPanel=document.getElementById('adminPanel');
    const userTableBody=document.getElementById('userTableBody');
    let isLoginMode=true;
    function updateUI(){
        var user=getCurrentUser();
        if(user){
            userDisplay.textContent='👤 '+user;
            loginBtn.style.display='none';
            logoutBtn.style.display='inline-block';
            if(isAdmin()){
                userPanel.style.display='none';
                adminPanel.style.display='block';
                loadUserList();
            }else{
                userPanel.style.display='block';
                adminPanel.style.display='none';
            }
        }else{
            userDisplay.textContent='';
            loginBtn.style.display='inline-block';
            logoutBtn.style.display='none';
            userPanel.style.display='block';
            adminPanel.style.display='none';
        }
    }
    function loadUserList(){
        var users=getUsers();
        var html='';
        for(var username in users){
            if(users.hasOwnProperty(username)){
                var password=users[username];
                html+='<tr>';
                html+='<td><strong>'+username+'</strong></td>';
                html+='<td><input type="text" class="admin-input" data-original="'+username+'" value="'+username+'" placeholder="新用户名" /></td>';
                html+='<td><input type="text" class="admin-input" data-original="'+username+'" placeholder="新密码（留空不修改）" /></td>';
                html+='<td><button class="admin-btn save-user-btn" data-username="'+username+'">保存修改</button></td>';
                html+='</tr>';
            }
        }
        userTableBody.innerHTML=html;
        var saveBtns=document.querySelectorAll('.save-user-btn');
        for(var i=0;i<saveBtns.length;i++){
            (function(btn){
                btn.addEventListener('click',function(){
                    var tr=this.closest('tr');
                    var originalUsername=this.getAttribute('data-username');
                    var inputs=tr.querySelectorAll('input[type="text"]');
                    var newUsernameInput=inputs[0];
                    var newPasswordInput=inputs[1];
                    var newUsername=newUsernameInput.value.trim();
                    var newPassword=newPasswordInput.value.trim();
                    if(!newUsername){
                        alert('用户名不能为空');
                        return;
                    }
                    var users=getUsers();
                    if(newUsername!==originalUsername && users[newUsername]){
                        alert('用户名 "'+newUsername+'" 已存在');
                        return;
                    }
                    var finalPassword=newPassword||users[originalUsername];
                    delete users[originalUsername];
                    users[newUsername]=finalPassword;
                    saveUsers(users);
                    var currentUser=getCurrentUser();
                    if(currentUser===originalUsername){
                        localStorage.setItem('currentUser_miaomiao',newUsername);
                    }
                    alert('用户信息已更新喵');
                    loadUserList();
                    updateUI();
                });
            })(saveBtns[i]);
        }
    }
    document.getElementById('refreshUserListBtn').addEventListener('click',function(){
        loadUserList();
    });
    function openModal(mode){
        isLoginMode=mode==='login';
        authTitle.textContent=isLoginMode?'登录':'注册';
        authSubmit.textContent=isLoginMode?'登录':'注册';
        authSwitchText.textContent=isLoginMode?'还没有账号？':'已有账号？';
        authSwitch.textContent=isLoginMode?'注册':'登录';
        authMessage.textContent='';
        usernameInput.value='';
        passwordInput.value='';
        modal.style.display='block';
    }
    function closeModalFn(){
        modal.style.display='none';
    }
    function handleAuthSubmit(e){
        e.preventDefault();
        var username=usernameInput.value.trim();
        var password=passwordInput.value.trim();
        if(!username||!password){
            authMessage.textContent='请填写完整信息';
            return;
        }
        var result;
        if(isLoginMode){
            result=login(username,password);
        }else{
            result=register(username,password);
        }
        if(result.success){
            authMessage.textContent=result.message;
            if(isLoginMode){
                closeModalFn();
                updateUI();
            }else{
                authMessage.textContent='注册成功，请登录喵';
                isLoginMode=true;
                authTitle.textContent='登录';
                authSubmit.textContent='登录';
                authSwitchText.textContent='还没有账号？';
                authSwitch.textContent='注册';
                usernameInput.value='';
                passwordInput.value='';
            }
        }else{
            authMessage.textContent=result.message;
        }
    }
    loginBtn.addEventListener('click',function(){openModal('login');});
    logoutBtn.addEventListener('click',function(){
        logout();
        updateUI();
    });
    closeModal.addEventListener('click',closeModalFn);
    window.addEventListener('click',function(e){
        if(e.target===modal) closeModalFn();
    });
    authSwitch.addEventListener('click',function(e){
        e.preventDefault();
        openModal(isLoginMode?'register':'login');
    });
    authForm.addEventListener('submit',handleAuthSubmit);
    updateUI();
});