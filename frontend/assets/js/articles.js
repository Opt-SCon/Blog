import dataManager from './api.js';

let currentCategory = 'all';
let searchTerm = '';
let isLoading = false;

// 显示/隐藏加载状态
function setLoading(loading) {
    isLoading = loading;
    document.getElementById('loadingSpinner').style.display = loading ? 'flex' : 'none';
}

// 渲染分类按钮
async function renderCategories() {
    const categories = await dataManager.getCategories();
    const categoryFilter = document.getElementById('categoryFilter');

    // 清空现有按钮并添加"全部"按钮
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.dataset.category = 'all';
    allBtn.textContent = '全部';
    allBtn.addEventListener('click', () => filterArticles('all'));
    categoryFilter.innerHTML = '';
    categoryFilter.appendChild(allBtn);

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.dataset.category = category.id;
        btn.textContent = category.name;
        btn.addEventListener('click', () => filterArticles(category.id));
        categoryFilter.appendChild(btn);
    });
}

// 渲染文章列表
async function renderArticles(articles) {
    const grid = document.getElementById('articlesGrid');

    if (articles.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>暂无文章</h3>
                <p>换个关键词试试？</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = await Promise.all(articles.map(async article => {
        const category = await dataManager.getCategoryById(article.categoryId);
        return `
            <article class="article-card" onclick="location.href='article.html?id=${article.id}'">
                <div class="article-content">
                    <span class="category-tag">${category?.name || '未分类'}</span>
                    <h2>${article.title}</h2>
                    <p>${article.summary || article.content.substring(0, 150)}${article.content.length > 150 ? '...' : ''}</p>
                </div>
                <div class="article-meta">
                    <div class="meta-stats">
                        <span title="点赞数">👍 ${article.likes || 0}</span>
                        <span title="评论数">💬 ${article.comments?.length || 0}</span>
                        <span title="阅读数">👀 ${article.views || 0}</span>
                    </div>
                    <div class="meta-date">
                        <span>${article.formatted_date || new Date(article.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </article>
        `;
    })).then(cards => cards.join(''));

    // 添加动画效果
    const cards = document.querySelectorAll('.article-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// 过滤文章
async function filterArticles(categoryId) {
    try {
        setLoading(true);
        currentCategory = categoryId;

        // 更新按钮状态
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (categoryId === 'all' && btn.dataset.category === 'all' ||
                categoryId !== 'all' && btn.dataset.category === String(categoryId)) {
                btn.classList.add('active');
            }
        });

        // 应用过滤和搜索
        await applyFilters();
    } catch (error) {
        console.error('Failed to filter articles:', error);
        showError('过滤文章失败，请重试');
    } finally {
        setLoading(false);
    }
}

// 搜索功能
let searchTimeout;
function initSearchHandler() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();

        // 防抖处理
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => applyFilters(), 300);
    });
}

// 应用过滤和搜索
async function applyFilters() {
    try {
        setLoading(true);
        let filteredArticles = await dataManager.getArticles();

        // 应用分类过滤
        if (currentCategory !== 'all') {
            filteredArticles = await dataManager.filterByCategory(parseInt(currentCategory));
        }

        // 应用搜索过滤
        if (searchTerm) {
            filteredArticles = filteredArticles.filter(article =>
                article.title.toLowerCase().includes(searchTerm) ||
                article.content.toLowerCase().includes(searchTerm)
            );
        }

        await renderArticles(filteredArticles);
    } catch (error) {
        console.error('Failed to apply filters:', error);
        showError('加载文章失败，请重试');
    } finally {
        setLoading(false);
    }
}

// 显示错误信息
function showError(message) {
    const grid = document.getElementById('articlesGrid');
    grid.innerHTML = `
        <div class="error-message">
            <h3>出错了！</h3>
            <p>${message}</p>
            <button onclick="window.location.reload()" class="btn-retry">重试</button>
        </div>
    `;
}

// 初始化
async function init() {
    try {
        setLoading(true);
        await renderCategories();
        await applyFilters();
        initSearchHandler();
    } catch (error) {
        console.error('Failed to initialize articles page:', error);
        showError('初始化失败，请刷新页面重试');
    } finally {
        setLoading(false);
    }
}

// 启动应用
init(); 