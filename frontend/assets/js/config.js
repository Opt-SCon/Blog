/**
 * 前端配置文件
 * 包含所有可配置项，支持不同环境
 */

// 通过检查当前URL判断环境
const isDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

// Editor.md编辑器基础配置
const editorConfig = {
    // 宽度
    width: "100%",
    // 高度
    height: 640,
    // 主题
    theme: "default",
    // 预览主题
    previewTheme: "default",
    // 编辑器主题
    editorTheme: "default",
    // Markdown标准
    markdown: "commonmark",
    // 工具栏
    toolbarIcons: function () {
        return [
            "undo", "redo", "|",
            "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|",
            "h1", "h2", "h3", "h4", "h5", "h6", "|",
            "list-ul", "list-ol", "hr", "|",
            "link", "reference-link", "image", "code", "preformatted-text", "code-block", "table", "datetime", "html-entities", "pagebreak", "|",
            "goto-line", "watch", "preview", "fullscreen", "clear", "search", "|",
            "help"
        ];
    },
    // 自定义工具栏按钮
    toolbarCustomIcons: {
        // 可以在这里添加自定义按钮
    },
    // 延迟解析
    delay: 300,
    // 自动高度
    autoHeight: false,
    // 自动聚焦
    autoFocus: true,
    // 行号
    lineNumbers: true,
    // 行号偏移
    lineWrapping: true,
    // 粘贴图片
    imageUpload: true,
    // 图片上传接口
    imageUploadURL: "",  // 将在环境配置中设置
    // 十六进制颜色
    hexColors: true,
    // 自动补全
    autocomplete: true,
    // 任务列表
    taskList: true,
    // 井号标题
    atLink: true,
    // 电子邮件链接
    emailLink: true,
    // tex数学公式
    tex: true,
    // 流程图
    flowChart: true,
    // 时序图
    sequenceDiagram: true,
    // 预览中的代码高亮
    highlightStyle: "github",
    // 保存时回调
    saveHTMLToTextarea: true,
    // 同步滚动
    syncScrolling: true,
    // 编辑器渲染后的回调
    onload: function () {
        // 可以在这里添加加载完成后的处理
    },
    // 图片上传回调
    onImageUpload: function (files) {
        // 将在编辑器初始化时设置
    }
};

const config = {
    development: {
        API_BASE_URL: 'http://localhost:5050/api',
        DEBUG: true,
        // Editor.md配置
        EDITOR: {
            ...editorConfig,
            imageUploadURL: 'http://localhost:5050/api/upload/image',
            path: '/assets/js/editor.md/lib/',  // Editor.md依赖库路径
            imageFormats: ['jpg', 'jpeg', 'gif', 'png', 'webp'],
            imageMaxSize: 5 * 1024 * 1024  // 5MB
        },
        // 图片上传配置
        UPLOAD: {
            MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
            ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            IMAGE_BASE_URL: 'http://localhost:5050/uploads/'
        }
    },
    production: {
        API_BASE_URL: '/api',  // 生产环境使用相对路径
        DEBUG: false,
        // Editor.md配置
        EDITOR: {
            ...editorConfig,
            imageUploadURL: '/api/upload/image',
            path: '/assets/js/editor.md/lib/',  // Editor.md依赖库路径
            imageFormats: ['jpg', 'jpeg', 'png', 'webp'],  // 生产环境不允许GIF
            imageMaxSize: 2 * 1024 * 1024  // 2MB
        },
        // 图片上传配置
        UPLOAD: {
            MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB（生产环境限制更严格）
            ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'], // 生产环境不允许GIF
            IMAGE_BASE_URL: '/uploads/'
        }
    }
};

// 导出对应环境的配置
export default config[isDevelopment ? 'development' : 'production']; 