// 统计数据
function updateStats() {
    const articles = ArticleManager.getAll();
    const totalArticles = articles.length;
    const totalComments = articles.reduce((sum, article) => sum + (article.comments?.length || 0), 0);
    const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);

    document.getElementById('totalArticles').textContent = totalArticles;
    document.getElementById('totalComments').textContent = totalComments;
    document.getElementById('totalLikes').textContent = totalLikes;
}

// 渲染文章列表
function renderArticles() {
    const articles = ArticleManager.getAll();
    const articlesList = document.getElementById('articlesList');
    
    articlesList.innerHTML = articles.map((article, index) => `
        <div class="article-row">
            <div class="article-title">${article.title}</div>
            <div class="article-category">${article.category || '未分类'}</div>
            <div class="article-date">${DateFormatter.toLocalDate(article.date)}</div>
            <div class="article-stats">
                <span>👍 ${article.likes || 0}</span>
                <span>💬 ${article.comments?.length || 0}</span>
            </div>
            <div class="article-actions">
                <button class="action-btn btn-edit" onclick="editArticle(${index})">编辑</button>
                <button class="action-btn btn-delete" onclick="deleteArticle(${index})">删除</button>
            </div>
        </div>
    `).join('');
}

// 渲染评论列表
function renderComments() {
    const articles = ArticleManager.getAll();
    const commentsList = document.getElementById('commentsList');
    
    const allComments = articles.flatMap((article, articleIndex) => 
        (article.comments || []).map((comment, commentIndex) => ({
            ...comment,
            articleTitle: article.title,
            articleIndex,
            commentIndex
        }))
    );

    commentsList.innerHTML = allComments.map(comment => `
        <div class="comment-row">
            <div class="comment-content">
                <div class="comment-article">${comment.articleTitle}</div>
                <div class="comment-text">${comment.content}</div>
            </div>
            <div class="comment-date">${DateFormatter.toLocalDateTime(comment.date)}</div>
            <div class="comment-actions">
                <button class="action-btn btn-delete" 
                    onclick="deleteComment(${comment.articleIndex}, ${comment.commentIndex})">
                    删除
                </button>
            </div>
        </div>
    `).join('');
}

// 文章操作
function editArticle(index) {
    window.location.href = `editor.html?id=${index}`;
}

function deleteArticle(index) {
    if (confirm('确定要删除这篇文章吗？')) {
        ArticleManager.delete(index);
        updateStats();
        renderArticles();
        renderComments();
    }
}

// 评论操作
function deleteComment(articleIndex, commentIndex) {
    if (confirm('确定要删除这条评论吗？')) {
        const article = ArticleManager.get(articleIndex);
        article.comments.splice(commentIndex, 1);
        ArticleManager.save();
        updateStats();
        renderComments();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderArticles();
    renderComments();
});

// 菜单切换
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const target = item.dataset.target;
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = section.id === target ? 'block' : 'none';
        });
    });
}); 