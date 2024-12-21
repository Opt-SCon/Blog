const API_BASE_URL = 'http://localhost:5000/api';

class DataManager {
    constructor() {
        this.initialized = false;
        this.initPromise = null;
    }

    // 基础请求方法
    async request(endpoint, options = {}) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    // 文章相关方法
    async getArticles() {
        return this.request('/articles');
    }

    async getArticleById(id, incrementViews = false) {
        const endpoint = incrementViews
            ? `/articles/${id}?increment_views=true`
            : `/articles/${id}`;
        return this.request(endpoint);
    }

    async addArticle(article) {
        return this.request('/articles', {
            method: 'POST',
            body: JSON.stringify(article)
        });
    }

    async updateArticle(id, article) {
        return this.request(`/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(article)
        });
    }

    async deleteArticle(id) {
        return this.request(`/articles/${id}`, {
            method: 'DELETE'
        });
    }

    // 评论相关方法
    async addComment(articleId, comment) {
        return this.request(`/articles/${articleId}/comments`, {
            method: 'POST',
            body: JSON.stringify(comment)
        });
    }

    async deleteComment(articleId, commentId) {
        return this.request(`/articles/${articleId}/comments/${commentId}`, {
            method: 'DELETE'
        });
    }

    // 点赞功能
    async likeArticle(id) {
        const response = await this.request(`/articles/${id}/like`, {
            method: 'POST'
        });
        return response.likes;
    }

    // 分类相关方法
    async getCategories() {
        return this.request('/categories');
    }

    async getCategoryById(id) {
        const categories = await this.getCategories();
        return categories.find(category => category.id === parseInt(id));
    }

    // 搜索功能
    async searchArticles(query) {
        const articles = await this.getArticles();
        if (!query) return articles;

        query = query.toLowerCase().trim();
        const words = query.split(/\s+/);

        return articles.filter(article => {
            const title = article.title.toLowerCase();
            const content = article.content.toLowerCase();
            return words.every(word =>
                title.includes(word) || content.includes(word)
            );
        });
    }

    // 分类过滤
    async filterByCategory(categoryId) {
        const articles = await this.getArticles();
        if (categoryId === 'all') return articles;
        return articles.filter(article => article.categoryId === parseInt(categoryId));
    }
}

// 创建单例实例
const dataManager = new DataManager();

// 导出实例
export default dataManager; 