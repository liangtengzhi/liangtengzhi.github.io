const STORAGE_KEY='users_miaomiao';
const CURRENT_USER_KEY='currentUser_miaomiao';
function initAdmin(){
    var users=getUsers();
    if(!users['Admin']){
        users['Admin']='Admin';
        saveUsers(users);
    }
}
initAdmin();
function getUsers(){
    const data=localStorage.getItem(STORAGE_KEY);
    return data?JSON.parse(data):{};
}
function saveUsers(users){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(users));
}
function register(username,password){
    if(username.toLowerCase()==='admin'){
        return {success:false,message:'该用户名不可用'};
    }
    const users=getUsers();
    if(users[username]){
        return {success:false,message:'用户名已存在'};
    }
    if(username.length<2){
        return {success:false,message:'用户名至少2个字符'};
    }
    if(password.length<3) {
        return {success:false,message:'密码至少3个字符'};
    }
    users[username]=password;
    saveUsers(users);
    return {success:true,message:'注册成功'};
}
function login(username,password){
    const users=getUsers();
    if(!users[username]){
        return {success:false,message:'用户不存在'};
    }
    if(users[username]!==password){
        return {success:false,message:'密码错误'};
    }
    localStorage.setItem(CURRENT_USER_KEY,username);
    return {success:true,message:'登录成功'};
}
function logout(){
    localStorage.removeItem(CURRENT_USER_KEY);
}
function getCurrentUser(){
    return localStorage.getItem(CURRENT_USER_KEY)||null;
}
function isAdmin(){
    return getCurrentUser()==='Admin';
}
function requireLogin() {
    const user=getCurrentUser();
    if(!user){
        alert('请先登录');
        window.location.href='../index.html';
        return false;
    }
    return true;
}
