/**
 * 博客首页脚本
 * 负责首页的文章列表展示、搜索功能和滚动动画效果
 */

import dataManager from './api.js';

// 存储文章和分类数据
let articles = [];
let categories = [];

/**
 * 渲染文章列表
 * 将文章数据渲染为卡片形式的HTML
 * 包含文章标题、摘要、分类、点赞数、评论数和发布日期
 * 
 * @param {Array} filteredArticles - 过滤后的文章列表数据
 */
function renderArticles(filteredArticles) {
    const articlesList = document.getElementById('articlesList');

    // 处理空数据状态
    if (!filteredArticles.length) {
        articlesList.innerHTML = `
            <div class="empty-state">
                <h3>暂无文章</h3>
                <p>敬请期待...</p>
            </div>
        `;
        return;
    }

    // 渲染所有文章卡片
    articlesList.innerHTML = filteredArticles.map(article => `
        <div class="article-card" onclick="window.location.href='article.html?id=${article.id}'">
            <h2>${article.title}</h2>
            <p>${article.summary || ''}</p>
            <div class="article-meta">
                <span class="category-tag">${article.category?.name || '未分类'}</span>
                <div class="meta-stats">
                    <span><i>👍</i>${article.likes || 0}</span>
                    <span><i>💬</i>${article.comments?.length || 0}</span>
                    <span><i>📅</i>${article.formatted_date || new Date(article.date).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    `).join('');

    // 为卡片添加渐入动画效果
    const cards = document.querySelectorAll('.article-card');
    cards.forEach((card, index) => {
        card.style.animation = `fadeInUp 0.8s ease ${index * 0.1}s forwards`;
    });
}

/**
 * 搜索功能
 * 实现文章搜索的防抖处理
 * 当用户停止输入300ms后才执行搜索
 */
let searchTimeout;
function initSearchHandler() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        // 防抖处理：清除之前的定时器
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            // 在本地过滤文章
            const filteredArticles = articles.filter(article =>
                article.title.toLowerCase().includes(searchTerm) ||
                article.content.toLowerCase().includes(searchTerm)
            );
            renderArticles(filteredArticles);
        }, 300);
    });
}

/**
 * 滚动处理
 * 处理页面滚动时的视觉效果
 * 1. 控制搜索框的吸顶效果
 * 2. 处理文章卡片的滚动动画
 */
function handleScroll() {
    const cards = document.querySelectorAll('.article-card');
    const search = document.querySelector('.search');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 控制搜索框的吸顶样式
    if (scrollTop > window.innerHeight * 0.5) {
        search.classList.add('scrolled');
    } else {
        search.classList.remove('scrolled');
    }

    // 处理文章卡片的滚动动画
    cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // 当卡片进入视口时添加动画
        if (cardTop < windowHeight * 0.85 && cardTop > -card.offsetHeight) {
            if (!card.classList.contains('animated')) {
                card.classList.add('animated');
                card.style.animation = 'fadeInUp 0.8s ease forwards';
            }
        } else {
            // 当卡片离开视口时重置动画状态
            card.classList.remove('animated');
            card.style.animation = 'none';
            card.style.opacity = '0';
        }
    });
}

/**
 * 初始化滚动提示
 * 点击滚动提示时平滑滚动到文章列表区域
 */
function initScrollHint() {
    document.getElementById('scrollHint').addEventListener('click', () => {
        const articlesSection = document.querySelector('.articles');
        articlesSection.scrollIntoView({ behavior: 'smooth' });
    });
}

/**
 * 渲染分类统计
 * 在首页显示分类及其文章数量
 */
function renderCategoryStats() {
    const statsContainer = document.querySelector('.category-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = categories
        .sort((a, b) => b.article_count - a.article_count)
        .map(category => `
            <div class="category-stat">
                <span class="category-name">${category.name}</span>
                <span class="article-count">${category.article_count} 篇</span>
            </div>
        `).join('');
}

/**
 * 页面初始化
 * 加载文章数据并初始化各项功能
 * 包含错误处理机制
 */
async function init() {
    try {
        // 加载文章和分类数据
        const data = await dataManager.getArticles();
        articles = data.articles;
        categories = data.categories;

        // 渲染文章列表和分类统计
        renderArticles(articles);
        renderCategoryStats();

        // 初始化各项功能
        initSearchHandler();
        initScrollHint();
        window.addEventListener('scroll', handleScroll);

        // 初始触发一次滚动检查
        handleScroll();
    } catch (error) {
        console.error('Failed to initialize homepage:', error);
        // 显示错误信息
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