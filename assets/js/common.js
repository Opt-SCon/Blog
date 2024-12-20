// 存储管理
const Storage = {
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return [];
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    }
};

// 日期格式化
const DateFormatter = {
    toLocalDate: (dateString) => {
        return new Date(dateString).toLocaleDateString();
    },
    
    toLocalDateTime: (dateString) => {
        return new Date(dateString).toLocaleString();
    }
};

// 文章管理
const ArticleManager = {
    articles: Storage.get('articles'),
    
    getAll: function() {
        return this.articles;
    },
    
    get: function(id) {
        return this.articles[id];
    },
    
    add: function(article) {
        this.articles.push(article);
        this.save();
    },
    
    update: function(id, article) {
        this.articles[id] = article;
        this.save();
    },
    
    delete: function(id) {
        this.articles.splice(id, 1);
        this.save();
    },
    
    save: function() {
        Storage.set('articles', this.articles);
    }
};

// URL 参数处理
const UrlParams = {
    get: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
}; 