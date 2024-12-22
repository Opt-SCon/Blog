/**
 * 后台登录页面脚本
 * 处理管理员登录认证
 */

import dataManager from './api.js';

/**
 * 设置登录按钮状态
 * @param {boolean} loading - 是否为加载状态
 */
function setLoginButtonState(loading) {
    const button = document.getElementById('loginBtn');
    button.disabled = loading;
    button.textContent = loading ? '登录中...' : '登录';
}

/**
 * 显示错误信息
 * @param {string} message - 错误信息
 */
function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

/**
 * 隐藏错误信息
 */
function hideError() {
    const errorDiv = document.getElementById('loginError');
    errorDiv.style.display = 'none';
}

/**
 * 处理登录表单提交
 * @param {Event} e - 表单提交事件
 */
async function handleLogin(e) {
    e.preventDefault();
    hideError();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showError('请输入用户名和密码');
        return;
    }

    setLoginButtonState(true);

    try {
        const result = await dataManager.login(username, password);
        if (result.success) {
            // 登录成功，跳转到后台管理页面
            window.location.href = 'admin.html';
        } else {
            showError('用户名或密码错误');
            setLoginButtonState(false);
        }
    } catch (error) {
        console.error('Login failed:', error);
        showError('登录失败，请重试');
        setLoginButtonState(false);
    }
}

/**
 * 初始化页面
 */
function init() {
    // 检查是否已登录
    if (dataManager.isAuthenticated()) {
        window.location.href = 'admin.html';
        return;
    }

    // 添加表单提交事件监听
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // 添加输入事件监听，隐藏错误信息
    document.getElementById('username').addEventListener('input', hideError);
    document.getElementById('password').addEventListener('input', hideError);
}

// 启动应用
init(); 