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
    const articles = await dataManager.getArticles();

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
    const articles = await dataManager.getArticles();
    const articlesList = document.getElementById('articlesList');

    // 异步渲染每篇文章的信息
    articlesList.innerHTML = await Promise.all(articles.map(async article => {
        // 获取文章分类信息
        const category = await dataManager.getCategoryById(article.categoryId);
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
    })).then(rows => rows.join(''));
}

/**
 * 渲染评论列表
 * 展示所有文章的评论，包括评论内容、所属文章和发布时间
 */
async function renderComments() {
    // 获取所有文章数据
    const articles = await dataManager.getArticles();
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
 * 删除文章
 * 删除指定ID的文章，并更新相关数据显示
 * 
 * @param {number} id - 要删除的文章ID
 */
async function deleteArticle(id) {
    if (confirm('确定要删除这篇文章吗？')) {
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
}

/**
 * 删除评论
 * 删除指定文章下的指定评论
 * 
 * @param {number} articleId - 文章ID
 * @param {number} commentId - 评论ID
 */
async function deleteComment(articleId, commentId) {
    if (confirm('确定要删除这条评论吗？')) {
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
 * 页面初始化
 * 加载初始数据并设置事件处理程序
 */
async function init() {
    try {
        // 初始化各项数据
        await updateStats();
        await renderArticles();
        await renderComments();

        // 初始化菜单处理
        initMenuHandlers();

        // 将删除方法添加到全局作用域（供HTML onclick使用）
        window.deleteArticle = deleteArticle;
        window.deleteComment = deleteComment;
    } catch (error) {
        console.error('Failed to initialize admin panel:', error);
        alert('初始化失败，请刷新页面重试！');
    }
}

// 启动应用
init(); 