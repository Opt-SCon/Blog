/**
 * 博客前端API模块
 * 提供与后端API交互的所有方法
 * 使用单例模式确保全局只有一个实例
 */

// API基础URL配置
const API_BASE_URL = 'http://localhost:5050/api';

/**
 * 数据管理器类
 * 封装所有与后端API的交互方法
 */
class DataManager {
    constructor() {
        this.initialized = false;
        this.initPromise = null;
    }

    /**
     * 基础HTTP请求方法
     * 处理所有API请求的通用逻辑
     * 
     * @param {string} endpoint - API端点路径
     * @param {object} options - 请求配置选项
     * @returns {Promise<any>} 请求响应数据
     * @throws {Error} 当API请求失败时抛出错误
     */
    async request(endpoint, options = {}) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            credentials: 'include',  // 支持跨域认证
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            mode: 'cors'  // 启用CORS
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        // 处理无内容响应
        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    /**
     * 文章相关API方法
     */

    /**
     * 获取所有文章列表
     * @returns {Promise<Array>} 文章列表
     */
    async getArticles() {
        return this.request('/articles');
    }

    /**
     * 获取指定ID的文章详情
     * @param {number} id - 文章ID
     * @param {boolean} incrementViews - 是否增加阅读量
     * @returns {Promise<Object>} 文章详情
     */
    async getArticleById(id, incrementViews = false) {
        const endpoint = incrementViews
            ? `/articles/${id}?increment_views=true`
            : `/articles/${id}`;
        return this.request(endpoint);
    }

    /**
     * 创建新文章
     * @param {Object} article - 文章数据
     * @returns {Promise<Object>} 创建的文章
     */
    async addArticle(article) {
        return this.request('/articles', {
            method: 'POST',
            body: JSON.stringify(article)
        });
    }

    /**
     * 更新现有文章
     * @param {number} id - 文章ID
     * @param {Object} article - 更新的文章数据
     * @returns {Promise<Object>} 更新后的文章
     */
    async updateArticle(id, article) {
        return this.request(`/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(article)
        });
    }

    /**
     * 删除文章
     * @param {number} id - 文章ID
     * @returns {Promise<null>} 
     */
    async deleteArticle(id) {
        return this.request(`/articles/${id}`, {
            method: 'DELETE'
        });
    }

    /**
     * 评论相关API方法
     */

    /**
     * 添加评论
     * @param {number} articleId - 文章ID
     * @param {Object} comment - 评论数据
     * @returns {Promise<Object>} 创建的评论
     */
    async addComment(articleId, comment) {
        return this.request(`/articles/${articleId}/comments`, {
            method: 'POST',
            body: JSON.stringify(comment)
        });
    }

    /**
     * 删除评论
     * @param {number} articleId - 文章ID
     * @param {number} commentId - 评论ID
     * @returns {Promise<null>}
     */
    async deleteComment(articleId, commentId) {
        return this.request(`/articles/${articleId}/comments/${commentId}`, {
            method: 'DELETE'
        });
    }

    /**
     * 点赞功能
     * @param {number} id - 文章ID
     * @returns {Promise<number>} 更新后的点赞数
     */
    async likeArticle(id) {
        const response = await this.request(`/articles/${id}/like`, {
            method: 'POST'
        });
        return response.likes;
    }

    /**
     * 分类相关API方法
     */

    /**
     * 获取所有分类
     * @returns {Promise<Array>} 分类列表
     */
    async getCategories() {
        return this.request('/categories');
    }

    /**
     * 根据ID获取分类信息
     * @param {number} id - 分类ID
     * @returns {Promise<Object>} 分类信息
     */
    async getCategoryById(id) {
        const categories = await this.getCategories();
        return categories.find(category => category.id === parseInt(id));
    }

    /**
     * 搜索功能
     * 在文章标题和内容中搜索关键词
     * 
     * @param {string} query - 搜索关键词
     * @returns {Promise<Array>} 匹配的文章列表
     */
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

    /**
     * 分类过滤
     * 按分类筛选文章
     * 
     * @param {string|number} categoryId - 分类ID，'all'表示所有分类
     * @returns {Promise<Array>} 过滤后的文章列表
     */
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