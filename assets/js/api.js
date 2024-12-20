// API 配置
const API = {
    STORAGE_KEYS: {
        ARTICLES: 'blog_articles',
        CATEGORIES: 'blog_categories'
    },
    // 缓存相关配置
    CACHE: {
        VERSION: '1.0',
        KEY_PREFIX: 'blog_'
    },
    // 初始数据
    INITIAL_DATA: {
        articles: [
            {
                id: 1,
                title: "第一篇博客文章",
                content: "欢迎来到我的博客！这是第一篇文章...",
                categoryId: 1,
                date: "2024-01-01T12:00:00.000Z",
                likes: 5,
                views: 10,
                comments: []
            }
        ],
        categories: [
            {
                id: 1,
                name: "技术",
                description: "技术相关文章"
            },
            {
                id: 2,
                name: "生活",
                description: "生活随笔"
            }
        ]
    }
};

// 工具函数
const utils = {
    // 生成唯一ID
    generateId: (items) => Math.max(0, ...items.map(item => item.id)) + 1,
    // 格式化日期
    formatDate: (date) => new Date(date).toISOString(),
    // 验证ID是否有效
    isValidId: (id) => !isNaN(parseInt(id)) && id > 0
};

// 添加自定义错误类
class BlogError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'BlogError';
        this.code = code;
    }
}

class DataManager {
    constructor() {
        this.articles = [];
        this.categories = [];
        this.initialized = false;
        this.initPromise = null;
        this.version = API.CACHE.VERSION;
        this.cache = new Map();
    }

    // 初始化数据
    async init() {
        if (this.initialized) return;

        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            try {
                const success = this.loadFromStorage();
                if (!success) {
                    // 如果没有存储数据，使用初始数据
                    this.articles = API.INITIAL_DATA.articles;
                    this.categories = API.INITIAL_DATA.categories;
                    this.updateStorage();
                }
                this.initialized = true;
            } catch (error) {
                console.error('Failed to initialize data:', error);
                throw error;
            }
        })();

        return this.initPromise;
    }

    // 从 localStorage 加载数据
    loadFromStorage() {
        try {
            const storedArticles = localStorage.getItem(API.STORAGE_KEYS.ARTICLES);
            const storedCategories = localStorage.getItem(API.STORAGE_KEYS.CATEGORIES);

            if (!storedArticles || !storedCategories) return false;

            this.articles = JSON.parse(storedArticles);
            this.categories = JSON.parse(storedCategories);
            return true;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return false;
        }
    }

    // 更新存储
    updateStorage() {
        try {
            localStorage.setItem(API.STORAGE_KEYS.ARTICLES, JSON.stringify(this.articles));
            localStorage.setItem(API.STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
        } catch (error) {
            console.error('Error updating storage:', error);
        }
    }

    // 确保初始化
    async ensureInit() {
        if (!this.initialized) {
            await this.init();
        }
    }

    // 文章相关方法
    async getArticles() {
        await this.ensureInit();
        return this.articles;
    }

    async getArticleById(id) {
        await this.ensureInit();
        if (!utils.isValidId(id)) {
            throw new BlogError('Invalid article ID', 'INVALID_ID');
        }
        const article = this.articles.find(article => article.id === parseInt(id));
        if (!article) {
            throw new BlogError('Article not found', 'NOT_FOUND');
        }
        article.views = (article.views || 0) + 1;
        this.updateStorage();
        return article;
    }

    async addArticle(article) {
        await this.ensureInit();
        article.id = utils.generateId(this.articles);
        article.date = utils.formatDate(new Date());
        article.likes = 0;
        article.views = 0;
        article.comments = [];

        this.articles.unshift(article);
        this.updateStorage();
        return article;
    }

    async updateArticle(id, updatedArticle) {
        await this.ensureInit();
        const index = this.articles.findIndex(article => article.id === parseInt(id));
        if (index === -1) return null;

        this.articles[index] = {
            ...this.articles[index],
            ...updatedArticle,
            id: parseInt(id)
        };
        this.updateStorage();
        return this.articles[index];
    }

    async deleteArticle(id) {
        await this.ensureInit();
        const index = this.articles.findIndex(article => article.id === parseInt(id));
        if (index === -1) return false;

        this.articles.splice(index, 1);
        this.updateStorage();
        return true;
    }

    // 分类相关方法
    async getCategories() {
        await this.ensureInit();
        const cacheKey = 'categories';
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        this.setCache(cacheKey, this.categories);
        return this.categories;
    }

    async getCategoryById(id) {
        await this.ensureInit();
        return this.categories.find(category => category.id === parseInt(id));
    }

    // 评论相关方法
    async addComment(articleId, comment) {
        await this.ensureInit();
        const article = await this.getArticleById(articleId);
        if (!article) return false;

        comment.id = Math.max(0, ...(article.comments || []).map(c => c.id)) + 1;
        article.comments = article.comments || [];
        article.comments.push(comment);
        this.updateStorage();
        return true;
    }

    async deleteComment(articleId, commentId) {
        await this.ensureInit();
        const article = await this.getArticleById(articleId);
        if (!article || !article.comments) return false;

        const index = article.comments.findIndex(c => c.id === parseInt(commentId));
        if (index === -1) return false;

        article.comments.splice(index, 1);
        this.updateStorage();
        return true;
    }

    // 搜索和过滤方法
    async searchArticles(query) {
        await this.ensureInit();
        if (!query) return this.articles;

        query = query.toLowerCase().trim();
        const words = query.split(/\s+/);

        return this.articles.filter(article => {
            const title = article.title.toLowerCase();
            const content = article.content.toLowerCase();
            return words.every(word =>
                title.includes(word) || content.includes(word)
            );
        });
    }

    async filterByCategory(categoryId) {
        await this.ensureInit();
        if (categoryId === 'all') return this.articles;
        return this.articles.filter(article => article.categoryId === parseInt(categoryId));
    }

    // 点赞相关方法     
    async likeArticle(id) {
        await this.ensureInit();
        const article = await this.getArticleById(id);
        if (!article) return false;

        article.likes = (article.likes || 0) + 1;
        this.updateStorage();
        return article.likes;
    }

    // 添加缓存方法
    getCached(key, ttl = 60000) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
}

// 创建单例实例
const dataManager = new DataManager();

// 导出实例
export default dataManager; 