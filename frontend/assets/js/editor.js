/**
 * 文章编辑器脚本
 * 负责文章的创建和编辑功能
 * 包括Markdown编辑、分类选择、文章保存等功能
 */

import dataManager from './api.js';
import config from './config.js';

/**
 * 全局状态变量
 */
// 当前编辑的文章ID，null表示创建新文章
let editingId = null;
// 文章分类列表缓存
let categories = null;
// 当前编辑的文章数据
let currentArticle = null;
// Editor.md实例
let editor = null;

/**
 * 处理图片上传
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<string>} 上传后的图片URL
 */
async function handleImageUpload(file) {
    // 验证文件类型
    if (!config.UPLOAD.ALLOWED_TYPES.includes(file.type)) {
        throw new Error('不支持的图片格式');
    }

    // 验证文件大小
    if (file.size > config.UPLOAD.MAX_FILE_SIZE) {
        throw new Error(`图片大小不能超过${config.UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(config.EDITOR.imageUploadURL, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            throw new Error('图片上传失败');
        }

        const data = await response.json();
        return config.UPLOAD.IMAGE_BASE_URL + data.filename;
    } catch (error) {
        console.error('Failed to upload image:', error);
        throw new Error('图片上传失败，请重试');
    }
}

/**
 * 初始化Editor.md编辑器
 */
function initEditor() {
    const editorConfig = {
        ...config.EDITOR,
        // 重写图片上传处理
        imageUpload: true,
        imageUploadCallback: async function (files) {
            try {
                const url = await handleImageUpload(files[0]);
                return url;
            } catch (error) {
                console.error('Image upload failed:', error);
                alert(error.message);
                return false;
            }
        },
        // 编辑器加载完成回调
        onload: function () {
            // 如果是编辑模式，设置内容
            if (currentArticle) {
                editor.setMarkdown(currentArticle.content);
            }
        }
    };

    // 初始化编辑器
    editor = editormd("editor-md", editorConfig);
}

/**
 * 初始化编辑器
 * 加载分类数据，如果是编辑模式则加载文章数据
 */
async function initEditorData() {
    try {
        // 加载分类数据（只加载一次）
        if (!categories) {
            categories = await dataManager.getCategories();
            const categorySelect = document.getElementById('category');
            categorySelect.innerHTML = categories.map(category => `
                <option value="${category.id}">${category.name}</option>
            `).join('');
        }

        // 检查是否是编辑模式（URL中包含文章ID）
        const params = new URLSearchParams(window.location.search);
        editingId = params.get('id');

        // 如果是编辑模式且尚未加载文章数据
        if (editingId && !currentArticle) {
            currentArticle = await dataManager.getArticleById(parseInt(editingId));
            if (currentArticle) {
                // 填充表单数据
                document.getElementById('title').value = currentArticle.title;
                document.getElementById('category').value = currentArticle.categoryId;
                // 编辑器内容将在编辑器初始化完成后设置
            }
        }
    } catch (error) {
        console.error('Failed to initialize editor:', error);
        alert('初始化失败，请刷新页面重试！');
    }
}

/**
 * 设置提交按钮状态
 * @param {boolean} disabled - 是否禁用按钮
 */
function setSubmitButtonState(disabled) {
    const publishBtn = document.getElementById('publishBtn');
    publishBtn.disabled = disabled;
    publishBtn.textContent = disabled ? '发布中...' : '发布';
}

/**
 * 发布文章
 * 处理文章的保存或更新操作
 * 
 * @param {Event} e - 事件对象
 */
async function publishArticle(e) {
    e.preventDefault();

    // 获取表单数据
    const title = document.getElementById('title').value.trim();
    const content = editor.getMarkdown();
    const categoryId = parseInt(document.getElementById('category').value);

    // 表单验证
    if (!title || !content || !categoryId) {
        alert('请填写完整信息！');
        return;
    }

    // 防止重复提交
    setSubmitButtonState(true);

    try {
        // 构建文章数据
        const article = {
            title,
            content,
            categoryId
        };

        // 根据是否有editingId判断是更新还是创建
        if (editingId) {
            await dataManager.updateArticle(parseInt(editingId), article);
        } else {
            await dataManager.addArticle(article);
        }
        // 保存成功后返回管理页面
        window.location.href = 'admin.html';
    } catch (error) {
        console.error('Failed to save article:', error);
        alert('保存失败，请重试！');
        setSubmitButtonState(false);
    }
}

/**
 * 初始化事件监听器
 * 设置编辑器的各种交互事件
 */
function initEventListeners() {
    // 监听发布按钮点击
    document.getElementById('publishBtn').addEventListener('click', publishArticle);
}

/**
 * 页面初始化
 * 加载必要数据并设置事件处理程序
 */
async function init() {
    try {
        await initEditorData();
        initEditor();
        initEventListeners();
    } catch (error) {
        console.error('Failed to initialize editor:', error);
        alert('初始化失败，请刷新页面重试！');
    }
}

// 启动应用
init(); 