import { state, subscribe } from '../store/state.js';

export class Loading {
    constructor() {
        this.element = null;
        this.initialize();

        // 订阅状态变更
        subscribe(this.handleStateChange.bind(this));
    }

    initialize() {
        // 创建loading元素
        this.element = document.createElement('div');
        this.element.className = 'loading-container';
        this.element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <div class="loading-text">加载中...</div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .loading-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--bg-mask);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                backdrop-filter: blur(2px);
                -webkit-backdrop-filter: blur(2px);
            }
            
            .loading-spinner {
                background: var(--bg-primary);
                padding: var(--spacing-lg);
                border-radius: var(--radius-md);
                text-align: center;
                box-shadow: var(--shadow-md);
                animation: fadeIn var(--transition-normal) var(--easing-standard);
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                margin: 0 auto var(--spacing-sm);
                border: 4px solid var(--border-color);
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            .loading-text {
                color: var(--text-primary);
                font-size: var(--font-size-sm);
                font-family: var(--font-family);
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(this.element);
    }

    handleStateChange(newState) {
        if (newState.loading.global) {
            this.show();
        } else {
            this.hide();
        }
    }

    show(message = '加载中...') {
        this.element.querySelector('.loading-text').textContent = message;
        this.element.style.display = 'flex';
    }

    hide() {
        this.element.style.display = 'none';
    }
}

// 创建单例实例
export const loading = new Loading(); 