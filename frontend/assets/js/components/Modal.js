export class Modal {
    constructor() {
        this.element = null;
        this.initialize();
    }

    initialize() {
        // 创建modal元素
        this.element = document.createElement('div');
        this.element.className = 'modal';
        this.element.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer"></div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                font-family: var(--font-family);
            }
            
            .modal-overlay {
                position: absolute;
                width: 100%;
                height: 100%;
                background: var(--bg-mask);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
            }
            
            .modal-container {
                position: relative;
                width: 90%;
                max-width: 500px;
                margin: var(--spacing-xl) auto;
                background: var(--bg-primary);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-lg);
                transform: translateY(20px);
                opacity: 0;
                transition: all var(--transition-normal) var(--easing-standard);
            }
            
            .modal.show .modal-container {
                transform: translateY(0);
                opacity: 1;
            }
            
            .modal-header {
                padding: var(--spacing-md) var(--spacing-lg);
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-title {
                margin: 0;
                font-size: var(--font-size-lg);
                color: var(--text-primary);
                font-weight: 500;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: var(--font-size-xl);
                cursor: pointer;
                color: var(--text-secondary);
                opacity: 0.8;
                transition: all var(--transition-fast) var(--easing-standard);
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--radius-sm);
            }
            
            .modal-close:hover {
                opacity: 1;
                background-color: var(--bg-secondary);
                color: var(--text-primary);
            }
            
            .modal-body {
                padding: var(--spacing-lg);
                color: var(--text-primary);
                font-size: var(--font-size-md);
                line-height: 1.5;
                max-height: 70vh;
                overflow-y: auto;
            }
            
            .modal-footer {
                padding: var(--spacing-md) var(--spacing-lg);
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: flex-end;
                gap: var(--spacing-sm);
            }
            
            .modal-btn {
                padding: var(--spacing-sm) var(--spacing-lg);
                border: none;
                border-radius: var(--radius-sm);
                cursor: pointer;
                font-size: var(--font-size-sm);
                font-family: var(--font-family);
                transition: all var(--transition-fast) var(--easing-standard);
            }
            
            .modal-btn-primary {
                background: var(--primary-color);
                color: white;
            }
            
            .modal-btn-primary:hover {
                background: var(--primary-hover);
            }
            
            .modal-btn-secondary {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }
            
            .modal-btn-secondary:hover {
                background: var(--divider-color);
            }
            
            @media (max-width: 768px) {
                .modal-container {
                    width: 95%;
                    margin: var(--spacing-md) auto;
                }
                
                .modal-body {
                    max-height: 60vh;
                }
                
                .modal-footer {
                    flex-direction: column;
                }
                
                .modal-btn {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(this.element);

        // 绑定关闭事件
        this.element.querySelector('.modal-close').addEventListener('click', () => this.hide());
        this.element.querySelector('.modal-overlay').addEventListener('click', () => this.hide());
    }

    show(options = {}) {
        const {
            title = '',
            content = '',
            buttons = [],
            closable = true,
            width = null,
        } = options;

        // 设置标题
        this.element.querySelector('.modal-title').textContent = title;

        // 设置内容
        this.element.querySelector('.modal-body').innerHTML = content;

        // 设置按钮
        const footer = this.element.querySelector('.modal-footer');
        footer.innerHTML = buttons.map(btn => `
            <button class="modal-btn ${btn.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}">${btn.text}</button>
        `).join('');

        // 绑定按钮事件
        const btnElements = footer.querySelectorAll('.modal-btn');
        btnElements.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (buttons[index].onClick) {
                    buttons[index].onClick();
                }
                if (buttons[index].closeOnClick !== false) {
                    this.hide();
                }
            });
        });

        // 设置是否可关闭
        this.element.querySelector('.modal-close').style.display = closable ? '' : 'none';
        this.element.querySelector('.modal-overlay').style.pointerEvents = closable ? '' : 'none';

        // 设置宽度
        if (width) {
            this.element.querySelector('.modal-container').style.maxWidth = width;
        }

        // 显示modal
        this.element.style.display = 'block';
        setTimeout(() => this.element.classList.add('show'), 50);
    }

    hide() {
        this.element.classList.remove('show');
        setTimeout(() => {
            this.element.style.display = 'none';
        }, 300);
    }

    // 实例方法：显示确认对话框
    confirm(options) {
        return new Promise((resolve) => {
            this.show({
                title: options.title || '确认',
                content: options.content || '确定要执行此操作吗？',
                buttons: [
                    {
                        text: options.cancelText || '取消',
                        onClick: () => resolve(false)
                    },
                    {
                        text: options.confirmText || '确定',
                        primary: true,
                        onClick: () => resolve(true)
                    }
                ]
            });
        });
    }

    // 实例方法：显示提示对话框
    alert(options) {
        return new Promise((resolve) => {
            this.show({
                title: options.title || '提示',
                content: options.content,
                buttons: [
                    {
                        text: options.buttonText || '确定',
                        primary: true,
                        onClick: () => resolve()
                    }
                ]
            });
        });
    }
}

// 创建单例实例
export const modal = new Modal(); 