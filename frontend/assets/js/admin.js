/**
 * 博客后台管理脚本
 * 负责后台管理页面的数据展示、文章管理、评论管理等功能
 */

import dataManager from './api.js';
import { state, actions } from './store/state.js';
import { loading, toast, modal } from './components/index.js';

/**
 * 更新统计数据
 */
async function updateStats() {
    const loadingKey = 'stats';
    try {
        actions.setLoading(loadingKey, true);
        const response = await dataManager.getArticles();
        const articles = response.articles;

        // 计算统计数据
        const totalArticles = articles.length;
        const totalComments = articles.reduce((sum, article) =>
            sum + (article.comments?.length || 0), 0);
        const totalLikes = articles.reduce((sum, article) =>
            sum + (article.likes || 0), 0);

        // 更新显示
        document.getElementById('totalArticles').textContent = totalArticles;
        document.getElementById('totalComments').textContent = totalComments;
        document.getElementById('totalLikes').textContent = totalLikes;
    } catch (error) {
        console.error('Failed to update stats:', error);
        toast.show('获取统计数据失败', 'error');
    } finally {
        actions.setLoading(loadingKey, false);
    }
}

/**
 * 渲染文章列表
 */
async function renderArticles() {
    const loadingKey = 'articles';
    try {
        actions.setLoading(loadingKey, true);
        const response = await dataManager.getArticles();
        const articles = response.articles;
        const categories = response.categories;
        const articlesList = document.getElementById('articlesList');

        // 创建分类映射
        const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

        // 渲染列表
        articlesList.innerHTML = articles.map(article => {
            const category = categoryMap.get(article.categoryId);
            return `
                <div class="article-row">
                    <div class="article-title">${article.title}</div>
                    <div class="article-category">${category?.name || '未分类'}</div>
                    <div class="article-date">${article.formatted_date || new Date(article.date).toLocaleDateString()}</div>
                    <div class="article-stats">
                        <span>👍 ${article.likes || 0}</span>
                        <span>💬 ${article.comments?.length || 0}</span>
                    </div>
                    <div class="article-actions">
                        <button class="action-btn btn-edit" onclick="location.href='editor.html?id=${article.id}'">编辑</button>
                        <button class="action-btn btn-delete" onclick="window.admin.deleteArticle(${article.id})">删除</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to render articles:', error);
        toast.show('获取文章列表失败', 'error');
    } finally {
        actions.setLoading(loadingKey, false);
    }
}

/**
 * 渲染评论列表
 */
async function renderComments() {
    const loadingKey = 'comments';
    try {
        actions.setLoading(loadingKey, true);
        const response = await dataManager.getArticles();
        const articles = response.articles;
        const commentsList = document.getElementById('commentsList');

        // 提取所有评论
        const allComments = articles.flatMap(article =>
            (article.comments || []).map(comment => ({
                ...comment,
                articleTitle: article.title,
                articleId: article.id
            }))
        );

        // 渲染列表
        commentsList.innerHTML = allComments.map(comment => `
            <div class="comment-row">
                <div class="comment-content">
                    <div class="comment-article">${comment.articleTitle}</div>
                    <div class="comment-text">${comment.content}</div>
                </div>
                <div class="comment-date">${comment.formatted_date || new Date(comment.date).toLocaleString()}</div>
                <div class="comment-actions">
                    <button class="action-btn btn-delete" onclick="window.admin.deleteComment(${comment.articleId}, ${comment.id})">
                        删除
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to render comments:', error);
        toast.show('获取评论列表失败', 'error');
    } finally {
        actions.setLoading(loadingKey, false);
    }
}

/**
 * 删除文章
 */
async function deleteArticle(id) {
    const confirmed = await modal.confirm({
        title: '删除文章',
        content: '确定要删除这篇文章吗？删除后将无法恢复。',
        confirmText: '删除',
        cancelText: '取消'
    });

    if (!confirmed) return;

    const loadingKey = `delete-article-${id}`;
    try {
        actions.setLoading(loadingKey, true);
        await dataManager.deleteArticle(id);
        toast.show('文章已删除', 'success');

        // 更新页面数据
        await updateStats();
        await renderArticles();
        await renderComments();
    } catch (error) {
        console.error('Failed to delete article:', error);
        toast.show('删除文章失败', 'error');
    } finally {
        actions.setLoading(loadingKey, false);
    }
}

/**
 * 删除评论
 */
async function deleteComment(articleId, commentId) {
    const confirmed = await modal.confirm({
        title: '删除评论',
        content: '确定要删除这条评论吗？删除后将无法恢复。',
        confirmText: '删除',
        cancelText: '取消'
    });

    if (!confirmed) return;

    const loadingKey = `delete-comment-${articleId}-${commentId}`;
    try {
        actions.setLoading(loadingKey, true);
        await dataManager.deleteComment(articleId, commentId);
        toast.show('评论已删除', 'success');

        // 更新页面数据
        await updateStats();
        await renderComments();
    } catch (error) {
        console.error('Failed to delete comment:', error);
        toast.show('删除评论失败', 'error');
    } finally {
        actions.setLoading(loadingKey, false);
    }
}

/**
 * 初始化菜单切换
 */
function initMenuHandlers() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.target) {
                // 切换菜单激活状态
                document.querySelectorAll('.menu-item').forEach(i =>
                    i.classList.remove('active'));
                item.classList.add('active');

                // 切换内容显示
                document.querySelectorAll('.admin-section').forEach(section => {
                    section.style.display = section.id === item.dataset.target ? 'block' : 'none';
                });
            }
        });
    });
}

