import dataManager from './api.js';

let currentArticle = null;

// 格式化日期
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

// 渲染文章内容
async function renderArticle(article) {
    document.title = `${article.title} - 博客`;
    
    // 获取分类信息
    const category = await dataManager.getCategoryById(article.categoryId);
    
    // 更新文章内容
    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleContent').innerHTML = article.content;
    document.getElementById('articleCategory').textContent = category?.name || '未分类';
    document.getElementById('articleDate').textContent = formatDate(article.date);
    document.getElementById('articleViews').textContent = `阅读 ${article.views || 0}`;
    document.getElementById('categoryTag').textContent = category?.name || '未分类';
    document.getElementById('publishDate').textContent = formatDate(article.date);
    document.getElementById('viewCount').textContent = article.views || 0;
    document.getElementById('likeCount').textContent = article.likes || 0;
    document.getElementById('commentCount').textContent = article.comments?.length || 0;
    
    // 渲染评论
    renderComments(article.comments || []);
}

// 渲染评论列表
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

// 初始化
async function init() {
    try {
        const params = new URLSearchParams(window.location.search);
        const articleId = parseInt(params.get('id'));
        
        if (!articleId) {
            window.location.href = 'articles.html';
            return;
        }

        currentArticle = await dataManager.getArticleById(articleId);
        if (!currentArticle) {
            throw new Error('Article not found');
        }

        await renderArticle(currentArticle);
    } catch (error) {
        console.error('Failed to load article:', error);
        document.querySelector('.article-container').innerHTML = `
            <div class="error-message">
                <h2>文章加载失败</h2>
                <p>抱歉，无法加载文章内容。</p>
                <button class="btn btn-primary" onclick="window.location.reload()">重试</button>
                <button class="btn" onclick="window.history.back()">返回</button>
            </div>
        `;
    }
}

// 点赞功能
function initLikeButton() {
    document.getElementById('likeBtn').addEventListener('click', async () => {
        try {
            const newLikes = await dataManager.likeArticle(currentArticle.id);
            if (newLikes) {
                document.getElementById('likeCount').textContent = newLikes;
            }
        } catch (error) {
            console.error('Failed to like article:', error);
        }
    });
}

// 评论功能
function initCommentForm() {
    document.getElementById('commentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const textarea = e.target.querySelector('textarea');
        const content = textarea.value.trim();
        
        if (!content) return;

        try {
            const comment = {
                content,
                date: new Date().toISOString()
            };

            await dataManager.addComment(currentArticle.id, comment);
            textarea.value = '';
            
            // 重新获取文章数据并更新显示
            currentArticle = await dataManager.getArticleById(currentArticle.id);
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