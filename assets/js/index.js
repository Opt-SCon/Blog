import dataManager from './api.js';

// 渲染文章列表
async function renderArticles(articles) {
    const articlesList = document.getElementById('articlesList');
    
    if (!articles.length) {
        articlesList.innerHTML = `
            <div class="empty-state">
                <h3>暂无文章</h3>
                <p>敬请期待...</p>
            </div>
        `;
        return;
    }

    articlesList.innerHTML = await Promise.all(articles.map(async article => {
        const category = await dataManager.getCategoryById(article.categoryId);
        return `
            <div class="article-card" onclick="window.location.href='article.html?id=${article.id}'">
                <h2>${article.title}</h2>
                <p>${article.content.substring(0, 150)}${article.content.length > 150 ? '...' : ''}</p>
                <div class="article-meta">
                    <span class="category-tag">${category?.name || '未分类'}</span>
                    <div class="meta-stats">
                        <span><i>👍</i>${article.likes || 0}</span>
                        <span><i>💬</i>${article.comments?.length || 0}</span>
                        <span><i>📅</i>${new Date(article.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;
    })).then(cards => cards.join(''));

    // 添加动画效果
    const cards = document.querySelectorAll('.article-card');
    cards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.8s ease ${index * 0.1}s forwards`;
    });
}

// 搜索功能
let searchTimeout;
function initSearchHandler() {
    document.getElementById('searchInput').addEventListener('input', async (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        // 防抖处理
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const filteredArticles = await dataManager.searchArticles(searchTerm);
            renderArticles(filteredArticles);
        }, 300);
    });
}

// 滚动动画
function handleScroll() {
    const cards = document.querySelectorAll('.article-card');
    const search = document.querySelector('.search');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 控制搜索框样式
    if (scrollTop > window.innerHeight * 0.5) {
        search.classList.add('scrolled');
    } else {
        search.classList.remove('scrolled');
    }
    
    cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (cardTop < windowHeight * 0.85) {
            card.style.animation = 'fadeInUp 0.8s ease forwards';
        }
    });
}

// 滚动提示
function initScrollHint() {
    document.getElementById('scrollHint').addEventListener('click', () => {
        const articlesSection = document.querySelector('.articles');
        articlesSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// 初始化
async function init() {
    try {
        const articles = await dataManager.getArticles();
        await renderArticles(articles);
        initSearchHandler();
        initScrollHint();
        window.addEventListener('scroll', handleScroll);
    } catch (error) {
        console.error('Failed to initialize homepage:', error);
        document.getElementById('articlesList').innerHTML = `
            <div class="error-message">
                <h3>加载失败</h3>
                <p>抱歉，无法加载文章列表。</p>
                <button onclick="window.location.reload()" class="btn-retry">重试</button>
            </div>
        `;
    }
}

// 启动应用
init(); 