/**
 * 检查认证状态
 */
function checkAuth() {
    if (!dataManager.isAuthenticated()) {
        window.location.href = 'admin-login.html';
    }
}

/**
 * 初始化密码修改
 */
function initPasswordForm() {
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 验证新密码
        if (newPassword !== confirmPassword) {
            toast.show('两次输入的新密码不一致', 'error');
            return;
        }

        if (newPassword.length < 6) {
            toast.show('新密码长度不能少于6个字符', 'error');
            return;
        }

        const loadingKey = 'change-password';
        try {
            actions.setLoading(loadingKey, true);
            await dataManager.changePassword(oldPassword, newPassword);
            toast.show('密码修改成功', 'success');
            e.target.reset();
        } catch (error) {
            console.error('Failed to change password:', error);
            toast.show('密码修改失败：' + (error.message || '请重试'), 'error');
        } finally {
            actions.setLoading(loadingKey, false);
        }
    });
}

/**
 * 初始化退出登录
 */
function initLogout() {
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const confirmed = await modal.confirm({
            title: '退出登录',
            content: '确定要退出登录吗？',
            confirmText: '退出',
            cancelText: '取消'
        });

        if (confirmed) {
            dataManager.logout();
            window.location.href = 'admin-login.html';
        }
    });
}

/**
 * 初始化主题
 */
function initTheme() {
    // 从localStorage获取保存的主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    actions.setTheme(savedTheme);

    // 更新主题切换按钮状态
    updateThemeButtons(savedTheme);
}

/**
 * 更新主题切换按钮状态
 */
function updateThemeButtons(currentTheme) {
    const buttons = document.querySelectorAll('.theme-switch .btn');
    buttons.forEach(btn => {
        const theme = btn.getAttribute('data-theme');
        btn.setAttribute('data-active', theme === currentTheme);
    });
}

/**
 * 设置主题
 */
function setTheme(theme) {
    // 如果点击的是当前主题，则不执行任何操作
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (theme === currentTheme) {
        return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    actions.setTheme(theme);
    updateThemeButtons(theme);
    toast.show(`已切换到${theme === 'light' ? '浅色' : '深色'}主题`, 'success');
}

// 初始化页面
async function init() {
    // 检查登录状态
    checkAuth();

    // 初始化主题
    initTheme();

    // 初始化各项功能
    initMenuHandlers();
    initPasswordForm();
    initLogout();

    // 加载初始数据
    await updateStats();
    await renderArticles();
    await renderComments();
}

// 暴露给全局的方法
window.admin = {
    deleteArticle,
    deleteComment,
    setTheme
};

// 启动应用
init(); 