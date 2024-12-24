/**
 * 博客前端API模块
 * 提供与后端API交互的所有方法
 * 使用单例模式确保全局只有一个实例
 */

import config from './config.js';

/**
 * 自定义API错误类
 */
class APIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

/**
 * 数据管理器类
 * 封装所有与后端API的交互方法
 */
class DataManager {
    constructor() {
        this.initialized = false;
        this.initPromise = null;
        this.baseURL = config.API_BASE_URL;
        this.categoriesCache = null;
    }

    /**
     * 基础HTTP请求方法
     * 处理所有API请求的通用逻辑
     * 
     * @param {string} endpoint - API端点路径
     * @param {object} options - 请求配置选项
     * @returns {Promise<any>} 请求响应数据
     * @throws {APIError} 当API请求失败时抛出错误
     */
    async request(endpoint, options = {}) {
        try {
            const token = this.getAuthToken();
            if (token) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                };
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                mode: 'cors'
            });

            // 处理认证失败
            if (response.status === 401) {
                localStorage.removeItem('auth_token');
                if (window.location.pathname !== '/admin-login.html') {
                    window.location.href = 'admin-login.html';
                }
                throw new APIError('Authentication failed', 401);
            }

            // 处理无内容响应
            if (response.status === 204) {
                return null;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new APIError(
                    data.error || 'API request failed',
                    response.status,
                    data
                );
            }

            return data;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(
                'Network error or server is unreachable',
                0,
                { originalError: error.message }
            );
        }
    }

    /**
     * 上传文件
     * @param {string} endpoint - API端点路径
     * @param {FormData} formData - 包含文件的FormData对象
     * @returns {Promise<any>} 上传响应数据
     */
    async uploadFile(endpoint, formData) {
        try {
            const token = this.getAuthToken();
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers,
                mode: 'cors'
            });

            if (response.status === 401) {
                localStorage.removeItem('auth_token');
                if (window.location.pathname !== '/admin-login.html') {
                    window.location.href = 'admin-login.html';
                }
                throw new APIError('Authentication failed', 401);
            }

            const data = await response.json();

            if (!response.ok) {
                throw new APIError(
                    data.error || 'Upload failed',
                    response.status,
                    data
                );
            }

            return data;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(
                'Network error or server is unreachable',
                0,
                { originalError: error.message }
            );
        }
    }

    /**
     * 获取认证令牌
     * @returns {string|null} 认证令牌
     */
    getAuthToken() {
        return localStorage.getItem('auth_token');
    }

    /**
     * 文章相关API方法
     */

    /**
     * 获取所有文章列表
     * @returns {Promise<{articles: Array, categories: Array}>} 文章列表和分类列表
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
        const response = await this.request('/articles');
        return response.categories;
    }

    /**
     * 上传图片
     * @param {File} file - 图片文件
     * @returns {Promise<{filename: string, url: string}>} 上传结果
     */
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        return this.uploadFile('/upload/image', formData);
    }

    /**
     * 认证相关API方法
     */

    /**
     * 检查是否已有管理员账号
     * @returns {Promise<boolean>} 是否已有管理员
     */
    async checkAdmin() {
        try {
            const response = await this.request('/auth/check-admin');
            return response.hasAdmin;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    /**
     * 注册管理员账号
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<Object>} 注册结果，包含token
     */
    async register(username, password) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
        }
        return response;
    }

    /**
     * 检查用户是否已认证
     * @returns {Promise<boolean>} 是否已认证
     */
    async isAuthenticated() {
        try {
            const token = this.getAuthToken();
            if (!token) {
                return false;
            }
            // 验证token有效性
            await this.request('/auth/verify');
            return true;
        } catch (error) {
            if (error.status === 401) {
                localStorage.removeItem('auth_token');
            }
            return false;
        }
    }

    /**
     * 管理员登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<Object>} 登录结果，包含token
     */
    async login(username, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
        }
        return response;
    }

    /**
     * 退出登录
     * @returns {Promise<null>}
     */
    async logout() {
        localStorage.removeItem('auth_token');
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    /**
     * 修改密码
     * @param {string} oldPassword - 旧密码
     * @param {string} newPassword - 新密码
     * @returns {Promise<Object>} 修改结果
     */
    async changePassword(oldPassword, newPassword) {
        return this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ oldPassword, newPassword })
        });
    }

    /**
     * 根据ID获取分类信息
     * @param {number} id - 分类ID
     * @returns {Promise<Object>} 分类信息
     */
    async getCategoryById(id) {
        const categories = await this.getCategories();
        return categories.find(category => category.id === id) || null;
    }
}

// 导出单例实例
export default new DataManager(); 