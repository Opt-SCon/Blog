import { state, subscribe, actions } from '../store/state.js';

export class Toast {
    constructor() {
        this.container = null;
        this.initialize();

        // 订阅状态变更
        subscribe(this.handleStateChange.bind(this));
    }

    initialize() {
        // 创建通知容器
        this.container = document.createElement('div');
        this.container.className = 'toast-container';

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                top: var(--spacing-lg);
                right: var(--spacing-lg);
                z-index: 10000;
                font-family: var(--font-family);
            }
            
            .toast {
                min-width: 300px;
                margin-bottom: var(--spacing-sm);
                padding: var(--spacing-md);
                border-radius: var(--radius-sm);
                color: white;
                font-size: var(--font-size-sm);
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: var(--shadow-md);
                animation: slideIn var(--transition-normal) var(--easing-standard);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            }
            
            .toast.info {
                background-color: var(--info-color);
                background: linear-gradient(135deg, var(--info-color), rgba(52, 152, 219, 0.85));
            }
            
            .toast.success {
                background-color: var(--success-color);
                background: linear-gradient(135deg, var(--success-color), rgba(46, 204, 113, 0.85));
            }
            
            .toast.warning {
                background-color: var(--warning-color);
                background: linear-gradient(135deg, var(--warning-color), rgba(241, 196, 15, 0.85));
            }
            
            .toast.error {
                background-color: var(--error-color);
                background: linear-gradient(135deg, var(--error-color), rgba(231, 76, 60, 0.85));
            }
            
            .toast-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: var(--font-size-lg);
                margin-left: var(--spacing-sm);
                padding: 0;
                opacity: 0.8;
                transition: opacity var(--transition-fast) var(--easing-standard);
            }
            
            .toast-close:hover {
                opacity: 1;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%) translateY(-50%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0) translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @media (max-width: 768px) {
                .toast-container {
                    top: auto;
                    bottom: var(--spacing-lg);
                    left: var(--spacing-md);
                    right: var(--spacing-md);
                }
                
                .toast {
                    min-width: auto;
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(this.container);
    }

    handleStateChange(newState) {
        this.render(newState.notifications);
    }

    render(notifications) {
        this.container.innerHTML = notifications.map(notification => `
            <div class="toast ${notification.type}" data-id="${notification.id}">
                <span>${notification.message}</span>
                <button class="toast-close" onclick="window.toast.close(${notification.id})">×</button>
            </div>
        `).join('');
    }

    close(id) {
        const toast = this.container.querySelector(`[data-id="${id}"]`);
        if (toast) {
            toast.style.animation = 'fadeOut var(--transition-normal) var(--easing-standard)';
            setTimeout(() => {
                actions.removeNotification(id);
            }, 300);
        }
    }

    // 实例方法：显示通知
    show(message, type = 'info', duration = 3000) {
        actions.showNotification(message, type, duration);
    }
}

// 创建单例实例
export const toast = new Toast();
// 为了能在HTML中访问close方法
window.toast = toast; 