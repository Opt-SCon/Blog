/**
 * 文章详情页脚本
 * 负责文章内容展示、评论系统、点赞功能
 * 以及阅读量统计等交互功能
 */

import dataManager from './api.js';

/**
 * 会话存储相关常量和全局变量
 */
// 用于存储已访问文章ID的sessionStorage键名
const VIEWED_ARTICLES_KEY = 'viewed_articles';
// 当前文章数据
let currentArticle = null;

/**
 * 检查文章是否已被访问过
 * 用于防止重复计算阅读量
 * 
 * @param {number} articleId - 文章ID
 * @returns {boolean} 是否已访问过
 */
function hasArticleBeenViewed(articleId) {
    const viewedArticles = JSON.parse(sessionStorage.getItem(VIEWED_ARTICLES_KEY) || '[]');
    return viewedArticles.includes(articleId);
}

/**
 * 将文章标记为已访问
 * 在sessionStorage中记录访问历史
 * 
 * @param {number} articleId - 文章ID
 */
function markArticleAsViewed(articleId) {
    const viewedArticles = JSON.parse(sessionStorage.getItem(VIEWED_ARTICLES_KEY) || '[]');
    if (!viewedArticles.includes(articleId)) {
        viewedArticles.push(articleId);
        sessionStorage.setItem(VIEWED_ARTICLES_KEY, JSON.stringify(viewedArticles));
    }
}

/**
 * 格式化日期
 * @param {string} dateString - ISO格式的日期字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * 渲染文章内容
 * 更新页面标题、文章内容、元信息等
 * 
 * @param {Object} article - 文章数据对象
 */
function renderArticle(article) {
    if (!article) return;

    // 更新页面标题
    document.title = `${article.title} - 博客`;

    // 更新文章内容和元信息
    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleContent').innerHTML = article.content;
    document.getElementById('articleCategory').textContent = article.category?.name || '未分类';
    document.getElementById('articleDate').textContent = formatDate(article.date);
    document.getElementById('articleViews').textContent = `阅读 ${article.views || 0}`;
    document.getElementById('categoryTag').textContent = article.category?.name || '未分类';
    document.getElementById('publishDate').textContent = formatDate(article.date);
    document.getElementById('viewCount').textContent = article.views || 0;
    document.getElementById('likeCount').textContent = article.likes || 0;
    document.getElementById('commentCount').textContent = article.comments?.length || 0;

    // 渲染评论列表
    renderComments(article.comments || []);
}

/**
 * 渲染评论列表
 * 将评论数据转换为HTML并插入页面
 * 
 * @param {Array} comments - 评论数据数组
 */
function renderComments(comments) {
    const commentList = document.getElementById('commentList');
    commentList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-content">${comment.content}</div>
            <div class="comment-meta">
                <span>${formatDate(comment.date)}</span>
            </div>
        </div>
    `).join('');
}

/**
 * 设置加载状态
 * @param {boolean} loading - 是否显示加载状态
 */
function setLoading(loading) {
    document.getElementById('loadingSpinner').style.display = loading ? 'flex' : 'none';
    document.getElementById('articleContainer').style.display = loading ? 'none' : 'grid';
}

/**
 * 页面初始化
 * 获取并显示文章内容，处理阅读量统计
 */
async function init() {
    try {
        setLoading(true);
        // 从URL获取文章ID
        const params = new URLSearchParams(window.location.search);
        const articleId = parseInt(params.get('id'));

        if (!articleId) {
            window.location.href = 'articles.html';
            return;
        }

        // 检查是否需要增加阅读量
        const shouldIncrementViews = !hasArticleBeenViewed(articleId);

        // 获取文章数据
        currentArticle = await dataManager.getArticleById(articleId, shouldIncrementViews);

        if (!currentArticle) {
            throw new Error('Article not found');
        }

        // 记录文章访问历史
        if (shouldIncrementViews) {
            markArticleAsViewed(articleId);
        }

        // 渲染文章内容
        renderArticle(currentArticle);
    } catch (error) {
        console.error('Failed to load article:', error);
        // 显示错误信息
        document.querySelector('.article-container').innerHTML = `
            <div class="error-message">
                <h2>文章加载失败</h2>
                <p>抱歉，无法加载文章内容。</p>
                <button class="btn btn-primary" onclick="window.location.reload()">重试</button>
                <button class="btn" onclick="window.history.back()">返回</button>
            </div>
        `;
    } finally {
        setLoading(false);
    }
}

/**
 * 初始化点赞功能
 * 处理点赞按钮的点击事件
 */
function initLikeButton() {
    document.getElementById('likeBtn').addEventListener('click', async () => {
        try {
            const newLikes = await dataManager.likeArticle(currentArticle.id);
            if (newLikes) {
                document.getElementById('likeCount').textContent = newLikes;
                currentArticle.likes = newLikes;
            }
        } catch (error) {
            console.error('Failed to like article:', error);
        }
    });
}

/**
 * 初始化评论功能
 * 处理评论表单的提交事件
 */
function initCommentForm() {
    document.getElementById('commentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const textarea = e.target.querySelector('textarea');
        const content = textarea.value.trim();

        if (!content) return;

        try {
            // 创建新评论
            const comment = {
                content,
                date: new Date().toISOString()
            };

            // 提交评论
            await dataManager.addComment(currentArticle.id, comment);
            textarea.value = '';

            // 重新获取文章数据并更新显示（不增加阅读量）
            currentArticle = await dataManager.getArticleById(currentArticle.id, false);
            renderComments(currentArticle.comments || []);
            document.getElementById('commentCount').textContent = currentArticle.comments.length;
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert('评论发布失败，请重试！');
        }
    });
}

// 启动应用
init();
initLikeButton();
initCommentForm(); 