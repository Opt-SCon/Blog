import dataManager from './api.js';

// 更新统计数据
async function updateStats() {
    const articles = await dataManager.getArticles();
    const totalArticles = articles.length;
    const totalComments = articles.reduce((sum, article) => sum + (article.comments?.length || 0), 0);
    const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);

    document.getElementById('totalArticles').textContent = totalArticles;
    document.getElementById('totalComments').textContent = totalComments;
    document.getElementById('totalLikes').textContent = totalLikes;
}

// 渲染文章列表
async function renderArticles() {
    const articles = await dataManager.getArticles();
    const articlesList = document.getElementById('articlesList');
    
    articlesList.innerHTML = await Promise.all(articles.map(async article => {
        const category = await dataManager.getCategoryById(article.categoryId);
        return `
            <div class="article-row">
                <div class="article-title">${article.title}</div>
                <div class="article-category">${category?.name || '未分类'}</div>
                <div class="article-date">${new Date(article.date).toLocaleDateString()}</div>
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

// 渲染评论列表
async function renderComments() {
    const articles = await dataManager.getArticles();
    const commentsList = document.getElementById('commentsList');
    
    const allComments = articles.flatMap(article => 
        (article.comments || []).map(comment => ({
            ...comment,
            articleTitle: article.title,
            articleId: article.id
        }))
    );

    commentsList.innerHTML = allComments.map(comment => `
        <div class="comment-row">
            <div class="comment-content">
                <div class="comment-article">${comment.articleTitle}</div>
                <div class="comment-text">${comment.content}</div>
            </div>
            <div class="comment-date">${new Date(comment.date).toLocaleString()}</div>
            <div class="comment-actions">
                <button class="action-btn btn-delete" onclick="deleteComment(${comment.articleId}, ${comment.id})">
                    删除
                </button>
            </div>
        </div>
    `).join('');
}

// 删除文章
async function deleteArticle(id) {
    if (confirm('确定要删除这篇文章吗？')) {
        try {
            await dataManager.deleteArticle(id);
            await updateStats();
            await renderArticles();
            await renderComments();
        } catch (error) {
            console.error('Failed to delete article:', error);
            alert('删除失败，请重试！');
        }
    }
}

// 删除评论
async function deleteComment(articleId, commentId) {
    if (confirm('确定要删除这条评论吗？')) {
        try {
            await dataManager.deleteComment(articleId, commentId);
            await updateStats();
            await renderComments();
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('删除失败，请重试！');
        }
    }
}

// 初始化菜单切换
function initMenuHandlers() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.target) {
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                document.querySelectorAll('.admin-section').forEach(section => {
                    section.style.display = section.id === item.dataset.target ? 'block' : 'none';
                });
            }
        });
    });
}

// 初始化
async function init() {
    try {
        await updateStats();
        await renderArticles();
        await renderComments();
        initMenuHandlers();
        
        // 将删除方法添加到全局作用域
        window.deleteArticle = deleteArticle;
        window.deleteComment = deleteComment;
    } catch (error) {
        console.error('Failed to initialize admin panel:', error);
        alert('初始化失败，请刷新页面重试！');
    }
}

// 启动应用
init(); 