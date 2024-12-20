import dataManager from './api.js';

let editingId = null;

// 更新预览
function updatePreview() {
    const content = document.getElementById('content').value;
    document.getElementById('preview').innerHTML = content;
}

// 初始化编辑器
async function initEditor() {
    // 加载分类
    const categories = await dataManager.getCategories();
    const categorySelect = document.getElementById('category');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });

    // 检查是否是编辑模式
    const params = new URLSearchParams(window.location.search);
    editingId = params.get('id');

    if (editingId) {
        const article = await dataManager.getArticleById(parseInt(editingId));
        if (article) {
            document.getElementById('title').value = article.title;
            document.getElementById('category').value = article.categoryId;
            document.getElementById('content').value = article.content;
            updatePreview();
        }
    }
}

// 发布文章
async function publishArticle(e) {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const categoryId = parseInt(document.getElementById('category').value);

    if (!title || !content || !categoryId) {
        alert('请填写完整信息！');
        return;
    }

    const article = {
        title,
        content,
        categoryId
    };

    try {
        if (editingId) {
            await dataManager.updateArticle(parseInt(editingId), article);
        } else {
            await dataManager.addArticle(article);
        }
        window.location.href = 'admin.html';
    } catch (error) {
        console.error('Failed to save article:', error);
        alert('保存失败，请重试！');
    }
}

// 初始化事件监听
function initEventListeners() {
    // 实时预览
    document.getElementById('content').addEventListener('input', updatePreview);
    
    // 发布按钮
    document.getElementById('publishBtn').addEventListener('click', publishArticle);
}

// 启动应用
async function init() {
    try {
        await initEditor();
        initEventListeners();
    } catch (error) {
        console.error('Failed to initialize editor:', error);
        alert('初始化失败，请刷新页面重试！');
    }
}

init(); 