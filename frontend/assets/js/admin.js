/**
 * 博客后台管理脚本
 * 负责后台管理页面的数据展示、文章管理、评论管理等功能
 * 包括数据统计、列表展示、删除操作等
 */

import dataManager from './api.js';

/**
 * 更新统计数据
 * 计算并显示文章总数、评论总数和点赞总数
 */
async function updateStats() {
    // 获取所有文章数据
    const response = await dataManager.getArticles();
    const articles = response.articles;

    // 计算各项统计数据
    const totalArticles = articles.length;
    const totalComments = articles.reduce((sum, article) =>
        sum + (article.comments?.length || 0), 0);
    const totalLikes = articles.reduce((sum, article) =>
        sum + (article.likes || 0), 0);

    // 更新页面上的统计数字
    document.getElementById('totalArticles').textContent = totalArticles;
    document.getElementById('totalComments').textContent = totalComments;
    document.getElementById('totalLikes').textContent = totalLikes;
}

/**
 * 渲染文章列表
 * 展示所有文章的标题、分类、发布日期和操作按钮
 */
async function renderArticles() {
    // 获取文章数据
    const response = await dataManager.getArticles();
    const articles = response.articles;
    const categories = response.categories;
    const articlesList = document.getElementById('articlesList');

    // 创建分类查找映射
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

    // 渲染文章列表
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
                    <button class="action-btn btn-delete" onclick="deleteArticle(${article.id})">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 渲染评论列表
 * 展示所有文章的评论，包括评论内容、所属文章和发布时间
 */
async function renderComments() {
    // 获取所有文章数据
    const response = await dataManager.getArticles();
    const articles = response.articles;
    const commentsList = document.getElementById('commentsList');

    // 提取并扁平化所有评论数据，添加文章信息
    const allComments = articles.flatMap(article =>
        (article.comments || []).map(comment => ({
            ...comment,
            articleTitle: article.title,
            articleId: article.id
        }))
    );

    // 渲染评论列表
    commentsList.innerHTML = allComments.map(comment => `
        <div class="comment-row">
            <div class="comment-content">
                <div class="comment-article">${comment.articleTitle}</div>
                <div class="comment-text">${comment.content}</div>
            </div>
            <div class="comment-date">${comment.formatted_date || new Date(comment.date).toLocaleString()}</div>
            <div class="comment-actions">
                <button class="action-btn btn-delete" onclick="deleteComment(${comment.articleId}, ${comment.id})">
                    删除
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * 显示确认对话框
 * @param {string} message - 确认信息
 * @returns {Promise<boolean>} 用户选择结果
 */
function showConfirmDialog(message) {
    return new Promise(resolve => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML = `
            <div class="confirm-content">
                <p>${message}</p>
                <div class="confirm-buttons">
                    <button class="btn btn-cancel">取消</button>
                    <button class="btn btn-danger">确认删除</button>
                </div>
            </div>
        `;

        // 添加事件监听
        const confirmBtn = dialog.querySelector('.btn-danger');
        const cancelBtn = dialog.querySelector('.btn-cancel');

        confirmBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
            resolve(true);
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
            resolve(false);
        });

        document.body.appendChild(dialog);
    });
}

/**
 * 删除文章
 * 删除指定ID的文章，并更新相关数据显示
 * 
 * @param {number} id - 要删除的文章ID
 */
async function deleteArticle(id) {
    const confirmed = await showConfirmDialog('确定要删除这篇文章吗？删除后将无法恢复。');
    if (!confirmed) return;

    try {
        // 调用API删除文章
        await dataManager.deleteArticle(id);

        // 更新页面数据
        await updateStats();
        await renderArticles();
        await renderComments();
    } catch (error) {
        console.error('Failed to delete article:', error);
        alert('删除失败，请重试！');
    }
}

/**
 * 删除评论
 * 删除指定文章下的指定评论
 * 
 * @param {number} articleId - 文章ID
 * @param {number} commentId - 评论ID
 */
async function deleteComment(articleId, commentId) {
    const confirmed = await showConfirmDialog('确定要删除这条评论吗？删除后将无法恢复。');
    if (!confirmed) return;

    try {
        // 调用API删除评论
        await dataManager.deleteComment(articleId, commentId);

        // 更新页面数据
        await updateStats();
        await renderComments();
    } catch (error) {
        console.error('Failed to delete comment:', error);
        alert('删除失败，请重试！');
    }
}

/**
 * 初始化菜单切换功能
 * 处理左侧菜单的点击事件和页面切换
 */
function initMenuHandlers() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.target) {
                // 切换菜单项的激活状态
                document.querySelectorAll('.menu-item').forEach(i =>
                    i.classList.remove('active'));
                item.classList.add('active');

                // 切换对应内容区域的显示状态
                document.querySelectorAll('.admin-section').forEach(section => {
                    section.style.display = section.id === item.dataset.target ? 'block' : 'none';
                });
            }
        });
    });
}

/**
 * 检查认证状态
 * 如果未登录则跳转到登录页面
 */
function checkAuth() {
    if (!dataManager.isAuthenticated()) {
        window.location.href = 'admin-login.html';
    }
}

/**
 * 初始化密码修改功能
 * 处理密码修改表单的提交
 */
function initPasswordForm() {
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 验证新密码
        if (newPassword !== confirmPassword) {
            alert('两次输入的新密码不一致');
            return;
        }

        if (newPassword.length < 6) {
            alert('新密码长度不能少于6个字符');
            return;
        }

        try {
            await dataManager.changePassword(oldPassword, newPassword);
            alert('密码修改成功');
            e.target.reset();
        } catch (error) {
            console.error('Failed to change password:', error);
            alert('密码修改失败：' + (error.message || '请重试'));
        }
    });
}

/**
 * 初始化退出登录功能
 */
function initLogout() {
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if (confirm('确定要退出登录吗？')) {
            await dataManager.logout();
        }
    });
}

/**
 * 页面初始化
 * 加载初始数据并设置事件处理程序
 */
async function init() {
    try {
        // 检查认证状态
        checkAuth();

        // 初始化各项数据
        await updateStats();
        await renderArticles();
        await renderComments();

        // 初始化菜单处理
        initMenuHandlers();

        // 初始化密码修改功能
        initPasswordForm();

        // 初始化退出登录功能
        initLogout();

        // 将删除方法添��到全局作用域（供HTML onclick使用）
        window.deleteArticle = deleteArticle;
        window.deleteComment = deleteComment;
    } catch (error) {
        console.error('Failed to initialize admin panel:', error);
        alert('初始化失败，请刷新页面重试！');
    }
}

// 启动应用
init(); 