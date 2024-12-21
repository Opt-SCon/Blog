import dataManager from './api.js';

// 使用 sessionStorage 来存储已访问的文章信息
const VIEWED_ARTICLES_KEY = 'viewed_articles';
let currentArticle = null;
let currentCategory = null;

// 检查文章是否已被访问过
function hasArticleBeenViewed(articleId) {
    const viewedArticles = JSON.parse(sessionStorage.getItem(VIEWED_ARTICLES_KEY) || '[]');
    return viewedArticles.includes(articleId);
}

// 标记文章为已访问
function markArticleAsViewed(articleId) {
    const viewedArticles = JSON.parse(sessionStorage.getItem(VIEWED_ARTICLES_KEY) || '[]');
    if (!viewedArticles.includes(articleId)) {
        viewedArticles.push(articleId);
        sessionStorage.setItem(VIEWED_ARTICLES_KEY, JSON.stringify(viewedArticles));
    }
}

// 渲染文章内容
async function renderArticle(article) {
    if (!article) return;

    document.title = `${article.title} - 博客`;

    // 获取分类信息（如果还没有获取）
    if (!currentCategory) {
        currentCategory = await dataManager.getCategoryById(article.categoryId);
    }

    // 更新文章内容
    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleContent').innerHTML = article.content;
    document.getElementById('articleCategory').textContent = currentCategory?.name || '未分类';
    document.getElementById('articleDate').textContent = article.formatted_date;
    document.getElementById('articleViews').textContent = `阅读 ${article.views || 0}`;
    document.getElementById('categoryTag').textContent = currentCategory?.name || '未分类';
    document.getElementById('publishDate').textContent = article.formatted_date;
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
                <span>${comment.formatted_date}</span>
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

        // 检查文章是否已被访问过
        const shouldIncrementViews = !hasArticleBeenViewed(articleId);

        // 获取文章数据
        currentArticle = await dataManager.getArticleById(articleId, shouldIncrementViews);

        if (!currentArticle) {
            throw new Error('Article not found');
        }

        // 如果是新访问，标记文章为已访问
        if (shouldIncrementViews) {
            markArticleAsViewed(articleId);
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
                currentArticle.likes = newLikes;
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