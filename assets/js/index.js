// 滚动到文章列表
document.getElementById('scrollHint').addEventListener('click', () => {
    const articlesSection = document.querySelector('.articles');
    articlesSection.scrollIntoView({ behavior: 'smooth' });
});

// 监听滚动，添加文章卡片动画
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

// 监听滚动事件
window.addEventListener('scroll', handleScroll);

// 初始检查是否需要显示动画
handleScroll();

// 渲染文章列表
function renderArticles(articles) {
    const articlesList = document.getElementById('articlesList');
    articlesList.innerHTML = articles.map((article, index) => `
        <div class="article-card" onclick="viewArticle(${index})">
            <h2>${article.title}</h2>
            <p>${article.content.substring(0, 150)}${article.content.length > 150 ? '...' : ''}</p>
            <div class="article-meta">
                <span><i>👍</i>${article.likes || 0}</span>
                <span><i>💬</i>${article.comments?.length || 0}</span>
                <span><i>📅</i>${DateFormatter.toLocalDate(article.date)}</span>
            </div>
        </div>
    `).join('');

    // 渲染完成后检查动画
    handleScroll();
}

// 搜索功能
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredArticles = ArticleManager.getAll().filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm)
    );
    renderArticles(filteredArticles);
});

// 查看文章详情
function viewArticle(index) {
    window.location.href = `article.html?id=${index}`;
}

// 初始化渲染
renderArticles(ArticleManager.getAll()); 