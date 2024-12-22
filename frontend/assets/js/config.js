/**
 * 前端配置文件
 * 包含所有可配置项，支持不同环境
 */

// 通过检查当前URL判断环境
const isDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

const config = {
    development: {
        API_BASE_URL: 'http://localhost:5050/api',
        DEBUG: true
    },
    production: {
        API_BASE_URL: '/api',  // 生产环境使用相对路径
        DEBUG: false
    }
};

// 导出对应环境的配置
export default config[isDevelopment ? 'development' : 'production']; 