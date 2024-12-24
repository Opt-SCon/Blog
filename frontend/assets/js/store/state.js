/**
 * 全局状态管理模块
 */

// 状态订阅者
const subscribers = new Set();

// 全局状态
export const state = {
    // 加载状态
    loading: {
        global: false,
        requests: new Map()
    },
    // 通知消息队列
    notifications: [],
    // 当前用户信息
    user: null,
    // 全局配置
    config: {
        theme: 'light'
    }
};

// 状态变更通知
function notifySubscribers() {
    subscribers.forEach(callback => callback(state));
}

// 状态操作方法
export const actions = {
    // 设置加载状态
    setLoading(key, value) {
        state.loading.requests.set(key, value);
        state.loading.global = Array.from(state.loading.requests.values()).some(v => v);
        notifySubscribers();
    },

    // 显示通知
    showNotification(message, type = 'info', duration = 3000) {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };
        state.notifications.push(notification);
        notifySubscribers();

        // 自动移除通知
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, duration);
        }
    },

    // 移除通知
    removeNotification(id) {
        state.notifications = state.notifications.filter(n => n.id !== id);
        notifySubscribers();
    },

    // 设置用户信息
    setUser(user) {
        state.user = user;
        notifySubscribers();
    },

    // 设置主题
    setTheme(theme) {
        state.config.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        notifySubscribers();
    }
};

// 订阅状态变更
export function subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
} 