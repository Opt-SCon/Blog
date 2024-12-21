/**
 * 文章编辑器脚本
 * 负责文章的创建和编辑功能
 * 包括实时预览、分类选择、文章保存等功能
 */

import dataManager from './api.js';

/**
 * 全局状态变量
 */
// 当前编辑的文章ID，null表示创建新文章
let editingId = null;
// 文章分类列表缓存
let categories = null;
// 当前编辑的文章数据
let currentArticle = null;

/**
 * 更新预览内容
 * 将编辑器中的内容实时显示在预览区域
 */
function updatePreview() {
    const content = document.getElementById('content').value;
    document.getElementById('preview').innerHTML = content;
}

/**
 * 初始化编辑器
 * 加载分类数据，如果是编辑模式则加载文章数据
 */
async function initEditor() {
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
                document.getElementById('content').value = currentArticle.content;
                updatePreview();
            }
        }
    } catch (error) {
        console.error('Failed to initialize editor:', error);
        alert('初始化失败，请刷新页面重试！');
    }
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
    const content = document.getElementById('content').value.trim();
    const categoryId = parseInt(document.getElementById('category').value);

    // 表单验证
    if (!title || !content || !categoryId) {
        alert('请填写完整信息！');
        return;
    }

    // 构建文章数据
    const article = {
        title,
        content,
        categoryId
    };

    try {
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
    }
}

/**
 * 初始化事件监听器
 * 设置编辑器的各种交互事件
 */
function initEventListeners() {
    // 监听内容变化，实时更新预览
    document.getElementById('content').addEventListener('input', updatePreview);

    // 监听发布按钮点击
    document.getElementById('publishBtn').addEventListener('click', publishArticle);
}

/**
 * 页面初始化
 * 加载必要数据并设置事件处理程序
 */
async function init() {
    try {
        await initEditor();
        initEventListeners();
    } catch (error) {
        console.error('Failed to initialize editor:', error);
        alert('初始化失败，请刷新页面重试！');
    }
}

// 启动应用
init(); 