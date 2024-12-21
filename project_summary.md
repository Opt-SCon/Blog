# 个人博客系统

## 项目结构
```plaintext
blog/
├── frontend/          # 前端文件
│   ├── index.html    # 首页
│   ├── articles.html # 文章列表页
│   ├── article.html  # 文章详情页
│   ├── admin.html    # 后台管理页
│   ├── editor.html   # 文章编辑页
│   └── assets/
│       ├── css/      # 样式文件
│       └── js/       # JavaScript文件
└── backend/          # 后端文件
    ├── app.py        # Flask应用
    ├── config.py     # 配置文件
    └── data/         # 数据存储
        └── blog.json # 博客数据
```

## 功能特性

### 前台功能
1. 文章展示
   - 文章列表浏览
   - 文章详情查看
   - 分类筛选
   - 搜索功能

2. 交互功能
   - 文章点赞
   - 评论系统
   - 阅读量统计

### 后台功能
1. 文章管理
   - 新建文章
   - 编辑文章
   - 删除文章
   - 分类管理

2. 评论管理
   - 查看评论
   - 删除评论

3. 数据统计
   - 文章总数
   - 评论总数
   - 获赞总数

## 技术栈

### 前端
- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- 模块化开发

### 后端
- Python
- Flask
- Flask-CORS
- JSON文件存储

## 启动说明

1. 安装依赖：
```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

2. 启动后端服务：
```bash
cd backend
python app.py
```

3. 访问前端页面：
- 打开浏览器访问 `http://localhost:5000`

## API 文档

### 文章相关
- GET /api/articles - 获取所有文章
- GET /api/articles/:id - 获取单篇文章
- POST /api/articles - 创建文章
- PUT /api/articles/:id - 更新文章
- DELETE /api/articles/:id - 删除文章

### 评论相关
- POST /api/articles/:id/comments - 添加评论
- DELETE /api/articles/:id/comments/:commentId - 删除评论

### 其他功能
- GET /api/categories - 获取分类列表
- POST /api/articles/:id/like - 文章点赞

## 设计特点

1. 前后端分离
   - 前端使用纯静态文件
   - 后端提供RESTful API
   - 使用CORS支持跨域请求

2. 数据存储
   - 使用JSON文件存储数据
   - 支持数据持久化
   - 便于备份和迁移

3. 用户体验
   - Apple风格的UI设计
   - 响应式布局
   - 平滑的动画效果

4. 代码组织
   - 模块化的代码结构
   - 清晰的API设计
   - 统一的错误处理
